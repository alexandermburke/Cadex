import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDB } from '@/firebaseAdmin'; // Ensure this path is correct

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

// Your Stripe webhook secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const webhookHandlers = {
    'customer.subscription.created': async (subscription, eventId) => {
        try {
            console.log('Received customer.subscription.created event with metadata:', JSON.stringify(subscription.metadata, null, 2));

            if (!subscription.metadata || !subscription.metadata.userId || !subscription.metadata.plan) {
                console.error('Subscription metadata missing userId or plan:', JSON.stringify(subscription, null, 2));
                throw new Error('Missing userId or plan in subscription metadata.');
            }

            const userId = subscription.metadata.userId;
            const selectedPlan = subscription.metadata.plan; // This value should now be set
            const stripeCustomerId = subscription.customer;

            console.log(`Processing customer.subscription.created for userId: ${userId}, stripeCustomerId: ${stripeCustomerId}`);

            // Check idempotency: skip if event already processed
            const eventRef = adminDB.collection('processed_events').doc(eventId);
            const eventDoc = await eventRef.get();
            if (eventDoc.exists) {
                console.log(`Event ${eventId} already processed.`);
                return;
            }

            // Fetch user data from Firestore
            const userDocRef = adminDB.collection('users').doc(userId);
            const userDoc = await userDocRef.get();
            if (!userDoc.exists) {
                throw new Error('User not found in Firestore.');
            }

            const userData = userDoc.data();
            const existingStripeCustomerId = userData.billing?.stripeCustomerId;
            const existingSubscriptionId = userData.billing?.subscriptionId || null;

            // Validate stripeCustomerId consistency
            if (existingStripeCustomerId && existingStripeCustomerId !== stripeCustomerId) {
                console.error(`Mismatch in stripeCustomerId for user ${userId}. Existing: ${existingStripeCustomerId}, New: ${stripeCustomerId}`);
                throw new Error('Mismatch in stripeCustomerId.');
            }

            if (!existingStripeCustomerId) {
                await userDocRef.set({
                    billing: {
                        stripeCustomerId: stripeCustomerId,
                    },
                }, { merge: true });
            }

            // If there's an existing subscription ID and it's different from the new one, cancel the old subscription
            if (existingSubscriptionId && existingSubscriptionId !== subscription.id) {
                try {
                    await stripe.subscriptions.del(existingSubscriptionId);
                    console.log(`Canceled old subscription: ${existingSubscriptionId}`);
                } catch (cancelErr) {
                    console.error(`Error canceling old subscription: ${cancelErr.message}`);
                }
            }

            // Update user's billing info using the subscription details and store the new subscription ID
            const nextPaymentDue = subscription.current_period_end; // Unix timestamp
            const amountDue = subscription.items.data[0]?.price?.unit_amount; // in cents
            const currency = subscription.items.data[0]?.price?.currency?.toUpperCase();
            const status = subscription.status;

            await userDocRef.set({
                billing: {
                    plan: selectedPlan,
                    status,
                    nextPaymentDue,
                    amountDue,
                    currency,
                    subscriptionId: subscription.id,
                },
            }, { merge: true });

            await eventRef.set({ processed: true });
            console.log(`User ${userId} successfully upgraded to ${selectedPlan} plan via customer.subscription.created.`);
        } catch (err) {
            console.error(`Error handling customer.subscription.created: ${err.message}`);
            throw err;
        }
    },

    'checkout.session.completed': async (session, eventId) => {
        try {
            console.log('Received checkout.session.completed event with metadata:', JSON.stringify(session.metadata, null, 2));
            if (!session.metadata || !session.metadata.userId || !session.metadata.plan) {
                console.error('Session metadata missing userId or plan:', JSON.stringify(session, null, 2));
                throw new Error('Missing userId or plan in session metadata.');
            }

            const userId = session.metadata.userId;
            const selectedPlan = session.metadata.plan;
            const stripeCustomerId = session.customer;

            console.log(`Processing checkout.session.completed for userId: ${userId}, stripeCustomerId: ${stripeCustomerId}`);

            const eventRef = adminDB.collection('processed_events').doc(eventId);
            const eventDoc = await eventRef.get();
            if (eventDoc.exists) {
                console.log(`Event ${eventId} already processed.`);
                return;
            }

            const userDocRef = adminDB.collection('users').doc(userId);
            const userDoc = await userDocRef.get();
            if (!userDoc.exists) {
                throw new Error('User not found in Firestore.');
            }

            const userData = userDoc.data();
            const existingStripeCustomerId = userData.billing?.stripeCustomerId;
            const existingSubscriptionId = userData.billing?.subscriptionId || null;

            if (existingStripeCustomerId && existingStripeCustomerId !== stripeCustomerId) {
                console.error(`Mismatch in stripeCustomerId for user ${userId}. Existing: ${existingStripeCustomerId}, New: ${stripeCustomerId}`);
                throw new Error('Mismatch in stripeCustomerId.');
            }

            if (!existingStripeCustomerId) {
                await userDocRef.set({
                    billing: {
                        stripeCustomerId: stripeCustomerId,
                    },
                }, { merge: true });
            }

            // Cancel previous subscription if it exists and is different from the new one.
            if (existingSubscriptionId && existingSubscriptionId !== session.subscription) {
                try {
                    await stripe.subscriptions.del(existingSubscriptionId);
                    console.log(`Canceled old subscription: ${existingSubscriptionId}`);
                } catch (cancelErr) {
                    console.error(`Error canceling old subscription: ${cancelErr.message}`);
                }
            }

            const subscriptionData = await stripe.subscriptions.retrieve(session.subscription);
            const nextPaymentDue = subscriptionData.current_period_end;
            const amountDue = subscriptionData.items.data[0].price.unit_amount;
            const currency = subscriptionData.items.data[0].price.currency.toUpperCase();
            const status = subscriptionData.status;

            await userDocRef.set({
                billing: {
                    plan: selectedPlan,
                    status,
                    nextPaymentDue,
                    amountDue,
                    currency,
                    subscriptionId: session.subscription,
                },
            }, { merge: true });

            await eventRef.set({ processed: true });
            console.log(`User ${userId} successfully upgraded to ${selectedPlan} plan via checkout.session.completed.`);
        } catch (err) {
            console.error(`Error handling checkout.session.completed: ${err.message}`);
            throw err;
        }
    },

    'invoice.payment_failed': async (invoice, eventId) => {
        try {
            const stripeCustomerId = invoice.customer;

            if (!stripeCustomerId) {
                console.error('Invoice is missing customer field:', JSON.stringify(invoice, null, 2));
                throw new Error('Missing stripeCustomerId in invoice.');
            }

            const eventRef = adminDB.collection('processed_events').doc(eventId);
            const eventDoc = await eventRef.get();

            if (eventDoc.exists) {
                console.log(`Event ${eventId} already processed.`);
                return;
            }

            const usersSnapshot = await adminDB.collection('users').where('billing.stripeCustomerId', '==', stripeCustomerId).get();

            if (usersSnapshot.empty) {
                console.log('No matching user found for stripeCustomerId:', stripeCustomerId);
                await eventRef.set({ processed: true });
                return;
            }

            const batch = adminDB.batch();
            usersSnapshot.forEach(doc => {
                batch.set(doc.ref, {
                    billing: {
                        status: 'Inactive',
                    },
                }, { merge: true });
            });
            await batch.commit();

            await eventRef.set({ processed: true });
            console.log(`Updated billing status to 'Inactive' for stripeCustomerId: ${stripeCustomerId}`);
        } catch (err) {
            console.error(`Error handling invoice.payment_failed: ${err.message}`);
            throw err;
        }
    },

    // Add more handlers as needed
};

export async function POST(request) {
    console.log('--- WEBHOOK STARTED ---');

    let event;

    try {
        const rawBody = await request.text();
        const sig = request.headers.get('stripe-signature');

        if (!sig) {
            throw new Error('Missing Stripe signature.');
        }

        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
        console.log('Webhook signature verified:', event.type);
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    console.log('Received event:', JSON.stringify(event, null, 2));

    try {
        const handler = webhookHandlers[event.type];
        if (handler) {
            await handler(event.data.object, event.id);
        } else {
            console.log(`Unhandled event type: ${event.type}`);
        }
        return NextResponse.json({ received: true }, { status: 200 });
    } catch (err) {
        console.error(`Error handling event ${event.type}: ${err.message}`);
        return NextResponse.json({ error: `Error handling event: ${err.message}` }, { status: 500 });
    }
}

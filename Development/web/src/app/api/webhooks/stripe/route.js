// app/api/webhooks/stripe.js

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDB } from '@/firebaseAdmin'; // Ensure this path is correct

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

// Your Stripe webhook secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const webhookHandlers = {
    // Existing handler (in case checkout.session.completed events are sent)
    'checkout.session.completed': async (session, eventId) => {
        try {
            const { customer: stripeCustomerId, metadata, subscription } = session;

            if (!metadata || !metadata.userId || !metadata.plan) {
                console.error('Session metadata missing userId or plan:', JSON.stringify(session, null, 2));
                throw new Error('Missing userId or plan in session metadata.');
            }

            const userId = metadata.userId;
            const selectedPlan = metadata.plan; // Dynamically use the passed plan

            console.log(`Processing checkout.session.completed for userId: ${userId}, stripeCustomerId: ${stripeCustomerId}`);

            // Check if the event has already been processed (idempotency)
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

            // Validate stripeCustomerId consistency
            if (existingStripeCustomerId && existingStripeCustomerId !== stripeCustomerId) {
                console.error(`Mismatch in stripeCustomerId for user ${userId}. Existing: ${existingStripeCustomerId}, New: ${stripeCustomerId}`);
                throw new Error('Mismatch in stripeCustomerId.');
            }

            // If stripeCustomerId doesn't exist in Firestore, set it
            if (!existingStripeCustomerId) {
                await userDocRef.set({
                    billing: {
                        stripeCustomerId: stripeCustomerId,
                    },
                }, { merge: true });
            }

            // Retrieve subscription details
            const subscriptionData = await stripe.subscriptions.retrieve(subscription);
            const nextPaymentDue = subscriptionData.current_period_end;
            const amountDue = subscriptionData.items.data[0].price.unit_amount;
            const currency = subscriptionData.items.data[0].price.currency.toUpperCase();
            const status = subscriptionData.status;

            // Update the user's billing info using the selected plan from metadata
            await userDocRef.set({
                billing: {
                    plan: selectedPlan,
                    status,
                    nextPaymentDue,
                    amountDue,
                    currency,
                },
            }, { merge: true });

            await eventRef.set({ processed: true });
            console.log(`User ${userId} successfully upgraded to ${selectedPlan} plan via checkout.session.completed.`);
        } catch (err) {
            console.error(`Error handling checkout.session.completed: ${err.message}`);
            throw err;
        }
    },

    // New handler for customer.subscription.created events
    'customer.subscription.created': async (subscription, eventId) => {
        try {
            const { customer: stripeCustomerId, metadata } = subscription;

            if (!metadata || !metadata.userId || !metadata.plan) {
                console.error('Subscription metadata missing userId or plan:', JSON.stringify(subscription, null, 2));
                throw new Error('Missing userId or plan in subscription metadata.');
            }

            const userId = metadata.userId;
            const selectedPlan = metadata.plan; // This should be set in subscription_data.metadata in your checkout

            console.log(`Processing customer.subscription.created for userId: ${userId}, stripeCustomerId: ${stripeCustomerId}`);

            // Check if the event has already been processed (idempotency)
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

            // Validate stripeCustomerId consistency
            if (existingStripeCustomerId && existingStripeCustomerId !== stripeCustomerId) {
                console.error(`Mismatch in stripeCustomerId for user ${userId}. Existing: ${existingStripeCustomerId}, New: ${stripeCustomerId}`);
                throw new Error('Mismatch in stripeCustomerId.');
            }

            // If stripeCustomerId doesn't exist in Firestore, set it
            if (!existingStripeCustomerId) {
                await userDocRef.set({
                    billing: {
                        stripeCustomerId: stripeCustomerId,
                    },
                }, { merge: true });
            }

            // Update user's billing information from the subscription details
            const nextPaymentDue = subscription.current_period_end; // Unix timestamp
            const amountDue = subscription.items.data[0]?.price?.unit_amount; // Amount in cents
            const currency = subscription.items.data[0]?.price?.currency?.toUpperCase();
            const status = subscription.status;

            await userDocRef.set({
                billing: {
                    plan: selectedPlan,
                    status,
                    nextPaymentDue,
                    amountDue,
                    currency,
                },
            }, { merge: true });

            await eventRef.set({ processed: true });
            console.log(`User ${userId} successfully upgraded to ${selectedPlan} plan via customer.subscription.created.`);
        } catch (err) {
            console.error(`Error handling customer.subscription.created: ${err.message}`);
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

            // Check if the event has already been processed (idempotency)
            const eventRef = adminDB.collection('processed_events').doc(eventId);
            const eventDoc = await eventRef.get();

            if (eventDoc.exists) {
                console.log(`Event ${eventId} already processed.`);
                return;
            }

            // Find user by stripeCustomerId
            const usersSnapshot = await adminDB.collection('users').where('billing.stripeCustomerId', '==', stripeCustomerId).get();

            if (usersSnapshot.empty) {
                console.log('No matching user found for stripeCustomerId:', stripeCustomerId);
                await eventRef.set({ processed: true }); // Mark as processed to avoid retries
                return;
            }

            // Update user's billing status to Inactive
            const batch = adminDB.batch();
            usersSnapshot.forEach(doc => {
                batch.set(doc.ref, {
                    billing: {
                        status: 'Inactive',
                        // Optionally, you can update other fields like nextPaymentDue, amountDue, etc.
                    },
                }, { merge: true });
            });
            await batch.commit();

            // Mark the event as processed
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
        // Get the raw body and signature from the request
        const rawBody = await request.text();
        const sig = request.headers.get('stripe-signature');

        if (!sig) {
            throw new Error('Missing Stripe signature.');
        }

        // Verify the event with Stripe
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
        console.log('Webhook signature verified:', event.type);
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Log the entire event for debugging
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

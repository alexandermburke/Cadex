// app/api/checkout/route.js

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDB } from '@/firebaseAdmin'; // Ensure this path is correct

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

// Define your price IDs mapped to plan names
const priceIds = {
    Basic: 'price_1QOUDFP6GBvKc5e8upbY4YVR',
    Pro: 'price_1QOUEtP6GBvKc5e8U1TuUVLm',
};

////////////////////////// BILLING //////////////////////////

// Handle a POST request to /api/checkout
export async function POST(request) {
    const { customerId, userId, email, plan } = await request.json();
    let stripeCustomerId = customerId;

    if (!userId) {
        return NextResponse.json({ error: 'Missing required field: userId' }, { status: 400 });
    }

    try {
        // Create a Stripe customer if not provided
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: email,
                metadata: {
                    userId: userId,
                },
            });
            stripeCustomerId = customer.id;

            // Save the stripeCustomerId to Firestore
            await adminDB.collection('users').doc(userId).set(
                {
                    billing: {
                        stripeCustomerId: stripeCustomerId,
                    },
                },
                { merge: true }
            );
        }

        // Validate the selected plan
        if (!priceIds[plan]) {
            throw new Error('Invalid plan selected');
        }

        // Create a Stripe Checkout Session with a 7-day trial
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            metadata: {
                userId: userId,
                email: email,
                stripeCustomerId: stripeCustomerId,
            },
            line_items: [
                {
                    price: priceIds[plan],
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            subscription_data: {
                trial_period_days: 7,
            },
            cancel_url: 'http://www.cadexlaw.com/admin', // Replace with your cancel URL
            success_url: 'http://www.cadexlaw.com/admin/success?session_id={CHECKOUT_SESSION_ID}',
        });

        return NextResponse.json({ url: session.url }, { status: 201 });
    } catch (err) {
        console.error('Failed to create checkout session', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// Handle a DELETE request to /api/checkout (for cancellation)
export async function DELETE(request) {
    const { stripeCustomerId, userId } = await request.json();

    if (!userId) {
        return NextResponse.json({ error: 'Missing required field: userId' }, { status: 400 });
    }

    let customerId = stripeCustomerId;

    try {
        // If stripeCustomerId is not provided, retrieve it from Firestore
        if (!customerId) {
            const userDoc = await adminDB.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                return NextResponse.json({ error: 'User not found.' }, { status: 404 });
            }

            const userData = userDoc.data();
            customerId = userData?.billing?.stripeCustomerId;

            if (!customerId) {
                return NextResponse.json({ error: 'No stripeCustomerId found for this user.' }, { status: 404 });
            }
        }

        const customer = await stripe.customers.retrieve(customerId, {
            expand: ['subscriptions'],
        });

        if (!customer.subscriptions || customer.subscriptions.data.length === 0) {
            throw new Error('No active subscriptions found for this customer.');
        }

        const subscriptionId = customer.subscriptions.data[0].id;

        // Cancel the subscription immediately
        await stripe.subscriptions.del(subscriptionId);

        // Update Firestore to reflect the cancellation
        await adminDB.collection('users').doc(userId).set(
            {
                billing: {
                    plan: null, // Or set to 'Canceled' or appropriate status
                    status: 'Canceled',
                    stripeCustomerId: customerId,
                },
            },
            { merge: true }
        );

        return NextResponse.json({ message: 'Subscription cancelled successfully.' }, { status: 200 });
    } catch (err) {
        console.error('Failed to cancel subscription', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// app/api/checkout/route.js

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDB } from '@/firebaseAdmin'; // Ensure this path is correct

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});


const priceIds = {
    Basic: 'price_1QOUDFP6GBvKc5e8upbY4YVR',
    Pro: 'price_1QOUEtP6GBvKc5e8U1TuUVLm',
};

export async function POST(request) {
    const { userId, email, plan } = await request.json();

    if (!userId || !email || !plan) {
        return NextResponse.json({ error: 'Missing required fields: userId, email, or plan.' }, { status: 400 });
    }

    try {
        // Fetch the user from Firestore
        const userDocRef = adminDB.collection('users').doc(userId);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }

        let stripeCustomerId = userDoc.data().billing?.stripeCustomerId;

        // If the user doesn't have a Stripe customer ID, create one
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email,
                metadata: {
                    userId: userId,
                },
            });
            stripeCustomerId = customer.id;

            // Update Firestore with the new Stripe customer ID
            await userDocRef.set({
                billing: {
                    stripeCustomerId: stripeCustomerId,
                },
            }, { merge: true });
        }

        // Validate the selected plan
        if (!priceIds[plan]) {
            throw new Error('Invalid plan selected.');
        }

        // Create the Stripe Checkout Session with a 7-day trial
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer: stripeCustomerId, // Reuse existing customer ID
            line_items: [
                {
                    price: priceIds[plan],
                    quantity: 1,
                },
            ],
            subscription_data: {
                trial_period_days: 7,
            },
            success_url: `${process.env.NEXT_PUBLIC_YOUR_DOMAIN}/admin/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_YOUR_DOMAIN}/admin`,
            metadata: { userId }, // Pass userId for webhook linkage
        });

        return NextResponse.json({ url: session.url }, { status: 201 });
    } catch (err) {
        console.error('Failed to create checkout session:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

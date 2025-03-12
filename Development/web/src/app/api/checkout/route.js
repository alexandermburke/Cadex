import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDB } from '@/firebaseAdmin'; // Ensure this path is correct

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

const priceIds = {
    Basic: 'price_1R0WZkP6GBvKc5e89itgiFsO',
    Pro: 'price_1R0WZyP6GBvKc5e8P8ek4upz',
    Expert: 'price_1R0Wa9P6GBvKc5e8hvECp6BP',
};

export async function POST(request) {
    const { userId, email, plan } = await request.json();

    if (!userId || !email || !plan) {
        return NextResponse.json({ error: 'Missing required fields: userId, email, or plan.' }, { status: 400 });
    }

    try {
        const userDocRef = adminDB.collection('users').doc(userId);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }

        let stripeCustomerId = userDoc.data().billing?.stripeCustomerId;

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email,
                metadata: {
                    userId: userId,
                },
            });
            stripeCustomerId = customer.id;

            await userDocRef.set({
                billing: {
                    stripeCustomerId: stripeCustomerId,
                },
            }, { merge: true });
        }

        if (!priceIds[plan]) {
            throw new Error('Invalid plan selected.');
        }

        // Create checkout session with plan info in both session metadata and subscription_data.metadata.
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer: stripeCustomerId, 
            line_items: [
                {
                    price: priceIds[plan],
                    quantity: 1,
                },
            ],
            subscription_data: {
                trial_period_days: 7,
                metadata: {
                    userId,
                    plan, // Ensure plan is attached to the subscription object.
                },
            },
            success_url: `https://www.cadexlaw.com/admin/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://www.cadexlaw.com/admin/account`,
            metadata: { 
                userId,
                plan, // Also attach plan at the session level.
            },
        });

        return NextResponse.json({ url: session.url }, { status: 201 });
    } catch (err) {
        console.error('Failed to create checkout session:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// pages/api/cancel-subscription.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_LIVE, {
    apiVersion: '2023-10-16',
});

export async function POST(request) {
    const { stripeCustomerId, userId } = await request.json();

    if (!stripeCustomerId || !userId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        const subscriptions = await stripe.subscriptions.list({
            customer: stripeCustomerId,
            status: 'active',
        });

        if (subscriptions.data.length === 0) {
            return NextResponse.json({ error: 'No active subscriptions found.' }, { status: 404 });
        }

        const subscriptionId = subscriptions.data[0].id;

        // Cancel the subscription immediately
        await stripe.subscriptions.del(subscriptionId);

        return NextResponse.json({ message: 'Subscription cancelled successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Error cancelling subscription:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

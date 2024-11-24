import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_LIVE, {
    apiVersion: "2023-10-16",
});

// Define your price IDs mapped to plan names
const priceIds = {
    Basic: 'price_1QOUDFP6GBvKc5e8upbY4YVR', // Replace with your actual Basic plan price ID
    Pro: 'price_1QOUEtP6GBvKc5e8U1TuUVLm',       // Replace with your actual Pro plan price ID
};

////////////////////////// BILLING //////////////////////////

// To handle a POST request to /api/checkout
export async function POST(request) {
    const { customerId, userId, email, plan } = await request.json();
    let stripeCustomerId = customerId;

    try {
        // Create a Stripe customer if not provided
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: email,
                metadata: {
                    userId: userId,
                },
            });
            stripeCustomerId = customer.id;
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
        console.log('Failed to create checkout session', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// To handle a DELETE request to /api/checkout (for cancellation)
export async function DELETE(request) {
    const { stripeCustomerId, userId } = await request.json();

    if (!stripeCustomerId || !userId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        const customer = await stripe.customers.retrieve(stripeCustomerId, {
            expand: ['subscriptions'],
        });

        if (customer.subscriptions.data.length === 0) {
            throw new Error('No active subscriptions found for this customer.');
        }

        const subscriptionId = customer.subscriptions.data[0].id;

        await stripe.subscriptions.del(subscriptionId);

        return NextResponse.json({ message: 'Subscription cancelled successfully.' }, { status: 200 });
    } catch (err) {
        console.log('Failed to cancel subscription', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

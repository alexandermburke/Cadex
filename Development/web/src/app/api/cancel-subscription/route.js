import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDB } from '@/firebaseAdmin'; // Ensure this path is correct

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

export async function POST(request) {
    const { stripeCustomerId, userId } = await request.json();

    if (!userId) {
        return NextResponse.json({ error: 'Missing required field: userId' }, { status: 400 });
    }

    let customerId = stripeCustomerId;

    try {
        // If stripeCustomerId is not provided, retrieve it from Firestore using userId
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

        // List active subscriptions for the customer
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
            expand: ['data.default_payment_method'],
        });

        if (subscriptions.data.length === 0) {
            return NextResponse.json({ error: 'No active subscriptions found.' }, { status: 404 });
        }

        const subscriptionId = subscriptions.data[0].id;

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
    } catch (error) {
        console.error('Error cancelling subscription:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

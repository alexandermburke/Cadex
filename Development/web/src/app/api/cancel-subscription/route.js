import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDB } from '@/firebaseAdmin'; // Ensure this path is correct

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

// Add logging to verify the Stripe instance
console.log('Stripe Instance:', stripe);
console.log('Subscriptions Object:', stripe.subscriptions);
console.log('Is `del` a function:', typeof stripe.subscriptions.del === 'function');

export async function POST(request) {
    try {
        const { stripeCustomerId, userId } = await request.json();
        console.log(`Received cancel subscription request for userId: ${userId}, stripeCustomerId: ${stripeCustomerId}`);

        if (!userId) {
            console.warn('Missing required field: userId');
            return NextResponse.json({ error: 'Missing required field: userId' }, { status: 400 });
        }

        let customerId = stripeCustomerId;

        // If stripeCustomerId is not provided, retrieve it from Firestore using userId
        if (!customerId) {
            const userDoc = await adminDB.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                console.warn(`User not found: ${userId}`);
                return NextResponse.json({ error: 'User not found.' }, { status: 404 });
            }

            const userData = userDoc.data();
            customerId = userData?.billing?.stripeCustomerId;

            if (!customerId) {
                console.warn(`No stripeCustomerId found for user: ${userId}`);
                return NextResponse.json({ error: 'No stripeCustomerId found for this user.' }, { status: 404 });
            }
        }

        console.log(`Using stripeCustomerId: ${customerId} for userId: ${userId}`);

        // List all subscriptions for the customer
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'all', // Retrieve all statuses
            expand: ['data.default_payment_method'],
            limit: 100, // Adjust as needed
        });

        console.log(`Found ${subscriptions.data.length} subscription(s) for customer ${customerId}`);

        // Filter subscriptions to include only 'active' and 'trialing'
        const activeSubscriptions = subscriptions.data.filter(sub => 
            sub.status === 'active' || sub.status === 'trialing'
        );

        console.log(`Filtered to ${activeSubscriptions.length} active/trialing subscription(s)`);

        if (activeSubscriptions.length === 0) {
            return NextResponse.json({ error: 'No active or trialing subscriptions found.' }, { status: 404 });
        }

        // Assuming you want to cancel all active/trialing subscriptions
        const cancellationResults = [];

        for (const subscription of activeSubscriptions) {
            const subscriptionId = subscription.id;
            console.log(`Cancelling subscription: ${subscriptionId}`);

            try {
                // Cancel the subscription immediately using the 'del' method
                const cancelledSubscription = await stripe.subscriptions.del(subscriptionId);
                console.log(`Subscription ${subscriptionId} cancelled successfully`);

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

                console.log(`Firestore updated for userId: ${userId}`);

                cancellationResults.push({ subscriptionId, status: 'Cancelled' });
            } catch (cancelError) {
                console.error(`Error cancelling subscription ${subscriptionId}:`, cancelError.message);
                cancellationResults.push({ subscriptionId, status: 'Failed', error: cancelError.message });
            }
        }

        return NextResponse.json({ message: 'Subscription cancellation process completed.', results: cancellationResults }, { status: 200 });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

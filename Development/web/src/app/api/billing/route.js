import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDB } from '@/firebaseAdmin'; // Adjust path as needed

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Fetch user data from Firestore
    const userDoc = await adminDB.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found in Firestore' }, { status: 404 });
    }

    const userData = userDoc.data();
    const plan = userData?.billing?.plan || 'Free';
    const stripeCustomerId = userData?.billing?.stripeCustomerId || null;

    // If the user is on the Free plan and has no stripeCustomerId, just return free plan details
    if (plan === 'Free' && !stripeCustomerId) {
      return NextResponse.json({
        billing: {
          plan: 'Free',
          status: 'Inactive',
          nextPaymentDue: null,
          amountDue: null,
          currency: null,
        }
      }, { status: 200 });
    }

    // If user is not on the Free plan but has no stripeCustomerId, return an error
    if (!stripeCustomerId) {
      return NextResponse.json({ error: 'No stripeCustomerId found for user' }, { status: 400 });
    }

    // Fetch subscriptions from Stripe since we have a stripeCustomerId
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      limit: 1,
    });

    if (!subscriptions.data.length) {
      // No active subscriptions found, set user to free plan
      await adminDB.collection('users').doc(userId).set({
        billing: {
          plan: 'Free',
          status: 'Inactive',
          stripeCustomerId: stripeCustomerId,
          nextPaymentDue: null,
          amountDue: null,
          currency: null,
        }
      }, { merge: true });

      // Return free plan details
      return NextResponse.json({
        billing: {
          plan: 'Free',
          status: 'Inactive',
          nextPaymentDue: null,
          amountDue: null,
          currency: null,
        }
      }, { status: 200 });
    }

    // If subscription found, return subscription details
    const subscription = subscriptions.data[0];
    const billing = {
      plan: plan,
      status: subscription.status,
      nextPaymentDue: subscription.current_period_end,
      amountDue: subscription.items.data[0]?.price?.unit_amount || null,
      currency: subscription.items.data[0]?.price?.currency?.toUpperCase() || null,
    };

    return NextResponse.json({ billing }, { status: 200 });
  } catch (err) {
    console.error('Error fetching user subscription data:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

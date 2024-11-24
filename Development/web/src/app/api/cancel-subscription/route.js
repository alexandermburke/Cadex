// app/api/cancel-subscription/route.js

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDB } from '@/firebaseAdmin'; // Adjust the import path as needed

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Route Segment Configurations
export const runtime = 'nodejs'; // Ensures the route runs on Node.js
export const dynamic = 'force-dynamic'; // Forces the route to be dynamic

// Subscription Cancellation Handler
export async function POST(req) {
  try {
    const { stripeCustomerId, userId } = await req.json();

    if (!stripeCustomerId || !userId) {
      return NextResponse.json({ error: 'Missing stripeCustomerId or userId.' }, { status: 400 });
    }

    // Retrieve all active subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: 'No active subscriptions found.' }, { status: 400 });
    }

    // Cancel each active subscription
    for (const subscription of subscriptions.data) {
      await stripe.subscriptions.del(subscription.id);
      console.log(`✅  Cancelled subscription: ${subscription.id}`);
    }

    // Update Firestore billing status to 'Cancelled'
    await adminDB.collection('users').doc(userId).set(
      {
        'billing.status': 'Cancelled',
      },
      { merge: true }
    );

    console.log(`✅  Updated billing status to 'Cancelled' for userId: ${userId}`);

    return NextResponse.json({ message: 'Subscription cancelled successfully.' }, { status: 200 });
  } catch (error) {
    console.error('❌  Error cancelling subscription:', error.message);
    return NextResponse.json({ error: 'Failed to cancel subscription.' }, { status: 500 });
  }
}

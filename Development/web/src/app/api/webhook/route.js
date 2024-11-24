import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDB } from '@/firebaseAdmin';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_LIVE, {
  apiVersion: '2023-10-16',
});

// Your Stripe webhook secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_LIVE;

export async function POST(request) {
  console.log('WEBHOOK STARTED');

  let event;

  try {
    // Get the raw body and signature from the request
    const rawBody = await request.text();
    const sig = request.headers.get('stripe-signature');

    // Verify the event with Stripe
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  try {
    if (webhookHandlers[event.type]) {
      await webhookHandlers[event.type](event.data.object);
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error(`Error handling event ${event.type}: ${err.message}`);
    return NextResponse.json({ error: `Error handling event: ${err.message}` }, { status: 500 });
  }
}

const webhookHandlers = {
  // Handle successful checkout sessions
  'checkout.session.completed': async (session) => {
    try {
      const stripeCustomerId = session.customer;
      const userId = session.metadata.userId;
      const email = session.metadata.email;

      // Update user's billing information in Firestore
      await adminDB.collection('users').doc(userId).set(
        {
          billing: {
            plan: 'Pro',
            status: 'Active',
            stripeCustomerId: stripeCustomerId,
          },
        },
        { merge: true }
      );

      console.log(`Payment successful for userId: ${userId}, stripeCustomerId: ${stripeCustomerId}`);
    } catch (error) {
      console.error(`Error in 'checkout.session.completed' handler: ${error.message}`);
      throw error;
    }
  },

  // Handle payment failures
  'invoice.payment_failed': async (invoice) => {
    try {
      const stripeCustomerId = invoice.customer;

      // Find user by stripeCustomerId
      const usersRef = adminDB.collection('users');
      const snapshot = await usersRef.where('billing.stripeCustomerId', '==', stripeCustomerId).get();

      if (snapshot.empty) {
        console.log('No matching user found for customerId:', stripeCustomerId);
        return;
      }

      // Update the user's billing status
      snapshot.forEach(async (doc) => {
        const userId = doc.id;
        await doc.ref.set(
          {
            'billing.status': 'Inactive',
          },
          { merge: true }
        );
        console.log(`Updated user ${userId} billing status to 'Inactive' due to payment failure`);
      });
    } catch (error) {
      console.error(`Error in 'invoice.payment_failed' handler: ${error.message}`);
      throw error;
    }
  },

  // Add more handlers as needed
};

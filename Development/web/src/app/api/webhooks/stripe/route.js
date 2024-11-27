// app/api/webhooks/stripe/route.js

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDB } from '@/firebaseAdmin'; // Ensure this path is correct

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Your Stripe webhook secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  console.log('--- WEBHOOK STARTED ---');

  let event;

  try {
    // Get the raw body and signature from the request
    const rawBody = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
      throw new Error('Missing Stripe signature.');
    }

    // Verify the event with Stripe
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    console.log('Webhook signature verified.');
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Log the entire event for debugging
  console.log('Received event:', JSON.stringify(event, null, 2));

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

      // Log retrieved values
      console.log('stripeCustomerId:', stripeCustomerId);
      console.log('userId:', userId);
      console.log('email:', email);

      if (!userId || !stripeCustomerId) {
        throw new Error('Missing userId or stripeCustomerId in session metadata.');
      }

      // Implement idempotency by checking if the event has already been processed
      const eventId = session.id;
      const eventRef = adminDB.collection('processed_events').doc(eventId);
      const eventDoc = await eventRef.get();

      if (eventDoc.exists) {
        console.log(`Event ${eventId} already processed.`);
        return;
      }

      // Update user's billing information in Firestore
      await adminDB.collection('users').doc(userId).set(
        {
          billing: {
            plan: 'Pro',
            status: 'Active',
            stripeCustomerId: stripeCustomerId,
            email: email,
          },
        },
        { merge: true }
      );

      // Mark the event as processed to prevent duplicate handling
      await eventRef.set({ processed: true });

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

      if (!stripeCustomerId) {
        throw new Error('Missing stripeCustomerId in invoice.');
      }

      // Implement idempotency
      const eventId = invoice.id;
      const eventRef = adminDB.collection('processed_events').doc(eventId);
      const eventDoc = await eventRef.get();

      if (eventDoc.exists) {
        console.log(`Event ${eventId} already processed.`);
        return;
      }

      // Find user by stripeCustomerId
      const usersRef = adminDB.collection('users');
      const snapshot = await usersRef.where('billing.stripeCustomerId', '==', stripeCustomerId).get();

      if (snapshot.empty) {
        console.log('No matching user found for customerId:', stripeCustomerId);
        // Optionally, mark the event as processed to avoid retrying
        await eventRef.set({ processed: true });
        return;
      }

      // Update the user's billing status
      const updatePromises = [];
      snapshot.forEach((doc) => {
        const userId = doc.id;
        const updatePromise = doc.ref.set(
          {
            'billing.status': 'Inactive',
          },
          { merge: true }
        ).then(() => {
          console.log(`Updated user ${userId} billing status to 'Inactive' due to payment failure`);
        });
        updatePromises.push(updatePromise);
      });
      await Promise.all(updatePromises);

      // Mark the event as processed
      await eventRef.set({ processed: true });
    } catch (error) {
      console.error(`Error in 'invoice.payment_failed' handler: ${error.message}`);
      throw error;
    }
  },

  // Add more handlers as needed
};

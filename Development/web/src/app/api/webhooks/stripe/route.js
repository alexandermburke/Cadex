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
    console.log('Webhook signature verified:', event.type);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Log the entire event for debugging
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    const handler = webhookHandlers[event.type];
    if (handler) {
      await handler(event.data.object, event.id);
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
  'checkout.session.completed': async (session, eventId) => {
    try {
      const { customer: stripeCustomerId, metadata } = session;

      if (!metadata || !metadata.userId) {
        console.error('Session metadata missing userId or email:', JSON.stringify(session, null, 2));
        throw new Error('Missing required field: userId in session metadata.');
      }

      const userId = metadata.userId;
      const email = metadata.email;

      console.log('Processing checkout.session.completed for:', { userId, stripeCustomerId, email });

      // Check if the event has already been processed (idempotency)
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
            stripeCustomerId,
            email,
          },
        },
        { merge: true }
      );

      // Mark the event as processed
      await eventRef.set({ processed: true });
      console.log(`User ${userId} updated to 'Pro' plan successfully.`);
    } catch (err) {
      console.error(`Error in 'checkout.session.completed' handler: ${err.message}`);
      throw err;
    }
  },

  // Handle payment failures
  'invoice.payment_failed': async (invoice, eventId) => {
    try {
      const stripeCustomerId = invoice.customer;

      if (!stripeCustomerId) {
        console.error('Invoice is missing customer field:', JSON.stringify(invoice, null, 2));
        throw new Error('Missing stripeCustomerId in invoice.');
      }

      // Check if the event has already been processed (idempotency)
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
        await eventRef.set({ processed: true }); // Mark as processed to avoid retries
        return;
      }

      // Update user's billing status
      await Promise.all(
        snapshot.docs.map((doc) =>
          doc.ref.set(
            {
              'billing.status': 'Inactive',
            },
            { merge: true }
          )
        )
      );

      // Mark the event as processed
      await eventRef.set({ processed: true });
      console.log(`Updated billing status to 'Inactive' for customerId: ${stripeCustomerId}`);
    } catch (err) {
      console.error(`Error in 'invoice.payment_failed' handler: ${err.message}`);
      throw err;
    }
  },

  // Add more handlers as needed
};

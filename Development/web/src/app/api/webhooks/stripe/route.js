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
  let rawBody;
  let sig;

  try {
    console.log('Attempting to parse request body as text...');
    rawBody = await request.text();
    sig = request.headers.get('stripe-signature');
    console.log('Raw request body received:', rawBody.slice(0, 500), '...'); // Log the first 500 chars for brevity
    console.log('Stripe Signature Header:', sig);

    if (!sig) {
      console.error('Missing Stripe signature header.');
      throw new Error('Missing Stripe signature.');
    }

    console.log('Verifying the Stripe event signature...');
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    console.log('Webhook signature verified. Event type:', event.type);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Log the entire event for debugging
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    const handler = webhookHandlers[event.type];
    if (handler) {
      console.log(`Found handler for event type: ${event.type}. Invoking...`);
      await handler(event.data.object, event.id);
      console.log(`Handler for ${event.type} completed successfully.`);
    } else {
      console.log(`Unhandled event type: ${event.type}. No action taken.`);
    }
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error(`Error handling event ${event.type}: ${err.message}`);
    return NextResponse.json({ error: `Error handling event: ${err.message}` }, { status: 500 });
  }
}

const webhookHandlers = {
  'checkout.session.completed': async (session, eventId) => {
    console.log('Entered checkout.session.completed handler with session:', session, 'and eventId:', eventId);
    try {
      const { customer: stripeCustomerId, metadata, subscription } = session;

      if (!metadata || !metadata.userId) {
        console.error('Session metadata is missing userId:', JSON.stringify(session, null, 2));
        throw new Error('Missing required field: userId in session metadata.');
      }

      const userId = metadata.userId;
      const email = metadata.email;

      console.log('Processing checkout.session.completed with data:', { userId, stripeCustomerId, email });

      // Check if the event has already been processed (idempotency)
      console.log('Checking if event has already been processed:', eventId);
      const eventRef = adminDB.collection('processed_events').doc(eventId);
      const eventDoc = await eventRef.get();

      if (eventDoc.exists) {
        console.log(`Event ${eventId} already processed. Skipping...`);
        return;
      }

      console.log('Fetching subscription data from Stripe for subscription ID:', subscription);
      const subscriptionData = await stripe.subscriptions.retrieve(subscription);
      console.log('Retrieved subscription data:', subscriptionData);

      const nextPaymentDue = subscriptionData.current_period_end; // Unix timestamp
      const amountDue = subscriptionData.items.data[0].price.unit_amount; // Amount in cents
      const currency = subscriptionData.items.data[0].price.currency.toUpperCase();
      const status = subscriptionData.status;

      console.log('Updating Firestore user billing info for userId:', userId);
      await adminDB.collection('users').doc(userId).set(
        {
          billing: {
            plan: 'Pro',
            status,
            stripeCustomerId,
            email,
            nextPaymentDue,
            amountDue,
            currency,
          },
        },
        { merge: true }
      );

      console.log('Marking event as processed in Firestore:', eventId);
      await eventRef.set({ processed: true });
      console.log(`User ${userId} updated to 'Pro' plan successfully with subscription details.`);
    } catch (err) {
      console.error(`Error in 'checkout.session.completed' handler: ${err.message}`);
      throw err;
    }
  },

  'invoice.payment_failed': async (invoice, eventId) => {
    console.log('Entered invoice.payment_failed handler with invoice:', invoice, 'and eventId:', eventId);
    try {
      const stripeCustomerId = invoice.customer;

      if (!stripeCustomerId) {
        console.error('Invoice is missing customer field:', JSON.stringify(invoice, null, 2));
        throw new Error('Missing stripeCustomerId in invoice.');
      }

      console.log('Checking if event has already been processed:', eventId);
      const eventRef = adminDB.collection('processed_events').doc(eventId);
      const eventDoc = await eventRef.get();

      if (eventDoc.exists) {
        console.log(`Event ${eventId} already processed. Skipping...`);
        return;
      }

      console.log('Searching Firestore for user with stripeCustomerId:', stripeCustomerId);
      const usersRef = adminDB.collection('users');
      const snapshot = await usersRef.where('billing.stripeCustomerId', '==', stripeCustomerId).get();

      if (snapshot.empty) {
        console.log('No matching user found for customerId:', stripeCustomerId);
        await eventRef.set({ processed: true }); // Mark as processed to avoid retries
        return;
      }

      console.log(`Found ${snapshot.size} matching user(s). Updating billing status to 'Inactive'...`);
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

      console.log('Marking event as processed in Firestore:', eventId);
      await eventRef.set({ processed: true });
      console.log(`Updated billing status to 'Inactive' for customerId: ${stripeCustomerId}`);
    } catch (err) {
      console.error(`Error in 'invoice.payment_failed' handler: ${err.message}`);
      throw err;
    }
  },

  // Add more handlers as needed
};

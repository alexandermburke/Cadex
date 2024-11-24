// app/api/webhook/route.js

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDB } from '@/firebaseAdmin'; // Adjust the import path as needed

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Ensure this matches your Stripe API version
});

// Your Stripe webhook secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Route Segment Configurations
export const runtime = 'nodejs'; // Ensures the route runs on Node.js
export const dynamic = 'force-dynamic'; // Forces the route to be dynamic

// Webhook handler
export async function POST(req) {
  console.log('🔔 Webhook received');

  const rawBody = await req.text(); // Read raw body as text
  const sig = req.headers.get('stripe-signature');

  let event;

  try {
    // Verify the event with Stripe
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    console.log(`✅  Event ${event.type} constructed successfully`);

    // Log event details for debugging (ensure sensitive data is protected)
    console.log('Event Details:', JSON.stringify(event, null, 2));
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  try {
    if (webhookHandlers[event.type]) {
      await webhookHandlers[event.type](event.data.object);
    } else {
      console.log(`❓ Unhandled event type: ${event.type}`);
    }

    // Acknowledge receipt of the event
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error(`🔥 Error handling event ${event.type}: ${err.message}`);
    return NextResponse.json({ error: `Error handling event: ${err.message}` }, { status: 500 });
  }
}

// Define handlers for relevant Stripe events
const webhookHandlers = {
  // Handle successful checkout sessions
  'checkout.session.completed': async (session) => {
    try {
      const stripeCustomerId = session.customer;
      const userId = session.metadata.userId;
      const email = session.metadata.email;

      console.log(`🔗 Processing checkout.session.completed for userId: ${userId}`);

      if (!stripeCustomerId || !userId) {
        throw new Error('Missing stripeCustomerId or userId in session metadata');
      }

      // Update user's billing information in Firestore
      await adminDB.collection('users').doc(userId).set(
        {
          billing: {
            plan: 'Pro',
            status: 'Active',
            stripeCustomerId: stripeCustomerId,
            email: email, // Optionally store email for reference
          },
        },
        { merge: true }
      );

      console.log(`✅  Saved stripeCustomerId (${stripeCustomerId}) for userId: ${userId}`);
    } catch (error) {
      console.error(`❌  Error in 'checkout.session.completed' handler: ${error.message}`);
      throw error;
    }
  },

  // Handle payment failures
  'invoice.payment_failed': async (invoice) => {
    try {
      const stripeCustomerId = invoice.customer;
      const status = invoice.status; // e.g., 'failed'

      console.log(`🔗 Processing invoice.payment_failed for customerId: ${stripeCustomerId}`);

      if (!stripeCustomerId) {
        throw new Error('Missing stripeCustomerId in invoice');
      }

      // Find user by stripeCustomerId
      const usersRef = adminDB.collection('users');
      const snapshot = await usersRef.where('billing.stripeCustomerId', '==', stripeCustomerId).get();

      if (snapshot.empty) {
        console.log(`🔍 No matching user found for customerId: ${stripeCustomerId}`);
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
        console.log(`✅  Updated user ${userId} billing status to 'Inactive' due to payment failure`);
      });
    } catch (error) {
      console.error(`❌  Error in 'invoice.payment_failed' handler: ${error.message}`);
      throw error;
    }
  },

  // Handle subscription updates (e.g., canceled, updated)
  'customer.subscription.updated': async (subscription) => {
    try {
      const stripeCustomerId = subscription.customer;
      const status = subscription.status; // e.g., 'active', 'canceled'

      console.log(`🔗 Processing customer.subscription.updated for customerId: ${stripeCustomerId}`);

      if (!stripeCustomerId) {
        throw new Error('Missing stripeCustomerId in subscription');
      }

      // Find user by stripeCustomerId
      const usersRef = adminDB.collection('users');
      const snapshot = await usersRef.where('billing.stripeCustomerId', '==', stripeCustomerId).get();

      if (snapshot.empty) {
        console.log(`🔍 No matching user found for customerId: ${stripeCustomerId}`);
        return;
      }

      // Update the user's billing status based on subscription status
      snapshot.forEach(async (doc) => {
        const userId = doc.id;
        const newStatus = status === 'active' ? 'Active' : 'Inactive';
        await doc.ref.set(
          {
            'billing.status': newStatus,
          },
          { merge: true }
        );
        console.log(`✅  Updated user ${userId} billing status to '${newStatus}'`);
      });
    } catch (error) {
      console.error(`❌  Error in 'customer.subscription.updated' handler: ${error.message}`);
      throw error;
    }
  },

  // Handle subscription deletions (cancellations)
  'customer.subscription.deleted': async (subscription) => {
    try {
      const stripeCustomerId = subscription.customer;

      console.log(`🔗 Processing customer.subscription.deleted for customerId: ${stripeCustomerId}`);

      if (!stripeCustomerId) {
        throw new Error('Missing stripeCustomerId in subscription');
      }

      // Find user by stripeCustomerId
      const usersRef = adminDB.collection('users');
      const snapshot = await usersRef.where('billing.stripeCustomerId', '==', stripeCustomerId).get();

      if (snapshot.empty) {
        console.log(`🔍 No matching user found for customerId: ${stripeCustomerId}`);
        return;
      }

      // Update the user's billing status to 'Canceled'
      snapshot.forEach(async (doc) => {
        const userId = doc.id;
        await doc.ref.set(
          {
            'billing.status': 'Canceled',
          },
          { merge: true }
        );
        console.log(`✅  Updated user ${userId} billing status to 'Canceled'`);
      });
    } catch (error) {
      console.error(`❌  Error in 'customer.subscription.deleted' handler: ${error.message}`);
      throw error;
    }
  },

  // Add more handlers as needed for other event types
};

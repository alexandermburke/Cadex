// app/api/create-checkout-session/route.js

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

// Checkout Session Creation Handler
export async function POST(req) {
  try {
    const { userId, email } = await req.json(); // Parsing JSON body

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email in request body.' }, { status: 400 });
    }

    // Create a Stripe Customer explicitly
    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        userId: userId,
      },
    });

    console.log(`✅  Created Stripe Customer: ${customer.id} for userId: ${userId}`);

    // Create Checkout Session with the Customer ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customer.id, // Associate the session with the customer
      line_items: [
        {
          price: 'price_1Hh1XYZ...', // Replace with your actual price ID from Stripe
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
        email: email,
      },
      success_url: `${process.env.YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.YOUR_DOMAIN}/cancel`,
    });

    console.log(`✅  Created Checkout Session: ${session.id} for customer: ${customer.id}`);

    return NextResponse.json({ sessionId: session.id }, { status: 200 });
  } catch (error) {
    console.error('❌  Error creating Checkout Session:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// app/api/create-checkout-session.js

import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, email } = req.body; // Ensure these are sent from the client

    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing userId or email in request body.' });
    }

    try {
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

      res.status(200).json({ sessionId: session.id });
    } catch (error) {
      console.error('❌  Error creating Checkout Session:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

// app/api/checkout/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Function to select the correct Stripe Secret Key based on the environment
const getStripeSecretKey = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.STRIPE_SECRET_KEY;
  } else {
    return process.env.STRIPE_SECRET_KEY_TEST;
  }
};

// Initialize Stripe with the selected Secret Key
const stripe = new Stripe(getStripeSecretKey(), {
  apiVersion: '2023-10-16',
});

export async function POST(request) {
  console.log('Received POST request at /api/checkout');

  const stripeSecretKey = getStripeSecretKey();

  // Log whether the Stripe Secret Key is set
  console.log(
    `Stripe Secret Key is ${stripeSecretKey ? 'set' : 'not set'} in ${
      process.env.NODE_ENV
    } environment.`
  );

  if (!stripeSecretKey) {
    console.error('Stripe Secret Key is not set.');
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }

  try {
    const { userId, email, priceId } = await request.json();

    console.log('Creating checkout session for user:', userId);

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId, // Ensure this is a valid price ID from Stripe Dashboard
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      customer_metadata: {
        userId: userId,
        email: email,
      },
    });

    console.log('Checkout session created:', session.id);

    return NextResponse.json({ sessionId: session.id }, { status: 200 });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session.' },
      { status: 500 }
    );
  }
}

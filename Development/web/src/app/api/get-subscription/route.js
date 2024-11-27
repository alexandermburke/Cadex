
import { getSubscription } from '@/lib/stripe'; // Replace with your actual Stripe integration

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { stripeCustomerId } = req.body;

    if (!stripeCustomerId) {
        return res.status(400).json({ error: 'Missing stripeCustomerId' });
    }

    try {
        const subscription = await getSubscription(stripeCustomerId); // Implement this function to fetch subscription data from Stripe

        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        res.status(200).json({
            nextPaymentDue: subscription.current_period_end, // Unix timestamp in seconds
            amountDue: subscription.amount_due, // Assuming you have this field
            currency: subscription.currency, // Currency code, e.g., 'usd'
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

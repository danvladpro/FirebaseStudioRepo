'use server';
/**
 * @fileOverview A flow for creating a Stripe Checkout session.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import Stripe from 'stripe';

export const CreateCheckoutSessionInputSchema = z.object({
  priceId: z.string(),
  userId: z.string(),
  userEmail: z.string(),
});

export type CreateCheckoutSessionInput = z.infer<
  typeof CreateCheckoutSessionInputSchema
>;

export const CreateCheckoutSessionOutputSchema = z.object({
  sessionId: z.string(),
  url: z.string().nullable(),
});

export type CreateCheckoutSessionOutput = z.infer<
  typeof CreateCheckoutSessionOutputSchema
>;

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export const createCheckoutSessionFlow = ai.defineFlow(
  {
    name: 'createCheckoutSessionFlow',
    inputSchema: CreateCheckoutSessionInputSchema,
    outputSchema: CreateCheckoutSessionOutputSchema,
  },
  async (input) => {
    const { priceId, userId, userEmail } = input;
    
    const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

    // Check if customer exists in Stripe, if not create a new one
    let customer;
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: { firebaseUID: userId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // or 'payment' for one-time
      success_url: `${YOUR_DOMAIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/checkout/cancel`,
      metadata: {
        firebaseUID: userId,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }
);

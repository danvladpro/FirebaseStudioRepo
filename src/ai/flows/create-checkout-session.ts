'use server';
/**
 * @fileOverview A server action for creating a Stripe Checkout session.
 */

import { z } from 'zod';
import Stripe from 'stripe';

const CreateCheckoutSessionInputSchema = z.object({
  priceId: z.string(),
  userId: z.string(),
  userEmail: z.string(),
  plan: z.enum(['one-week', 'lifetime']),
});

export type CreateCheckoutSessionInput = z.infer<
  typeof CreateCheckoutSessionInputSchema
>;

// Initialize Stripe with the secret key and a matching API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-09-30.clover' as any,
});

export async function createCheckoutSession(input: CreateCheckoutSessionInput) {
  try {
    const validatedInput = CreateCheckoutSessionInputSchema.safeParse(input);

    if (!validatedInput.success) {
      throw new Error('Invalid input for creating checkout session.');
    }

    const { priceId, userId, userEmail, plan } = validatedInput.data;
    
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
      payment_method_types: ['card','ideal'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/checkout/cancel`,
      metadata: {
        firebaseUID: userId,
        plan: plan,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error: any) {
    console.error("Error creating checkout session:", error.message);
    // In a real app, you might want to return a more structured error
    return { error: error.message };
  }
}

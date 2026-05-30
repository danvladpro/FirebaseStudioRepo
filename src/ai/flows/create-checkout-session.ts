'use server';

import { z } from 'zod';
import Stripe from 'stripe';
import { adminAuth } from '@/lib/firebase-admin';

const CreateCheckoutSessionInputSchema = z.object({
  firebaseToken: z.string(),
  plan: z.enum(['one-week', 'lifetime']),
});

export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionInputSchema>;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

const PRICE_IDS: Record<'one-week' | 'lifetime', string | undefined> = {
  'one-week': process.env.STRIPE_ONE_WEEK_PRICE_ID,
  'lifetime': process.env.STRIPE_LIFETIME_PRICE_ID,
};

export async function createCheckoutSession(input: CreateCheckoutSessionInput) {
  try {
    const validatedInput = CreateCheckoutSessionInputSchema.safeParse(input);

    if (!validatedInput.success) {
      throw new Error('Invalid input for creating checkout session.');
    }

    const { firebaseToken, plan } = validatedInput.data;

    let userId: string;
    let userEmail: string | undefined;
    try {
      const decoded = await adminAuth.verifyIdToken(firebaseToken);
      userId = decoded.uid;
      userEmail = decoded.email ?? undefined;
    } catch {
      throw new Error("Authentication failed. Please log in again.");
    }

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      throw new Error(`Stripe price ID for plan "${plan}" is not configured.`);
    }

    const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

    let customer: Stripe.Customer | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: userEmail,
          metadata: { firebaseUID: userId },
        });
      }
    }

    const session = await stripe.checkout.sessions.create({
      ...(customer ? { customer: customer.id } : {}),
      payment_method_types: ['card', 'ideal'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/checkout/cancel`,
      metadata: {
        firebaseUID: userId,
        plan,
      },
    });

    return { sessionId: session.id, url: session.url };
  } catch (error: any) {
    console.error("Error creating checkout session:", error.message);
    return { error: error.message };
  }
}

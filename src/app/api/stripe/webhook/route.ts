import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase-admin';

// Initialize Stripe with the secret key and a matching API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-09-30.clover' as any,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  let body: string;
  let signature: string | null;
  let event: Stripe.Event;

  try {
    body = await req.text();
    signature = req.headers.get('Stripe-Signature');

    if (!signature) {
      console.error('Webhook Error: Missing Stripe-Signature header.');
      return NextResponse.json(
        { error: 'Missing Stripe-Signature header' }, 
        { status: 400 });
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ received: true }, { status: 200 });

  // --- Handle the event ---
  (async () => {
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.firebaseUID;
          if (!userId) {
            console.error('Missing firebaseUID for session:', session.id);
            return;
          }
          await db.collection('users').doc(userId).update({ isPremium: true });
          console.log(`User ${userId} upgraded to premium`);
          break;
        }
        default:
          console.log(`ℹ️ Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      console.error(`💥 Error processing event ${event.type}:`, err);
    }
  })();
  return response;
}

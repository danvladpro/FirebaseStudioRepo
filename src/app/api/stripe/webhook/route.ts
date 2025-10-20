import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  let event: Stripe.Event;

  try {
    const body = await req.text();
    if (!sig || !webhookSecret) {
      console.error('Webhook Error: Missing Stripe signature or secret.');
      return NextResponse.json({ error: 'Webhook configuration error.' }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }
  
  // These will be used in the catch block if needed
  let userId: string | undefined;
  let customerId: string | undefined;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        userId = session.metadata?.firebaseUID;
        customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

        if (!userId) {
          throw new Error('Missing firebaseUID in session metadata.');
        }

        if (!customerId) {
          throw new Error('Missing customer ID in session.');
        }

        await db.collection('users').doc(userId).update({
          isPremium: true,
          stripeCustomerId: customerId,
          stripeError: null, // Clear any previous errors
        });
        console.log(`User ${userId} upgraded to premium.`);
        break;
      }
      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`💥 Error processing event ${event.type}:`, err);
    // If we have a userId, store the error in their document
    if (userId) {
      try {
        await db.collection('users').doc(userId).update({
          stripeError: `Webhook failed: ${err.message}`,
        });
      } catch (dbError: any) {
         console.error(`💥💥 Could not write error to user ${userId} document:`, dbError);
      }
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

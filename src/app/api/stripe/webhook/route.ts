import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';

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
      console.error('Webhook secret not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.firebaseUID;
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

        if (!userId) {
          throw new Error('Missing firebaseUID in session metadata.');
        }

        if (!customerId) {
          throw new Error('Missing customer ID in session.');
        }

        const userDocRef = adminDb.collection('users').doc(userId);
        await userDocRef.update({
          isPremium: true,
          stripeCustomerId: customerId,
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
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

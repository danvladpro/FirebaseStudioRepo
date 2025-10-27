
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
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

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      const userId = session.metadata?.firebaseUID;
      if (!userId) {
        return NextResponse.json({ error: 'Missing firebaseUID in session metadata.' }, { status: 400 });
      }

      try {
        const userDocRef = adminDb.collection('users').doc(userId);
        
        await userDocRef.set({
          isPremium: true,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription, // This will be null for one-time payments
        }, { merge: true });

        console.log(`User ${userId} upgraded to premium.`);
      } catch (error) {
        console.error('Error updating user to premium:', error);
        return NextResponse.json({ error: 'Failed to update user profile.' }, { status: 500 });
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

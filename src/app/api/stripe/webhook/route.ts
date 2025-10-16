import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { db } from '@/lib/firebase-admin'; // Using admin SDK for secure backend operations

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      const userId = session?.metadata?.firebaseUID;

      if (!userId) {
        console.error('Webhook Error: Missing firebaseUID in session metadata.');
        return NextResponse.json({ error: 'Missing user ID in session metadata' }, { status: 400 });
      }

      try {
        const userRef = db.collection('users').doc(userId);
        await userRef.update({
          isPremium: true,
          stripeCustomerId: session.customer,
        });
        console.log(`Successfully updated user ${userId} to premium.`);
      } catch (error) {
        console.error(`Error updating user ${userId} in Firestore:`, error);
        return NextResponse.json({ error: 'Failed to update user in database' }, { status: 500 });
      }
      break;
    
    // You can handle other event types here, like subscription updates or cancellations
    // case 'customer.subscription.deleted':
    // case 'customer.subscription.updated':
    //   // ... handle subscription changes
    //   break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

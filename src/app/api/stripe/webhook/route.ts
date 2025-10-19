import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.firebaseUID;

  if (!userId) {
    console.error('Webhook Error: Missing firebaseUID in session metadata.');
    // A 400 error tells Stripe not to retry this event.
    return NextResponse.json({ error: 'Missing user ID in metadata' }, { status: 400 });
  }

  try {
    const userRef = db.collection('users').doc(userId);
    const updateData = { isPremium: true };

    await userRef.update(updateData);

    console.log(`Successfully updated user ${userId} to premium.`);
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error(`Error updating user ${userId} in Firestore:`, error);
    // A 500 error tells Stripe to retry this event later.
    return NextResponse.json({ error: 'Failed to update user in database' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: string;
  let signature: string | null;
  let event: Stripe.Event;

  try {
    body = await req.text();
    signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe-Signature header.');
      return NextResponse.json({ error: 'Missing Stripe-Signature header' }, { status: 400 });
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  // --- Handle the event ---
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('Processing checkout.session.completed event.');
        const session = event.data.object as Stripe.Checkout.Session;
        // Return the response from the handler
        return await handleCheckoutSessionCompleted(session);
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
        // Return 200 for unhandled events so Stripe doesn't retry
        return NextResponse.json({ received: true, message: `Unhandled event type: ${event.type}` }, { status: 200 });
    }
  } catch (handlerError: any) {
    // This is a safety net for any unexpected errors within the switch statement.
    console.error(`Error processing event ${event?.type}:`, handlerError);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the event.' },
      { status: 500 }
    );
  }
}

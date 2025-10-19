import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { db } from '@/lib/firebase-admin'; // Using admin SDK for secure backend operations

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  let userId = session.metadata?.firebaseUID;

  // For subscriptions, metadata is on the subscription, not the session.
  if (session.mode === 'subscription' && session.subscription) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      userId = subscription.metadata?.firebaseUID;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      // Exit without erroring, as we can't process it.
      return; 
    }
  }

  if (!userId) {
    console.error('Webhook Error: Missing firebaseUID in session metadata or related subscription.');
    // Return a 400 status to indicate a client-side error to Stripe
    return NextResponse.json({ error: 'Missing user ID in metadata' }, { status: 400 });
  }

  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      isPremium: true,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription, // Store subscription ID for future management
    });
    console.log(`Successfully updated user ${userId} to premium.`);
  } catch (error) {
    console.error(`Error updating user ${userId} in Firestore:`, error);
    // Return a 500 status to indicate a server-side error
    return NextResponse.json({ error: 'Failed to update user in database' }, { status: 500 });
  }
}

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
      const response = await handleCheckoutSessionCompleted(session);
      // If the handler returned an error response, forward it.
      if (response) {
        return response;
      }
      break;
    
    // You can handle other event types here, like subscription updates or cancellations
    // For example, when a user's subscription ends.
    case 'customer.subscription.deleted':
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const isSubscriptionActive = subscription.status === 'active' || subscription.status === 'trialing';

      // Find user by stripeCustomerId
      const usersRef = db.collection('users');
      const snapshot = await usersRef.where('stripeCustomerId', '==', customerId).limit(1).get();
      
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        await userDoc.ref.update({ isPremium: isSubscriptionActive });
        console.log(`Updated premium status for user ${userDoc.id} to ${isSubscriptionActive}`);
      } else {
        console.warn(`Webhook Warning: No user found for stripeCustomerId: ${customerId}`);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

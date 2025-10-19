
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { db } from '@/lib/firebase-admin'; // Using admin SDK for secure backend operations

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.firebaseUID;
  const stripeCustomerId = session.customer;
  const stripeSubscriptionId = session.subscription;

  if (!userId) {
    console.error('Webhook Error: Missing firebaseUID in session metadata.');
    return NextResponse.json({ error: 'Missing user ID in metadata' }, { status: 400 });
  }

  try {
    const userRef = db.collection('users').doc(userId);
    const updateData: { isPremium: boolean; stripeCustomerId?: string | Stripe.Customer | null; stripeSubscriptionId?: string | Stripe.Subscription | null } = {
        isPremium: true,
        stripeCustomerId: stripeCustomerId,
    };
    
    if (session.mode === 'subscription') {
        updateData.stripeSubscriptionId = stripeSubscriptionId;
    }

    await userRef.update(updateData);

    console.log(`Successfully updated user ${userId} to premium.`);
  } catch (error) {
    console.error(`Error updating user ${userId} in Firestore:`, error);
    return NextResponse.json({ error: 'Failed to update user in database' }, { status: 500 });
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const isSubscriptionActive = ['active', 'trialing'].includes(subscription.status);
    const stripeCustomerId = subscription.customer as string;

    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('stripeCustomerId', '==', stripeCustomerId).limit(1).get();

        if (snapshot.empty) {
            console.warn(`Webhook Warning: No user found for stripeCustomerId: ${stripeCustomerId}`);
            return;
        }
        
        const userDoc = snapshot.docs[0];
        await userDoc.ref.update({ isPremium: isSubscriptionActive });
        console.log(`Updated premium status for user ${userDoc.id} to ${isSubscriptionActive} based on subscription ${subscription.id}`);
    } catch (error) {
        console.error(`Error updating user for stripeCustomerId ${stripeCustomerId}:`, error);
        return NextResponse.json({ error: 'Failed to update user subscription status' }, { status: 500 });
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
      // This handles both one-time payments and the creation of a subscription
      const response = await handleCheckoutSessionCompleted(session);
      if (response) {
        return response;
      }
      break;
    
    case 'customer.subscription.deleted':
    case 'customer.subscription.updated':
      // This handles renewals, cancellations, etc.
      const subscription = event.data.object as Stripe.Subscription;
      const subResponse = await handleSubscriptionUpdate(subscription);
       if (subResponse) {
        return subResponse;
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

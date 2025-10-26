
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const fulfillOrder = async (session: Stripe.Checkout.Session) => {
  const userId = session.metadata?.firebaseUID;
  if (!userId) {
    throw new Error('Missing firebaseUID in session metadata.');
  }

  const userDocRef = adminDb.collection('users').doc(userId);
  const userDoc = await userDocRef.get();

  // Prevent duplicate fulfillment
  if (userDoc.exists && userDoc.data()?.isPremium) {
    console.log(`User ${userId} is already premium. No action taken.`);
    return;
  }
  
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  if (!customerId) {
    throw new Error('Missing customer ID in session.');
  }

  await userDocRef.set({
    isPremium: true,
    stripeCustomerId: customerId,
    stripeSubscriptionId: session.subscription, // This will be null for one-time payments
  }, { merge: true });

  console.log(`User ${userId} upgraded to premium.`);
};

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
        // For sync payments or when payment_status is 'paid'
        if (session.payment_status === 'paid') {
          await fulfillOrder(session);
        } else {
            console.log(`ℹ️  Checkout session ${session.id} completed but payment not yet paid (status: ${session.payment_status}). Waiting for payment_intent.succeeded.`);
        }
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // This is the definitive confirmation for asynchronous payments like iDEAL
        const checkoutSessionId = paymentIntent.metadata.checkout_session_id;

        if (checkoutSessionId) {
            const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
            await fulfillOrder(session);
        } else {
             // Fallback for older sessions that might not have the metadata
            const sessions = await stripe.checkout.sessions.list({
                payment_intent: paymentIntent.id,
                limit: 1,
            });
            if (sessions.data.length > 0) {
                await fulfillOrder(sessions.data[0]);
            } else {
                console.warn(`Could not find checkout session for payment_intent ${paymentIntent.id}`);
            }
        }
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

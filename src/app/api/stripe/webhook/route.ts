import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import { addDays } from 'date-fns';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  if (!sig || !webhookSecret) {
    console.error('❌ Missing Stripe webhook secret or signature');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.firebaseUID;
        const plan = session.metadata?.plan; // 'one-week' or 'lifetime'
        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id;

        if (!userId || !plan) {
          console.error('❌ Missing firebaseUID or plan in session metadata');
          throw new Error('Missing firebaseUID or plan');
        }

        const userDocRef = adminDb.collection('users').doc(userId);

        let expiresAt: string | null = null;
        if (plan === 'one-week') {
          expiresAt = addDays(new Date(), 7).toISOString();
        }

        await userDocRef.update(
          {
            subscription: {
              type: plan === 'one-week' ? 'one-week' : 'lifetime',
              status: 'active',
              expiresAt,
              stripeCustomerId: customerId ?? null,
              stripeSessionId: session.id,
            },
          }
        );

        console.log(`✅ User ${userId} granted ${plan} premium access.`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled Stripe event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`💥 Error processing Stripe event:`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import { addDays, addMonths } from 'date-fns';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Grant premium access for a paid Checkout Session. Shared by the synchronous
// (`checkout.session.completed` with payment_status === 'paid') and the async
// (`checkout.session.async_payment_succeeded`, e.g. iDEAL) success paths.
async function grantPremiumAccess(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.firebaseUID;
  const plan = session.metadata?.plan; // 'one-week' or 'one-month'
  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id;

  if (!userId || !plan) {
    console.error('❌ Missing firebaseUID or plan in session metadata');
    throw new Error('Missing firebaseUID or plan');
  }

  let expiresAt: string | null = null;
  if (plan === 'one-week') {
    expiresAt = addDays(new Date(), 7).toISOString();
  } else if (plan === 'one-month') {
    expiresAt = addMonths(new Date(), 1).toISOString();
  }

  await adminDb.collection('users').doc(userId).update({
    subscription: {
      type: plan,
      status: 'active',
      expiresAt,
      stripeCustomerId: customerId ?? null,
      stripeSessionId: session.id,
    },
  });

  console.log(`✅ User ${userId} granted ${plan} premium access.`);
}

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
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // For instant methods (cards) payment_status is already 'paid' here.
        // For async methods (e.g. iDEAL) the session completes while still
        // 'unpaid'/'no_payment_required' — defer to async_payment_succeeded.
        if (session.payment_status === 'paid') {
          await grantPremiumAccess(session);
        } else {
          console.log(
            `ℹ️ Session ${session.id} completed but payment not yet confirmed (payment_status: ${session.payment_status}). Awaiting async result.`
          );
        }
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        // Delayed-notification payment (e.g. iDEAL) finally cleared.
        const session = event.data.object as Stripe.Checkout.Session;
        await grantPremiumAccess(session);
        break;
      }

      case 'checkout.session.async_payment_failed': {
        // Delayed-notification payment failed/expired. Access was never granted,
        // so there is nothing to revoke — just record it.
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.firebaseUID;
        console.warn(
          `⚠️ Async payment failed for session ${session.id} (user: ${userId ?? 'unknown'}). No access granted.`
        );
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

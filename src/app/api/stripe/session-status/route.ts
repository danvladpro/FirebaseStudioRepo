import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Lightweight, read-only lookup the checkout success page uses to tell apart
// "paid", "still processing (async, e.g. iDEAL)" and "failed/expired" — instead
// of inferring outcome from a client-side timeout. The webhook remains the
// source of truth for granting access; this only drives what the user sees.
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // payment_status: 'paid' | 'unpaid' | 'no_payment_required'
    // status:         'open' | 'complete' | 'expired'
    let paymentState: 'paid' | 'processing' | 'failed';
    if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
      paymentState = 'paid';
    } else if (session.status === 'expired') {
      paymentState = 'failed';
    } else {
      // Completed redirect but not yet paid → async method awaiting clearance.
      paymentState = 'processing';
    }

    return NextResponse.json({
      paymentState,
      paymentStatus: session.payment_status,
      status: session.status,
    });
  } catch (err: any) {
    console.error(`❌ Failed to retrieve checkout session: ${err.message}`);
    return NextResponse.json({ error: 'Could not retrieve session' }, { status: 500 });
  }
}

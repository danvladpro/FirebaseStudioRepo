"use client";

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle2, ArrowRight, Loader2, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import Confetti from 'react-confetti';
import { trackPurchase } from '@/lib/analytics';

type Status = 'polling' | 'success' | 'processing' | 'error';

const POLLING_TIMEOUT = 10000; // 10 seconds before we ask Stripe what's going on

/** Session ids already reported, so a page reload can't double-count a sale. */
const REPORTED_KEY = 'reportedPurchaseSessions';

function alreadyReported(sessionId: string): boolean {
  try {
    const raw = localStorage.getItem(REPORTED_KEY);
    return raw ? (JSON.parse(raw) as string[]).includes(sessionId) : false;
  } catch {
    return false;
  }
}

function markReported(sessionId: string): void {
  try {
    const raw = localStorage.getItem(REPORTED_KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    // Keep the list short — only recent sessions can plausibly be re-visited.
    localStorage.setItem(
      REPORTED_KEY,
      JSON.stringify([...ids, sessionId].slice(-20))
    );
  } catch {
    /* localStorage unavailable (private mode) — Google dedupes on transaction_id */
  }
}

function SuccessContent() {
  const { isPremium, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<Status>('polling');
  const [showConfetti, setShowConfetti] = useState(false);

  // The real-time Firestore listener (auth-provider) is the happy path: when the
  // webhook grants access, isPremium flips and we resolve instantly.
  useEffect(() => {
    if (authLoading) return;
    if (isPremium) {
      setStatus('success');
      setShowConfetti(true);
    }
  }, [isPremium, authLoading]);

  // Report the conversion only once premium access actually exists — i.e. the
  // Stripe webhook has confirmed payment. Landing on this URL is not proof of
  // purchase, so this deliberately keys off `isPremium` rather than page load.
  // The real charged amount comes from Stripe so the reported value is correct
  // whichever plan was bought (and if a coupon ever reduces it).
  useEffect(() => {
    if (!isPremium || !sessionId) return;
    if (alreadyReported(sessionId)) return;

    markReported(sessionId);

    let cancelled = false;
    (async () => {
      let value: number | null = null;
      let currency = 'EUR';
      try {
        const res = await fetch(
          `/api/stripe/session-status?session_id=${encodeURIComponent(sessionId)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (typeof data.amount === 'number') value = data.amount;
          if (typeof data.currency === 'string') currency = data.currency;
        }
      } catch {
        /* fall through — a conversion without a value beats no conversion */
      }
      if (cancelled) return;
      trackPurchase({ value: value ?? 0, currency, transactionId: sessionId });
    })();

    return () => {
      cancelled = true;
    };
  }, [isPremium, sessionId]);

  // If access hasn't appeared within the timeout, don't guess from the clock —
  // ask Stripe whether the payment is genuinely processing (async, e.g. iDEAL)
  // or actually failed/delayed. The webhook stays the source of truth for access.
  useEffect(() => {
    if (authLoading || isPremium) return;

    const timeoutId = setTimeout(async () => {
      if (isPremium) return; // resolved during the wait

      if (!sessionId) {
        setStatus('error');
        return;
      }

      try {
        const res = await fetch(`/api/stripe/session-status?session_id=${encodeURIComponent(sessionId)}`);
        if (!res.ok) throw new Error('lookup failed');
        const { paymentState } = await res.json();

        // 'paid' but isPremium still false → webhook lag, keep waiting via the
        // listener but reassure rather than alarm.
        if (paymentState === 'processing' || paymentState === 'paid') {
          setStatus('processing');
        } else {
          setStatus('error');
        }
      } catch {
        // Network/Stripe lookup failed — fall back to the soft error card.
        setStatus('error');
      }
    }, POLLING_TIMEOUT);

    return () => clearTimeout(timeoutId);
  }, [isPremium, authLoading, sessionId]);

  const renderContent = () => {
    switch (status) {
      case 'polling':
        return {
          icon: <Loader2 className="h-12 w-12 animate-spin text-primary" />,
          title: "Finalizing Your Upgrade...",
          description: "Please wait a moment while we update your account.",
          content: "This shouldn't take more than a few seconds. Please don't refresh the page.",
          footer: <Button className="w-full" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait</Button>
        };
      case 'success':
        return {
          icon: <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit"><CheckCircle2 className="h-12 w-12" /></div>,
          title: "Payment Successful!",
          description: "Welcome to Premium! Your account has been upgraded.",
          content: "You now have unlimited access to all challenges, flashcards, and the final exam. Let's get started!",
          footer: <Button asChild className="w-full"><Link href="/dashboard">Go to Your Dashboard<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        };
      case 'processing':
        return {
          icon: <div className="mx-auto bg-accent/10 text-accent rounded-full p-3 w-fit"><Clock className="h-12 w-12" /></div>,
          title: "Payment Processing",
          description: "Your payment is being confirmed by your bank.",
          content: "Some payment methods (like iDEAL) take a little longer to clear. You can safely leave this page — your premium access will activate automatically as soon as the payment is confirmed, and this page will update if you stay.",
          footer: <Button asChild className="w-full" variant="outline"><Link href="/dashboard">Go to Dashboard<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        };
      case 'error':
        return {
          icon: <div className="mx-auto bg-destructive/10 text-destructive rounded-full p-3 w-fit"><AlertTriangle className="h-12 w-12" /></div>,
          title: "Update Issue",
          description: "We couldn't confirm your upgrade just yet.",
          content: "If your payment went through, your premium status will appear shortly. If it doesn't, please contact support with your order details.",
          footer: <Button asChild className="w-full"><Link href="/dashboard">Check Your Dashboard<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        };
    }
  };

  const { icon, title, description, content, footer } = renderContent();

  return (
    <>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            {icon}
            <CardTitle className="mt-4 text-2xl">{title}</CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground text-sm">
                  {content}
              </p>
          </CardContent>
          <CardFooter>
            {footer}
          </CardFooter>
        </Card>
      </div>
    </>
  );
}


export default function CheckoutSuccessPage() {
    return (
        <Suspense>
            <SuccessContent />
        </Suspense>
    )
}

"use client";

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle2, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import Confetti from 'react-confetti';

type Status = 'polling' | 'success' | 'error';

const POLLING_TIMEOUT = 10000; // 10 seconds

function SuccessContent() {
  const { isPremium, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<Status>('polling');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (isPremium) {
      setStatus('success');
      setShowConfetti(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      // Check one last time before declaring timeout
      if (!isPremium) {
        setStatus('error');
      }
    }, POLLING_TIMEOUT);

    return () => clearTimeout(timeoutId);

  }, [isPremium, authLoading]);

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
      case 'error':
        return {
          icon: <div className="mx-auto bg-destructive/10 text-destructive rounded-full p-3 w-fit"><AlertTriangle className="h-12 w-12" /></div>,
          title: "Update Issue",
          description: "Your payment was successful, but we encountered a delay updating your account.",
          content: "If your premium status doesn't appear shortly, please contact support with your order details.",
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

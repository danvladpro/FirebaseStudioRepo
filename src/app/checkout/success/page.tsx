
"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { userProfile, loading } = useAuth();

  useEffect(() => {
    // Redirect non-premium users away if they land here by mistake
    if (!loading && !userProfile?.isPremium) {
       // A small delay to allow webhook to potentially process
       setTimeout(() => {
            // Re-check after delay, maybe redirect to dashboard if still not premium
       }, 3000);
    }
  }, [userProfile, loading, router]);


  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <CardTitle className="mt-4 text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Welcome to Premium! Your account has been upgraded.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                You now have unlimited access to all challenges, flashcards, and the final exam. Let's get started!
            </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/dashboard">
              Go to Your Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

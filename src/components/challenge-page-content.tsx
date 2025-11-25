
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ChallengeSet } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import ChallengeUI from '@/components/challenge-ui';
import { useAuth } from './auth-provider';
import { ChallengePreloader } from './challenge-preloader';

export function ChallengePageContent({ challengeSet }: { challengeSet: ChallengeSet }) {
  const { user } = useAuth();
  const [isPreloading, setIsPreloading] = useState(true);

  if (!user) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
            <p>Please log in to start a challenge.</p>
        </div>
    )
  }

  return (
    <>
      <AppHeader />
      <main className="min-h-screen w-full flex flex-col items-center justify-center bg-muted/40 p-4 pt-20">
        <div className="w-full max-w-2xl mb-4 flex justify-end">
            <Button asChild variant="outline">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>
        {isPreloading ? (
            <ChallengePreloader challengeSet={challengeSet} onLoaded={() => setIsPreloading(false)} />
        ) : (
            <ChallengeUI set={challengeSet} />
        )}
      </main>
    </>
  );
}

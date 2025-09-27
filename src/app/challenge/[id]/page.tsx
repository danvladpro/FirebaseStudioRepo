
"use client";

import { ALL_CHALLENGE_SETS } from '@/lib/challenges';
import ChallengeUI from '@/components/challenge-ui';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ChallengeSet } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import { Suspense } from 'react';
import { useAuth } from '@/components/auth-provider';

function ChallengePageContent({ params }: { params: { id: string } }) {
  const challengeSet = ALL_CHALLENGE_SETS.find(set => set.id === params.id) as ChallengeSet | undefined;
  const { isGuest } = useAuth();

  if (!challengeSet) {
    notFound();
  }

  return (
    <>
      <AppHeader />
      <main className="min-h-screen w-full flex flex-col items-center justify-center bg-muted/40 p-4 pt-20">
        <div className="w-full max-w-2xl mb-4 flex justify-end">
            <Button asChild variant="outline">
                <Link href="/challenges">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Challenges
                </Link>
            </Button>
        </div>
        <ChallengeUI set={challengeSet} />
      </main>
    </>
  );
}

export default function ChallengePage({ params }: { params: { id: string } }) {
  return (
    <Suspense>
      <ChallengePageContent params={params} />
    </Suspense>
  )
}

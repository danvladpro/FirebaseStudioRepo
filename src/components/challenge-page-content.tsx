
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ChallengeSet } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import ChallengeUI from '@/components/challenge-ui';
import { useAuth } from '@/components/auth-provider';

export function ChallengePageContent({ challengeSet }: { challengeSet: ChallengeSet }) {
  const { isGuest } = useAuth();
  const guestQuery = isGuest ? '?guest=true' : '';

  return (
    <>
      <AppHeader />
      <main className="min-h-screen w-full flex flex-col items-center justify-center bg-muted/40 p-4 pt-20">
        <div className="w-full max-w-2xl mb-4 flex justify-end">
            <Button asChild variant="outline">
                <Link href={`/challenges${guestQuery}`}>
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

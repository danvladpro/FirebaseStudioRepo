import { ALL_CHALLENGE_SETS } from '@/lib/challenges';
import ChallengeUI from '@/components/challenge-ui';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ChallengeSet } from '@/lib/types';
import { AppHeader } from '@/components/app-header';

export default function ChallengePage({ params }: { params: { id: string } }) {
  const challengeSet = ALL_CHALLENGE_SETS.find(set => set.id === params.id) as ChallengeSet | undefined;

  if (!challengeSet) {
    notFound();
  }

  return (
    <>
      <AppHeader />
      <main className="min-h-screen w-full flex items-center justify-center bg-muted/40 p-4 pt-20">
        <ChallengeUI set={challengeSet} />
      </main>
    </>
  );
}


import { ALL_CHALLENGE_SETS } from '@/lib/challenges';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ChallengePageContent } from '@/components/challenge-page-content';
import { ChallengeSet } from '@/lib/types';


export default async function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const challengeSet = ALL_CHALLENGE_SETS.find(set => set.id === id) as ChallengeSet | undefined;

  if (!challengeSet) {
    notFound();
  }
  
  return (
    <Suspense>
      <ChallengePageContent challengeSet={challengeSet} />
    </Suspense>
  )
}

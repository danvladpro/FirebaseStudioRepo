
import { ALL_CHALLENGE_SETS } from '@/lib/challenges';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ChallengePageContent } from '@/components/challenge-page-content';
import { ChallengeSet } from '@/lib/types';


export default function ChallengePage({ params }: { params: { id: string } }) {
  const challengeSet = ALL_CHALLENGE_SETS.find(set => set.id === params.id) as ChallengeSet | undefined;

  if (!challengeSet) {
    notFound();
  }
  
  return (
    <Suspense>
      <ChallengePageContent challengeSet={challengeSet} />
    </Suspense>
  )
}



import { ALL_CHALLENGE_SETS } from '@/lib/challenges';
import { notFound } from 'next/navigation';
import { ChallengeSet } from '@/lib/types';
import { Suspense } from 'react';
import { FlashcardSetPageContent } from '@/components/flashcard-set-page-content';


export default function FlashcardSetPage({ params }: { params: { id: string } }) {
  const challengeSet = ALL_CHALLENGE_SETS.find(set => set.id === params.id) as ChallengeSet | undefined;

  if (!challengeSet) {
    notFound();
  }

  return (
    <Suspense>
        <FlashcardSetPageContent challengeSet={challengeSet} />
    </Suspense>
  );
}

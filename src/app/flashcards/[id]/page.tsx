

import { ALL_CHALLENGE_SETS } from '@/lib/challenges';
import { notFound } from 'next/navigation';
import { ChallengeSet } from '@/lib/types';
import { Suspense } from 'react';
import { FlashcardSetPageContent } from '@/components/flashcard-set-page-content';


export default async function FlashcardSetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const challengeSet = ALL_CHALLENGE_SETS.find(set => set.id === id) as ChallengeSet | undefined;

  if (!challengeSet) {
    notFound();
  }

  return (
    <Suspense>
        <FlashcardSetPageContent challengeSet={challengeSet} />
    </Suspense>
  );
}

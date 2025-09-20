
import { ALL_CHALLENGE_SETS } from '@/lib/challenges';
import { notFound } from 'next/navigation';
import { ChallengeSet } from '@/lib/types';
import { FlashcardClientPage } from '@/components/flashcard-client-page';
import { AppHeader } from '@/components/app-header';

export default function FlashcardSetPage({ params }: { params: { id: string } }) {
  const challengeSet = ALL_CHALLENGE_SETS.find(set => set.id === params.id) as ChallengeSet | undefined;

  if (!challengeSet) {
    notFound();
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppHeader />
      <main className="flex-1 flex flex-col items-center pb-12 container pt-24">
        <FlashcardClientPage set={challengeSet} />
      </main>
    </div>
  );
}

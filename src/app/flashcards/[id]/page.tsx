

import { ALL_CHALLENGE_SETS } from '@/lib/challenges';
import { notFound } from 'next/navigation';
import { ChallengeSet } from '@/lib/types';
import { FlashcardClientPage } from '@/components/flashcard-client-page';
import { AppHeader } from '@/components/app-header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

function FlashcardSetPageContent({ params }: { params: { id: string } }) {
  const challengeSet = ALL_CHALLENGE_SETS.find(set => set.id === params.id) as ChallengeSet | undefined;

  if (!challengeSet) {
    notFound();
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppHeader />
      <main className="flex-1 flex flex-col items-center pb-12 container pt-24">
        <header className="w-full max-w-4xl mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{challengeSet.name}</h1>
            <p className="text-muted-foreground mt-1">Study the shortcuts for this set.</p>
          </div>
           <Button asChild variant="outline">
              <Link href="/flashcards">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to All Decks
              </Link>
          </Button>
        </header>
        <FlashcardClientPage set={challengeSet} />
      </main>
    </div>
  );
}


export default function FlashcardSetPage({ params }: { params: { id: string } }) {
  return (
    <Suspense>
      <FlashcardSetPageContent params={params} />
    </Suspense>
  );
}

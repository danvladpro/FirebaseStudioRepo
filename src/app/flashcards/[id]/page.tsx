
import { ALL_CHALLENGE_SETS } from '@/lib/challenges';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ChallengeSet } from '@/lib/types';
import { FlashcardClientPage } from '@/components/flashcard-client-page';
import { Logo } from '@/components/logo';

export default function FlashcardSetPage({ params }: { params: { id: string } }) {
  const challengeSet = ALL_CHALLENGE_SETS.find(set => set.id === params.id) as ChallengeSet | undefined;

  if (!challengeSet) {
    notFound();
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="container py-8 md:py-12 flex items-center justify-between">
            <div>
                <Logo />
                <p className="text-muted-foreground mt-2">
                    Studying: <span className="font-semibold text-foreground">{challengeSet.name}</span>
                </p>
            </div>
            <Button asChild variant="outline">
                <Link href="/flashcards">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Decks
                </Link>
            </Button>
        </header>
        <main className="flex-1 flex flex-col items-center pb-12 container">
            <FlashcardClientPage set={challengeSet} />
        </main>
    </div>
  );
}

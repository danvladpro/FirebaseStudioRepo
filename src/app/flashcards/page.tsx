
import { ALL_CHALLENGE_SETS, CHALLENGE_SETS } from '@/lib/challenges';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { FlashcardClientPage } from '@/components/flashcard-client-page';
import { Challenge } from '@/lib/types';

export default function FlashcardsPage() {
    const allChallenges: Challenge[] = ALL_CHALLENGE_SETS.flatMap(set => set.id !== 'exam' ? set.challenges : []);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
             <header className="container py-8 md:py-12 flex items-center justify-between">
                <div>
                    <Logo />
                    <p className="text-muted-foreground mt-2">
                        Study the shortcuts, one card at a time.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </header>
            <main className="flex-1 flex flex-col items-center pb-12 container">
                <FlashcardClientPage allChallenges={allChallenges} challengeSets={CHALLENGE_SETS} />
            </main>
        </div>
    );
}

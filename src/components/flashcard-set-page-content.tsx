
"use client";

import { ChallengeSet } from '@/lib/types';
import { FlashcardClientPage } from '@/components/flashcard-client-page';
import { AppHeader } from '@/components/app-header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ClipboardCopy, ArrowRightLeft, MousePointerSquareDashed, Pilcrow, FunctionSquare, Layers, Filter, GalleryVerticalEnd, Award, Medal, Trophy } from 'lucide-react';
import { useAuth } from './auth-provider';
import { ElementType } from 'react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, ElementType> = {
    ClipboardCopy,
    ArrowRightLeft,
    MousePointerSquareDashed,
    Pilcrow,
    FunctionSquare,
    Layers,
    Filter,
    GalleryVerticalEnd,
    Award,
    Medal,
    Trophy
};


export function FlashcardSetPageContent({ challengeSet }: { challengeSet: ChallengeSet }) {
  const { user } = useAuth();
  const Icon = iconMap[challengeSet.iconName];


  if (!user) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
            <p>Please log in to study flashcards.</p>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppHeader />
      <main className="flex-1 flex flex-col items-center pb-12 container pt-24">
        <header className="w-full max-w-4xl mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              {Icon && <Icon className="w-8 h-8 text-primary" />}
              <h1 className="text-3xl font-bold">{challengeSet.name}</h1>
            </div>
            <p className="text-muted-foreground mt-1">Study the shortcuts for this set.</p>
          </div>
           <Button asChild variant="outline">
              <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
              </Link>
          </Button>
        </header>
        <FlashcardClientPage set={challengeSet} />
      </main>
    </div>
  );
}

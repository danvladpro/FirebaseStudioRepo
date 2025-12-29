
"use client";

import Link from 'next/link';
import { ArrowLeft, ClipboardCopy, ArrowRightLeft, MousePointerSquareDashed, Pilcrow, FunctionSquare, ArrowRight, Layers, BookMarked, Filter, Lock, GalleryVerticalEnd, Sparkles, Award, Medal, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CHALLENGE_SETS } from '@/lib/challenges';
import { ChallengeSet } from '@/lib/types';
import { ElementType } from 'react';
import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PremiumModal } from '@/components/premium-modal';
import React from 'react';

const iconMap: Record<ChallengeSet["iconName"], ElementType> = {
    ClipboardCopy,
    ArrowRightLeft,
    MousePointerSquareDashed,
    Pilcrow,
    FunctionSquare,
    BookMarked: Layers,
    Layers,
    Filter,
    GalleryVerticalEnd,
    Award,
    Medal,
    Trophy
};

export default function FlashcardsPage() {
    const { isPremium } = useAuth();
    const [isPremiumModalOpen, setIsPremiumModalOpen] = React.useState(false);

    const isLimited = !isPremium;

    const GUEST_ALLOWED_SET_ID = 'formatting-basics';
    
    const setsToDisplay = isLimited
      ? CHALLENGE_SETS.map(set => ({ ...set, isLocked: set.id !== GUEST_ALLOWED_SET_ID }))
      : CHALLENGE_SETS.map(set => ({ ...set, isLocked: false }));
      
    const getSubtitle = () => {
        if (isLimited) {
            return "Try 'Formatting Basics' below. Go premium for full access.";
        }
        return "Choose a set to study with flashcards.";
    }

    return (
        <>
        <PremiumModal isOpen={isPremiumModalOpen} onOpenChange={setIsPremiumModalOpen} />
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <AppHeader />
            <main className="flex-1 container py-8 md:py-12 mt-16">
                <header className="mb-8 md:mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Flashcard Decks</h1>
                        <p className="text-muted-foreground mt-1">
                            {getSubtitle()}
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </header>

                <section>
                    <TooltipProvider>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {setsToDisplay.map((set) => {
                            const Icon = iconMap[set.iconName];

                             const cardContent = (
                                <Card key={set.id} className={cn("flex flex-col", set.isLocked && "bg-muted/50 text-muted-foreground")}>
                                    <CardContent className="p-6 flex-grow">
                                        <div className="flex items-start gap-4">
                                            <Icon className={cn("w-10 h-10 mt-1", set.isLocked ? "text-muted-foreground" : "text-primary")} />
                                            <div>
                                                <h3 className={cn("font-semibold text-lg", !set.isLocked && "text-card-foreground")}>{set.name}</h3>
                                                <p className="text-sm mt-1">{set.description}</p>
                                                <p className={cn("text-sm font-semibold mt-2", set.isLocked ? "text-muted-foreground" : "text-primary")}>
                                                    {set.id === GUEST_ALLOWED_SET_ID && isLimited ? '5 cards (Demo)' : `${set.challenges.length} cards`}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div className="p-6 pt-0 mt-auto">
                                      {set.isLocked && isLimited ? (
                                          <Button className="w-full" variant="premium" onClick={() => setIsPremiumModalOpen(true)}>
                                              <Sparkles className="mr-2 h-4 w-4" />
                                              Go Premium
                                          </Button>
                                      ) : (
                                          <Button asChild className="w-full">
                                              <Link href={`/flashcards/${set.id}`}>
                                                  Study this set
                                                  <ArrowRight className="ml-2 h-4 w-4" />
                                              </Link>
                                          </Button>
                                      )}
                                    </div>
                                </Card>
                            );

                            if (set.isLocked) {
                                return (
                                    <Tooltip key={set.id}>
                                        <TooltipTrigger asChild>
                                            <div className="cursor-not-allowed w-full h-full">
                                                {cardContent}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Upgrade to unlock this deck.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            }

                            return cardContent;
                        })}
                    </div>
                    </TooltipProvider>
                </section>
            </main>
        </div>
        </>
    );
}

    
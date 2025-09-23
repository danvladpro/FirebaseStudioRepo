
"use client";

import Link from 'next/link';
import { ArrowLeft, ClipboardCopy, ArrowRightLeft, MousePointerSquareDashed, Pilcrow, FunctionSquare, BookMarked, ArrowRight, Layers, Filter, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CHALLENGE_SETS } from '@/lib/challenges';
import { ChallengeSet } from '@/lib/types';
import { usePerformanceTracker } from '@/hooks/use-performance-tracker';
import { Skeleton } from '@/components/ui/skeleton';
import { ElementType } from 'react';
import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const iconMap: Record<ChallengeSet["iconName"], ElementType> = {
    ClipboardCopy,
    ArrowRightLeft,
    MousePointerSquareDashed,
    Pilcrow,
    FunctionSquare,
    BookMarked,
    Layers,
    Filter,
};

export default function ChallengesPage() {
    const { stats, isLoaded } = usePerformanceTracker();
    const { isGuest } = useAuth();
    const GUEST_ALLOWED_SET_ID = 'formatting-basics';

    const setsToDisplay = isGuest 
      ? CHALLENGE_SETS.map(set => ({ ...set, isLocked: set.id !== GUEST_ALLOWED_SET_ID }))
      : CHALLENGE_SETS.map(set => ({ ...set, isLocked: false }));


    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <AppHeader />
            <main className="flex-1 container py-8 md:py-12 mt-16">
                <header className="mb-8 md:mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Practice Challenges</h1>
                        <p className="text-muted-foreground mt-1">
                            {isGuest ? "Try the 'Formatting Basics' set below. Sign up for full access." : "Choose a set to practice specific skills."}
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
                    <div className="flex flex-col gap-4">
                        {setsToDisplay.map((set) => {
                            const Icon = iconMap[set.iconName];
                            const setStats = stats[set.id];
                            const hasBeenCompleted = !!setStats?.lastTrained;
                            const bestTime = setStats?.bestTime;
                            const lastScore = setStats?.lastScore;

                            const cardContent = (
                                <Card key={set.id} className={cn(set.isLocked && "bg-muted/50 text-muted-foreground")}>
                                    <CardContent className="p-4 grid md:grid-cols-[auto_1fr_auto] items-center gap-4">
                                        <Icon className={cn("w-10 h-10", set.isLocked ? "text-muted-foreground" : "text-primary")} />
                                        <div className="flex-1">
                                            <h3 className={cn("font-semibold text-lg", !set.isLocked && "text-card-foreground")}>{set.name}</h3>
                                            <p className="text-sm">{set.description}</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-x-4 text-sm text-center">
                                            <div>
                                                <p className={cn("font-bold text-lg", !set.isLocked && "text-card-foreground")}>{set.challenges.length}</p>
                                                <p>Questions</p>
                                            </div>
                                            <div>
                                                {isLoaded && !isGuest ? (
                                                    lastScore !== undefined && lastScore !== null ? (
                                                        <p className={cn("font-bold text-lg", !set.isLocked && "text-card-foreground")}>{lastScore.toFixed(0)}%</p>
                                                    ) : (
                                                        <p className={cn("font-bold text-lg", !set.isLocked && "text-card-foreground")}>-</p>
                                                    )
                                                ) : <Skeleton className={cn("h-7 w-12 mx-auto", set.isLocked && "hidden")} />}
                                                 {isGuest && <p className={cn("font-bold text-lg", !set.isLocked && "text-card-foreground")}>-</p>}
                                                <p>Last Score</p>
                                            </div>
                                            <div>
                                                {isLoaded && !isGuest ? (
                                                    <p className={cn("font-bold text-lg", !set.isLocked && "text-card-foreground")}>{bestTime ? `${bestTime.toFixed(2)}s` : 'N/A'}</p>
                                                ) : <Skeleton className={cn("h-7 w-12 mx-auto", set.isLocked && "hidden")} />}
                                                {isGuest && <p className={cn("font-bold text-lg", !set.isLocked && "text-card-foreground")}>N/A</p>}
                                                <p>Best Time</p>
                                            </div>
                                        </div>
                                        <Button asChild size="sm" className="md:col-start-4" variant={hasBeenCompleted && !set.isLocked ? "warning" : "default"} disabled={set.isLocked}>
                                            <Link href={set.isLocked ? "#" : `/challenge/${set.id}`}>
                                                {set.isLocked ? <Lock /> : (hasBeenCompleted ? 'Try Again' : 'Start')}
                                                {!set.isLocked && <ArrowRight className="ml-2 h-4 w-4" />}
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                            
                             if (set.isLocked) {
                                return (
                                    <Tooltip key={set.id}>
                                        <TooltipTrigger asChild>
                                            <div className="cursor-not-allowed">{cardContent}</div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Sign up to unlock this challenge set.</p>
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
    );
}

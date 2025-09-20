"use client";

import Link from 'next/link';
import { ArrowLeft, ClipboardCopy, ArrowRightLeft, MousePointerSquareDashed, Pilcrow, FunctionSquare, BookMarked, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CHALLENGE_SETS } from '@/lib/challenges';
import { ChallengeSet } from '@/lib/types';
import { Logo } from '@/components/logo';
import { usePerformanceTracker } from '@/hooks/use-performance-tracker';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: Record<ChallengeSet["iconName"], React.FC<React.SVGProps<SVGSVGElement>>> = {
    ClipboardCopy,
    ArrowRightLeft,
    MousePointerSquareDashed,
    Pilcrow,
    FunctionSquare,
    BookMarked,
};

export default function ChallengesPage() {
    const { stats, isLoaded } = usePerformanceTracker();

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <main className="flex-1 container py-8 md:py-12">
                <header className="mb-8 md:mb-12 flex items-center justify-between">
                    <div>
                        <Logo />
                        <p className="text-muted-foreground mt-2">
                            Choose a set to practice your skills.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>
                </header>

                <section>
                    <h2 className="text-2xl font-bold mb-6">Choose Your Challenge</h2>
                    <div className="flex flex-col gap-4">
                        {CHALLENGE_SETS.map((set) => {
                            const Icon = iconMap[set.iconName];
                            const setStats = stats[set.id];
                            const hasBeenCompleted = !!setStats?.lastTrained;
                            const bestTime = setStats?.bestTime;

                            return (
                                <Card key={set.id}>
                                    <CardContent className="p-4 grid md:grid-cols-[auto_1fr_auto] items-center gap-4">
                                        <Icon className="w-10 h-10 text-primary" />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">{set.name}</h3>
                                            <p className="text-sm text-muted-foreground">{set.description}</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-x-4 text-sm text-center">
                                            <div>
                                                <p className="font-bold text-lg">{set.challenges.length}</p>
                                                <p className="text-muted-foreground">Questions</p>
                                            </div>
                                            <div>
                                                {isLoaded ? (
                                                    hasBeenCompleted ? <CheckCircle className="h-7 w-7 text-green-500 mx-auto" /> : <p className="font-bold text-lg">-</p>
                                                ) : <Skeleton className="h-7 w-12 mx-auto" />}
                                                <p className="text-muted-foreground">Completed</p>
                                            </div>
                                            <div>
                                                {isLoaded ? (
                                                    <p className="font-bold text-lg">{bestTime ? `${bestTime.toFixed(2)}s` : 'N/A'}</p>
                                                ) : <Skeleton className="h-7 w-12 mx-auto" />}
                                                <p className="text-muted-foreground">Best Time</p>
                                            </div>
                                        </div>
                                        <Button asChild size="sm" className="md:col-start-4">
                                            <Link href={`/challenge/${set.id}`}>
                                                {hasBeenCompleted ? 'Try Again' : 'Start'}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </section>
            </main>
        </div>
    );
}

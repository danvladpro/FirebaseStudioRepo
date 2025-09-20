"use client";

import Link from 'next/link';
import { ArrowLeft, ClipboardCopy, ArrowRightLeft, MousePointerSquareDashed, Pilcrow, FunctionSquare, BookMarked, ArrowRight, CheckCircle, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
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
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {CHALLENGE_SETS.map((set) => {
                            const Icon = iconMap[set.iconName];
                            const setStats = stats[set.id];
                            const hasBeenCompleted = !!setStats?.lastTrained;
                            const bestTime = setStats?.bestTime;

                            return (
                                <Card key={set.id} className="flex flex-col">
                                    <CardHeader className="flex-row gap-4 items-start">
                                        <Icon className="w-10 h-10 text-primary mt-1" />
                                        <div className='flex-1'>
                                            <CardTitle>{set.name}</CardTitle>
                                            <CardDescription>{set.description}</CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-grow space-y-4">
                                         <p className="text-sm text-muted-foreground font-semibold">{set.category}</p>
                                         <div className="text-sm text-muted-foreground space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span>Questions:</span>
                                                <span className="font-bold text-foreground">{set.challenges.length}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Completed:</span>
                                                {isLoaded ? (
                                                    hasBeenCompleted ? <CheckCircle className="h-5 w-5 text-green-500" /> : <span className="font-bold text-foreground">No</span>
                                                ) : <Skeleton className="h-5 w-8" />}
                                            </div>
                                             <div className="flex items-center justify-between">
                                                <span>Best Time:</span>
                                                {isLoaded ? (
                                                     <span className="font-bold text-foreground">{bestTime ? `${bestTime.toFixed(2)}s` : 'N/A'}</span>
                                                ) : <Skeleton className="h-5 w-12" />}
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button asChild className="w-full">
                                            <Link href={`/challenge/${set.id}`}>
                                                {hasBeenCompleted ? 'Try Again' : 'Start Challenge'} <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                </section>
            </main>
        </div>
    );
}

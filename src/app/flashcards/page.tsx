
"use client";

import Link from 'next/link';
import { ArrowLeft, ClipboardCopy, ArrowRightLeft, MousePointerSquareDashed, Pilcrow, FunctionSquare, ArrowRight, Layers, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CHALLENGE_SETS } from '@/lib/challenges';
import { ChallengeSet } from '@/lib/types';
import { Logo } from '@/components/logo';
import { ElementType } from 'react';

const iconMap: Record<ChallengeSet["iconName"], ElementType> = {
    ClipboardCopy,
    ArrowRightLeft,
    MousePointerSquareDashed,
    Pilcrow,
    FunctionSquare,
    BookMarked,
    Layers,
};

export default function FlashcardsPage() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <main className="flex-1 container py-8 md:py-12">
                <header className="mb-8 md:mb-12 flex items-center justify-between">
                    <div>
                        <Logo />
                        <p className="text-muted-foreground mt-2">
                            Choose a set to study with flashcards.
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
                    <h2 className="text-2xl font-bold mb-6">Choose a Deck</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {CHALLENGE_SETS.map((set) => {
                            const Icon = iconMap[set.iconName];
                            return (
                                <Card key={set.id} className="flex flex-col">
                                    <CardContent className="p-6 flex-grow">
                                        <div className="flex items-start gap-4">
                                            <Icon className="w-10 h-10 text-primary mt-1" />
                                            <div>
                                                <h3 className="font-semibold text-lg">{set.name}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">{set.description}</p>
                                                <p className="text-sm font-semibold text-primary mt-2">{set.challenges.length} cards</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div className="p-6 pt-0 mt-auto">
                                        <Button asChild className="w-full">
                                            <Link href={`/flashcards/${set.id}`}>
                                                Study this set
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </section>
            </main>
        </div>
    );
}

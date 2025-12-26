
"use client";

import { useEffect, useState } from "react";
import { ChallengeSet } from "@/lib/types";
import * as icons from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, BookOpen, Loader2, Timer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChallengePreloaderProps {
    challengeSet: ChallengeSet;
    onStart: (mode: 'timed' | 'training') => void;
}

export function ChallengePreloader({ challengeSet, onStart }: ChallengePreloaderProps) {
    const [status, setStatus] = useState("Preparing challenge...");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const preloadAssets = async () => {
            try {
                // Collect all unique icon names from the challenge set
                const iconNames = new Set<keyof typeof icons>();
                challengeSet.challenges.forEach(challenge => {
                    challenge.steps.forEach(step => {
                        if (step.iconName && icons[step.iconName]) {
                            iconNames.add(step.iconName);
                        }
                    });
                });

                setStatus(`Loading ${iconNames.size} assets...`);

                // Simulate loading time
                await new Promise(resolve => setTimeout(resolve, 750));

                if (isMounted) {
                    setStatus("Ready to start!");
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Failed to preload challenge assets:", error);
                if(isMounted) {
                   setStatus("Failed to load. Please try again.");
                   setIsLoading(false);
                }
            }
        };

        preloadAssets();

        return () => {
            isMounted = false;
        };

    }, [challengeSet]);

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader className="flex-row items-center justify-between p-4">
                <CardTitle className="text-2xl">
                {challengeSet.name}
                </CardTitle>
                <Button asChild variant="outline" className="hover:bg-primary/10 hover:text-primary">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="p-6 text-center">
                 {isLoading ? (
                    <div className="flex flex-col items-center gap-3 py-8">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm font-medium text-muted-foreground">
                            {status}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <p className="text-2xl font-semibold text-primary">
                            {status}
                        </p>
                        <Image
                            src="/NinjaTying.png"
                            alt="Excel Ninja Typing"
                            width={220}
                            height={220}
                        />
                    </div>
                )}
            </CardContent>
            <CardFooter className={cn("p-4 bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-3", isLoading && "opacity-50 pointer-events-none")}>
                <Button
                    onClick={() => onStart('timed')}
                    disabled={isLoading}
                    size="lg"
                    >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Timer className="mr-2 h-4 w-4" />
                    )}
                    Timed Challenge
                </Button>

                <Button
                    onClick={() => onStart('training')}
                    disabled={isLoading}
                    size="lg"
                    variant="secondary"
                    >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <BookOpen className="mr-2 h-4 w-4" />
                    )}
                    Training Mode
                </Button>
            </CardFooter>
        </Card>

    );
}

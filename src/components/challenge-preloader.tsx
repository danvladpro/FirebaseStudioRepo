
"use client";

import { useEffect, useState } from "react";
import { ChallengeSet } from "@/lib/types";
import * as icons from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface ChallengePreloaderProps {
    challengeSet: ChallengeSet;
    onLoaded: () => void;
}

export function ChallengePreloader({ challengeSet, onLoaded }: ChallengePreloaderProps) {
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
        <Card className="w-full max-w-2xl text-center">
            <CardHeader>
                <CardTitle className="text-2xl">{challengeSet.name}</CardTitle>
            </CardHeader>
            <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-4">
                    {isLoading ? (
                        <>
                         <Loader2 className="h-10 w-10 animate-spin text-primary" />
                         <p className="text-lg font-semibold text-muted-foreground">{status}</p>
                        </>
                    ) : (
                        <p className="text-lg font-semibold text-green-500">{status}</p>
                    )}

                    <Button
                        onClick={onLoaded}
                        disabled={isLoading}
                        size="lg"
                        className="mt-6"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            "Start Challenge"
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

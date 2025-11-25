
"use client";

import { useEffect, useState } from "react";
import { ChallengeSet } from "@/lib/types";
import * as icons from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Loader2 } from "lucide-react";

interface ChallengePreloaderProps {
    challengeSet: ChallengeSet;
    onLoaded: () => void;
}

export function ChallengePreloader({ challengeSet, onLoaded }: ChallengePreloaderProps) {
    const [status, setStatus] = useState("Preparing challenge...");

    useEffect(() => {
        let isMounted = true;
        const preloadIcons = async () => {
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

                // This doesn't actually "load" them in the network sense,
                // but it ensures they are part of the component's render logic,
                // which can help with initial render performance if they were being dynamically loaded.
                // In this app, since all of lucide-react is imported, this is more of a simulation
                // to ensure a smooth transition and show a loading state.
                
                setStatus(`Loading ${iconNames.size} assets...`);

                // Simulate a short loading time to make the transition feel smoother
                await new Promise(resolve => setTimeout(resolve, 500));

                if (isMounted) {
                    onLoaded();
                }
            } catch (error) {
                console.error("Failed to preload challenge assets:", error);
                if(isMounted) {
                   setStatus("Failed to load. Please try again.");
                }
            }
        };

        preloadIcons();

        return () => {
            isMounted = false;
        };

    }, [challengeSet, onLoaded]);

    return (
        <Card className="w-full max-w-2xl">
            <CardContent className="text-center py-16">
                <div className="flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-lg font-semibold text-foreground">{status}</p>
                </div>
            </CardContent>
        </Card>
    );
}


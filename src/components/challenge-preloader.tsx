
"use client";

import { useEffect, useState } from "react";
import { ChallengeSet } from "@/lib/types";
import * as icons from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { BookOpen, Loader2, Timer } from "lucide-react";
import Image from "next/image";

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
        <Card className="w-full max-w-2xl p-6">
  <CardHeader className="p-0 mb-4">
    <CardTitle className="text-2xl text-center">
      {challengeSet.name}
    </CardTitle>
  </CardHeader>

  <CardContent className="p-0">
    <div className="flex flex-col items-center gap-4">

      {isLoading ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">
            {status}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-4">
          
          <Image
            src="/NinjaTying.png"
            alt="Excel Ninja Typing"
            width={220}
            height={220}
          />
          <p className="text-2xl font-semibold text-green-500">
            {status}
          </p>
        </div>
      )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-sm">
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
      </div>
    </div>
  </CardContent>
</Card>

    );
}

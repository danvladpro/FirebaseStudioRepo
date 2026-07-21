
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChallengeSet } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, BookOpen, Timer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ChallengePreloaderProps {
    challengeSet: ChallengeSet;
    onStart: (mode: 'timed' | 'training') => void;
}

export function ChallengePreloader({ challengeSet, onStart }: ChallengePreloaderProps) {
    const router = useRouter();

    useEffect(() => {
        // Warm the results route + its celebration image without blocking the UI.
        router.prefetch('/results');
        const img = new window.Image();
        img.src = '/NinjaCelebrate.svg';
    }, [router]);

    return (
        <Card className="w-full max-w-2xl p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl text-center">
              {challengeSet.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="flex flex-col items-center gap-4">

              <div className="flex flex-col items-center gap-4 py-4">
                <Image
                  src="/NinjaTying.svg"
                  alt="Ninja Shortcuts Typing"
                  width={220}
                  height={220}
                  priority
                />
                <p className="text-2xl font-semibold text-green-500">
                  Ready to start!
                </p>
              </div>

            <div className="w-full max-w-2xl flex flex-col md:flex-row gap-3">
                <Button
                    onClick={() => onStart('timed')}
                    size="lg"
                    className="flex-1"
                >
                    <Timer className="mr-2 h-4 w-4" />
                    Timed Challenge
                </Button>

                <Button
                    onClick={() => onStart('training')}
                    size="lg"
                    variant="secondary"
                    className="flex-1"
                >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Training Mode
                </Button>
                <Button asChild size="lg" variant="outline" className="flex-1">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Dashboard
                    </Link>
                </Button>
            </div>
            </div>
          </CardContent>
        </Card>

    );
}

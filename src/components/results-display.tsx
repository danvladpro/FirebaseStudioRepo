"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Trophy } from 'lucide-react';
import { CHALLENGE_SETS } from '@/lib/challenges';
import { usePerformanceTracker } from '@/hooks/use-performance-tracker';
import { Badge } from '@/components/ui/badge';


export default function ResultsDisplay() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { stats, updateStats } = usePerformanceTracker();
  
  const [isNewRecord, setIsNewRecord] = useState(false);
  
  const setId = searchParams.get('setId');
  const timeStr = searchParams.get('time');
  const time = timeStr ? parseFloat(timeStr) : null;
  const skippedStr = searchParams.get('skipped');
  const skippedCount = skippedStr ? parseInt(skippedStr, 10) : 0;
  
  const challengeSet = CHALLENGE_SETS.find(set => set.id === setId);
  const personalBest = stats[setId!]?.bestTime;

  const totalChallenges = challengeSet?.challenges.length ?? 0;
  const correctAnswers = totalChallenges - skippedCount;
  const score = totalChallenges > 0 ? (correctAnswers / totalChallenges) * 100 : 0;
  const isPerfectScore = skippedCount === 0;

  useEffect(() => {
    if (setId && time !== null && isPerfectScore) {
      const oldBest = personalBest;
      if (oldBest === null || oldBest === undefined || time < oldBest) {
        setIsNewRecord(true);
      }
      updateStats(setId, time);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setId, time, updateStats, isPerfectScore]);


  if (!challengeSet || time === null) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4">
        <p>Invalid results data.</p>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          {isNewRecord && isPerfectScore && (
            <Badge className="w-fit mx-auto mb-4 bg-accent text-accent-foreground hover:bg-accent/90">
              <Trophy className="mr-2 h-4 w-4"/> New Record!
            </Badge>
          )}
          <CardTitle className="text-3xl">Challenge Complete!</CardTitle>
          <CardDescription>{challengeSet.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Your Time</p>
              <p className="text-5xl font-bold tracking-tighter text-primary">{time.toFixed(2)}s</p>
            </div>
             <div>
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-5xl font-bold tracking-tighter text-primary">{score.toFixed(0)}%</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Personal Best (Time)</p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {personalBest ? `${personalBest.toFixed(2)}s` : "N/A"}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Home
          </Button>
          <Button className="w-full" onClick={() => router.push(`/challenge/${setId}`)}>
            <RefreshCw className="mr-2 h-4 w-4" /> Play Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

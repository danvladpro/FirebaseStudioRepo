
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Trophy, AlertTriangle } from 'lucide-react';
import { ALL_CHALLENGE_SETS } from '@/lib/challenges';
import { usePerformanceTracker } from '@/hooks/use-performance-tracker';
import { Badge } from '@/components/ui/badge';
import { Separator } from './ui/separator';
import { useAuth } from './auth-provider';
import { cn } from '@/lib/utils';


const KeyDisplay = ({ value }: { value: string }) => {
    const isModifier = ["Control", "Shift", "Alt", "Meta"].includes(value);
    const isLetter = value.length === 1 && value.match(/[a-z]/i);

    return (
        <kbd className={cn(
            "px-1.5 py-1 text-xs font-semibold text-muted-foreground bg-muted rounded-md border-b-2",
            isModifier ? "min-w-[3rem] text-center" : "",
            isLetter ? "uppercase" : ""
        )}>
            {value === " " ? "Space" : value}
        </kbd>
    );
};

// NOTE: Auth has been temporarily disabled for debugging.
const useAuthBypass = () => ({ isGuest: true });

export default function ResultsDisplay() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { stats, updateStats, isLoaded } = usePerformanceTracker();
  const { isGuest } = useAuthBypass();
  
  const [isNewRecord, setIsNewRecord] = useState(false);
  
  const setId = searchParams.get('setId');
  const timeStr = searchParams.get('time');
  const time = timeStr ? parseFloat(timeStr) : null;
  const skippedStr = searchParams.get('skipped');
  const skippedCount = skippedStr ? parseInt(skippedStr, 10) : 0;
  const skippedIndicesStr = searchParams.get('skippedIndices');

  const challengeSet = ALL_CHALLENGE_SETS.find(set => set.id === setId);
  const personalBest = stats[setId!]?.bestTime;

  const totalChallenges = challengeSet?.challenges.length ?? 0;
  const correctAnswers = totalChallenges - skippedCount;
  const score = totalChallenges > 0 ? (correctAnswers / totalChallenges) * 100 : 0;
  const isPerfectScore = skippedCount === 0;

  const skippedChallenges = skippedIndicesStr && challengeSet
    ? skippedIndicesStr.split(',').filter(Boolean).map(i => challengeSet.challenges[parseInt(i)])
    : [];

  useEffect(() => {
    if (setId && time !== null && !isGuest) {
      if (isPerfectScore) {
        const oldBest = personalBest;
        if (oldBest === null || oldBest === undefined || time < oldBest) {
          setIsNewRecord(true);
        }
      }
      updateStats(setId, time, score);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setId, time, score, isPerfectScore, isGuest]);


  if (!challengeSet || time === null) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4">
        <p>Invalid results data.</p>
        <Button onClick={() => router.push('/dashboard')}>Go Home</Button>
      </div>
    );
  }

  const guestQuery = isGuest ? '?guest=true' : '';
  const dashboardPath = `/dashboard${guestQuery}`;
  const challengePath = `/challenge/${setId}${guestQuery}`;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          {isNewRecord && isPerfectScore && !isGuest && (
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
          {isLoaded && isPerfectScore && personalBest && !isGuest && (
            <div>
              <p className="text-sm text-muted-foreground">Personal Best (Time)</p>
              <p className="text-2xl font-semibold tracking-tight text-foreground">
                {personalBest.toFixed(2)}s
              </p>
            </div>
          )}
          {skippedChallenges.length > 0 && (
            <div className="space-y-4">
              <Separator />
              <div className="text-left">
                  <h3 className="font-semibold flex items-center gap-2 justify-center text-destructive mb-2">
                    <AlertTriangle className="w-4 h-4"/>
                    Areas for Improvement
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-3 bg-muted/50 p-4 rounded-md">
                      {skippedChallenges.map((challenge, index) => (
                          <li key={index} className="flex justify-between items-center">
                            <span>{challenge.description}</span>
                            <div className="flex items-center gap-1.5">
                              {challenge.keys.map(key => <KeyDisplay key={key} value={key} />)}
                            </div>
                          </li>
                      ))}
                  </ul>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button variant="outline" className="w-full" onClick={() => router.push(dashboardPath)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go to Dashboard
          </Button>
          <Button className="w-full" onClick={() => router.push(challengePath)}>
            <RefreshCw className="mr-2 h-4 w-4" /> Play Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

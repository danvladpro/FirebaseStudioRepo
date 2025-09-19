"use client";

import { useEffect, useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Sparkles, Trophy } from 'lucide-react';
import { CHALLENGE_SETS } from '@/lib/challenges';
import { usePerformanceTracker } from '@/hooks/use-performance-tracker';
import { Badge } from '@/components/ui/badge';
import { getRecommendationsAction } from '@/actions/get-recommendations';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from './logo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

export default function ResultsDisplay() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { stats, updateStats, getPerformanceDataForAI } = usePerformanceTracker();
  
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const setId = searchParams.get('setId');
  const timeStr = searchParams.get('time');
  const time = timeStr ? parseFloat(timeStr) : null;
  
  const challengeSet = CHALLENGE_SETS.find(set => set.id === setId);
  const personalBest = stats[setId!]?.bestTime;

  useEffect(() => {
    if (setId && time !== null) {
      const oldBest = stats[setId]?.bestTime;
      if (oldBest === null || oldBest === undefined || time < oldBest) {
        setIsNewRecord(true);
      }
      updateStats(setId, time);
    }
  }, [setId, time, updateStats]);

  const handleGetRecommendation = () => {
    startTransition(async () => {
      const performanceData = getPerformanceDataForAI();
      if (Object.keys(performanceData).length === 0) {
        setRecommendation("Complete at least one challenge set to get a recommendation.");
        return;
      }
      const result = await getRecommendationsAction(performanceData);
      if (result.success) {
        setRecommendation(result.recommendations);
      } else {
        setRecommendation(result.error ?? 'An unknown error occurred.');
      }
    });
  };

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
          {isNewRecord && (
            <Badge className="w-fit mx-auto mb-4 bg-accent text-accent-foreground hover:bg-accent/90">
              <Trophy className="mr-2 h-4 w-4"/> New Record!
            </Badge>
          )}
          <CardTitle className="text-3xl">Challenge Complete!</CardTitle>
          <CardDescription>{challengeSet.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">Your Time</p>
            <p className="text-5xl font-bold tracking-tighter text-primary">{time.toFixed(2)}s</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Personal Best</p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {personalBest ? `${personalBest.toFixed(2)}s` : "N/A"}
            </p>
          </div>
          
           <Accordion type="single" collapsible className="w-full pt-4">
            <AccordionItem value="item-1">
              <AccordionTrigger onClick={handleGetRecommendation} disabled={isPending}>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <span className="font-semibold">Get AI Training Plan</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 text-left">
                {isPending && <Skeleton className="h-24 w-full" />}
                {recommendation && !isPending && (
                  <Alert>
                    <AlertTitle>Personalized Recommendations</AlertTitle>
                    <AlertDescription className="whitespace-pre-wrap">
                      {recommendation}
                    </AlertDescription>
                  </Alert>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

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

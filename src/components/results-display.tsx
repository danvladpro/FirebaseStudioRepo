

"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Trophy, AlertTriangle, Linkedin, Lock } from 'lucide-react';
import { ALL_CHALLENGE_SETS } from '@/lib/challenges';
import { usePerformanceTracker } from '@/hooks/use-performance-tracker';
import { Badge } from '@/components/ui/badge';
import { Separator } from './ui/separator';
import { useAuth } from './auth-provider';
import { cn, buildLinkedInUrl } from '@/lib/utils';
import { Challenge, ChallengeStep } from '@/lib/types';
import Confetti from 'react-confetti';
import { updateUserPerformance } from '@/app/actions/update-user-performance';
import { toast } from '@/hooks/use-toast';
import { XP_CONFIG } from './home-page-client';

const KeyDisplay = ({ value, isMac }: { value: string, isMac: boolean }) => {
    const isModifier = ["Control", "Shift", "Alt", "Meta"].includes(value);
    const isLetter = value.length === 1 && value.match(/[a-z]/i);

    const displayMap: Record<string, string> = {
        'Control': isMac ? '⌃' : 'Ctrl',
        'Meta': isMac ? '⌘' : 'Win',
        'Alt': isMac ? '⌥' : 'Alt',
        ' ': 'Space'
    };
    
    const displayValue = displayMap[value] || value;

    return (
        <kbd className={cn(
            "px-1.5 py-1 text-xs font-semibold text-muted-foreground bg-muted rounded-md border-b-2",
            isModifier ? "min-w-[3rem] text-center" : "",
            isLetter ? "uppercase" : ""
        )}>
            {displayValue}
        </kbd>
    );
};

export default function ResultsDisplay() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { stats, isLoaded } = usePerformanceTracker();
  const { user } = useAuth();
  
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setIsMac(navigator.userAgent.toLowerCase().includes('mac'));
    setShowConfetti(true);
  }, []);
  
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

  const xpEarned = (isPerfectScore && challengeSet?.level) ? XP_CONFIG[challengeSet.level] : 0;

  const getOsKeys = (step: ChallengeStep, isMac: boolean) => {
    const isStrikethrough = step.description.toLowerCase().includes('strikethrough');
    
    return step.keys.map(key => {
        if (isMac && key.toLowerCase() === 'control' && !isStrikethrough) {
            return 'Meta';
        }
        return key;
    });
  }

  const skippedChallenges = skippedIndicesStr && challengeSet
    ? skippedIndicesStr.split(',').filter(Boolean).map(i => challengeSet.challenges[parseInt(i)])
    : [];

  useEffect(() => {
    if (!isLoaded || !setId || time === null || !user) return;
    
    const updatePerformance = async () => {
      try {
        const result = await updateUserPerformance({ uid: user.uid, setId, time, score });
        if (result.newBest) {
          setIsNewRecord(true);
        }
      } catch (error: any) {
        toast({
            title: "Error Saving Results",
            description: error.message,
            variant: "destructive"
        });
      }
    };
    
    updatePerformance();
  }, [isLoaded, setId, time, score, user]);


  const isExam = challengeSet?.category === 'Exam';
  const isScenario = challengeSet?.category === 'Scenario';


  if (!challengeSet || time === null) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4">
        <p>Invalid results data.</p>
        <Button onClick={() => router.push('/dashboard')}>Go Home</Button>
      </div>
    );
  }

  const dashboardPath = `/dashboard`;
  const challengePath = `/challenge/${setId}`;

  return (
    <>
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={isPerfectScore ? 1300 : 300}
          gravity={isPerfectScore ? 0.1 : 0.1}
        />
      )}
      <div className="min-h-screen w-full flex items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-lg text-center">
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
            
            {xpEarned > 0 && (
                <div>
                    <p className="text-sm text-muted-foreground">XP Earned</p>
                    <p className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
                        +{xpEarned} XP
                    </p>
                </div>
            )}

            {isLoaded && isPerfectScore && personalBest && user && (
              <div>
                <p className="text-sm text-muted-foreground">Personal Best (Time)</p>
                <p className="text-2xl font-semibold tracking-tight text-foreground">
                  {personalBest.toFixed(2)}s
                </p>
              </div>
            )}
            {isExam && (
               <div className="space-y-4 pt-4">
                  <Separator />
                  {isPerfectScore ? (
                    <>
                      <h3 className="font-semibold pt-2">Congratulations!</h3>
                      <p className="text-sm text-muted-foreground">You've passed the {challengeSet.name}. Add your achievement to your professional profile.</p>
                      <Button asChild className="bg-[#0A66C2] hover:bg-[#0A66C2]/90">
                          <a href={buildLinkedInUrl(challengeSet, user)} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="mr-2 h-5 w-5" /> Add to LinkedIn
                          </a>
                      </Button>
                    </>
                  ) : (
                     <>
                      <h3 className="font-semibold pt-2">Almost there!</h3>
                      <p className="text-sm text-muted-foreground">Achieve a perfect score of 100% to unlock your certificate and share it on LinkedIn.</p>
                       <Button disabled className="w-fit mx-auto">
                          <Lock className="mr-2 h-5 w-5" /> Add to LinkedIn
                      </Button>
                     </>
                  )}
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
                    <div className="text-sm text-muted-foreground space-y-4 bg-muted/50 p-4 rounded-md">
                        {isScenario 
                          ? skippedChallenges.map((challenge, index) => (
                              <div key={index} className="space-y-2">
                                <p className="font-semibold text-foreground">{index + 1}. {challenge.description}</p>
                                <ul className="pl-4 space-y-2">
                                  {challenge.steps.map((step, stepIndex) => (
                                    <li key={stepIndex} className="flex justify-between items-center">
                                      <span>- {step.description}</span>
                                      <div className="flex items-center gap-1.5">
                                        {getOsKeys(step, isMac).map((key, keyIndex) => (
                                          <KeyDisplay key={keyIndex} value={key} isMac={isMac} />
                                        ))}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))
                          : skippedChallenges.map((challenge, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span>{challenge.description}</span>
                              <div className="flex items-center gap-1.5">
                                {challenge.steps[0] && getOsKeys(challenge.steps[0], isMac).map((key, keyIndex) => <KeyDisplay key={keyIndex} value={key} isMac={isMac} />)}
                              </div>
                            </div>
                          ))
                        }
                    </div>
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
    </>
  );
}

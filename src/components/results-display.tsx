

"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Trophy, AlertTriangle, Linkedin, Lock, BookOpen, Download } from 'lucide-react';
import { ALL_CHALLENGE_SETS, CHALLENGE_SETS } from '@/lib/challenges';
import { usePerformanceTracker } from '@/hooks/use-performance-tracker';
import { Badge } from '@/components/ui/badge';
import { Separator } from './ui/separator';
import { useAuth } from './auth-provider';
import { cn } from '@/lib/utils';
import { Challenge, ChallengeSet, ChallengeStep } from '@/lib/types';
import Confetti from 'react-confetti';
import { updateUserPerformance } from '@/app/actions/update-user-performance';
import { toast } from '@/hooks/use-toast';
import { XP_CONFIG } from './home-page-client';
import Link from 'next/link';
import { CertificateModal } from './certificate-modal';

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
  const [recommendedModules, setRecommendedModules] = useState<ChallengeSet[]>([]);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);


  useEffect(() => {
    setIsMac(navigator.userAgent.toLowerCase().includes('mac'));
  }, []);
  
  const setId = searchParams.get('setId');
  const timeStr = searchParams.get('time');
  const time = timeStr ? parseFloat(timeStr) : null;
  const skippedStr = searchParams.get('skipped');
  const skippedCount = skippedStr ? parseInt(skippedStr, 10) : 0;
  const skippedIndicesStr = searchParams.get('skippedIndices');
  const mode = searchParams.get('mode') as 'timed' | 'training' | null;

  useEffect(() => {
      if (mode === 'timed') {
          setShowConfetti(true);
      }
  }, [mode]);

  const challengeSet = ALL_CHALLENGE_SETS.find(set => set.id === setId);
  
  const totalChallenges = challengeSet?.challenges.length ?? 0;
  const correctAnswers = totalChallenges - skippedCount;
  const score = totalChallenges > 0 ? (correctAnswers / totalChallenges) * 100 : 0;
  const isPerfectScore = skippedCount === 0;

  const personalBest = stats[setId!]?.bestTime;
  const certificateId = stats[setId!]?.certificateId;
  const xpEarned = (isPerfectScore && challengeSet?.level && mode === 'timed') ? XP_CONFIG[challengeSet.level] : 0;

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
    if (mode === 'timed' && challengeSet?.category === 'Exam' && !isPerfectScore && skippedChallenges.length > 0) {
      const recommended = new Set<ChallengeSet>();
      skippedChallenges.forEach(skippedChallenge => {
        CHALLENGE_SETS.forEach(module => {
          if (module.category !== 'Scenario') {
            const hasMatch = module.challenges.some(
              challenge => challenge.description === skippedChallenge.description
            );
            if (hasMatch) {
              recommended.add(module);
            }
          }
        });
      });
      setRecommendedModules(Array.from(recommended));
    }
  }, [challengeSet, isPerfectScore, skippedChallenges, mode]);


  useEffect(() => {
    if (!isLoaded || !setId || time === null || !user || mode !== 'timed') return;
    
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
  }, [isLoaded, setId, time, score, user, mode]);


  const isExam = challengeSet?.category === 'Exam';
  const isScenario = challengeSet?.category === 'Scenario';

  if (!challengeSet || time === null || !mode) {
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
      <CertificateModal isOpen={isCertificateModalOpen} onOpenChange={setIsCertificateModalOpen} examSet={challengeSet} />
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
            {isNewRecord && mode === 'timed' && (
              <Badge className="w-fit mx-auto mb-4 bg-accent text-accent-foreground hover:bg-accent/90">
                <Trophy className="mr-2 h-4 w-4"/> New Record!
              </Badge>
            )}
            <CardTitle className="text-3xl">
              {mode === 'timed' ? 'Challenge Complete!' : 'Training Complete!'}
            </CardTitle>
            <CardDescription>{challengeSet.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {mode === 'timed' && (
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
            )}
            
            {xpEarned > 0 && (
                <div>
                    <p className="text-sm text-muted-foreground">XP Earned</p>
                    <p className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
                        +{xpEarned} XP
                    </p>
                </div>
            )}

            {isLoaded && isPerfectScore && personalBest && user && mode === 'timed' && (
              <div>
                <p className="text-sm text-muted-foreground">Personal Best (Time)</p>
                <p className="text-2xl font-semibold tracking-tight text-foreground">
                  {personalBest.toFixed(2)}s
                </p>
              </div>
            )}
            {isExam && mode === 'timed' && (
               <div className="space-y-4 pt-4">
                  <Separator />
                  {isPerfectScore ? (
                    <>
                      <h3 className="font-semibold pt-2">Congratulations!</h3>
                      <p className="text-sm text-muted-foreground">You've passed the {challengeSet.name}. Claim your certificate.</p>
                      <Button variant="premium" onClick={() => setIsCertificateModalOpen(true)} disabled={!certificateId}>
                          <Download className="mr-2 h-5 w-5" /> Claim Certificate
                      </Button>
                    </>
                  ) : (
                     <>
                      <h3 className="font-semibold pt-2">Almost there!</h3>
                      <p className="text-sm text-muted-foreground">Achieve a perfect score of 100% to unlock your certificate.</p>
                       <Button disabled className="w-fit mx-auto">
                          <Lock className="mr-2 h-5 w-5" /> Claim Certificate
                      </Button>
                     </>
                  )}
              </div>
            )}
            {recommendedModules.length > 0 && (
              <div className="space-y-4 pt-4">
                <Separator />
                <div className="text-left">
                  <h3 className="font-semibold flex items-center gap-2 justify-center text-accent mb-2">
                    <BookOpen className="w-4 h-4" />
                    Recommended Study
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    Review these modules to master the shortcuts you missed.
                  </p>
                  <div className="space-y-2">
                    {recommendedModules.map((module) => (
                      <Button
                        key={module.id}
                        asChild
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Link href={`/challenge/${module.id}`}>
                          {module.name}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {skippedChallenges.length > 0 && recommendedModules.length === 0 && (
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
            <Button className="w-full" onClick={() => router.push(challengePath + `?mode=${mode}`)}>
              <RefreshCw className="mr-2 h-4 w-4" /> Play Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

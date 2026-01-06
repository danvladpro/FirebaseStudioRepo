
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Trophy, AlertTriangle, Linkedin, Lock, BookOpen, Download, Star } from 'lucide-react';
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
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

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
  const { user, userProfile } = useAuth();
  
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [recommendedModules, setRecommendedModules] = useState<ChallengeSet[]>([]);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [allExamsPassed, setAllExamsPassed] = useState(false);


  useEffect(() => {
    setIsMac(navigator.userAgent.toLowerCase().includes('mac'));
  }, []);
  
  const setId = searchParams.get('setId');
  const timeStr = searchParams.get('time');
  const time = timeStr ? parseFloat(timeStr) : null;
  const skippedStr = searchParams.get('skipped');
  const skippedCount = skippedStr ? parseInt(skippedStr, 10) : 0;
  const skippedIndicesStr = searchParams.get('skippedIndices') || '';
  const skippedIndices = new Set(skippedIndicesStr.split(',').filter(Boolean).map(Number));
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

  const previousBestScore = stats[setId!]?.bestScore;
  const personalBestTime = stats[setId!]?.bestTime;
  const masteryCertificateId = userProfile?.masteryCertificateId;
  const xpEarned = (isPerfectScore && challengeSet?.level && mode === 'timed') ? XP_CONFIG[challengeSet.level] : 0;
  const showXp = xpEarned > 0 && previousBestScore !== 100;

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
  
  useEffect(() => {
     if (isLoaded) {
        const passed = ALL_CHALLENGE_SETS.filter(s => s.category === 'Exam').every(exam => stats[exam.id]?.bestScore === 100);
        setAllExamsPassed(passed);
     }
  }, [isLoaded, stats]);

    const wasAutoSkipped = (challenge: Challenge) => {
        if (!userProfile?.missingKeys) return false;
        const missingKeys = userProfile.missingKeys.map(k => k.toLowerCase());
        const requiredKeys = challenge.steps.flatMap(step => step.keys.map(k => k.toLowerCase()));
        return requiredKeys.some(key => missingKeys.includes(key));
    };

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
  
  const reviewTitle = mode === 'timed' ? "Areas for Improvement" : "Training Summary";

  const dashboardPath = `/dashboard`;
  const challengePath = `/challenge/${setId}`;

  return (
    <>
      <CertificateModal isOpen={isCertificateModalOpen} onOpenChange={setIsCertificateModalOpen} />
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
             {isPerfectScore && mode === 'timed' && (
              <div className="flex justify-center">
                  <Image
                      src="/NinjaCelebrate.svg"
                      alt="Ninja Celebrating"
                      width={150}
                      height={150}
                  />
              </div>
            )}
            {mode === 'timed' && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Your Time</p>
                            <p className="text-5xl font-bold tracking-tighter text-primary">{time.toFixed(2)}s</p>
                        </div>
                        {isLoaded && isPerfectScore && personalBestTime && user && (
                            <div>
                                <p className="text-sm text-muted-foreground">Personal Best</p>
                                <p className="text-2xl font-semibold tracking-tight text-foreground">
                                {personalBestTime.toFixed(2)}s
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Score</p>
                            <p className="text-5xl font-bold tracking-tighter text-primary">{score.toFixed(0)}%</p>
                        </div>
                        {showXp && (
                            <div>
                                <p className="text-sm text-muted-foreground">XP Earned</p>
                                <p className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
                                    +{xpEarned} XP
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {isExam && mode === 'timed' && (
               <div className="space-y-4 pt-4">
                  <Separator />
                  {allExamsPassed ? (
                    <>
                      <h3 className="font-semibold pt-2">Ultimate Achievement!</h3>
                      <p className="text-sm text-muted-foreground">You've passed all exams and earned the Mastery Certificate.</p>
                      <Button variant="premium" onClick={() => setIsCertificateModalOpen(true)} disabled={!masteryCertificateId}>
                          <Star className="mr-2 h-5 w-5" /> Claim Mastery Certificate
                      </Button>
                    </>
                  ) : (
                     <>
                      <h3 className="font-semibold pt-2">One Step Closer!</h3>
                      <p className="text-sm text-muted-foreground">Pass all three exams (Basic, Intermediate, and Advanced) to unlock your Mastery Certificate.</p>
                       <Button disabled className="w-fit mx-auto">
                          <Lock className="mr-2 h-5 w-5" /> Claim Mastery Certificate
                      </Button>
                     </>
                  )}
              </div>
            )}
            {mode === 'timed' && recommendedModules.length > 0 && (
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
            
            {(mode === 'training' || (mode === 'timed' && skippedChallenges.length > 0)) && (
              <div className="space-y-4">
                <Separator />
                <div className="text-left">
                    <h3 className={cn("font-semibold flex items-center gap-2 justify-center mb-2", mode==='timed' && "text-destructive")}>
                      <AlertTriangle className="w-4 h-4"/>
                      {reviewTitle}
                    </h3>
                    <div className="text-sm text-muted-foreground space-y-4 bg-muted/50 p-4 rounded-md">
                      <TooltipProvider>
                      {challengeSet.challenges.map((challenge, index) => {
                        const isSkipped = skippedIndices.has(index);
                        if (mode === 'timed' && !isSkipped) return null;
                        
                        const isAutoSkipped = wasAutoSkipped(challenge);

                        return (
                          <div key={index} className={cn("p-2 rounded-md", isSkipped && "bg-destructive/10")}>
                            {isScenario ? (
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <p className="font-semibold text-foreground">{index + 1}. {challenge.description}</p>
                                    {isSkipped && (
                                        isAutoSkipped ? (
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Badge variant="warning">Left out</Badge>
                                                </TooltipTrigger>
                                                <TooltipContent className="whitespace-nowrap">
                                                    <p>Skipped due to keyboard settings. Change in your profile.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : <Badge variant="destructive">Skipped</Badge>
                                    )}
                                  </div>
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
                              ) : (
                                <div className="flex justify-between items-center">
                                  <p className="font-semibold text-foreground">{challenge.description}</p>
                                  <div className="flex items-center gap-4">
                                    {isSkipped && (
                                       isAutoSkipped ? (
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Badge variant="warning">Left out</Badge>
                                                </TooltipTrigger>
                                                <TooltipContent className="whitespace-nowrap">
                                                    <p>Skipped due to keyboard settings. Change in your profile.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : <Badge variant="destructive">Skipped</Badge>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                      {challenge.steps[0] && getOsKeys(challenge.steps[0], isMac).map((key, keyIndex) => <KeyDisplay key={keyIndex} value={key} isMac={isMac} />)}
                                    </div>
                                  </div>
                                </div>
                            )}
                          </div>
                        )
                      })}
                      </TooltipProvider>
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

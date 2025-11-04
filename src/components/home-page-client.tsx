
"use client";

import { Trophy, ArrowRight, Library, Layers, Lock, Sparkles, ClipboardCopy, ArrowRightLeft, MousePointerSquareDashed, Pilcrow, FunctionSquare, GalleryVerticalEnd, Filter, Rocket, Award, Medal, Unlock, Ribbon, CheckCircle, Timer, RotateCw, Download } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChallengeSet } from "@/lib/types";
import { usePerformanceTracker } from "@/hooks/use-performance-tracker";
import { Skeleton } from "@/components/ui/skeleton";
import * as React from "react";
import { CHALLENGE_SETS } from "@/lib/challenges";
import { AppHeader } from "./app-header";
import { useAuth } from "./auth-provider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { cn } from "@/lib/utils";
import { ElementType } from "react";
import { PremiumModal } from "./premium-modal";

const iconMap: Record<ChallengeSet["iconName"], ElementType> = {
    ClipboardCopy,
    ArrowRightLeft,
    MousePointerSquareDashed,
    Pilcrow,
    FunctionSquare,
    Layers,
    Filter,
    GalleryVerticalEnd,
    Award,
    Medal,
    Trophy
};


interface HomePageClientProps {
  examSets: ChallengeSet[];
}

export function HomePageClient({ examSets }: HomePageClientProps) {
  const { isLoaded, stats, getCompletedSetsCount } = usePerformanceTracker();
  const { user, userProfile, isPremium } = useAuth();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = React.useState(false);
  
  const isLimited = !isPremium;

  const examStats = {
    basic: stats['exam-basic']?.bestTime ?? null,
    intermediate: stats['exam-intermediate']?.bestTime ?? null,
    advanced: stats['exam-advanced']?.bestTime ?? null,
  };

  const completedSetsCount = getCompletedSetsCount();
  const totalPracticeSets = CHALLENGE_SETS.length;

  const setsToDisplay = isLimited 
      ? CHALLENGE_SETS.map(set => ({ ...set, isLocked: set.id !== 'formatting-basics' }))
      : CHALLENGE_SETS.map(set => ({ ...set, isLocked: false }));

  const getIsExamLocked = (examId: string) => {
    if (isLimited) return true;
    if (examId === 'exam-intermediate' && !examStats.basic) return true;
    if (examId === 'exam-advanced' && !examStats.intermediate) return true;
    return false;
  };
  
  const getExamLockTooltip = (examId: string) => {
    if (isLimited) return "Upgrade to Premium to unlock exams.";
    if (examId === 'exam-intermediate' && !examStats.basic) return "Complete the Basic Exam to unlock.";
    if (examId === 'exam-advanced' && !examStats.intermediate) return "Complete the Intermediate Exam to unlock.";
    return "";
  }
  
  const getExamBestTime = (examId: keyof typeof examStats) => {
      return examStats[examId];
  }


  const renderExamCard = (examSet: ChallengeSet) => {
    const isExamLocked = getIsExamLocked(examSet.id);
    const Icon = iconMap[examSet.iconName];
    const bestTime = getExamBestTime(examSet.id as keyof typeof examStats);
    const isCompleted = !!bestTime;

    const cardContent = (
     <Card key={examSet.id} className={cn("border-emerald-300/50 bg-background/50 flex flex-col", isExamLocked && "bg-muted/50 border-dashed text-muted-foreground")}>
        <CardHeader className="flex-row gap-4 items-center p-4">
            <Icon className={cn("w-8 h-8", isExamLocked ? "text-muted-foreground" : "text-primary")} />
            <div>
                <CardTitle className={cn("text-xl", isExamLocked && "text-muted-foreground")}>{examSet.name}</CardTitle>
                <CardDescription className="text-xs">{examSet.description}</CardDescription>
            </div>
        </CardHeader>
        <CardFooter className="mt-auto p-4">
            {isExamLocked ? (
                 <Button className="w-full" variant={isLimited ? "premium" : "secondary"} onClick={() => isLimited && setIsPremiumModalOpen(true)} disabled={!isLimited}>
                    {isLimited ? <Sparkles className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
                    {isLimited ? "Go Premium" : "Locked"}
                 </Button>
            ) : isCompleted ? (
                <div className="w-full grid grid-cols-2 gap-2">
                    <Button asChild variant="secondary" size="sm">
                         <Link href={`/challenge/${examSet.id}`}>
                            <RotateCw className="mr-2 h-4 w-4" />
                            Try Again
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                        <Download className="mr-2 h-4 w-4" />
                        Claim Certificate
                    </Button>
                </div>
            ) : (
                <Button asChild className="w-full">
                    <Link href={`/challenge/${examSet.id}`}>
                        Start Exam
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            )}
        </CardFooter>
    </Card>
    );

    if (isExamLocked) {
      return (
        <Tooltip key={examSet.id}>
            <TooltipTrigger asChild>
                <div className="cursor-not-allowed h-full">{cardContent}</div>
            </TooltipTrigger>
            <TooltipContent>
                <p>{getExamLockTooltip(examSet.id)}</p>
            </TooltipContent>
        </Tooltip>
      )
    }
    return cardContent;
  }
  
  const getDashboardTitle = () => {
    if (userProfile?.name) return `Welcome back, ${userProfile.name}!`;
    if (isPremium) return "Unleash Your Shortcut Speed";
    return "Start Your Journey to Shortcut Mastery";
  }

  const getDashboardSubtitle = () => {
    if (isPremium) return "Master the keyboard, boost your productivity, and leave the mouse behind.";
    return "Learn the basics and upgrade to unlock your full potential.";
  }
  
  const renderExamStatus = (examId: 'exam-basic' | 'exam-intermediate' | 'exam-advanced', bestTime: number | null) => {
    const isLocked = getIsExamLocked(examId);

    if (isLocked) {
        return <Button variant="ghost" size="sm" disabled className="text-muted-foreground text-xs"><Ribbon className="mr-2 h-4 w-4" /> Claim Certificate</Button>
    }
    
    if (isLoaded) {
        if (bestTime) {
            return <p className="text-sm font-bold">{`${bestTime.toFixed(2)}s`}</p>;
        } else {
            return (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Unlock className="w-3 h-3 text-primary"/>
                    <span className="text-primary font-semibold">Complete to get certificate</span>
                </div>
            )
        }
    }
    
    return <Skeleton className="w-20 h-5" />;
  }
  
  const getExamStatusBg = (examId: 'exam-basic' | 'exam-intermediate' | 'exam-advanced', bestTime: number | null) => {
    const isLocked = getIsExamLocked(examId);
    if (!isLocked && !bestTime) {
        return "bg-emerald-500/10 border border-emerald-500/20";
    }
    return "bg-muted/50";
  }

  return (
    <>
    <PremiumModal isOpen={isPremiumModalOpen} onOpenChange={setIsPremiumModalOpen} />
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppHeader />
      <main className="flex-1 container py-8 md:py-12 mt-16">
        <header className="mb-8 md:mb-12 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              {isPremium && <Rocket className="w-8 h-8 text-primary" />}
              <h1 className="text-3xl font-bold">{getDashboardTitle()}</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              {getDashboardSubtitle()}
            </p>
          </div>
        </header>
        
        <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Exams</h2>
            <TooltipProvider>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {examSets.map((examSet) => renderExamCard(examSet))}
              </div>
            </TooltipProvider>
         </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-4">Practice & Learn</h2>
                <TooltipProvider>
                    <div className="flex flex-col gap-4">
                        {setsToDisplay.map((set) => {
                            const Icon = iconMap[set.iconName];
                            const setStats = stats[set.id];
                            const bestScore = setStats?.bestScore;
                            const bestTime = setStats?.bestTime;

                            const cardContent = (
                                <Card key={set.id} className={cn("grid md:grid-cols-[1fr_auto] items-center gap-4 bg-white", set.isLocked && "bg-muted/50 text-muted-foreground")}>
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <Icon className={cn("w-10 h-10", set.isLocked ? "text-muted-foreground" : "text-primary")} />
                                        <div className="flex-1">
                                            <h3 className={cn("font-semibold text-lg", !set.isLocked && "text-card-foreground")}>{set.name}</h3>
                                            <p className="text-sm">{set.description} - {set.challenges.length} items</p>
                                        </div>
                                    </CardContent>
                                    
                                    <div className="p-4 grid grid-cols-2 md:grid-cols-[auto_auto] items-center justify-end gap-x-4 text-sm text-center">
                                        <div className="flex flex-col items-center justify-center min-h-[44px]">
                                            {isLoaded ? (
                                                bestScore === 100 && bestTime ? (
                                                    <div className="flex items-center gap-1.5 text-green-600">
                                                        <Timer className="w-4 h-4" />
                                                        <span className="font-bold text-lg">{bestTime.toFixed(2)}s</span>
                                                    </div>
                                                ) : bestScore !== undefined && bestScore !== null ? (
                                                    <p className={cn("font-bold text-lg", !set.isLocked && "text-card-foreground")}>{bestScore.toFixed(0)}%</p>
                                                ) : (
                                                    <p className={cn("font-bold text-lg", !set.isLocked && "text-card-foreground")}>-</p>
                                                )
                                            ) : (
                                                <Skeleton className={cn("h-7 w-12 mx-auto", set.isLocked && "hidden")} />
                                            )}
                                            <p>
                                                {bestScore === 100 && bestTime ? "Best Time" : (bestScore !== undefined && bestScore !== null) ? "Best Score" : "Not Practiced"}
                                            </p>
                                        </div>
                                    
                                        <div className="col-span-2 md:col-span-1 mt-4 md:mt-0 grid grid-cols-2 gap-2">
                                            {set.isLocked ? (
                                                <Button className="w-full col-span-2" variant="premium" onClick={() => setIsPremiumModalOpen(true)}>
                                                    <Sparkles className="mr-2 h-4 w-4" />
                                                    Go Premium
                                                </Button>
                                            ) : (
                                                <>
                                                <Button asChild size="sm" className="w-full" variant="warning">
                                                    <Link href={`/challenge/${set.id}`}>
                                                        <Library className="mr-2 h-4 w-4" /> Practice
                                                    </Link>
                                                </Button>
                                                <Button asChild size="sm" variant="secondary" className="w-full">
                                                    <Link href={`/flashcards/${set.id}`}>
                                                        <Layers className="mr-2 h-4 w-4" /> Study
                                                    </Link>
                                                </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            );
                            
                            if (set.isLocked) {
                                return (
                                    <Tooltip key={set.id}>
                                        <TooltipTrigger asChild>
                                            <div className="cursor-not-allowed">{cardContent}</div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Upgrade to unlock this set.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            }

                            return cardContent;
                        })}
                    </div>
                </TooltipProvider>
            </section>
            <aside className="lg:col-span-1">
                <h2 className="text-2xl font-bold mb-4">Progress Overview</h2>
                 <Card className="bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Best Exam Times</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 p-4">
                        <div className={cn("flex items-center justify-between p-3 rounded-lg flex-1 min-h-[64px]", getExamStatusBg('exam-basic', examStats.basic))}>
                           <div className="flex items-center gap-3">
                               <Award className="w-5 h-5 text-yellow-500" />
                               <p className="font-medium text-sm">Basic Exam</p>
                           </div>
                           {renderExamStatus('exam-basic', examStats.basic)}
                        </div>
                         <div className={cn("flex items-center justify-between p-3 rounded-lg flex-1 min-h-[64px]", getExamStatusBg('exam-intermediate', examStats.intermediate))}>
                           <div className="flex items-center gap-3">
                               <Medal className="w-5 h-5 text-slate-400" />
                               <p className="font-medium text-sm">Intermediate</p>
                           </div>
                           {renderExamStatus('exam-intermediate', examStats.intermediate)}
                        </div>
                         <div className={cn("flex items-center justify-between p-3 rounded-lg flex-1 min-h-[64px]", getExamStatusBg('exam-advanced', examStats.advanced))}>
                           <div className="flex items-center gap-3">
                               <Trophy className="w-5 h-5 text-amber-500" />
                               <p className="font-medium text-sm">Advanced</p>
                           </div>
                           {renderExamStatus('exam-advanced', examStats.advanced)}
                        </div>
                    </CardContent>
                </Card>
                 <Card className="mt-6 bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Practice Sets Completed</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-4">
                      {isLoaded ? (
                          <div className="text-center">
                              <span className="text-4xl font-bold text-primary">{completedSetsCount}</span>
                              <span className="text-2xl text-muted-foreground">/{totalPracticeSets}</span>
                              <p className="text-xs text-muted-foreground mt-2">sets completed</p>
                          </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 pt-2 text-center">
                            <Skeleton className="w-24 h-8" />
                            <Skeleton className="w-20 h-4 mt-1" />
                        </div>
                      )}
                    </CardContent>
                </Card>
            </aside>
        </div>
      </main>
    </div>
    </>
  );
}

    
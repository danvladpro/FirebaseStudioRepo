
"use client";

import { Trophy, ArrowRight, Library, Layers, Lock, Sparkles, ClipboardCopy, ArrowRightLeft, MousePointerSquareDashed, Pilcrow, FunctionSquare, GalleryVerticalEnd, Filter, Rocket, Award, Medal, Unlock } from "lucide-react";
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
  const { user, userProfile } = useAuth();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = React.useState(false);
  
  const isLimited = !userProfile?.isPremium;

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


  const renderExamCard = (examSet: ChallengeSet) => {
    const isExamLocked = getIsExamLocked(examSet.id);
    const Icon = iconMap[examSet.iconName];

    const cardContent = (
     <Card key={examSet.id} className={cn("border-primary/50 bg-primary/5 flex flex-col", isExamLocked && "bg-muted/50 border-dashed text-muted-foreground")}>
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
    if (userProfile && !userProfile.isPremium) return "Start Your Journey to Shortcut Mastery";
    if (userProfile && userProfile.isPremium) return "Unleash Your Shortcut Speed";
    return "Dashboard";
  }

  const getDashboardSubtitle = () => {
    if (userProfile && !userProfile.isPremium) return "Learn the basics and upgrade to unlock your full potential.";
    if (userProfile && userProfile.isPremium) return "Master the keyboard, boost your productivity, and leave the mouse behind.";
    return "Welcome back! Here's your progress at a glance.";
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
              {userProfile?.isPremium && <Rocket className="w-8 h-8 text-primary" />}
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
                            const lastScore = setStats?.lastScore;

                            const cardContent = (
                                <Card key={set.id} className={cn("grid md:grid-cols-[1fr_auto] items-center gap-4", set.isLocked && "bg-muted/50 text-muted-foreground")}>
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <Icon className={cn("w-10 h-10", set.isLocked ? "text-muted-foreground" : "text-primary")} />
                                        <div className="flex-1">
                                            <h3 className={cn("font-semibold text-lg", !set.isLocked && "text-card-foreground")}>{set.name}</h3>
                                            <p className="text-sm">{set.description}</p>
                                        </div>
                                    </CardContent>
                                    
                                    <div className="p-4 grid grid-cols-2 md:grid-cols-[auto_auto_auto] items-center justify-end gap-x-4 text-sm text-center">
                                        <div className="flex flex-col items-center">
                                            <p className={cn("font-bold text-lg", !set.isLocked && "text-card-foreground")}>{set.challenges.length}</p>
                                            <p>Items</p>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            {isLoaded ? (
                                                lastScore !== undefined && lastScore !== null ? (
                                                    <p className={cn("font-bold text-lg", !set.isLocked && "text-card-foreground")}>{lastScore.toFixed(0)}%</p>
                                                ) : (
                                                    <p className={cn("font-bold text-lg", !set.isLocked && "text-card-foreground")}>-</p>
                                                )
                                            ) : (
                                                <Skeleton className={cn("h-7 w-12 mx-auto", set.isLocked && "hidden")} />
                                            )}
                                            <p>Last Score</p>
                                        </div>
                                    
                                        <div className="col-span-2 md:col-span-1 mt-4 md:mt-0 grid grid-cols-2 gap-2">
                                            {set.isLocked ? (
                                                <Button className="w-full col-span-2" variant="premium" onClick={() => setIsPremiumModalOpen(true)}>
                                                    <Sparkles className="mr-2 h-4 w-4" />
                                                    Go Premium
                                                </Button>
                                            ) : (
                                                <>
                                                <Button asChild size="sm" className="w-full">
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
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Best Exam Times</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 p-4">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                           <div className="flex items-center gap-3">
                               <Award className="w-5 h-5 text-yellow-500" />
                               <p className="font-medium text-sm">Basic Exam</p>
                           </div>
                           {getIsExamLocked('exam-basic') ? (
                                <Lock className="w-4 h-4 text-muted-foreground"/>
                            ) : isLoaded ? (
                                examStats.basic ? (
                                <p className="text-sm font-bold">{`${examStats.basic.toFixed(2)}s`}</p>
                                ) : (
                                <Unlock className="w-4 h-4 text-muted-foreground" />
                                )
                            ) : (
                                <Skeleton className="w-12 h-5" />
                            )}
                        </div>
                         <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                           <div className="flex items-center gap-3">
                               <Medal className="w-5 h-5 text-slate-400" />
                               <p className="font-medium text-sm">Intermediate</p>
                           </div>
                           {getIsExamLocked('exam-intermediate') ? (
                                <Lock className="w-4 h-4 text-muted-foreground"/>
                            ) : isLoaded ? (
                                examStats.intermediate ? (
                                <p className="text-sm font-bold">{`${examStats.intermediate.toFixed(2)}s`}</p>
                                ) : (
                                <Unlock className="w-4 h-4 text-muted-foreground" />
                                )
                            ) : (
                                <Skeleton className="w-12 h-5" />
                            )}
                        </div>
                         <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                           <div className="flex items-center gap-3">
                               <Trophy className="w-5 h-5 text-amber-500" />
                               <p className="font-medium text-sm">Advanced</p>
                           </div>
                           {getIsExamLocked('exam-advanced') ? (
                                <Lock className="w-4 h-4 text-muted-foreground"/>
                            ) : isLoaded ? (
                                examStats.advanced ? (
                                <p className="text-sm font-bold">{`${examStats.advanced.toFixed(2)}s`}</p>
                                ) : (
                                <Unlock className="w-4 h-4 text-muted-foreground" />
                                )
                            ) : (
                                <Skeleton className="w-12 h-5" />
                            )}
                        </div>
                    </CardContent>
                </Card>
                 <Card className="mt-6">
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

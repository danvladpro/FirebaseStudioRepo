
"use client";

import { Trophy, ArrowRight, Library, Layers, Lock, Sparkles, ClipboardCopy, ArrowRightLeft, MousePointerSquareDashed, Pilcrow, FunctionSquare, GalleryVerticalEnd, Filter, Rocket, Award, Medal, CheckCircle, Timer, RotateCw, BadgeCheck, Star, BrainCircuit, StarIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChallengeSet } from "@/lib/types";
import { usePerformanceTracker } from "@/hooks/use-performance-tracker";
import { Skeleton } from "@/components/ui/skeleton";
import * as React from "react";
import { CHALLENGE_SETS, SCENARIO_SETS } from "@/lib/challenges";
import { AppHeader } from "./app-header";
import { useAuth } from "./auth-provider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { cn } from "@/lib/utils";
import { ElementType } from "react";
import { PremiumModal } from "./premium-modal";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { CertificateModal } from "./certificate-modal";

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
    Trophy,
    BrainCircuit
};


interface HomePageClientProps {
  examSets: ChallengeSet[];
}

export const XP_CONFIG = {
  Beginner: 20,
  Intermediate: 40,
  Advanced: 60,
  Scenario: 100,
};

const LEVEL_THRESHOLDS = [
    { level: 'Rookie', xp: 0, icon: <Image src="/Level0.png" alt="Rookie" width={64} height={64} /> },
    { level: 'Apprentice', xp: 50, icon: <Image src="/Level1.png" alt="Apprentice" width={64} height={64} /> },
    { level: 'Master', xp: 120, icon: <Image src="/Level2.png" alt="Master" width={64} height={64} /> },
    { level: 'Ninja', xp: 200, icon: <Image src="/Level3.png" alt="Ninja" width={64} height={64} /> }
];


interface ProgressPieChartProps {
    completed: number;
    total: number;
    title: string;
    color: string;
}

const ProgressPieChart: React.FC<ProgressPieChartProps> = ({ completed, total, title, color }) => {
    const data =
      completed > 0
        ? [
            { name: "Completed", value: completed, fill: color },
            { name: "Remaining", value: total - completed, fill: "hsl(var(--muted))" },
          ]
        : [
            { name: "Remaining", value: total, fill: "hsl(var(--muted))" },
          ];

    const chartConfig = {
        completed: { label: 'Completed', color },
        remaining: { label: 'Remaining', color: 'hsl(var(--muted))' },
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <ChartContainer config={chartConfig} className="mx-auto aspect-square h-24">
                <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={25}
                        strokeWidth={2}
                        labelLine={false}
                    >
                       {data.map((entry) => (
                           <Cell key={entry.name} fill={entry.fill} stroke={entry.fill === 'hsl(var(--muted))' && completed > 0 ? 'hsl(var(--border))' : entry.fill} />
                       ))}
                    </Pie>
                     <text
                         x="50%"
                         y="50%"
                         textAnchor="middle"
                         dominantBaseline="middle"
                         className="fill-foreground text-sm font-bold"
                       >
                        {`${completed}/${total}`}
                       </text>
                </PieChart>
            </ChartContainer>
            <span className="text-sm font-medium">{title}</span>
        </div>
    );
};


export function HomePageClient({ examSets }: HomePageClientProps) {
  const { isLoaded, stats } = usePerformanceTracker();
  const { user, userProfile, isPremium } = useAuth();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = React.useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = React.useState(false);
  
  const isLimited = !isPremium;

  const examStats = {
    'exam-basic': stats['exam-basic'],
    'exam-intermediate': stats['exam-intermediate'],
    'exam-advanced': stats['exam-advanced'],
  };
  
  const isBasicPassed = (examStats['exam-basic']?.bestScore ?? 0) === 100;
  const isIntermediatePassed = (examStats['exam-intermediate']?.bestScore ?? 0) === 100;
  const isAdvancedPassed = (examStats['exam-advanced']?.bestScore ?? 0) === 100;
  
  const passedExamsCount = [isBasicPassed, isIntermediatePassed, isAdvancedPassed].filter(Boolean).length;
  const allExamsPassed = passedExamsCount === examSets.length;

  const completedSets = React.useMemo(() => {
    const allSets = [...CHALLENGE_SETS, ...SCENARIO_SETS];
    const practiceSetIds = new Set(allSets.map(s => s.id));
    return Object.keys(stats).filter(setId => 
        practiceSetIds.has(setId) && stats[setId]?.bestScore === 100
    );
  }, [stats]);

  const totalXP = React.useMemo(() => {
    const allSets = [...CHALLENGE_SETS, ...SCENARIO_SETS];
    return completedSets.reduce((acc, setId) => {
      const set = allSets.find(s => s.id === setId);
      if (set && set.level) {
        return acc + (XP_CONFIG[set.level] || 0);
      }
      return acc;
    }, 0);
  }, [completedSets]);
  
  const currentLevelInfo = React.useMemo(() => {
    return LEVEL_THRESHOLDS.slice().reverse().find(l => totalXP >= l.xp) || LEVEL_THRESHOLDS[0];
  }, [totalXP]);

  const nextLevelInfo = React.useMemo(() => {
    return LEVEL_THRESHOLDS.find(l => totalXP < l.xp);
  }, [totalXP]);
  
  const xpForNextLevel = nextLevelInfo ? nextLevelInfo.xp - (currentLevelInfo?.xp || 0) : 0;
  const xpIntoCurrentLevel = totalXP - (currentLevelInfo?.xp || 0);
  const levelProgress = xpForNextLevel > 0 ? (xpIntoCurrentLevel / xpForNextLevel) * 100 : 100;
  
  const setsByLevel = React.useMemo(() => {
    return CHALLENGE_SETS.reduce((acc, set) => {
      const level = set.level || 'Other';
      if (!acc[level]) acc[level] = { total: 0, completed: 0 };
      acc[level].total++;
      if (completedSets.includes(set.id)) {
        acc[level].completed++;
      }
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);
  }, [completedSets]);

  const isBeginnerCompleted = (setsByLevel['Beginner']?.completed || 0) === (setsByLevel['Beginner']?.total || 0);
  const isIntermediateCompleted = (setsByLevel['Intermediate']?.completed || 0) === (setsByLevel['Intermediate']?.total || 0);
  
  const isBasicExamPassed = (examStats['exam-basic']?.bestScore ?? 0) === 100;
  const isIntermediateExamPassed = (examStats['exam-intermediate']?.bestScore ?? 0) === 100;

  const isIntermediateUnlocked = isBeginnerCompleted || isBasicExamPassed;
  const isAdvancedUnlocked = isIntermediateCompleted || isIntermediateExamPassed;

  const getIsSetLocked = (set: ChallengeSet) => {
    if (isLimited) {
      if (set.id === 'formatting-basics') return false;
      return true;
    }
    if (set.category === 'Scenario') return false;

    if (set.level === 'Intermediate' && !isIntermediateUnlocked) return true;
    if (set.level === 'Advanced' && !isAdvancedUnlocked) return true;
    
    return false;
  };

  const getSetLockTooltip = (set: ChallengeSet) => {
    if (isLimited && set.id !== 'formatting-basics') return "Upgrade to Premium to unlock this set.";
    if (set.level === 'Intermediate' && !isIntermediateUnlocked) return "Complete all Beginner sets or pass the Basic Exam to unlock.";
    if (set.level === 'Advanced' && !isAdvancedUnlocked) return "Complete all Intermediate sets or pass the Intermediate Exam to unlock.";
    if (set.category === 'Scenario' && isLimited) return "Upgrade to Premium to access scenarios.";
    return "";
  };

  const shortcutSetsToDisplay = CHALLENGE_SETS.map(set => ({ ...set, isLocked: getIsSetLocked(set) }));
  const scenarioSetsToDisplay = SCENARIO_SETS.map(set => ({ ...set, isLocked: getIsSetLocked(set) }));
      
  const groupedShortcutSets = shortcutSetsToDisplay.reduce((acc, set) => {
    const level = set.level || 'Other';
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(set);
    return acc;
  }, {} as Record<string, typeof shortcutSetsToDisplay>);
  
  const levelOrder: (keyof typeof groupedShortcutSets)[] = ['Beginner', 'Intermediate', 'Advanced'];

  const getIsExamLocked = (examId: string) => {
    if (isLimited) return true;
    if (examId === 'exam-intermediate' && (examStats['exam-basic']?.bestScore ?? 0) < 100) return true;
    if (examId === 'exam-advanced' && (examStats['exam-intermediate']?.bestScore ?? 0) < 100) return true;
    return false;
  };
  
  const getExamLockTooltip = (examId: string) => {
    if (isLimited) return "Upgrade to Premium to unlock exams.";
    if (examId === 'exam-intermediate' && (examStats['exam-basic']?.bestScore ?? 0) < 100) return "Pass the Basic Exam to unlock.";
    if (examId === 'exam-advanced' && (examStats['exam-intermediate']?.bestScore ?? 0) < 100) return "Pass the Intermediate Exam to unlock.";
    return "";
  }
  
  const getExamStats = (examId: keyof typeof examStats) => {
      const stats = examStats[examId];
      return stats ? stats : { bestTime: null, bestScore: null };
  }

  const renderExamCard = (examSet: ChallengeSet) => {
    const isExamLocked = getIsExamLocked(examSet.id);
    const Icon = iconMap[examSet.iconName];
    const { bestScore } = getExamStats(examSet.id as keyof typeof examStats);
    const isCompleted = (bestScore ?? 0) === 100;
    
    let isNextExam = false;
    if (!isExamLocked && !isCompleted) {
        if (examSet.id === 'exam-basic') isNextExam = true;
        else if (examSet.id === 'exam-intermediate' && isBasicPassed) isNextExam = true;
        else if (examSet.id === 'exam-advanced' && isIntermediatePassed) isNextExam = true;
    }


    const cardContent = (
     <Card key={examSet.id} className={cn(
        "shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col relative", 
        isExamLocked ? "bg-muted/50 border-dashed text-muted-foreground" : "bg-card hover:bg-accent/5",
        isCompleted && "border-green-500/50",
        isNextExam && "border-yellow-500 border-2"
     )}>
        {isCompleted ? (
             <Badge variant="premium" className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-sm border-0">
                <Trophy className="mr-1.5 h-4 w-4" />
                Passed
            </Badge>
        ) : isExamLocked ? (
            <Badge variant="level" className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-sm">
                <Lock className="mr-1.5 h-3 w-3" />
                Locked
            </Badge>
        ) : isNextExam ? (
             <Badge variant="warning" className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-sm">
                <StarIcon className="mr-1.5 h-3 w-3" />
                Next Up
            </Badge>
        ) : null}
        <CardHeader className="flex-row gap-4 items-center p-4">
            <Icon className={cn("w-8 h-8", isExamLocked ? "text-muted-foreground" : "text-primary")} />
            <div>
                <CardTitle className={cn("text-xl", isExamLocked && "text-muted-foreground")}>{examSet.name}</CardTitle>
                <CardDescription className={cn("text-xs", isCompleted && "text-primary")}>
                    {isCompleted ? "Congratulations! You've mastered this exam." : examSet.description}
                </CardDescription>
            </div>
        </CardHeader>
        <CardFooter className="mt-auto p-4">
            {isExamLocked ? (
                <Button className="w-full" variant={isLimited ? "premium" : "secondary"} onClick={() => isLimited && setIsPremiumModalOpen(true)} disabled={!isLimited}>
                    {isLimited ? <Sparkles className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
                    {isLimited ? "Go Premium" : "Locked"}
                </Button>
            ) : isCompleted ? (
                <Button asChild size="sm" className="w-full" variant="secondary">
                    <Link href={`/challenge/${examSet.id}`}>
                    <RotateCw className="mr-2 h-4 w-4" />
                    Try Again
                    </Link>
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
  
  const renderSetCard = (set: ChallengeSet & { isLocked: boolean }) => {
    const Icon = iconMap[set.iconName];
    const setStats = stats[set.id];
    const bestScore = setStats?.bestScore;
    const bestTime = setStats?.bestTime;
    const isCompleted = bestScore === 100;

    const cardContent = (
        <Card key={set.id} className={cn(
            "relative grid md:grid-cols-[1fr_auto] items-center gap-4 bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:bg-accent/5",
            set.isLocked && "bg-muted/50 text-muted-foreground border-dashed"
        )}>
            {isCompleted && !set.isLocked && (
                <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-green-500" />
            )}
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
                        isCompleted ? (
                        bestTime ? (
                            <div className="flex items-center gap-1.5 text-green-600">
                                <Timer className="w-4 h-4" />
                                <span className="font-bold text-lg">{bestTime.toFixed(2)}s</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-green-600">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-bold text-lg">Completed</span>
                            </div>
                        )
                        ) : bestScore !== undefined && bestScore !== null ? (
                            <p className={cn("font-bold text-lg", !set.isLocked && "text-card-foreground")}>{bestScore.toFixed(0)}%</p>
                        ) : (
                            <p className={cn("font-bold text-lg", !set.isLocked && "text-card-foreground")}>-</p>
                        )
                    ) : (
                        <Skeleton className={cn("h-7 w-12 mx-auto", set.isLocked && "hidden")} />
                    )}
                    <p>
                    {isCompleted ? (bestTime ? "Best Time" : "Status") : "Best Score"}
                    </p>
                </div>

                <div className="col-span-2 md:col-span-1 mt-4 md:mt-0 grid grid-cols-2 gap-2">
                    {set.isLocked ? (
                        <Button className="w-full col-span-2" variant={isLimited ? 'premium' : 'secondary'} onClick={() => isLimited && setIsPremiumModalOpen(true)} disabled={!isLimited && set.level !== 'Scenario'}>
                           {isLimited ? <Sparkles className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
                           {isLimited ? 'Go Premium' : 'Locked'}
                        </Button>
                    ) : (
                        <>
                        <Button asChild size="sm" className="w-full" variant="default">
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
                    <p>{getSetLockTooltip(set)}</p>
                </TooltipContent>
            </Tooltip>
        );
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

  const renderExamTime = (examId: keyof typeof examStats) => {
    if (!isLoaded) return <Skeleton className="w-12 h-5" />;

    const exam = examStats[examId];
    const isLocked = getIsExamLocked(examId);
    
    if (exam?.bestTime) {
      return <span className="font-bold">{exam.bestTime.toFixed(2)}s</span>;
    }

    if (isLocked) {
      return <Badge variant="level" className="px-2 py-0.5 text-xs">Locked  </Badge>

    }

    let isNextUp = false;
    if (examId === 'exam-basic' && !isBasicPassed) isNextUp = true;
    if (examId === 'exam-intermediate' && isBasicPassed && !isIntermediatePassed) isNextUp = true;
    if (examId === 'exam-advanced' && isIntermediatePassed && !isAdvancedPassed) isNextUp = true;
    
    if (isNextUp) {
      return <Badge variant="warning" className="px-2 py-0.5 text-xs">Next Up</Badge>
    }
    
    return <span className="font-bold">-</span>; // Should not happen if passed but no time, but as fallback
  };

  return (
    <>
    <PremiumModal isOpen={isPremiumModalOpen} onOpenChange={setIsPremiumModalOpen} />
    <CertificateModal isOpen={isCertificateModalOpen} onOpenChange={setIsCertificateModalOpen} />
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
            <aside className="lg:col-span-1">
                <Card className="bg-card">
                    <CardHeader>
                        <h2 className="text-2xl font-bold">Progress Overview</h2>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col gap-6">
                        {isLoaded ? (
                            <>
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0">
                                        {currentLevelInfo.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold">{currentLevelInfo.level}</h3>
                                        <p className="text-2xl font-bold text-primary">{totalXP} <span className="text-base font-medium text-muted-foreground">XP</span></p>
                                        {nextLevelInfo && (
                                            <>
                                                <Progress value={levelProgress} className="h-2 mt-2" />
                                                <p className="text-xs text-muted-foreground mt-1">{xpIntoCurrentLevel}/{xpForNextLevel} XP to {nextLevelInfo.level}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 text-center">
                                  <ProgressPieChart
                                      completed={setsByLevel['Beginner']?.completed || 0}
                                      total={setsByLevel['Beginner']?.total || 0}
                                      title="Beginner"
                                      color="hsl(var(--primary))"
                                  />
                                  <ProgressPieChart
                                      completed={setsByLevel['Intermediate']?.completed || 0}
                                      total={setsByLevel['Intermediate']?.total || 0}
                                      title="Intermediate"
                                      color="hsl(var(--primary))"
                                  />
                                  <ProgressPieChart
                                      completed={setsByLevel['Advanced']?.completed || 0}
                                      total={setsByLevel['Advanced']?.total || 0}
                                      title="Advanced"
                                      color="hsl(var(--primary))"
                                  />
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Best Exam Times</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground"><Award className="w-4 h-4 text-yellow-500" /> Basic Exam</div>
                                            {renderExamTime('exam-basic')}
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground"><Medal className="w-4 h-4 text-slate-400" /> Intermediate</div>
                                            {renderExamTime('exam-intermediate')}
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground"><Trophy className="w-4 h-4 text-amber-500" /> Advanced</div>
                                            {renderExamTime('exam-advanced')}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold">Certificate of Mastery</h3>
                                  <div className="relative w-full h-4 overflow-hidden rounded-lg bg-secondary">
                                      <div
                                        className="h-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all duration-500"
                                        style={{ width: `${(passedExamsCount / examSets.length) * 100}%` }}
                                      ></div>
                                       <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="px-2 py-0.5 rounded-md bg-background/80 text-xs font-semibold text-foreground backdrop-blur">
                                            {passedExamsCount} of {examSets.length} Exams Passed
                                            </span>
                                        </div>
                                  </div>
                                  <TooltipProvider>
                                  {allExamsPassed ? (
                                    <Button 
                                        className="w-full transition-all bg-emerald-600 hover:bg-emerald-600/90"
                                        onClick={() => setIsCertificateModalOpen(true)}
                                    >
                                        <Trophy className="mr-2 h-4 w-4" /> 
                                        Claim Certificate
                                    </Button>
                                  ) : (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="w-full">
                                                <Button className="w-full" disabled>
                                                    <Lock className="mr-2 h-4 w-4" /> 
                                                    Claim Certificate
                                                </Button>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Pass all 3 exams to unlock your certificate.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                  )}
                                  </TooltipProvider>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-2 pt-2 text-center">
                                <Skeleton className="w-full h-40" />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </aside>
            <section className="lg:col-span-2 space-y-8">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Real Scenarios</h2>
                    <TooltipProvider>
                        <div className="flex flex-col gap-4">
                            {scenarioSetsToDisplay.map((set) => renderSetCard(set))}
                        </div>
                    </TooltipProvider>
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-4">Learn Shortcuts</h2>
                    <TooltipProvider>
                        <div className="flex flex-col gap-8">
                            {levelOrder.map(level => groupedShortcutSets[level] && (
                                <div key={level}>
                                    <h3 className="text-xl font-semibold mb-4 capitalize">{level}</h3>
                                    <div className="flex flex-col gap-4">
                                    {groupedShortcutSets[level].map((set) => renderSetCard(set))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TooltipProvider>
                </div>
            </section>
        </div>
      </main>
    </div>
    </>
  );
}


"use client";

import { Trophy, ArrowRight, Library, Layers, Lock, Sparkles, ClipboardCopy, ArrowRightLeft, MousePointerSquareDashed, Pilcrow, FunctionSquare, GalleryVerticalEnd, Filter, Rocket, Award, Medal, CheckCircle, Timer, RotateCw, BadgeCheck, Star, BrainCircuit, StarIcon, HelpCircle, Zap, Dumbbell, Repeat, Check, ClipboardPaste, Wand2, Palette, DollarSign, ShieldCheck } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { CertificateModal } from "./certificate-modal";
import { DRILL_SET, Drill } from "@/lib/drills";

const iconMap: Record<string, ElementType> = {
    ClipboardPaste,
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
    BrainCircuit,
    HelpCircle,
    Zap,
    Dumbbell,
    Repeat,
    Wand2,
    Palette,
    DollarSign,
    ShieldCheck,
};

export const XP_CONFIG = {
  General: 10,
  Beginner: 20,
  Intermediate: 40,
  Advanced: 60,
  Scenario: 100,
};

const LEVEL_THRESHOLDS = [
    { level: 'Rookie', xp: 0, icon: <Image src="/Level0.svg" alt="Rookie" width={64} height={64} /> },
    { level: 'Apprentice', xp: 50, icon: <Image src="/Level1.svg" alt="Apprentice" width={64} height={64} /> },
    { level: 'Master', xp: 120, icon: <Image src="/Level2.svg" alt="Master" width={64} height={64} /> },
    { level: 'Ninja', xp: 200, icon: <Image src="/Level3.svg" alt="Ninja" width={64} height={64} /> }
];

export function HomePageClient() {
  const { isLoaded, stats } = usePerformanceTracker();
  const { user, userProfile, isPremium } = useAuth();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = React.useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = React.useState(false);

  const SCROLL_POSITION_KEY = 'dashboardScrollPosition';

  React.useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
    if (savedPosition) {
      setTimeout(() => {
        window.scrollTo({ top: parseInt(savedPosition, 10), behavior: 'auto' });
      }, 100);
    }
  }, []);

  const isLimited = !isPremium;

  const completedChallengesCount = React.useMemo(() => {
    return CHALLENGE_SETS.filter(set => stats[set.id]?.bestScore === 100).length;
  }, [stats]);
  
  const completedDrillsCount = React.useMemo(() => {
      return DRILL_SET.drills.filter(drill => stats[drill.id]?.bestScore === 100).length;
  }, [stats]);
  
  const totalChallenges = CHALLENGE_SETS.length;
  const totalDrills = DRILL_SET.drills.length;
  const totalItems = totalChallenges + totalDrills;
  const completedItems = completedChallengesCount + completedDrillsCount;
  const allItemsPassed = totalItems > 0 && completedItems === totalItems;
  const certificateProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;


  const totalXP = React.useMemo(() => {
    const allCompletedIds = new Set([
        ...CHALLENGE_SETS.filter(set => stats[set.id]?.bestScore === 100).map(set => set.id),
        ...DRILL_SET.drills.filter(drill => stats[drill.id]?.bestScore === 100).map(drill => drill.id)
    ]);
    
    let xp = 0;
    CHALLENGE_SETS.forEach(set => {
        if(allCompletedIds.has(set.id) && set.level && XP_CONFIG[set.level]) {
            xp += XP_CONFIG[set.level];
        }
    });

    return xp;
  }, [stats]);
  
  const currentLevelInfo = React.useMemo(() => {
    return LEVEL_THRESHOLDS.slice().reverse().find(l => totalXP >= l.xp) || LEVEL_THRESHOLDS[0];
  }, [totalXP]);

  const nextLevelInfo = React.useMemo(() => {
    return LEVEL_THRESHOLDS.find(l => totalXP < l.xp);
  }, [totalXP]);
  
  const xpToGo = nextLevelInfo ? nextLevelInfo.xp - totalXP : 0;
  
  const getIsSetLocked = (set: ChallengeSet) => {
    if (isPremium) return false;
    return set.id !== 'warp-speed-navigation' && set.id !== 'rapid-selection';
  };

  const shortcutSetsToDisplay = CHALLENGE_SETS.map(set => ({ ...set, isLocked: getIsSetLocked(set) }));
      
  const groupedShortcutSets = shortcutSetsToDisplay.reduce((acc, set) => {
    const level = set.level || 'Other';
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(set);
    return acc;
  }, {} as Record<string, typeof shortcutSetsToDisplay>);

  const drillsByLevel = React.useMemo(() => {
    return DRILL_SET.drills.reduce((acc, drill) => {
      const level = drill.level || 'General';
      if (!acc[level]) acc[level] = [];
      acc[level].push(drill);
    return acc;
    }, {} as Record<string, Drill[]>);
  }, []);
  
  const levelOrder: (keyof typeof groupedShortcutSets)[] = ['Beginner', 'Intermediate', 'Advanced'];

  const getSetLockTooltip = (set: ChallengeSet) => {
    if (isLimited && set.id !== 'warp-speed-navigation' && set.id !== 'rapid-selection') return "Upgrade to Premium to unlock this set.";
    return "";
  };

  const renderSetCard = (set: ChallengeSet & { isLocked: boolean }) => {
    const Icon = iconMap[set.iconName];
    const setStats = stats[set.id];
    const bestScore = setStats?.bestScore;
    const isCompleted = bestScore === 100;

    const cardContent = (
        <Card key={set.id} className={cn(
            "flex flex-col h-full transition-transform duration-200", 
            set.isLocked ? "bg-muted/50 text-muted-foreground border-dashed" : "hover:shadow-md hover:-translate-y-0.5"
        )}>
            <CardHeader className="flex flex-row items-start gap-4 p-4">
                <Icon className={cn("w-10 h-10 mt-1", set.isLocked ? "text-muted-foreground" : "text-primary")} />
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className={cn("font-semibold text-lg", !set.isLocked && "text-card-foreground")}>{set.name}</h3>
                         {isCompleted && !set.isLocked && (
                            <Badge variant="completed">Passed</Badge>
                         )}
                    </div>
                    <CardDescription>{set.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-4 pt-0">
                <p className="text-sm text-muted-foreground">{set.challenges.length} items</p>
            </CardContent>
            <CardFooter className={cn("p-4 pt-0 mt-auto flex items-center gap-3", set.isLocked ? "justify-center" : "justify-between")}>
                {set.isLocked ? (
                    <Button className="w-full" variant={isLimited ? 'premium' : 'secondary'} onClick={() => isLimited && setIsPremiumModalOpen(true)} disabled={!isLimited}>
                       {isLimited ? <Sparkles className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
                       {isLimited ? 'Go Premium' : 'Locked'}
                    </Button>
                ) : (
                    <>
                     <Button asChild size="sm" variant="secondary">
                        <Link href={`/flashcards/${set.id}`}>
                            <Layers className="mr-2 h-4 w-4" /> Flashcards
                        </Link>
                    </Button>
                     <div className="flex h-9 items-center justify-center rounded-md border border-input bg-transparent px-4 py-2">
                        {isLoaded ? (
                            bestScore !== undefined && bestScore !== null ? (
                                <p className="font-semibold text-primary">{bestScore.toFixed(0)}%</p>
                            ) : (
                                <p className="text-sm font-medium text-muted-foreground">Best Score</p>
                            )
                        ) : (
                            <Skeleton className="h-5 w-16" />
                        )}
                    </div>
                    <Button asChild size="sm" variant="default">
                        <Link href={`/challenge/${set.id}`}>
                           <Library className="mr-2 h-4 w-4" /> Learn / Challenge
                        </Link>
                    </Button>
                    </>
                )}
            </CardFooter>
        </Card>
    );

    if (set.isLocked) {
        return (
            <Tooltip key={set.id}>
                <TooltipTrigger asChild>
                    <div className="cursor-not-allowed h-full">
                        {cardContent}
                    </div>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
                                            <p className="text-xs text-muted-foreground mt-1">{xpToGo} XP to {nextLevelInfo.level}</p>
                                        )}
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold">Certificate of Mastery</h3>
                                  <div className="relative w-full h-4 overflow-hidden rounded-full bg-secondary">
                                      <div
                                        className="h-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all duration-500"
                                        style={{ width: `${certificateProgress}%` }}
                                      ></div>
                                       <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-black drop-shadow-sm text-xs font-semibold">
                                              {completedItems} of {totalItems} Items Mastered
                                            </span>
                                        </div>
                                  </div>
                                  <TooltipProvider>
                                  {allItemsPassed ? (
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
                                            <div className="cursor-not-allowed">
                                                <Button className="w-full bg-slate-100 text-slate-600 border-2 border-dashed border-slate-400 cursor-not-allowed" disabled>
                                                    <Lock className="mr-2 h-4 w-4" /> 
                                                    Claim Certificate
                                                </Button>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Complete all challenges and drills to unlock.</p>
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
            <section className="lg:col-span-3 space-y-8">
                {levelOrder.map(level => {
                    const challengesForLevel = groupedShortcutSets[level] || [];
                    const drillsForLevel = drillsByLevel[level] || [];
                    if (challengesForLevel.length === 0 && drillsForLevel.length === 0) return null;
                    
                    const completedChallengesForLevel = challengesForLevel.filter(s => stats[s.id]?.bestScore === 100);
                    const xpForLevel = challengesForLevel.reduce((acc, set) => acc + (XP_CONFIG[set.level] || 0), 0);
                    const completedXpForLevel = completedChallengesForLevel.reduce((acc, set) => acc + (XP_CONFIG[set.level] || 0), 0);

                    return (
                        <Card key={level}>
                          <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                              <CardTitle className="text-xl capitalize">{level}</CardTitle>
                              <p className="text-sm font-bold text-muted-foreground">
                                  XP: {completedXpForLevel} / {xpForLevel}
                              </p>
                          </CardHeader>
                          
                          <CardContent className="p-4 pt-4 space-y-6">
                            <div>
                                <h3 className="font-semibold text-lg text-muted-foreground mb-4">Challenges</h3>
                                <TooltipProvider>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        {challengesForLevel.map((set) => renderSetCard(set))}
                                    </div>
                                </TooltipProvider>
                            </div>
                            
                            {drillsForLevel.length > 0 && (
                                <div className="bg-muted/30 rounded-lg p-4 mt-6">
                                    <h3 className="font-semibold text-lg text-muted-foreground mb-4">Drills</h3>
                                    <TooltipProvider>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                                            {(() => {
                                                const areChallengesForLevelPassed = completedChallengesForLevel.length === challengesForLevel.length;

                                                let firstIncompleteDrillIndex = drillsForLevel.length;
                                                for (let i = 0; i < drillsForLevel.length; i++) {
                                                    if (stats[drillsForLevel[i].id]?.bestScore !== 100) {
                                                        firstIncompleteDrillIndex = i;
                                                        break;
                                                    }
                                                }

                                                return drillsForLevel.map((drill, index) => {
                                                    const isDrillPassed = stats[drill.id]?.bestScore === 100;
                                                    const isDrillLocked = !isPremium && (!areChallengesForLevelPassed || index > firstIncompleteDrillIndex);
                                                    const isNextDrill = !isDrillLocked && !isDrillPassed && index === firstIncompleteDrillIndex;
                                                    
                                                    const tooltipContent = isDrillLocked 
                                                        ? (!areChallengesForLevelPassed 
                                                            ? `Complete all '${level}' challenges to unlock drills.`
                                                            : `Complete the previous drill to unlock.`)
                                                        : drill.name;

                                                    const buttonClasses = cn(
                                                        "h-auto p-1.5 w-full text-left flex flex-col items-start shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-150",
                                                        isDrillLocked && "bg-muted text-muted-foreground hover:bg-muted",
                                                        isNextDrill && "bg-accent text-accent-foreground hover:bg-accent/90",
                                                        isDrillPassed && "bg-emerald-600 text-white hover:bg-emerald-600/90"
                                                    );
                                                    
                                                    const buttonContent = isDrillLocked 
                                                    ? (
                                                        <div className="text-center w-full">
                                                            <span className="text-xs text-muted-foreground/80">Drill {index + 1}</span>
                                                            <Lock className="w-4 h-4 mx-auto mt-1" />
                                                        </div>
                                                    )
                                                    : (
                                                        <div className="text-left w-full">
                                                            <div className="flex justify-between items-center">
                                                                <span className={cn("text-xs", isDrillPassed ? "text-white/70" : "text-foreground/70")}>Drill {index + 1}</span>
                                                                {isDrillPassed && <Check className="w-3 h-3 text-white" />}
                                                            </div>
                                                            <span className="text-xs font-semibold block truncate">{drill.name}</span>
                                                        </div>
                                                    );

                                                    const buttonElement = isDrillLocked ? (
                                                        <Button className={buttonClasses} disabled>
                                                            {buttonContent}
                                                        </Button>
                                                    ) : (
                                                        <Button asChild className={buttonClasses}>
                                                            <Link href={`/drills/${drill.id}?drillNumber=${index + 1}`}>
                                                                {buttonContent}
                                                            </Link>
                                                        </Button>
                                                    );

                                                    return (
                                                        <Tooltip key={drill.id}>
                                                            <TooltipTrigger asChild>
                                                                <div className={cn("w-full h-full", isDrillLocked && "cursor-not-allowed")}>
                                                                    {buttonElement}
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top">
                                                                <p className="text-xs">{tooltipContent}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )
                                                });
                                            })()}
                                        </div>
                                    </TooltipProvider>
                                </div>
                            )}
                          </CardContent>
                        </Card>
                    );
                })}
            </section>
        </div>
      </main>
    </div>
    </>
  );
}

    

    


"use client";

import { Trophy, ArrowRight, Library, Layers, Lock, Sparkles, ClipboardCopy, ArrowRightLeft, MousePointerSquareDashed, Pilcrow, FunctionSquare, GalleryVerticalEnd, Filter, Rocket, Award, Medal, CheckCircle, Timer, RotateCw, BadgeCheck, Star, BrainCircuit, StarIcon, HelpCircle, Zap, Dumbbell, Repeat, Check, ClipboardPaste, Wand2, Palette, DollarSign, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChallengeSet, ChallengeLevel } from "@/lib/types";
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
import { BeforeYouStart } from "./before-you-start";

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
  Apprentice: 20,
  Master: 40,
  Ninja: 60,
  Scenario: 100,
};

const PROGRESSION_LEVELS = [
    { name: 'Rookie', icon: <Image src="/Level0.svg" alt="Rookie" width={64} height={64} /> },
    { name: 'Apprentice', icon: <Image src="/Level1.svg" alt="Apprentice" width={64} height={64} /> },
    { name: 'Master', icon: <Image src="/Level2.svg" alt="Master" width={64} height={64} /> },
    { name: 'Ninja', icon: <Image src="/Level3.svg" alt="Ninja" width={64} height={64} /> }
];

export function HomePageClient() {
  const { isLoaded, stats } = usePerformanceTracker();
  const { user, userProfile, isPremium } = useAuth();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = React.useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = React.useState(false);
  const isAdmin = userProfile?.preview === true;

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

  const levelCompletion = React.useMemo(() => {
    if (!isLoaded) return { Apprentice: false, Master: false, Ninja: false };

    const checkLevelCompletion = (level: ChallengeLevel) => {
        const challengesForLevel = CHALLENGE_SETS.filter(c => c.level === level);
        const drillsForLevel = DRILL_SET.drills.filter(d => d.level === level);

        if (challengesForLevel.length === 0 && drillsForLevel.length === 0) return true;

        const allChallengesPassed = challengesForLevel.every(c => stats[c.id]?.bestScore === 100);
        const allDrillsPassed = drillsForLevel.every(d => stats[d.id]?.bestScore === 100);

        return allChallengesPassed && allDrillsPassed;
    };

    return {
        Apprentice: checkLevelCompletion('Apprentice'),
        Master: checkLevelCompletion('Master'),
        Ninja: checkLevelCompletion('Ninja'),
    };
  }, [isLoaded, stats]);
  
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
  
  const currentUserLevelName = React.useMemo(() => {
    if (!isLoaded) return 'Rookie';
    if (allItemsPassed) return 'Ninja';
    if (levelCompletion.Master) return 'Master';
    if (levelCompletion.Apprentice) return 'Apprentice';
    return 'Rookie';
  }, [isLoaded, levelCompletion, allItemsPassed]);

  const nextUserLevelName = React.useMemo(() => {
    switch (currentUserLevelName) {
        case 'Rookie': return 'Apprentice';
        case 'Apprentice': return 'Master';
        case 'Master': return 'Ninja';
        default: return null;
    }
  }, [currentUserLevelName]);

  const currentUserProgression = PROGRESSION_LEVELS.find(l => l.name === currentUserLevelName) || PROGRESSION_LEVELS[0];


  const isMasterLockedForPremium = !isAdmin && !levelCompletion.Apprentice;
  const isNinjaLockedForPremium = !isAdmin && !levelCompletion.Master;

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
  
  const groupedShortcutSets = CHALLENGE_SETS.reduce((acc, set) => {
    const level = set.level || 'Other';
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(set);
    return acc;
  }, {} as Record<string, ChallengeSet[]>);

  const drillsByLevel = React.useMemo(() => {
    return DRILL_SET.drills.reduce((acc, drill) => {
      const level = drill.level || 'General';
      if (!acc[level]) acc[level] = [];
      acc[level].push(drill);
    return acc;
    }, {} as Record<string, Drill[]>);
  }, []);
  
  const levelOrder: (keyof typeof groupedShortcutSets)[] = ['Apprentice', 'Master', 'Ninja'];

  const levelProgress = React.useMemo(() => {
    if (!isLoaded) return {};
    
    const progress: Record<string, number> = {};
    const levels: ChallengeLevel[] = ['Apprentice', 'Master', 'Ninja'];

    levels.forEach(level => {
      const challengesForLevel = CHALLENGE_SETS.filter(c => c.level === level);
      const drillsForLevel = DRILL_SET.drills.filter(d => d.level === level);
      const totalItems = challengesForLevel.length + drillsForLevel.length;

      if (totalItems === 0) {
        progress[level] = 0;
        return;
      }

      const completedChallenges = challengesForLevel.filter(c => stats[c.id]?.bestScore === 100).length;
      const completedDrills = drillsForLevel.filter(d => stats[d.id]?.bestScore === 100).length;
      const completedItems = completedChallenges + completedDrills;
      
      progress[level] = (completedItems / totalItems) * 100;
    });

    return progress;
  }, [isLoaded, stats]);
  

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
                                        {currentUserProgression.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold">{currentUserProgression.name}</h3>
                                        <p className="text-2xl font-bold text-primary">{totalXP} <span className="text-base font-medium text-muted-foreground">XP</span></p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                  {PROGRESSION_LEVELS.map((level) => {
                                      const currentIndex = PROGRESSION_LEVELS.findIndex(l => l.name === currentUserLevelName);
                                      const levelIndex = PROGRESSION_LEVELS.findIndex(l => l.name === level.name);
                                      
                                      const isCompleted = levelIndex < currentIndex;
                                      const isCurrent = levelIndex === currentIndex;
                                      const isNext = levelIndex === currentIndex + 1;
                                      const isUpcoming = levelIndex > currentIndex + 1;
                                      
                                      const progress = isNext ? levelProgress[level.name as ChallengeLevel] ?? 0 : 0;

                                      return (
                                          <div key={level.name} className={cn(
                                              "p-2 rounded-lg transition-all",
                                              isCurrent && "border-2 border-emerald-500 bg-emerald-500/10",
                                              isNext && "border-2 border-primary/30",
                                              (isCompleted || isUpcoming) && "bg-muted/50"
                                          )}>
                                              <div className="flex items-center justify-between">
                                                  <span className={cn(
                                                      "font-medium text-sm",
                                                      isCurrent ? "text-emerald-700 dark:text-emerald-300" : 
                                                      isNext ? "text-foreground" : 
                                                      "text-muted-foreground"
                                                  )}>
                                                      {level.name}
                                                  </span>
                                                  {isCompleted && (
                                                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                                                  )}
                                              </div>
                                              {isNext && (
                                                  <div className="mt-2 space-y-1">
                                                      <Progress value={progress} className="h-1.5" />
                                                      <p className="text-xs text-right text-muted-foreground">{progress.toFixed(0)}% complete</p>
                                                  </div>
                                              )}
                                          </div>
                                      );
                                  })}
                              </div>
                                <Separator />
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold">Certificate of Mastery</h3>
                                  <p className="text-sm text-muted-foreground -mt-3">Complete all challenges & drills to claim certificate.</p>
                                  <div className="relative w-full h-4 overflow-hidden rounded-full bg-secondary">
                                      <div
                                        className="h-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all duration-500"
                                        style={{ width: `${certificateProgress}%` }}
                                      ></div>
                                       <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-black drop-shadow-sm text-xs font-semibold">
                                              {certificateProgress.toFixed(0)}% Complete
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
                <BeforeYouStart />
                {(levelOrder as ChallengeLevel[]).map(level => {
                    const challengesForLevel = groupedShortcutSets[level] || [];
                    const drillsForLevel = drillsByLevel[level] || [];
                    if (!isPremium && !isAdmin && level !== 'Apprentice') return null;

                    if (challengesForLevel.length === 0 && drillsForLevel.length === 0) return null;
                    
                    const isLevelLocked = (() => {
                        if (isAdmin) return false;
                        if (!isPremium && level !== 'Apprentice') return true;
                        if (level === 'Master' && isMasterLockedForPremium) return true;
                        if (level === 'Ninja' && isNinjaLockedForPremium) return true;
                        return false;
                    })();

                    const areChallengesForLevelPassed = challengesForLevel.every(s => stats[s.id]?.bestScore === 100);
                    const areDrillsLockedForPremium = isPremium && !isAdmin && !areChallengesForLevelPassed;
                    
                    const completedChallengesForLevel = challengesForLevel.filter(s => stats[s.id]?.bestScore === 100);
                    const xpForLevel = challengesForLevel.reduce((acc, set) => acc + (XP_CONFIG[set.level] || 0), 0);
                    const completedXpForLevel = completedChallengesForLevel.reduce((acc, set) => acc + (XP_CONFIG[set.level] || 0), 0);

                    if (isLevelLocked) {
                        const lockReason = `Complete all challenges and drills in the ${level === 'Master' ? 'Apprentice' : 'Master'} level to unlock.`;
                        return (
                            <TooltipProvider key={level}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Card className="border-dashed bg-muted/50">
                                            <CardHeader className="flex flex-row items-center justify-between p-4">
                                                <CardTitle className="text-xl capitalize text-muted-foreground">{level === 'Master' ? '🥷 ' : '🏆 '}{level}</CardTitle>
                                                <Lock className="w-5 h-5 text-muted-foreground"/>
                                            </CardHeader>
                                        </Card>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{lockReason}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        );
                    }

                    return (
                        <Card key={level}>
                          <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                              <CardTitle className="text-xl capitalize">
                                  {level === 'Apprentice' ? '⚔️ ' : level === 'Master' ? '🥷 ' : level === 'Ninja' ? '🏆 ' : ''}
                                  {level}
                              </CardTitle>
                              <p className="text-sm font-bold text-muted-foreground">
                                  XP: {completedXpForLevel} / {xpForLevel}
                              </p>
                          </CardHeader>
                          
                          <CardContent className="p-4 pt-4 space-y-6">
                            <div>
                                <h3 className="font-semibold text-lg text-muted-foreground mb-4">🎯 Challenges</h3>
                                <TooltipProvider>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        {challengesForLevel.map((set) => {
                                            const setStats = stats[set.id];
                                            const bestScore = setStats?.bestScore;
                                            const isCompleted = bestScore === 100;
                                            const Icon = iconMap[set.iconName];
                                            const isChallengeLocked = !isPremium && !isAdmin && set.id !== 'rapid-selection';
                                            
                                            const cardContent = (
                                                <Card key={set.id} className={cn(
                                                    "flex flex-col h-full transition-transform duration-200", 
                                                    isChallengeLocked ? "bg-muted/50 text-muted-foreground border-dashed" : "hover:shadow-md hover:-translate-y-0.5"
                                                )}>
                                                    <CardHeader className="flex flex-row items-start gap-1 p-4">
                                                        <Icon className={cn("w-10 h-10 mt-1", isChallengeLocked ? "text-muted-foreground" : "text-primary")} />
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className={cn("font-semibold text-lg", !isChallengeLocked && "text-card-foreground")}>{set.name}</h3>
                                                                    {isCompleted && !isChallengeLocked && (
                                                                    <Badge variant="completed">Passed</Badge>
                                                                    )}
                                                            </div>
                                                            <CardDescription>{set.description}</CardDescription>
                                                        </div>
                                                    </CardHeader>
                                                
                                                    <CardContent className="p-4 pt-0 pb-2">
                                                         {/* <p className="text-sm text-muted-foreground">{set.challenges.length} items</p> */}
                                                    </CardContent>
                                                
                                                    <CardFooter className={cn("p-4 pt-2 mt-auto")}>
                                                        {isChallengeLocked ? (
                                                            <Button className="w-full" variant={'premium'} onClick={() => setIsPremiumModalOpen(true)}>
                                                                <Sparkles className="mr-2 h-4 w-4" /> Go Premium
                                                            </Button>
                                                        ) : (
                                                            <div className="flex flex-col gap-2 w-full">
                                                                <Separator />
                                                                <div className="flex items-center justify-between pt-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <Button asChild size="sm" variant="secondary">
                                                                            <Link href={`/flashcards/${set.id}`}>
                                                                                <Layers className="mr-2 h-4 w-4" /> Flashcards
                                                                            </Link>
                                                                        </Button>
                                                
                                                                         <div className="flex h-9 min-w-20 items-center justify-center rounded-md border border-input bg-transparent px-3 py-2">
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
                                                                    </div>
                                                
                                                                    <Button asChild size="sm" variant="default">
                                                                        <Link href={`/challenge/${set.id}`}>
                                                                            <Library className="mr-2 h-4 w-4" /> Challenge
                                                                        </Link>
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CardFooter>
                                                </Card>
                                            );
                                            
                                             if (isChallengeLocked) {
                                                return (
                                                    <Tooltip key={set.id}>
                                                        <TooltipTrigger asChild>
                                                            <div className="cursor-not-allowed h-full">
                                                                {cardContent}
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Upgrade to Premium to unlock.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                );
                                            }
                                            return cardContent;
                                        })}
                                    </div>
                                </TooltipProvider>
                            </div>
                            
                            {drillsForLevel.length > 0 && (
                                <div className="bg-muted/30 rounded-lg p-4 mt-6 relative">
                                    <h3 className="font-semibold text-lg text-muted-foreground mb-4">🧠 Drills</h3>
                                    <TooltipProvider>
                                        <div className={cn(
                                            "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3",
                                        )}>
                                            {drillsForLevel.map((drill, index) => {
                                                const firstIncompleteDrillIndex = drillsForLevel.findIndex(d => stats[d.id]?.bestScore !== 100);

                                                const isDrillLocked = (() => {
                                                    if (isAdmin) return false;
                                                    if (!isPremium) {
                                                        return drill.id !== 'strikethrough-undo';
                                                    }
                                                    if (!areChallengesForLevelPassed) return true;
                                                    if (firstIncompleteDrillIndex === -1) return false;
                                                    return index > firstIncompleteDrillIndex;
                                                })();

                                                const isDrillPassed = stats[drill.id]?.bestScore === 100;
                                                const isNextDrill = !isDrillLocked && !isDrillPassed && (firstIncompleteDrillIndex === -1 || index === firstIncompleteDrillIndex);
                                                
                                                const tooltipContent = (() => {
                                                    if (isDrillLocked) {
                                                        if (!isPremium) return "Upgrade to Premium to unlock more drills.";
                                                        if (!areChallengesForLevelPassed) return `Complete all '${level}' challenges to unlock drills.`;
                                                        return 'Complete the previous drill to unlock.';
                                                    }
                                                    return drill.name;
                                                })();

                                                const buttonClasses = cn(
                                                    "h-auto p-2 w-full text-left flex flex-col items-start shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-150",
                                                    isDrillLocked && "bg-muted text-muted-foreground",
                                                    isNextDrill && "bg-yellow-500/10 text-yellow-600 border border-yellow-500 hover:bg-yellow-500/20",
                                                    isDrillPassed && "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                                                );
                                                
                                                const buttonContent = isDrillLocked 
                                                ? (
                                                    <div className="text-center w-full">
                                                        <span className="text-xs text-muted-foreground">Drill {index + 1}</span>
                                                        <Lock className="w-4 h-4 mx-auto mt-1" />
                                                    </div>
                                                )
                                                : (
                                                    <div className="text-left w-full">
                                                        <div className="flex justify-between items-center">
                                                            <span className={cn("text-xs", isDrillPassed ? "text-emerald-600/80" : "text-muted-foreground")}>
                                                                Drill {index + 1}
                                                            </span>
                                                            {isDrillPassed && <Check className="w-4 h-4 text-emerald-600" />}
                                                        </div>
                                                        <span className="text-xs font-semibold block truncate">{drill.name}</span>
                                                    </div>
                                                );

                                                const buttonElement = isDrillLocked ? (
                                                    <Button className={buttonClasses} onClick={!isPremium ? () => setIsPremiumModalOpen(true) : undefined} disabled={isPremium}>
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
                                            })}
                                        </div>
                                    </TooltipProvider>

                                    {areDrillsLockedForPremium && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-card/10 backdrop-blur-sm">
                                            <div className="text-center p-4 bg-card/90 rounded-md border-2 border-dashed">
                                                <p className="text-sm font-medium text-muted-foreground">Complete all challenges in this level to unlock drills.</p>
                                            </div>
                                        </div>
                                    )}
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



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

export const DRILL_XP = 5;

const PROGRESSION_LEVELS = [
    { name: 'Rookie',     img: '/Level0.svg', icon: <Image src="/Level0.svg" alt="Rookie"     width={64} height={64} /> },
    { name: 'Apprentice', img: '/Level1.svg', icon: <Image src="/Level1.svg" alt="Apprentice" width={64} height={64} /> },
    { name: 'Master',     img: '/Level2.svg', icon: <Image src="/Level2.svg" alt="Master"     width={64} height={64} /> },
    { name: 'Ninja',      img: '/Level3.svg', icon: <Image src="/Level3.svg" alt="Ninja"      width={64} height={64} /> },
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
    let xp = 0;
    CHALLENGE_SETS.forEach(set => {
      if (stats[set.id]?.bestScore === 100 && set.level && XP_CONFIG[set.level]) {
        xp += XP_CONFIG[set.level];
      }
    });
    DRILL_SET.drills.forEach(drill => {
      if (stats[drill.id]?.bestScore === 100) {
        xp += DRILL_XP;
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
  

  // XP threshold for the next user progression level (cumulative)
  const xpForNextLevel = React.useMemo(() => {
    if (!nextUserLevelName) return 0;
    const levelsToInclude: ChallengeLevel[] =
      nextUserLevelName === 'Apprentice' ? ['Apprentice'] :
      nextUserLevelName === 'Master'     ? ['Apprentice', 'Master'] :
                                           ['Apprentice', 'Master', 'Ninja'];
    const challengeXP = CHALLENGE_SETS
      .filter(c => levelsToInclude.includes(c.level as ChallengeLevel))
      .reduce((acc, set) => acc + (set.level ? (XP_CONFIG[set.level] || 0) : 0), 0);
    const drillXP = DRILL_SET.drills
      .filter(d => levelsToInclude.includes(d.level as ChallengeLevel))
      .length * DRILL_XP;
    return challengeXP + drillXP;
  }, [nextUserLevelName]);

  const xpProgressPct = React.useMemo(() => {
    if (!xpForNextLevel) return 100;
    return Math.min(100, Math.round((totalXP / xpForNextLevel) * 100));
  }, [totalXP, xpForNextLevel]);

  // Next incomplete drill (for "Next Up" resume card)
  const nextDrill = React.useMemo(() => {
    if (!isLoaded) return null;
    for (const level of levelOrder as ChallengeLevel[]) {
      const drills = drillsByLevel[level] || [];
      for (const drill of drills) {
        if (stats[drill.id]?.bestScore !== 100) return drill;
      }
    }
    return null;
  }, [isLoaded, stats, drillsByLevel, levelOrder]);

  const nextDrillLevelDrills = React.useMemo(() => {
    if (!nextDrill) return [];
    return drillsByLevel[(nextDrill.level as string) || 'Apprentice'] || [];
  }, [nextDrill, drillsByLevel]);

  const nextDrillIndex = React.useMemo(() => {
    if (!nextDrill) return 0;
    return nextDrillLevelDrills.findIndex(d => d.id === nextDrill.id) + 1;
  }, [nextDrill, nextDrillLevelDrills]);

  // Active tab for training path — persisted across navigation
  const [activeTrainingLevel, setActiveTrainingLevel] = React.useState<ChallengeLevel>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('dashboardActiveTab');
      if (saved === 'Apprentice' || saved === 'Master' || saved === 'Ninja') return saved;
    }
    return 'Apprentice';
  });

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
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AppHeader />
      <main className="flex-1 container py-10 md:py-14 mt-16">
        <header className="mb-8 md:mb-10 flex items-stretch gap-4">
          {/* Left: welcome text */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              {isPremium && <Rocket className="w-7 h-7 text-primary" />}
              <h1 className="text-3xl font-extrabold tracking-tight">{getDashboardTitle()}</h1>
            </div>
            <p className="text-muted-foreground text-sm">{getDashboardSubtitle()}</p>
          </div>

        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
            <aside>
                <Card className="bg-card">
                    <CardHeader>
                        <h2 className="text-2xl font-bold">Progress Overview</h2>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col gap-4">
                        {isLoaded ? (
                            <>
                                {/* Level hero */}
                                <div className="flex items-center gap-4 p-3.5 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                                    <div className="flex-shrink-0">{currentUserProgression.icon}</div>
                                    <div>
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">
                                            Current Level
                                        </p>
                                        <h3 className="text-lg font-extrabold tracking-tight leading-none mb-1">
                                            {currentUserProgression.name}
                                        </h3>
                                        <p className="text-2xl font-extrabold text-primary tracking-tight leading-none">
                                            {totalXP}
                                            <span className="text-sm font-medium text-muted-foreground ml-1">
                                                / {xpForNextLevel || '∞'} XP
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* XP progress to next level */}
                                {nextUserLevelName && (
                                    <div>
                                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                                            <span>Progress to <strong className="text-foreground">{nextUserLevelName}</strong></span>
                                            <span className="font-bold text-primary">{xpProgressPct}%</span>
                                        </div>
                                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${xpProgressPct}%`, background: 'linear-gradient(to right, #059669, #10b981)' }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Level ladder */}
                                <div className="space-y-1">
                                    {PROGRESSION_LEVELS.map((level) => {
                                        const currentIndex = PROGRESSION_LEVELS.findIndex(l => l.name === currentUserLevelName);
                                        const levelIndex = PROGRESSION_LEVELS.findIndex(l => l.name === level.name);
                                        const isCompleted = levelIndex < currentIndex;
                                        const isCurrent = levelIndex === currentIndex;
                                        const isUpcoming = levelIndex > currentIndex;

                                        const isNext = levelIndex === currentIndex + 1;

                                        return (
                                            <div key={level.name} className={cn(
                                                "flex items-center justify-between p-2 rounded-lg transition-all",
                                                isCurrent && "border-2 border-emerald-500 bg-emerald-500/10",
                                                isNext    && "border-2 border-emerald-500/20 bg-emerald-500/5",
                                                !isCurrent && !isNext && "border-2 border-transparent"
                                            )}>
                                                <div className="flex items-center gap-2.5">
                                                    <Image
                                                        src={level.img}
                                                        alt={level.name}
                                                        width={16}
                                                        height={16}
                                                        className={cn("flex-shrink-0", isUpcoming && !isCurrent && !isNext && "opacity-30")}
                                                    />
                                                    <span className={cn(
                                                        "text-sm",
                                                        isCurrent  && "font-bold text-emerald-700 dark:text-emerald-300",
                                                        isNext     && "font-medium text-foreground",
                                                        isCompleted && "font-medium text-muted-foreground",
                                                        isUpcoming && !isNext && "font-medium text-muted-foreground"
                                                    )}>
                                                        {level.name}
                                                    </span>
                                                </div>
                                                <div>
                                                    {isCompleted && <CheckCircle className="w-4 h-4 text-primary" />}
                                                    {isCurrent   && <span className="text-xs font-bold text-primary">Current</span>}
                                                    {isUpcoming && !isNext && <Lock className="w-3 h-3 text-muted-foreground/40" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <Separator />

                                {/* Stats grid */}
                                <div className="grid grid-cols-2 rounded-lg border border-border overflow-hidden">
                                    <div className="p-3">
                                        <p className="text-2xl font-extrabold tracking-tight">
                                            {completedChallengesCount}
                                            <span className="text-sm font-medium text-muted-foreground">/{totalChallenges}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground font-medium mt-0.5">Challenges passed</p>
                                    </div>
                                    <div className="p-3 border-l border-border">
                                        <p className="text-2xl font-extrabold tracking-tight">
                                            {completedDrillsCount}
                                            <span className="text-sm font-medium text-muted-foreground">/{totalDrills}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground font-medium mt-0.5">Drills passed</p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Certificate of Mastery */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Medal className="w-4 h-4 text-amber-500" />
                                        <h3 className="font-bold text-sm">Certificate of Mastery</h3>
                                    </div>
                                    <div className="flex items-start gap-3 mb-3">
                                        <Image
                                            src="/seal.svg"
                                            alt="Certificate seal"
                                            width={56}
                                            height={56}
                                            className="flex-shrink-0 opacity-40 grayscale"
                                        />
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Pass every challenge and drill to unlock your official certificate.
                                        </p>
                                    </div>
                                    <div className="relative h-4 rounded-full overflow-hidden bg-secondary mb-2">
                                        <div
                                            className="h-full transition-all duration-500"
                                            style={{ width: `${certificateProgress}%`, background: 'linear-gradient(to right, #eab308, #059669)' }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-[10px] font-extrabold text-gray-700 drop-shadow-sm">
                                                {certificateProgress.toFixed(0)}% Complete
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-center text-muted-foreground mb-3">
                                        {completedItems} of {totalItems} items
                                    </p>
                                    {allItemsPassed ? (
                                        <Button
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold"
                                            onClick={() => setIsCertificateModalOpen(true)}
                                        >
                                            <Trophy className="mr-2 h-4 w-4" /> Claim Certificate
                                        </Button>
                                    ) : (
                                        <div className="cursor-not-allowed" title="Complete all challenges and drills to unlock.">
                                            <Button
                                                className="w-full bg-slate-100 text-slate-500 border-2 border-dashed border-slate-400 hover:bg-slate-100 cursor-not-allowed font-bold"
                                                disabled
                                            >
                                                <Lock className="mr-2 h-4 w-4" /> Claim Certificate
                                            </Button>
                                        </div>
                                    )}
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
            <section className="space-y-8">
                <BeforeYouStart />
                {/* Training path tab interface */}
                <div>
                    {/* Tab header */}
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold tracking-tight">Training path</h2>
                        <div className="flex gap-1 p-1 bg-muted rounded-xl border border-border">
                            {(levelOrder as ChallengeLevel[]).map(level => {
                                const isActive = activeTrainingLevel === level;
                                const isLocked = level === 'Master' ? isMasterLockedForPremium : level === 'Ninja' ? isNinjaLockedForPremium : false;
                                const levelEmoji = level === 'Apprentice' ? '⚔️' : level === 'Master' ? '🥷' : '🏆';
                                const pct = Math.round(levelProgress[level] ?? 0);
                                return (
                                    <button
                                        key={level}
                                        onClick={() => { setActiveTrainingLevel(level); sessionStorage.setItem('dashboardActiveTab', level); }}
                                        className={cn(
                                            "inline-flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-bold transition-all",
                                            isActive
                                                ? "bg-card text-foreground border border-border shadow-sm"
                                                : "text-muted-foreground hover:text-foreground bg-transparent border border-transparent"
                                        )}
                                    >
                                        <span>{levelEmoji}</span>
                                        <span>{level}</span>
                                        {isLocked
                                            ? <Lock className="w-3 h-3 opacity-60" />
                                            : <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full px-1.5 py-px">{pct}%</span>
                                        }
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tab content — IIFE to avoid extra component */}
                    {(() => {
                        const level = activeTrainingLevel;
                        const challengesForLevel = groupedShortcutSets[level] || [];
                        const drillsForLevel = drillsByLevel[level] || [];

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
                        const completedDrillsForLevelList = drillsForLevel.filter(d => stats[d.id]?.bestScore === 100);
                        const xpForLevel =
                          challengesForLevel.reduce((acc, set) => acc + (set.level ? (XP_CONFIG[set.level] || 0) : 0), 0) +
                          drillsForLevel.length * DRILL_XP;
                        const completedXpForLevel =
                          completedChallengesForLevel.reduce((acc, set) => acc + (set.level ? (XP_CONFIG[set.level] || 0) : 0), 0) +
                          completedDrillsForLevelList.length * DRILL_XP;

                        const completedDrillsForLevel = completedDrillsForLevelList.length;
                        const drillsCompletePct = drillsForLevel.length > 0 ? (completedDrillsForLevel / drillsForLevel.length) * 100 : 0;

                        if (isLevelLocked) {
                            return (
                                <div className="relative">
                                    {/* Blurred peek */}
                                    <div className="pointer-events-none select-none" style={{ filter: 'blur(3px)', opacity: 0.55 }}>
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                                                <CardTitle className="text-xl">
                                                    {level === 'Master' ? '🥷 ' : '🏆 '}{level}
                                                </CardTitle>
                                                <p className="text-sm font-bold text-muted-foreground">XP: 0 / {xpForLevel}</p>
                                            </CardHeader>
                                            <CardContent className="p-4 space-y-3">
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    {challengesForLevel.slice(0, 4).map(set => (
                                                        <div key={set.id} className="h-24 rounded-lg border bg-muted/30" />
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-4">
                                                    {drillsForLevel.slice(0, 6).map(drill => (
                                                        <div key={drill.id} className="h-10 rounded-lg border bg-muted/30" />
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                    {/* Overlay */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/70 backdrop-blur-[2px] rounded-xl">
                                        <div className="text-center">
                                            <div className="text-3xl mb-2">{level === 'Master' ? '🥷' : '🏆'}</div>
                                            <h3 className="text-xl font-extrabold tracking-tight mb-1">{level} Level</h3>
                                            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-1">
                                                {level === 'Master'
                                                    ? 'Complete all Apprentice challenges & drills to unlock.'
                                                    : 'Complete all Master challenges & drills to unlock.'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {challengesForLevel.length} challenges · {drillsForLevel.length} drills · +{xpForLevel} XP
                                            </p>
                                        </div>
                                        {!isPremium && (
                                            <Button
                                                className="font-bold shadow-lg"
                                                style={{ background: 'linear-gradient(135deg, #7c3aed, #059669)' }}
                                                onClick={() => setIsPremiumModalOpen(true)}
                                            >
                                                <Sparkles className="mr-2 h-4 w-4" /> Go Premium to unlock early
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        const isCurrentLevelCompleted = levelCompletion[level as keyof typeof levelCompletion] ?? false;
                        const nextLevelName: ChallengeLevel | null = level === 'Apprentice' ? 'Master' : level === 'Master' ? 'Ninja' : null;
                        const nextIncompleteChallenge = challengesForLevel.find(c => stats[c.id]?.bestScore !== 100);
                        const nextIncompleteDrill = drillsForLevel.find(d => stats[d.id]?.bestScore !== 100);
                        const nextItem = nextIncompleteChallenge || nextIncompleteDrill;
                        const nextItemHref = nextIncompleteChallenge
                            ? `/challenge/${nextIncompleteChallenge.id}`
                            : nextIncompleteDrill
                                ? `/drills/${nextIncompleteDrill.id}`
                                : null;

                        return (
                            <div className="space-y-8">
                                    <p className="text-sm font-bold text-muted-foreground">
                                      XP: {completedXpForLevel} / {xpForLevel}
                                    </p>
                                    {/* Next Up */}
                                    {isLoaded && (() => {
                                        if (allItemsPassed) {
                                            return (
                                                <div className="flex items-center gap-4 px-5 py-4 rounded-xl border border-emerald-400 bg-gradient-to-br from-emerald-100 via-teal-100 to-emerald-200 shadow-sm w-fit min-w-[320px]">
                                                    <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md flex-shrink-0">
                                                        <Trophy className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-0.5">Training Complete!</p>
                                                        <p className="font-extrabold text-base tracking-tight">You&apos;ve fully completed the training plan!</p>
                                                        <p className="text-xs text-emerald-700 opacity-80">Claim your well-deserved Certificate of Mastery.</p>
                                                    </div>
                                                    <Button size="sm" className="flex-shrink-0 font-bold shadow-sm bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsCertificateModalOpen(true)}>
                                                        <Trophy className="w-3.5 h-3.5 mr-1" /> Claim Certificate
                                                    </Button>
                                                </div>
                                            );
                                        }

                                        if (isCurrentLevelCompleted && nextLevelName) {
                                            return (
                                                <div className="flex items-center gap-4 px-5 py-4 rounded-xl border border-amber-300 bg-gradient-to-br from-amber-50 via-amber-100 to-orange-100 shadow-sm w-fit min-w-[320px]">
                                                    <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center shadow-md flex-shrink-0">
                                                        <Star className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-0.5">Level Complete!</p>
                                                        <p className="font-extrabold text-base tracking-tight">You&apos;ve completed {level}!</p>
                                                        <p className="text-xs text-amber-700 opacity-80">Go to the <strong>{nextLevelName}</strong> level — it&apos;s still not 100% done!</p>
                                                    </div>
                                                    <Button size="sm" className="flex-shrink-0 font-bold shadow-sm bg-amber-500 hover:bg-amber-600 text-white" onClick={() => { setActiveTrainingLevel(nextLevelName); sessionStorage.setItem('dashboardActiveTab', nextLevelName); }}>
                                                        {nextLevelName} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                                    </Button>
                                                </div>
                                            );
                                        }

                                        if (!isCurrentLevelCompleted && nextItem && nextItemHref) {
                                            return (
                                                <div className="flex items-center gap-4 px-5 py-4 rounded-xl border border-emerald-300 bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 shadow-sm w-fit min-w-[320px]">
                                                    <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-md flex-shrink-0">
                                                        <Zap className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-0.5">Next Up</p>
                                                        <p className="font-extrabold text-base tracking-tight truncate">{nextItem.name}</p>
                                                        <p className="text-xs text-emerald-700 opacity-80">
                                                            {nextIncompleteChallenge ? 'Challenge' : 'Drill'} · {level}
                                                        </p>
                                                    </div>
                                                    <Button asChild size="sm" className="flex-shrink-0 font-bold shadow-sm">
                                                        <Link href={nextItemHref}>
                                                            Start <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            );
                                        }

                                        return null;
                                    })()}

                                    {/* Challenges */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg font-bold tracking-tight">Challenges</h2>
                                            <span className="text-xs font-semibold text-primary">
                                                {challengesForLevel.filter(s => stats[s.id]?.bestScore === 100).length}/{challengesForLevel.length} passed
                                            </span>
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {challengesForLevel.map((set) => {
                                                const setStats = stats[set.id];
                                                const bestScore = setStats?.bestScore;
                                                const isCompleted = bestScore === 100;
                                                const isStarted = bestScore !== undefined && bestScore !== null && bestScore < 100;
                                                const SetIcon = iconMap[set.iconName];
                                                const isChallengeLocked = !isPremium && !isAdmin && set.id !== 'rapid-selection';

                                                const actionLabel = isCompleted ? "Rechallenge" : isStarted ? "Retry" : "Begin";

                                                return (
                                                    <Card key={set.id} className={cn(
                                                        "flex flex-col h-full transition-all duration-200",
                                                        isChallengeLocked ? "bg-muted/30 border-dashed" : "hover:shadow-md hover:-translate-y-0.5"
                                                    )}>
                                                        <CardContent className="p-4 flex flex-col gap-3 h-full">
                                                            {/* Icon + title + description row */}
                                                            <div className="flex items-start gap-3">
                                                                <div className={cn(
                                                                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                                                    isChallengeLocked ? "bg-muted text-muted-foreground" :
                                                                    isCompleted       ? "bg-primary text-white" :
                                                                                        "bg-emerald-100 text-primary"
                                                                )}>
                                                                    {isChallengeLocked
                                                                        ? <Lock className="w-4 h-4" />
                                                                        : <SetIcon className="w-5 h-5" />
                                                                    }
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                        <h3 className={cn("font-bold text-[15px] tracking-tight", isChallengeLocked && "text-muted-foreground")}>
                                                                            {set.name}
                                                                        </h3>
                                                                        {isCompleted && !isChallengeLocked && <Badge variant="completed">Passed</Badge>}
                                                                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 rounded-full px-2 py-px whitespace-nowrap">
                                                                            +{set.level ? XP_CONFIG[set.level] : 0} XP
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground leading-relaxed">{set.description}</p>
                                                                </div>
                                                            </div>

                                                            {/* Score bar */}
                                                            {isLoaded && !isChallengeLocked && (
                                                                bestScore !== undefined && bestScore !== null ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full rounded-full transition-all duration-500"
                                                                                style={{
                                                                                    width: `${bestScore}%`,
                                                                                    background: bestScore === 100 ? '#059669' : '#f59e0b',
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <span className={cn(
                                                                            "text-xs font-bold min-w-[28px] text-right",
                                                                            bestScore === 100 ? "text-primary" : "text-amber-600"
                                                                        )}>
                                                                            {bestScore.toFixed(0)}%
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground">Unattempted</span>
                                                                )
                                                            )}

                                                            {/* Footer */}
                                                            <div className="flex items-center justify-between pt-2.5 border-t border-border mt-auto">
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                                    <Library className="w-3 h-3" /> {set.challenges.length} items
                                                                </span>
                                                                {isChallengeLocked ? (
                                                                    <Button size="sm" variant="premium" onClick={() => setIsPremiumModalOpen(true)}>
                                                                        <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Go Premium
                                                                    </Button>
                                                                ) : (
                                                                    <div className="flex items-center gap-2">
                                                                        <Button asChild size="sm" variant="secondary">
                                                                            <Link href={`/flashcards/${set.id}`}>
                                                                                <Layers className="mr-1.5 h-3.5 w-3.5" /> Flashcards
                                                                            </Link>
                                                                        </Button>
                                                                        <Button asChild size="sm" variant="default">
                                                                            <Link href={`/challenge/${set.id}`}>{actionLabel}</Link>
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Drills */}
                                    {drillsForLevel.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <h2 className="text-lg font-bold tracking-tight">Drills</h2>
                                                <span className="text-xs font-bold text-primary whitespace-nowrap">
                                                    {completedDrillsForLevel} / {drillsForLevel.length} complete
                                                </span>
                                            </div>
                                            <div className="bg-card border border-border rounded-xl p-1.5 relative">
                                                <div className="grid grid-cols-2">
                                                    {drillsForLevel.map((drill, index) => {
                                                        const firstIncompleteDrillIndex = drillsForLevel.findIndex(d => stats[d.id]?.bestScore !== 100);
                                                        const isDrillLocked = (() => {
                                                            if (isAdmin) return false;
                                                            if (!isPremium) return drill.id !== 'strikethrough-undo';
                                                            if (!areChallengesForLevelPassed) return true;
                                                            if (firstIncompleteDrillIndex === -1) return false;
                                                            return index > firstIncompleteDrillIndex;
                                                        })();
                                                        const isDrillPassed = stats[drill.id]?.bestScore === 100;
                                                        const isNextDrill = !isDrillLocked && !isDrillPassed && (firstIncompleteDrillIndex === -1 || index === firstIncompleteDrillIndex);

                                                        const rowInner = (
                                                            <div className={cn(
                                                                "flex items-center gap-3 px-3 py-2.5 rounded-lg m-0.5 border border-transparent transition-all duration-150",
                                                                isDrillLocked && "opacity-40",
                                                                isNextDrill && "bg-emerald-50 border-emerald-400",
                                                                isDrillPassed && "text-muted-foreground",
                                                                !isDrillLocked && !isNextDrill && "hover:bg-muted/50 hover:border-border",
                                                            )}>
                                                                <div className={cn(
                                                                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold",
                                                                    isDrillPassed && "bg-primary text-white",
                                                                    isNextDrill && "border-[1.5px] border-primary text-primary bg-emerald-50",
                                                                    !isDrillPassed && !isNextDrill && "bg-muted text-muted-foreground",
                                                                )}>
                                                                    {isDrillPassed ? <Check className="w-3 h-3" /> : index + 1}
                                                                </div>
                                                                <span className={cn("flex-1 text-sm font-medium truncate", isDrillPassed && "text-muted-foreground")}>
                                                                    {drill.name}
                                                                </span>
                                                                {isDrillLocked && <Lock className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />}
                                                            </div>
                                                        );

                                                        if (isDrillLocked) {
                                                            return (
                                                                <div key={drill.id} className="cursor-not-allowed" onClick={!isPremium ? () => setIsPremiumModalOpen(true) : undefined}>
                                                                    {rowInner}
                                                                </div>
                                                            );
                                                        }
                                                        return (
                                                            <Link key={drill.id} href={`/drills/${drill.id}?drillNumber=${index + 1}`}>
                                                                {rowInner}
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                                {areDrillsLockedForPremium && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-card/10 backdrop-blur-sm rounded-xl">
                                                        <div className="text-center p-4 bg-card/90 rounded-md border-2 border-dashed">
                                                            <p className="text-sm font-medium text-muted-foreground">Complete all challenges in this level to unlock drills.</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        );
                    })()}
                </div>
            </section>
        </div>
      </main>
    </div>
    </>
  );
}



"use client";

import { Trophy, CheckSquare, ArrowRight, BookMarked, Library, Layers, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChallengeSet } from "@/lib/types";
import { usePerformanceTracker } from "@/hooks/use-performance-tracker";
import { Skeleton } from "@/components/ui/skeleton";
import * as React from "react";
import { CHALLENGE_SETS } from "@/lib/challenges";
import { AppHeader } from "@/components/app-header";
import { useAuth } from "./auth-provider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { cn } from "@/lib/utils";


interface HomePageClientProps {
  examSet: ChallengeSet;
}

export function HomePageClient({ examSet }: HomePageClientProps) {
  const { isLoaded, stats, getCompletedSetsCount } = usePerformanceTracker();
  const { user, userProfile } = useAuth();
  
  const isLimited = !userProfile?.isPremium;

  const examBestTime = stats['exam']?.bestTime ?? null;
  const completedSetsCount = getCompletedSetsCount();
  const totalPracticeSets = CHALLENGE_SETS.length;

  const examCardContent = (
     <Card key={examSet.id} className={cn("border-primary bg-primary/5 flex flex-col", isLimited && "bg-muted/50 border-dashed text-muted-foreground")}>
        <CardHeader className="flex-row gap-4 items-center">
            <BookMarked className={cn("w-10 h-10", isLimited ? "text-muted-foreground" : "text-primary")} />
            <div>
                <CardTitle className={cn(isLimited && "text-muted-foreground")}>{examSet.name}</CardTitle>
                <CardDescription>{examSet.description}</CardDescription>
            </div>
        </CardHeader>
        <CardFooter className="mt-auto">
            {isLimited ? (
                 <Button className="w-full" disabled variant="warning">
                    <Lock className="mr-2" />
                    Upgrade to Unlock
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
  
  const getDashboardTitle = () => {
    if (userProfile && !userProfile.isPremium) return "Basic Dashboard";
    if (userProfile && userProfile.isPremium) return "Premium Dashboard";
    return "Dashboard";
  }

  const getDashboardSubtitle = () => {
    if (userProfile && !userProfile.isPremium) return "Welcome! Upgrade to premium to unlock all features.";
    return "Welcome back! Here's your progress at a glance.";
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppHeader />
      <main className="flex-1 container py-8 md:py-12 mt-16">
        <header className="mb-8 md:mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{getDashboardTitle()}</h1>
            <p className="text-muted-foreground mt-1">
              {getDashboardSubtitle()}
            </p>
          </div>
          {user && userProfile && !userProfile.isPremium && (
            <Button variant="premium">
              <Sparkles className="mr-2 h-4 w-4"/>
              Go Premium
            </Button>
          )}
        </header>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Fastest Exam Completion</CardTitle>
              <Trophy className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoaded && !isLimited ? (
                <div className="text-2xl font-bold">
                  {examBestTime !== null ? `${examBestTime.toFixed(2)}s` : "Not taken yet"}
                </div>
              ) : (
                 <div className="text-2xl font-bold text-muted-foreground">Locked</div>
              )}
              <p className="text-xs text-muted-foreground">{isLimited ? "Upgrade to unlock the exam." : "Your personal best for the exam."}</p>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Practice Progress</CardTitle>
              <CheckSquare className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
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
        </section>

        <section className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col">
                 <h2 className="text-2xl font-bold mb-4">Final Exam</h2>
                 {isLimited ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="h-full cursor-not-allowed">{examCardContent}</div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Upgrade to unlock the final exam.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                 ) : (
                    examCardContent
                 )}
            </div>
            <div className="flex flex-col">
                <h2 className="text-2xl font-bold mb-4">Practice Challenges</h2>
                 <Card className="flex-grow flex flex-col justify-center items-center text-center p-6">
                     <CardContent className="p-0 flex flex-col items-center justify-center flex-grow">
                        <p className="text-muted-foreground mb-6">{isLimited ? "Try a free challenge set to get a feel for the exercises." : "Ready to warm up? Select from individual challenge sets to practice specific skills."}</p>
                        <Button asChild size="lg">
                            <Link href="/challenges">
                                <Library className="mr-2" /> {isLimited ? "Try a Challenge Set" : "View All Challenges"}
                            </Link>
                        </Button>
                     </CardContent>
                 </Card>
            </div>
             <div className="flex flex-col">
                <h2 className="text-2xl font-bold mb-4">Learn</h2>
                 <Card className="flex-grow flex flex-col justify-center items-center text-center p-6">
                     <CardContent className="p-0 flex flex-col items-center justify-center flex-grow">
                        <p className="text-muted-foreground mb-6">{isLimited ? "Study a sample flashcard deck to learn the basics." : "Review all the shortcuts using interactive flashcards to build muscle memory."}</p>
                        <Button asChild size="lg" variant="secondary">
                            <Link href="/flashcards">
                                <Layers className="mr-2" /> {isLimited ? "Try Flashcards" : "Study Flashcards"}
                            </Link>
                        </Button>
                     </CardContent>
                 </Card>
            </div>
        </section>
      </main>
    </div>
  );
}

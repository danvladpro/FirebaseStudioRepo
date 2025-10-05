
"use client";

import { Trophy, CheckSquare, ArrowRight, BookMarked, Library, Layers, Lock } from "lucide-react";
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

// NOTE: Auth has been temporarily disabled for debugging.
const useAuthBypass = () => ({ isGuest: true });

export function HomePageClient({ examSet }: HomePageClientProps) {
  const { isLoaded, stats, getCompletedSetsCount } = usePerformanceTracker();
  const { isGuest } = useAuthBypass();
  
  const examBestTime = stats['exam']?.bestTime ?? null;
  const completedSetsCount = getCompletedSetsCount();
  const totalPracticeSets = CHALLENGE_SETS.length;

  const examCardContent = (
     <Card key={examSet.id} className={cn("border-primary bg-primary/5 flex flex-col", isGuest && "bg-muted/50 border-dashed text-muted-foreground")}>
        <CardHeader className="flex-row gap-4 items-center">
            <BookMarked className={cn("w-10 h-10", isGuest ? "text-muted-foreground" : "text-primary")} />
            <div>
                <CardTitle className={cn(isGuest && "text-muted-foreground")}>{examSet.name}</CardTitle>
                <CardDescription>{examSet.description}</CardDescription>
            </div>
        </CardHeader>
        <CardFooter className="mt-auto">
            {isGuest ? (
                 <Button className="w-full" disabled variant="warning">
                    <Lock className="mr-2" />
                    Sign Up to Unlock
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
  
  const guestQuery = isGuest ? '?guest=true' : '';

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppHeader />
      <main className="flex-1 container py-8 md:py-12 mt-16">
        <header className="mb-8 md:mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{isGuest ? "Guest Dashboard" : "Dashboard"}</h1>
            <p className="text-muted-foreground mt-1">
              {isGuest ? "Welcome! Here's a sample of what Excel Ninja offers." : "Welcome back! Here's your progress at a glance."}
            </p>
          </div>
        </header>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Fastest Exam Completion</CardTitle>
              <Trophy className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoaded && !isGuest ? (
                <div className="text-2xl font-bold">
                  {examBestTime !== null ? `${examBestTime.toFixed(2)}s` : "Not taken yet"}
                </div>
              ) : (
                 <div className="text-2xl font-bold text-muted-foreground">Locked</div>
              )}
              <p className="text-xs text-muted-foreground">{isGuest ? "Sign up to unlock the exam." : "Your personal best for the exam."}</p>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Practice Progress</CardTitle>
              <CheckSquare className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              {isLoaded && !isGuest ? (
                 <div className="text-center">
                    <span className="text-4xl font-bold text-primary">{completedSetsCount}</span>
                    <span className="text-2xl text-muted-foreground">/{totalPracticeSets}</span>
                    <p className="text-xs text-muted-foreground mt-2">sets completed</p>
                 </div>
              ) : (
                <div className="flex flex-col items-center gap-2 pt-2 text-center">
                    <div className="text-2xl font-bold text-muted-foreground">Locked</div>
                    <p className="text-xs text-muted-foreground mt-2">Sign up to track your progress.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col">
                 <h2 className="text-2xl font-bold mb-4">Final Exam</h2>
                 {isGuest ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="h-full cursor-not-allowed">{examCardContent}</div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Sign up to unlock the final exam.</p>
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
                        <p className="text-muted-foreground mb-6">{isGuest ? "Try a free challenge set to get a feel for the exercises." : "Ready to warm up? Select from individual challenge sets to practice specific skills."}</p>
                        <Button asChild size="lg">
                            <Link href={`/challenges${guestQuery}`}>
                                <Library className="mr-2" /> {isGuest ? "Try a Challenge Set" : "View All Challenges"}
                            </Link>
                        </Button>
                     </CardContent>
                 </Card>
            </div>
             <div className="flex flex-col">
                <h2 className="text-2xl font-bold mb-4">Learn</h2>
                 <Card className="flex-grow flex flex-col justify-center items-center text-center p-6">
                     <CardContent className="p-0 flex flex-col items-center justify-center flex-grow">
                        <p className="text-muted-foreground mb-6">{isGuest ? "Study a sample flashcard deck to learn the basics." : "Review all the shortcuts using interactive flashcards to build muscle memory."}</p>
                        <Button asChild size="lg" variant="secondary">
                            <Link href={`/flashcards${guestQuery}`}>
                                <Layers className="mr-2" /> {isGuest ? "Try Flashcards" : "Study Flashcards"}
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

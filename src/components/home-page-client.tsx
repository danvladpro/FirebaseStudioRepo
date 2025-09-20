
"use client";

import { Trophy, CheckSquare, ArrowRight, BookMarked, Library, Layers } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChallengeSet } from "@/lib/types";
import { usePerformanceTracker } from "@/hooks/use-performance-tracker";
import { Skeleton } from "@/components/ui/skeleton";
import * as React from "react";
import { CHALLENGE_SETS } from "@/lib/challenges";


interface HomePageClientProps {
  examSet: ChallengeSet;
}

export function HomePageClient({ examSet }: HomePageClientProps) {
  const { isLoaded, stats, getCompletedSetsCount } = usePerformanceTracker();
  
  const examBestTime = stats['exam']?.bestTime ?? null;
  const completedSetsCount = getCompletedSetsCount();
  const totalPracticeSets = CHALLENGE_SETS.length;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex-1 container py-8 md:py-12">
        <header className="mb-8 md:mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's your progress at a glance.
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
              {isLoaded ? (
                <div className="text-2xl font-bold">
                  {examBestTime !== null ? `${examBestTime.toFixed(2)}s` : "Not taken yet"}
                </div>
              ) : (
                <Skeleton className="h-8 w-24" />
              )}
              <p className="text-xs text-muted-foreground">Your personal best for the exam.</p>
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
                <div className="flex flex-col items-center gap-2 pt-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col">
                 <h2 className="text-2xl font-bold mb-4">Final Exam</h2>
                 <Card key={examSet.id} className="border-primary bg-primary/5 flex-grow flex flex-col">
                    <CardHeader className="flex-row gap-4 items-center">
                        <BookMarked className="w-10 h-10 text-primary" />
                        <div>
                            <CardTitle>{examSet.name}</CardTitle>
                            <CardDescription>{examSet.description}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardFooter className="mt-auto">
                        <Button asChild className="w-full">
                            <Link href={`/challenge/${examSet.id}`}>
                            Start Exam <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            <div className="flex flex-col">
                <h2 className="text-2xl font-bold mb-4">Practice Challenges</h2>
                 <Card className="flex-grow flex flex-col justify-center items-center text-center p-6">
                     <CardContent className="p-0 flex flex-col items-center justify-center flex-grow">
                        <p className="text-muted-foreground mb-6">Ready to warm up? Select from individual challenge sets to practice specific skills.</p>
                        <Button asChild size="lg">
                            <Link href="/challenges">
                                <Library className="mr-2" /> View All Challenges
                            </Link>
                        </Button>
                     </CardContent>
                 </Card>
            </div>
             <div className="flex flex-col">
                <h2 className="text-2xl font-bold mb-4">Learn</h2>
                 <Card className="flex-grow flex flex-col justify-center items-center text-center p-6">
                     <CardContent className="p-0 flex flex-col items-center justify-center flex-grow">
                        <p className="text-muted-foreground mb-6">Review all the shortcuts using interactive flashcards to build muscle memory.</p>
                        <Button asChild size="lg" variant="secondary">
                            <Link href="/flashcards">
                                <Layers className="mr-2" /> Study Flashcards
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

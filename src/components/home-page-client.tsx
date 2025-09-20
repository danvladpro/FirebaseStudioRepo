
"use client";

import { Trophy, CalendarDays, ArrowRight, BookMarked, Library } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChallengeSet } from "@/lib/types";
import { usePerformanceTracker } from "@/hooks/use-performance-tracker";
import { Skeleton } from "@/components/ui/skeleton";
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";

interface HomePageClientProps {
  examSet: ChallengeSet;
}

export function HomePageClient({ examSet }: HomePageClientProps) {
  const { isLoaded, getOverallBestTime, getTrainedDates } = usePerformanceTracker();
  
  const overallBestTime = getOverallBestTime();
  const trainedDates = getTrainedDates();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex-1 container py-8 md:py-12">
        <header className="mb-8 md:mb-12">
          <Logo />
          <p className="text-muted-foreground mt-2">
            Sharpen your skills and become an Excel master.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Fastest Set Completion</CardTitle>
              <Trophy className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoaded ? (
                <div className="text-2xl font-bold">
                  {overallBestTime !== null ? `${overallBestTime.toFixed(2)}s` : "N/A"}
                </div>
              ) : (
                <Skeleton className="h-8 w-24" />
              )}
              <p className="text-xs text-muted-foreground">Your personal best across all sets.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Training History</CardTitle>
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex justify-center">
              {isLoaded ? (
                 <div className="scale-90">
                    <Calendar
                        modifiers={{ trained: trainedDates }}
                        modifiersStyles={{
                          trained: { 
                            color: 'hsl(var(--primary-foreground))',
                            backgroundColor: 'hsl(var(--primary))'
                          },
                        }}
                        className="p-0"
                    />
                 </div>
              ) : (
                <div className="flex flex-col items-center gap-2 pt-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Final Exam</h2>
           <Card key={examSet.id} className="border-primary bg-primary/5">
                <CardHeader className="flex-row gap-4 items-center">
                    <BookMarked className="w-10 h-10 text-primary" />
                    <div>
                        <CardTitle>{examSet.name}</CardTitle>
                        <CardDescription>{examSet.description}</CardDescription>
                    </div>
                </CardHeader>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href={`/challenge/${examSet.id}`}>
                        Start Exam <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </section>

        <section className="text-center">
            <h2 className="text-2xl font-bold mb-4">Practice Challenges</h2>
            <p className="text-muted-foreground mb-6">Ready to warm up? Select from individual challenge sets to practice specific skills.</p>
            <Button asChild size="lg">
                <Link href="/challenges">
                    <Library className="mr-2" /> View All Challenges
                </Link>
            </Button>
        </section>
      </main>
    </div>
  );
}

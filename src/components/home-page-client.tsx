
"use client";

import { Trophy, CalendarDays, ArrowRight, ClipboardCopy, ArrowRightLeft, MousePointerSquareDashed, Pilcrow, FunctionSquare } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChallengeSet } from "@/lib/types";
import { usePerformanceTracker } from "@/hooks/use-performance-tracker";
import { Skeleton } from "@/components/ui/skeleton";
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";

const iconMap: Record<ChallengeSet["iconName"], React.FC<React.SVGProps<SVGSVGElement>>> = {
    ClipboardCopy,
    ArrowRightLeft,
    MousePointerSquareDashed,
    Pilcrow,
    FunctionSquare,
};

interface HomePageClientProps {
  challengeSets: ChallengeSet[];
}

export function HomePageClient({ challengeSets }: HomePageClientProps) {
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

        <section>
          <h2 className="text-2xl font-bold mb-6">Choose Your Challenge</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {challengeSets.map((set) => {
              const Icon = iconMap[set.iconName];
              return (
              <Card key={set.id} className="flex flex-col">
                <CardHeader className="flex-row gap-4 items-center">
                  <Icon className="w-10 h-10 text-primary" />
                  <div>
                    <CardTitle>{set.name}</CardTitle>
                    <CardDescription>{set.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground font-semibold">{set.category}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/challenge/${set.id}`}>
                      Start Challenge <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )})}
          </div>
        </section>
      </main>
    </div>
  );
}

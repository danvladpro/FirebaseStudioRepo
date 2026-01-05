
"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { useAuth } from "./auth-provider";
import { Suspense } from "react";

function HeroContent() {
    const { user } = useAuth();

    return (
        <section className="w-full pt-24 md:pt-32 lg:pt-40 border-b">
            <div className="container px-4 md:px-6 grid gap-6 lg:grid-cols-2 lg:gap-12">
                <div className="flex flex-col justify-center space-y-4">
                    <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                        Master Excel Shortcuts — Level Up Like a Ninja
                    </h1>
                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                        Learn faster with interactive flashcards, real challenges, and timed exams. 
                        Earn your certificate and climb the ranks from Rookie to Master Ninja.
                    </p>
                    </div>
                     <div className="flex flex-col gap-2 min-[400px]:flex-row">
                        {user ? (
                            <Button asChild size="lg">
                                <Link href="/dashboard">Go to Dashboard</Link>
                            </Button>
                        ) : (
                            <Button asChild size="lg">
                                <Link href="/signup">Sign Up for Free</Link>
                            </Button>
                        )}
                    </div>
                </div>
                <Image
                    src="/LandingPage.png"
                    width="600"
                    height="400"
                    alt="Hero"
                    className="mx-auto aspect-[3/2] overflow-hidden rounded-xl object-cover sm:w-full"
                    data-ai-hint="office productivity"
                    unoptimized
                />
            </div>
            <div className="container px-4 md:px-6 mt-12 pb-12">
            </div>
        </section>

    )
}





export function LandingHero() {
    return (
       <Suspense>
            <HeroContent />
       </Suspense>
    );
}

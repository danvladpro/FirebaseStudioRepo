import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";

export function LandingHero() {
    return (
        <section className="w-full pt-24 md:pt-32 lg:pt-40 border-b">
            <div className="container px-4 md:px-6 grid gap-6 lg:grid-cols-2 lg:gap-12">
                <div className="flex flex-col justify-center space-y-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                            Master Excel Shortcuts, a text here
                        </h1>
                        <p className="max-w-[600px] text-muted-foreground md:text-xl">
                            Stop wasting time with your mouse. Our interactive challenges make learning Excel shortcuts fast, fun, and effective.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 min-[400px]:flex-row">
                        <Button asChild size="lg">
                            <Link href="/signup">Start Learning for Free</Link>
                        </Button>
                    </div>
                </div>
                <Image
                    src="/HomePage.png"
                    width="600"
                    height="400"
                    alt="Hero"
                    className="mx-auto aspect-[3/2] overflow-hidden rounded-xl object-cover sm:w-full"
                    data-ai-hint="office productivity"
                />
            </div>
            <div className="container px-4 md:px-6 mt-12 pb-12">
            </div>
        </section>
    );
}

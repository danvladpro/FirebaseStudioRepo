import { GraduationCap, Keyboard, Sparkles } from "lucide-react";
import { ScrollAnimation } from "./scroll-animation";

export function LandingFeatures() {
    return (
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Become Faster Than Your Mouse</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Our platform is designed to build deep muscle memory for the most critical Excel shortcuts, turning you into a spreadsheet power user.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
                    <ScrollAnimation delay={0}>
                        <div className="grid gap-1 text-center">
                            <Keyboard className="h-12 w-12 mx-auto text-primary" />
                            <h3 className="text-xl font-bold">Interactive Challenges</h3>
                            <p className="text-muted-foreground">
                                Put your knowledge to the test with timed, interactive challenges that simulate real-world Excel tasks.
                            </p>
                        </div>
                    </ScrollAnimation>
                    <ScrollAnimation delay={0.1}>
                        <div className="grid gap-1 text-center">
                            <GraduationCap className="h-12 w-12 mx-auto text-primary" />
                            <h3 className="text-xl font-bold">Visual Flashcards</h3>
                            <p className="text-muted-foreground">
                                Study at your own pace with our flashcard system, complete with a visual keyboard to reinforce learning.
                            </p>
                        </div>
                    </ScrollAnimation>
                    <ScrollAnimation delay={0.2}>
                         <div className="grid gap-1 text-center">
                            <Sparkles className="h-12 w-12 mx-auto text-primary" />
                            <h3 className="text-xl font-bold">Progress Tracking</h3>
                            <p className="text-muted-foreground">
                                Monitor your progress, track your best times, and see your skills improve with our detailed performance dashboard.
                            </p>
                        </div>
                    </ScrollAnimation>
                </div>
            </div>
        </section>
    );
}


import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Check } from "lucide-react";

export function LandingPricing() {
    return (
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                        A Plan for Every Ambition
                    </h2>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Whether you're an individual looking to level up or a team aiming for peak efficiency, we have a plan for you.
                    </p>
                </div>
                <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Lifetime</CardTitle>
                            <CardDescription>One-time payment for lifetime access for a single user.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex items-baseline justify-center">
                                <span className="text-4xl font-bold">$49</span>
                                <span className="ml-1 text-muted-foreground">/ lifetime</span>
                            </div>
                            <ul className="mt-6 space-y-4 text-left">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    All challenges & flashcards
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    Performance tracking
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    Lifetime updates
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card className="flex flex-col border-primary">
                         <CardHeader>
                            <CardTitle>Corporate</CardTitle>
                            <CardDescription>Equip your entire team with the skills they need to excel.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex items-baseline justify-center">
                                <span className="text-4xl font-bold">Let's Talk</span>
                            </div>
                            <ul className="mt-6 space-y-4 text-left">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    Per-user annual billing
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    Team performance dashboard
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    Dedicated support
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" variant="outline">Contact Sales</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </section>
    );
}

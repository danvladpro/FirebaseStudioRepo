
"use client";

import { AppHeader } from "@/components/app-header";
import { SupportModal } from "@/components/support-modal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { LifeBuoy, ChevronRight, Loader2 } from "lucide-react";
import React from "react";
import Link from "next/link";


const faqs = [
    {
        question: "How do the challenges work?",
        answer: "Each challenge presents you with a real-world task. Your goal is to perform the correct Excel shortcut on your keyboard. If you're correct, you'll advance to the next challenge or step. If you're incorrect, you can try again."
    },
    {
        question: "How is my score calculated?",
        answer: "Your score is based on the number of challenges you complete successfully within a set. A perfect run (no skips) results in a score of 100%. Skipped challenges will lower your score."
    },
    {
        question: "How do I earn XP and level up?",
        answer: "You earn Experience Points (XP) for every challenge set you complete with a perfect score (100%). Different challenge types award different amounts of XP: Beginner sets are worth 20 XP, Intermediate are 40 XP, Advanced are 60 XP, and Scenarios are 100 XP. As you accumulate XP, you will achieve new ranks: Rookie (0 XP), Apprentice (50 XP), Master (120 XP), and finally, Excel Ninja (200 XP)."
    },
    {
        question: "What's the difference between 'Learn Shortcuts' and 'Real Scenarios'?",
        answer: "'Learn Shortcuts' focuses on mastering one shortcut at a time to build muscle memory. 'Real Scenarios' chains multiple shortcuts together into a realistic workflow, testing your ability to apply your skills in sequence."
    },
    {
        question: "A shortcut isn't working. What should I do?",
        answer: "First, ensure your browser window is focused. Some shortcuts may also vary slightly between Windows and macOS, or even on different keyboard layouts. Our system automatically detects your OS and shows the correct keys. If a shortcut consistently fails, it might be a bug. Please use the 'Contact Support' button to report it."
    },
    {
        question: "What do I get with a Premium subscription?",
        answer: "Upgrading to Premium unlocks all challenge sets, all real-world scenarios, and all certification exams. It also gives you access to full flashcard decks and removes any limitations on practice."
    },
    {
        question: "How can I get a certificate?",
        answer: "You can earn a certificate by achieving a perfect score (100%) on any of the three exams: Basic, Intermediate, or Advanced. Once you pass an exam, a button to claim and share your certificate on LinkedIn will appear on your dashboard and on the results screen."
    },
];

export default function HelpPage() {
    const [isSupportModalOpen, setIsSupportModalOpen] = React.useState(false);
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) {
        return (
             <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 gap-4">
                <p>You must be logged in to view this page.</p>
                <Button asChild>
                    <Link href="/login">Log In</Link>
                </Button>
            </div>
        )
    }
    
    return (
        <>
            <SupportModal isOpen={isSupportModalOpen} onOpenChange={setIsSupportModalOpen} />
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <AppHeader />
                <main className="flex-1 container py-8 md:py-12 mt-16">
                    <header className="mb-8 md:mb-12">
                         <div className="flex items-center gap-3">
                            <LifeBuoy className="w-8 h-8 text-primary" />
                            <h1 className="text-3xl font-bold">Help & Support</h1>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            Find answers to common questions or get in touch with our support team.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Frequently Asked Questions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Accordion type="single" collapsible className="w-full">
                                        {faqs.map((faq, index) => (
                                            <AccordionItem key={index} value={`item-${index}`}>
                                                <AccordionTrigger>{faq.question}</AccordionTrigger>
                                                <AccordionContent>
                                                    {faq.answer}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-1">
                             <Card className="bg-card">
                                <CardHeader>
                                    <CardTitle>Need More Help?</CardTitle>
                                    <CardDescription>
                                        If you can't find the answer you're looking for, please don't hesitate to reach out.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                     <Button className="w-full" onClick={() => setIsSupportModalOpen(true)}>
                                        Contact Support
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

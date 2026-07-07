
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


const faqSections = [
    {
        title: "Getting started",
        items: [
            {
                question: "How do challenges, drills, and flashcards differ?",
                answer: "Excel Ninja gives you three ways to practice. Challenges put you in a real-world scenario and ask you to perform a shortcut, step by step — get it right and you advance. Drills repeat a small set of shortcuts so they become muscle memory. Flashcards let you study at your own pace, with an on-screen keyboard that highlights exactly which keys to press. Challenges marked as Scenarios chain several shortcuts together into a full workflow."
            },
            {
                question: "How is my score calculated?",
                answer: "Your score is based on how many steps you complete successfully within a set. A perfect run — no skips — is 100%. Skipping a step lowers your score, and only a perfect 100% result counts toward XP, ranks, and your certificate."
            },
            {
                question: "How do I earn XP and rank up?",
                answer: "You earn XP every time you finish a challenge set or drill with a perfect score (100%). Challenge XP depends on difficulty — Apprentice is 20 XP, Master 40, Ninja 60, and Scenario 100 — and each drill is worth 5 XP. Your rank climbs from Rookie to Apprentice to Master to Ninja: you reach a rank by completing every challenge and drill in that level with a perfect score, and the XP bar on your dashboard tracks how close you are."
            },
        ],
    },
    {
        title: "Mac vs Windows",
        items: [
            {
                question: "I'm on a Mac — why doesn't Ctrl work like on Windows?",
                answer: "On a Mac, Excel uses ⌘ (Command) where Windows uses Ctrl, and ⌥ (Option) where Windows uses Alt. Excel Ninja detects your operating system automatically and shows the correct keys — so a card that reads Ctrl+B on Windows shows ⌘+B on a Mac. A few shortcuts have no Mac equivalent and are clearly marked as Windows-only."
            },
            {
                question: "How do I switch between Windows and Mac shortcuts?",
                answer: "Excel Ninja guesses your platform from your browser, but you can override it. Go to your Dashboard → Settings → Keyboard and choose Windows (Ctrl / Alt) or Mac (⌘ / ⌥). This is handy when the detection is wrong — for example, a Mac with an external Windows keyboard, or vice versa."
            },
            {
                question: "My keyboard has no Home / End / Page Up / Page Down. What do I do?",
                answer: "Many compact keyboards — most Macs included — don't have dedicated Home, End, Page Up, or Page Down keys. When a step needs a key you don't have, Excel Ninja opens the on-screen keyboard so you can click it. On a Mac this happens automatically for those keys, and you can also use the Fn chords: Fn + ← / → for Home and End, and Fn + ↑ / ↓ for Page Up and Page Down. If you're on another compact keyboard, tell us which keys you're missing under Settings and we'll surface the on-screen keyboard for those steps too."
            },
            {
                question: "Why is a shortcut labelled “Windows-only”?",
                answer: "Some Excel shortcuts don't have a clean Mac equivalent. Simple navigation keys map fine (Fn + arrows stand in for Home / End / Page Up / Page Down), but heavier combos — like selecting to the end of a row with Ctrl+Shift+→, which becomes ⌘+Shift+Fn+→ on a Mac — are too awkward to be practical. Rather than mark you wrong, we flag those steps as Windows-only (with an amber note) so Mac users can skip them without losing their streak."
            },
        ],
    },
    {
        title: "When a shortcut won't work",
        items: [
            {
                question: "I pressed the right keys but it was marked wrong. Why?",
                answer: "Check these in order: (1) Platform — if the app thinks you're on the wrong OS, the expected keys differ; set it under Settings. (2) Combo vs sequence — hold the keys together when a combo is expected, or press them one by one for a sequence. (3) The browser stole it — shortcuts like Ctrl+W or F5 are intercepted by your browser before the app sees them, so use the on-screen keyboard instead. If none of these help, it may be a bug — please hit Contact Support."
            },
            {
                question: "What's the difference between a combo and a sequence?",
                answer: "A combo means hold all the keys down at the same time, e.g. Ctrl+Shift+L. A sequence means press the keys one after another, e.g. Alt → H → B. Each step shows a badge telling you which one it expects."
            },
            {
                question: "Some shortcuts close my tab or reload the page (Ctrl+W, Ctrl+T, F5…).",
                answer: "Some shortcuts belong to your browser and fire before Excel Ninja can see them — common ones are Ctrl+W (close tab), Ctrl+T (new tab), Ctrl+N (new window), and Ctrl+R / F5 (reload). When a step uses one of these, use the on-screen keyboard: hold the physical modifier and click the remaining key on screen."
            },
            {
                question: "Ctrl+W closed my tab — did I lose my progress?",
                answer: "No — your progress is saved to your account automatically. If a browser shortcut closes the tab or reloads the page, just come back and log in; your stats and completed steps are all still there."
            },
            {
                question: "I switched apps mid-challenge and a key felt stuck.",
                answer: "If you Alt-Tab or click away mid-challenge, Excel Ninja resets the keys it's tracking, so nothing stays stuck. Click back onto the page and keep going — releasing and re-pressing the keys clears any leftover highlight."
            },
            {
                question: "How do I use the on-screen keyboard?",
                answer: "The on-screen keyboard is your universal fallback. It appears automatically when a step needs a key your keyboard doesn't have (or one your browser reserves), and you can rely on it any time a physical combo won't register — hold the modifier on your keyboard and click the remaining key on screen."
            },
            {
                question: "Do non-US keyboard layouts (UK / AZERTY / ISO) work?",
                answer: "Right now Excel Ninja is tuned for the US QWERTY layout. Other layouts (UK, AZERTY, ISO variants) may register keys unexpectedly. Broader layout support is on our list but isn't available yet."
            },
            {
                question: "Can I use Excel Ninja on my phone or tablet?",
                answer: "Excel Ninja is built for desktop browsers (we recommend Chrome). It's all about physical keyboard shortcuts, which don't translate to touch screens, so phones and tablets aren't supported and the layout may look broken there."
            },
        ],
    },
    {
        title: "Account & Premium",
        items: [
            {
                question: "What's free, and what does Premium unlock?",
                answer: "The free plan includes one full challenge and one drill so you can try the real thing. Premium unlocks every challenge, drill, scenario, and flashcard deck, plus your mastery certificate."
            },
            {
                question: "How do I earn a certificate?",
                answer: "Finish every challenge and every drill with a perfect score (100%) to unlock your Mastery Certificate. Once you do, a button to download it as a PDF or share it on LinkedIn appears on your dashboard and on the results screen."
            },
            {
                question: "I verified my email but still can't get in, or I need to reset my password.",
                answer: "New accounts must confirm their email before training unlocks — check your inbox for the verification link after signing up. Forgot your password? Use the Forgot password link on the login screen and follow the emailed reset link. Both links open inside Excel Ninja."
            },
        ],
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
                                <CardContent className="space-y-8">
                                    {faqSections.map((section) => (
                                        <div key={section.title}>
                                            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                                                {section.title}
                                            </h2>
                                            <Accordion type="single" collapsible className="w-full">
                                                {section.items.map((faq, index) => (
                                                    <AccordionItem key={index} value={`${section.title}-${index}`}>
                                                        <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                                                        <AccordionContent>
                                                            {faq.answer}
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        </div>
                                    ))}
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

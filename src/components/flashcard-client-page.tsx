
"use client";

import { useState } from "react";
import Image from "next/image";
import { Challenge, ChallengeSet } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Eye, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { VisualKeyboard } from "./visual-keyboard";

interface FlashcardClientPageProps {
    set: ChallengeSet;
}

const KeyDisplay = ({ value }: { value: string }) => {
    const isModifier = ["Control", "Shift", "Alt", "Meta"].includes(value);
    const isLetter = value.length === 1 && value.match(/[a-z]/i);

    return (
        <kbd className={cn(
            "px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted rounded-md border-b-2",
            isModifier ? "min-w-[4rem] text-center" : "",
            isLetter ? "uppercase" : ""
        )}>
            {value === " " ? "Space" : value}
        </kbd>
    );
};

export function FlashcardClientPage({ set }: FlashcardClientPageProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnswerShown, setIsAnswerShown] = useState(false);

    const currentChallenge = set.challenges[currentIndex];

    const handleNext = () => {
        setIsAnswerShown(false);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % set.challenges.length);
    };

    const handlePrevious = () => {
        setIsAnswerShown(false);
        setCurrentIndex((prevIndex) => (prevIndex - 1 + set.challenges.length) % set.challenges.length);
    };

    const toggleAnswer = () => {
        setIsAnswerShown(!isAnswerShown);
    };

    return (
        <div className="w-full max-w-4xl flex flex-col items-center">
            <Card className="w-full min-h-[420px] flex flex-col justify-between">
                <CardContent className="p-6 md:p-8 text-center flex-grow flex flex-col items-center justify-center">
                    <p className="text-xl md:text-2xl font-semibold text-foreground mb-4">
                        {currentChallenge.description}
                    </p>
                    <div className="flex justify-center items-center h-24 bg-muted rounded-lg mb-4 overflow-hidden px-4 w-full max-w-sm">
                        <Image
                            src={currentChallenge.imageUrl}
                            alt={currentChallenge.description}
                            width={200}
                            height={80}
                            className="object-contain"
                            data-ai-hint={currentChallenge.imageHint}
                        />
                    </div>

                    <div className="h-16 flex items-center justify-center">
                        {isAnswerShown ? (
                            <div className="flex items-center justify-center gap-2 animate-in fade-in">
                                <Lightbulb className="w-6 h-6 text-yellow-400" />
                                {currentChallenge.keys.map((key, index) => (
                                    <KeyDisplay key={`${key}-${index}`} value={key} />
                                ))}
                            </div>
                        ) : (
                            <Button onClick={toggleAnswer} variant="outline">
                                <Eye className="mr-2" /> Show Shortcut
                            </Button>
                        )}
                    </div>

                </CardContent>
                <div className="bg-muted/50 p-4 flex items-center justify-between border-t">
                    <Button variant="ghost" size="icon" onClick={handlePrevious}>
                        <ChevronLeft />
                    </Button>
                    <p className="text-sm text-muted-foreground">
                        Card {currentIndex + 1} of {set.challenges.length}
                    </p>
                    <Button variant="ghost" size="icon" onClick={handleNext}>
                        <ChevronRight />
                    </Button>
                </div>
            </Card>

            <div className="w-full mt-8">
                 <VisualKeyboard highlightedKeys={isAnswerShown ? currentChallenge.keys : []} />
            </div>
        </div>
    );
}

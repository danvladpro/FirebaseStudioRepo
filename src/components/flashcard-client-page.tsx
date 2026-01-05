
"use client";

import { useState, ElementType, useEffect } from "react";
import { Challenge, ChallengeSet, GridState } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { VisualKeyboard } from "./visual-keyboard";
import * as icons from "lucide-react";
import { useAuth } from "./auth-provider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { VisualGrid } from "./visual-grid";
import { calculateGridStateForStep } from "@/lib/grid-engine";

interface KeyDisplayProps {
    value: string;
    isMac?: boolean;
}

const KeyDisplay = ({ value, isMac = false }: KeyDisplayProps) => {
    const isModifier = ["Control", "Shift", "Alt", "Meta"].includes(value);
    const isLetter = value.length === 1 && value.match(/[a-z]/i);

    const displayMap: Record<string, string> = {
        'Control': isMac ? '⌃' : 'Ctrl',
        'Meta': isMac ? '⌘' : 'Win',
        'Alt': isMac ? '⌥' : 'Alt',
        ' ': 'Space',
        'enter': 'Enter',
        'return': 'Return',
        'backspace': 'Backspace',
        'delete': 'Delete',
        'escape': 'Esc',
    };

    return (
        <kbd className={cn(
            "px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted rounded-md border-b-2",
            isModifier ? "min-w-[2.5rem] text-center" : "",
            isLetter ? "uppercase" : ""
        )}>
            {displayMap[value] || value}
        </kbd>
    );
};


export function FlashcardClientPage({ set }: { set: ChallengeSet }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnswerShown, setIsAnswerShown] = useState(false);
    const { isPremium } = useAuth();
    const [isMac, setIsMac] = useState(false);

    useEffect(() => {
        setIsMac(navigator.userAgent.toLowerCase().includes('mac'));
    }, []);
    
    const isLimited = !isPremium;
    const challenges = isLimited ? set.challenges.slice(0, 5) : set.challenges;

    const currentChallenge = challenges[currentIndex];
    const initialGridState = currentChallenge?.initialGridState ?? null;

    const { gridState: initialDisplayGridState, cellStyles: initialDisplayCellStyles } = initialGridState
        ? calculateGridStateForStep(currentChallenge.steps, initialGridState, -1)
        : { gridState: null, cellStyles: {} };
        
    const { gridState: finalDisplayGridState, cellStyles: finalDisplayCellStyles } = initialGridState
        ? calculateGridStateForStep(currentChallenge.steps, initialGridState, currentChallenge.steps.length - 1)
        : { gridState: null, cellStyles: {} };

    const handleNext = () => {
        setIsAnswerShown(false);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % challenges.length);
    };

    const handlePrevious = () => {
        setIsAnswerShown(false);
        setCurrentIndex((prevIndex) => (prevIndex - 1 + challenges.length) % challenges.length);
    };

    const toggleAnswer = () => {
        setIsAnswerShown(!isAnswerShown);
    };

    const getOsKeys = (challenge: Challenge, isMac: boolean) => {
        const primaryStep = challenge.steps[0];
        if (!primaryStep) return [];

        const isStrikethrough = primaryStep.description.toLowerCase().includes('strikethrough');
        
        return primaryStep.keys.map(key => {
            if (isMac && key.toLowerCase() === 'control' && !isStrikethrough) {
                return 'Meta';
            }
            return key;
        });
    }

    const windowsKeys = getOsKeys(currentChallenge, false);
    const macKeys = getOsKeys(currentChallenge, true);

    const ChallengeIcon = currentChallenge.steps[0] ? icons[currentChallenge.steps[0].iconName] as ElementType : null;

    return (
        <div className="w-full max-w-4xl flex flex-col items-center">
            <Card className="w-full min-h-[300px] flex flex-col justify-center relative">
                <p className="absolute top-4 right-4 text-sm text-muted-foreground font-medium">
                    Card {currentIndex + 1} of {challenges.length}
                </p>

                <Button variant="ghost" size="icon" onClick={handlePrevious} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 animate-pulse-subtle">
                    <ChevronLeft />
                </Button>

                <CardContent className="py-8 px-6 md:px-8 text-center flex flex-col items-center">
                    
                    {initialDisplayGridState && initialDisplayGridState.data && (
                        <div className="mb-6 w-full max-w-lg">
                             <VisualGrid 
                                data={initialDisplayGridState.data} 
                                selection={initialDisplayGridState.selection}
                                cellStyles={initialDisplayCellStyles}
                                previewState={finalDisplayGridState ? {
                                    gridState: finalDisplayGridState,
                                    cellStyles: finalDisplayCellStyles,
                                } : null}
                                isAccentuating={isAnswerShown}
                            />
                        </div>
                    )}
                    
                    <div className="flex justify-center items-center gap-3 mb-4">
                        {ChallengeIcon && <ChallengeIcon className="w-7 h-7 text-primary" />}
                        <p className="text-xl md:text-2xl font-semibold text-foreground">
                            {currentChallenge.description}
                        </p>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-2 min-h-[80px]">
                        {isAnswerShown ? (
                        <div className="flex flex-col items-center justify-center gap-2 animate-in fade-in">
                            <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold w-16">Windows:</span>
                            <div className="flex items-center justify-center gap-1">
                                {windowsKeys.map((key, index) => (
                                <KeyDisplay key={`win-${key}-${index}`} value={key} isMac={false} />
                                ))}
                            </div>
                            </div>
                            <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold w-16">macOS:</span>
                            <div className="flex items-center justify-center gap-1">
                                {macKeys.map((key, index) => (
                                <KeyDisplay key={`mac-${key}-${index}`} value={key} isMac={true} />
                                ))}
                            </div>
                            </div>
                        </div>
                        ) : (
                        <Button onClick={toggleAnswer} variant="outline" className="mt-2 animate-pulse-subtle">
                            <Eye className="mr-2" /> Show Shortcut
                        </Button>
                        )}
                    </div>
                </CardContent>

                <Button variant="ghost" size="icon" onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 animate-pulse-subtle">
                    <ChevronRight />
                </Button>
            </Card>

            <div className="w-full mt-8">
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <VisualKeyboard highlightedKeys={isAnswerShown ? getOsKeys(currentChallenge, isMac) : []} />
                        </TooltipTrigger>
                        {!isAnswerShown && (
                            <TooltipContent>
                                <p>The correct keys will be highlighted here once you flip the card.</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                 </TooltipProvider>
            </div>
        </div>
    );
}

    
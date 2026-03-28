
"use client";

import { useState, ElementType, useEffect, useMemo } from "react";
import { Challenge, ChallengeSet, GridState, ChallengeStep } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Eye, ArrowUp, ArrowDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { VisualKeyboard } from "./visual-keyboard";
import * as icons from "lucide-react";
import { useAuth } from "./auth-provider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { VisualGrid } from "./visual-grid";
import { calculateGridStateForStep } from "@/lib/grid-engine";
import { getPlatformKeys, getSelectionRangeString } from "@/lib/utils";
import { calculateDialogStateForStep } from "@/lib/dialog-engine";

// Dialog imports
import { FindReplaceDialog } from "./find-replace-dialog";
import { CreateTableDialog } from "./create-table-dialog";
import { GoToDialog } from "./go-to-dialog";
import { SortDialog } from "./sort-dialog";
import { FormatCellsDialog } from "./format-cells-dialog";
import { FillColorDropdown } from "./fill-color-dropdown";
import { FilterDropdown } from "./filter-dropdown";
import { PasteSpecialDialog } from "./paste-special-dialog";


const KeyDisplay = ({ value, isMac }: { value: string, isMac: boolean }) => {
    const isModifier = ["control", "shift", "alt", "meta"].includes(value);
    const isLetter = value.length === 1 && value.match(/[a-z]/i);

    const keyDisplayMap: Record<string, string | JSX.Element> = {
        'esc': 'Esc', 'backspace': 'Backspace', 'delete': 'Del', 'tab': 'Tab',
        'capslock': 'Caps Lock', 'enter': 'Enter', 'return': 'Return', 'shift': 'Shift',
        'control': '⌃', 'meta': '⌘', 'alt': '⌥', ' ': 'Space', 'fn': 'fn',
        'insert': 'Ins', 'home': 'Home', 'pageup': 'PgUp', 'end': 'End', 'pagedown': 'PgDn',
        'arrowup': <ArrowUp size={14} />, 'arrowdown': <ArrowDown size={14} />,
        'arrowleft': <icons.ArrowLeft size={14} />, 'arrowright': <ArrowRight size={14} />,
    };

    const windowsKeyDisplayMap: Record<string, string | JSX.Element> = {
        ...keyDisplayMap, 'control': 'Ctrl', 'meta': 'Win', 'alt': 'Alt', 'delete': 'Del'
    };

    const displayValue = isMac ? (keyDisplayMap[value] || value.toUpperCase()) : (windowsKeyDisplayMap[value] || value.toUpperCase());

    return (
        <kbd className={cn(
            "px-2 py-1.5 text-xs font-semibold rounded-md border-b-2 text-muted-foreground bg-muted",
            isModifier ? "min-w-[3rem] text-center" : "",
            isLetter ? "uppercase" : ""
        )}>
            {displayValue}
        </kbd>
    );
};

interface FlashcardItem {
  parentChallengeDescription: string;
  step: ChallengeStep;
  stepIndex: number;
  totalSteps: number;
  initialGridState: GridState | null;
  allSteps: ChallengeStep[];
}


export function FlashcardClientPage({ set }: { set: ChallengeSet }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnswerShown, setIsAnswerShown] = useState(false);
    const { isPremium } = useAuth();
    const [isMac, setIsMac] = useState(false);

    useEffect(() => {
        setIsMac(navigator.userAgent.toLowerCase().includes('mac'));
    }, []);
    
    const isLimited = !isPremium;
    
    const flashcards = useMemo((): FlashcardItem[] => {
        const allFlashcards: FlashcardItem[] = [];
        const sourceChallenges = isLimited ? set.challenges.slice(0, 5) : set.challenges;

        sourceChallenges.forEach(challenge => {
            challenge.steps.forEach((step, stepIndex) => {
                allFlashcards.push({
                    parentChallengeDescription: challenge.description,
                    step: step,
                    stepIndex: stepIndex,
                    totalSteps: challenge.steps.length,
                    initialGridState: challenge.initialGridState || null,
                    allSteps: challenge.steps,
                });
            });
        });
        return allFlashcards;
    }, [set.challenges, isLimited]);


    const currentFlashcard = flashcards[currentIndex];
    const initialGridState = currentFlashcard?.initialGridState ?? null;

    const { gridState: initialDisplayGridState, cellStyles: initialDisplayCellStyles } = initialGridState
        ? calculateGridStateForStep(currentFlashcard.allSteps, initialGridState, currentFlashcard.stepIndex - 1)
        : { gridState: null, cellStyles: {} };
        
    const { gridState: finalDisplayGridState, cellStyles: finalDisplayCellStyles } = initialGridState
        ? calculateGridStateForStep(currentFlashcard.allSteps, initialGridState, currentFlashcard.stepIndex)
        : { gridState: null, cellStyles: {} };
    
    const dialogStateBefore = calculateDialogStateForStep(currentFlashcard.allSteps, currentFlashcard.stepIndex - 1);
    const dialogStateAfter = calculateDialogStateForStep(currentFlashcard.allSteps, currentFlashcard.stepIndex);

    const handleNext = () => {
        setIsAnswerShown(false);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    };

    const handlePrevious = () => {
        setIsAnswerShown(false);
        setCurrentIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
    };

    const toggleAnswer = () => {
        setIsAnswerShown(!isAnswerShown);
    };

    if (!currentFlashcard) {
        return (
            <div className="w-full max-w-4xl flex flex-col items-center">
                <Card className="w-full min-h-[300px] flex flex-col justify-center items-center">
                    <p>No flashcards in this set.</p>
                </Card>
            </div>
        );
    }
    
    const stepKeys = getPlatformKeys(currentFlashcard.step, isMac);
    const StepIcon = icons[currentFlashcard.step.iconName] as ElementType;

    return (
        <div className="w-full max-w-4xl flex flex-col items-center">
            <Card className="w-full min-h-[300px] flex flex-col justify-center relative">
                <p className="absolute top-4 right-4 text-sm text-muted-foreground font-medium">
                    Card {currentIndex + 1} of {flashcards.length}
                </p>

                <Button variant="ghost" size="icon" onClick={handlePrevious} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 animate-pulse-subtle">
                    <ChevronLeft />
                </Button>

                <CardContent className="py-8 px-6 md:px-8 text-center flex flex-col items-center">
                    
                    <div className="mb-6 w-full max-w-lg relative">
                        {initialGridState && (
                             <VisualGrid 
                                gridState={initialDisplayGridState} 
                                cellStyles={initialDisplayCellStyles}
                                previewState={finalDisplayGridState ? {
                                    gridState: finalDisplayGridState,
                                    cellStyles: finalDisplayCellStyles,
                                } : null}
                                isAccentuating={isAnswerShown}
                            />
                        )}
                        {isAnswerShown && (
                            <>
                                <FindReplaceDialog state={dialogStateAfter} />
                                <CreateTableDialog
                                    isVisible={!!dialogStateAfter.createTableDialogVisible}
                                    isHighlighted={false}
                                    range={getSelectionRangeString(initialDisplayGridState?.sheets[initialDisplayGridState.activeSheetIndex]?.selection!)}
                                />
                                <GoToDialog
                                    isVisible={!!dialogStateAfter.goToDialogVisible}
                                    reference={dialogStateAfter.goToDialogReference || ''}
                                    isOkHighlighted={false}
                                    isInputHighlighted={false}
                                />
                                <SortDialog isVisible={!!dialogStateAfter.sortDialogVisible} />
                                <FormatCellsDialog state={dialogStateAfter} />
                                <FilterDropdown state={dialogStateAfter} />
                                <FillColorDropdown state={dialogStateAfter} />
                                <PasteSpecialDialog state={dialogStateAfter} />
                            </>
                        )}
                         {!isAnswerShown && (
                            <>
                                <FindReplaceDialog state={dialogStateBefore} />
                                <CreateTableDialog
                                    isVisible={!!dialogStateBefore.createTableDialogVisible}
                                    isHighlighted={false}
                                    range={getSelectionRangeString(initialDisplayGridState?.sheets[initialDisplayGridState.activeSheetIndex]?.selection!)}
                                />
                                <GoToDialog
                                    isVisible={!!dialogStateBefore.goToDialogVisible}
                                    reference={dialogStateBefore.goToDialogReference || ''}
                                    isOkHighlighted={false}
                                    isInputHighlighted={false}
                                />
                                <SortDialog isVisible={!!dialogStateBefore.sortDialogVisible} />
                                <FormatCellsDialog state={dialogStateBefore} />
                                <FilterDropdown state={dialogStateBefore} />
                                <FillColorDropdown state={dialogStateBefore} />
                                <PasteSpecialDialog state={dialogStateBefore} />
                            </>
                        )}
                    </div>
                    
                    {currentFlashcard.totalSteps > 1 && (
                        <p className="text-sm font-semibold text-primary mb-2">
                           {currentFlashcard.parentChallengeDescription} (Step {currentFlashcard.stepIndex + 1}/{currentFlashcard.totalSteps})
                        </p>
                    )}
                    
                    <p className="text-xl md:text-2xl font-semibold text-foreground mb-4">
                        {currentFlashcard.step.description}
                    </p>

                    <div className="flex flex-col items-center justify-center gap-2 min-h-[80px] w-full">
                        {isAnswerShown ? (
                            <div className="flex flex-col gap-2 text-left w-full animate-in fade-in">
                                <div className="p-2 rounded-lg bg-muted/50 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        {StepIcon && <StepIcon className="w-5 h-5 text-primary" />}
                                        <p>{currentFlashcard.step.description}</p>
                                    </div>
                                    <div className="flex items-center justify-center gap-1">
                                        {stepKeys.map((key, keyIndex) => (
                                            <KeyDisplay key={`${key}-${keyIndex}`} value={key} isMac={isMac} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Button onClick={toggleAnswer} variant="outline" className="mt-2 animate-pulse-subtle">
                                <Eye className="mr-2" /> Show Shortcut & Effect
                            </Button>
                        )}
                    </div>
                </CardContent>

                <Button variant="ghost" size="icon" onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 animate-pulse-subtle">
                    <ChevronRight />
                </Button>
            </Card>

            <div className="w-full h-full max-w-[750px] mt-8">
                <div className="w-full h-full max-h-[250px] aspect-[3/1]">
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                 <VisualKeyboard highlightedKeys={isAnswerShown ? stepKeys : []} />
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
        </div>
    );
}


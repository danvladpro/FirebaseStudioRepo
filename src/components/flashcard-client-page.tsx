
"use client";

import { useState, ElementType, useMemo } from "react";
import { Challenge, ChallengeSet, GridState, ChallengeStep } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { VisualKeyboard } from "./visual-keyboard";
import * as icons from "lucide-react";
import { useAuth, useIsMac } from "./auth-provider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { VisualGrid } from "./visual-grid";
import { calculateGridStateForStep } from "@/lib/grid-engine";
import { getPlatformKeySets, isStepWindowsOnly, getSelectionRangeString } from "@/lib/utils";
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


import { KeyDisplay } from "./key-display";

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
    const isMac = useIsMac();

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
    
    // Display-only: on Mac, Home/End/PageUp/PageDown are pressed as Fn + arrow.
    // The engine still matches the canonical key at runtime — this expansion is
    // purely so the flashcard keyboard/text show the real chord. Windows unchanged.
    const MAC_NAV_DISPLAY: Record<string, string[]> = {
        home: ['fn', 'arrowleft'],
        end: ['fn', 'arrowright'],
        pageup: ['fn', 'arrowup'],
        pagedown: ['fn', 'arrowdown'],
    };
    const stepIsWindowsOnly = isStepWindowsOnly(currentFlashcard.step, isMac);

    // On Mac, Home/End/PageUp/PageDown are normally shown as their Fn+arrow chord.
    // For Windows-only steps we skip that and show the literal Home/End/PgUp/PgDn
    // keys — the step is already flagged Windows-only, so the Fn chord just adds noise.
    const expandForDisplay = (set: string[]) =>
        isMac && !stepIsWindowsOnly ? set.flatMap(k => MAC_NAV_DISPLAY[k] ?? [k]) : set;

    // Every acceptable combo for this card, shown side-by-side ("or") in the text
    // row and colour-coded on the keyboard (1st = green, 2nd = yellow).
    const displayAlternatives = getPlatformKeySets(currentFlashcard.step, isMac).map(expandForDisplay);

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

                <CardContent className="py-5 px-6 md:px-8 text-center flex flex-col items-center">

                    <div className="mb-3 w-full max-w-lg relative text-left">
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
                    
                    <p className="text-base md:text-lg font-semibold text-foreground mb-3">
                        {currentFlashcard.step.description}
                    </p>

                    <div className="flex flex-col items-center justify-center gap-2 min-h-[60px] w-full">
                        {isAnswerShown ? (
                            <div className="flex flex-col items-center gap-1.5 animate-in fade-in">
                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                    {displayAlternatives.map((alt, altIndex) => (
                                        <div key={altIndex} className="flex items-center gap-1">
                                            {altIndex > 0 && (
                                                <span className="text-xs font-normal text-muted-foreground mr-1">or</span>
                                            )}
                                            {alt.map((key, keyIndex) => (
                                                <KeyDisplay key={`${key}-${keyIndex}`} value={key} isMac={isMac} />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                {stepIsWindowsOnly && (
                                    <p className="text-xs font-medium text-amber-600">
                                        Windows-only — no Mac equivalent (⌥ Option replaces Alt)
                                    </p>
                                )}
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

            <div className="w-full h-full max-w-[750px] mt-4">
                <div className="w-full h-full max-h-[190px] aspect-[3/1]">
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                 <VisualKeyboard highlightedKeySets={isAnswerShown ? displayAlternatives : []} isMac={isMac} />
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


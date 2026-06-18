
"use client";

import { useState, useEffect, useCallback, useRef, ElementType, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChallengeSet, ChallengeStep, Sheet } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, CheckCircle, XCircle, Timer, Keyboard, ChevronsRight, BookOpen, ArrowLeft, AlertTriangle } from "lucide-react";
import { cn, getPlatformKeySets, isStepWindowsOnly, resolveIsSequential, MAC_ABSENT_KEYS, getSelectionRangeString } from "@/lib/utils";
import { Button } from "./ui/button";
import * as icons from "lucide-react";
import { VisualGrid } from "./visual-grid";
import { calculateGridStateForStep } from "@/lib/grid-engine";
import { useAuth, useIsMac } from "./auth-provider";
import { VisualKeyboard } from "./visual-keyboard";
import Link from "next/link";
import { FindReplaceDialog } from "./find-replace-dialog";
import { calculateDialogStateForStep, applyDialogEffect } from "@/lib/dialog-engine";
import { CreateTableDialog } from "./create-table-dialog";
import { GoToDialog } from "./go-to-dialog";
import { Badge } from "./ui/badge";
import { SortDialog } from "./sort-dialog";
import { FormatCellsDialog } from "./format-cells-dialog";
import { FillColorDropdown } from "./fill-color-dropdown";
import { FilterDropdown } from "./filter-dropdown";
import { useShortcutEngine } from "@/hooks/use-shortcut-engine";
import { PasteSpecialDialog } from "./paste-special-dialog";

interface ChallengeUIProps {
  set: ChallengeSet;
  mode: 'timed' | 'training';
}

import { KeyDisplay } from "./key-display";

export default function ChallengeUI({ set, mode }: ChallengeUIProps) {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [isAccentuating, setIsAccentuating] = useState(false);
  const [skippedIndices, setSkippedIndices] = useState<number[]>([]);
  
  const [countdown, setCountdown] = useState(8);
  const isMac = useIsMac();
  const [isVirtualKeyboardMode, setIsVirtualKeyboardMode] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const stepRowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Prefetch results page bundle so navigation is instant when challenge ends
  useEffect(() => {
    router.prefetch('/results');
  }, [router]);

  useEffect(() => {
    const container = stepsContainerRef.current;
    const activeEl = stepRowRefs.current[currentStepIndex];
    if (!container || !activeEl) return;
    container.scrollTo({
      top: Math.max(0, activeEl.offsetTop - 32),
      behavior: 'smooth',
    });
  }, [currentStepIndex]);

  const currentChallenge = set.challenges[currentChallengeIndex];
  const currentStep = currentChallenge?.steps[currentStepIndex];
  const isSequential = currentStep ? resolveIsSequential(currentStep, isMac) : false;
  
  const requiredKeySets = useMemo(() => {
      if (!currentStep) return [];
      return getPlatformKeySets(currentStep, isMac);
  }, [currentStep, isMac]);
  // First acceptable combination — used for the key-cap display and the
  // virtual-keyboard heuristics below.
  const requiredKeys = requiredKeySets[0] ?? [];

  const finishChallenge = useCallback((finalSkippedIndices?: number[]) => {
    const indicesToUse = finalSkippedIndices || skippedIndices;
    if (mode === 'training') {
        const skippedParam = Array.from(indicesToUse).join(',');
        router.push(`/results?setId=${set.id}&time=0&skipped=${indicesToUse.length}&skippedIndices=${skippedParam}&mode=training`);
        return;
    }

    const duration = (Date.now() - startTime) / 1000;
    const skippedParam = Array.from(indicesToUse).join(',');
    router.push(`/results?setId=${set.id}&time=${duration.toFixed(2)}&skipped=${indicesToUse.length}&skippedIndices=${skippedParam}&mode=${mode}`);
  }, [router, set.id, startTime, mode, skippedIndices]);

  const moveToNextChallenge = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    const isLastChallenge = currentChallengeIndex === set.challenges.length - 1;
    
    if (isLastChallenge) {
        finishChallenge();
        return;
    }

    setCurrentChallengeIndex(prev => prev + 1);
    setCurrentStepIndex(0);
    setCountdown(8);
  }, [currentChallengeIndex, set.challenges.length, finishChallenge]);

  const advanceStepOrChallenge = useCallback(() => {
    setFeedback("correct");
    setIsAccentuating(true);
    
    const _currentChallenge = set.challenges[currentChallengeIndex];
    const _currentStep = _currentChallenge?.steps[currentStepIndex];

    const delay = (_currentStep?.dialogEffect?.action.startsWith('SHOW_') || _currentStep?.dialogEffect?.action === 'SHOW') ? 1200 : 400;

    setTimeout(() => {
        setFeedback(null);
        setIsAccentuating(false);
        const isLastStep = currentStepIndex === _currentChallenge.steps.length - 1;
        if (isLastStep) {
            moveToNextChallenge();
        } else {
            setCurrentStepIndex(prev => prev + 1);
        }
        
    }, delay);
  }, [currentStepIndex, currentChallengeIndex, set.challenges, moveToNextChallenge]);


  const handleIncorrect = useCallback(() => {
    if (feedback !== null) return;
    setFeedback("incorrect");
    setTimeout(() => {
      setFeedback(null);
    }, 500);
  }, [feedback]);

  const { pressedKeys, handleVirtualKeyClick } = useShortcutEngine({
      requiredKeySets,
      isSequential,
      onSuccess: advanceStepOrChallenge,
      onIncorrect: handleIncorrect,
      isMac,
      isDisabled: feedback !== null,
  });

  const handleSkip = useCallback(() => {
    if (skippedIndices.includes(currentChallengeIndex)) return;
    const newSkippedIndices = [...skippedIndices, currentChallengeIndex];
    setSkippedIndices(newSkippedIndices);
    
    setTimeout(() => {
        if (currentChallengeIndex === set.challenges.length - 1) {
            finishChallenge(newSkippedIndices);
        } else {
            moveToNextChallenge();
        }
    }, 100);
  }, [moveToNextChallenge, currentChallengeIndex, set.challenges.length, skippedIndices, finishChallenge]);
  
  // --- Dialog State Calculation ---
  const dialogStateBefore = calculateDialogStateForStep(currentChallenge.steps, currentStepIndex - 1);
  const previewEffect = currentStep?.previewDialogEffect;
  
  let dialogStateForPreview = dialogStateBefore;
  if (previewEffect) {
    dialogStateForPreview = applyDialogEffect(dialogStateBefore, previewEffect);
  }
  
  if (currentStep?.dialogEffect?.action === 'SHOW' || currentStep?.dialogEffect?.action === 'SHOW_CREATE_TABLE' || currentStep?.dialogEffect?.action === 'SHOW_GO_TO') {
    dialogStateForPreview.isVisible = false;
    dialogStateForPreview.createTableDialogVisible = false;
    dialogStateForPreview.goToDialogVisible = false;
  }
  
  const dialogStateAfter = calculateDialogStateForStep(currentChallenge.steps, currentStepIndex);
  const finalDialogState = feedback === 'correct' ? dialogStateAfter : (previewEffect ? dialogStateForPreview : dialogStateBefore);
  // --- End Dialog State Calculation ---

  const initialGridState = currentChallenge?.initialGridState ?? null;

  const { gridState: displayedGridState, cellStyles: displayedCellStyles } = initialGridState
    ? calculateGridStateForStep(currentChallenge.steps, initialGridState, currentStepIndex - 1)
    : { gridState: null, cellStyles: {} };

  const { gridState: previewGridState, cellStyles: previewCellStyles } = initialGridState
    ? calculateGridStateForStep(currentChallenge.steps, initialGridState, currentStepIndex)
    : { gridState: null, cellStyles: {} };
  
  useEffect(() => {
    if (!currentStep) {
        setIsVirtualKeyboardMode(false);
        return;
    }

    const requiredKeysForStepSet = new Set(requiredKeys);
    const hasT = requiredKeysForStepSet.has('t');
    const hasR = requiredKeysForStepSet.has('r');
    const hasW = requiredKeysForStepSet.has('w');
    const hasV = requiredKeysForStepSet.has('v');
    const hasModifier = requiredKeysForStepSet.has('control') || requiredKeysForStepSet.has('meta');
    
    if (requiredKeysForStepSet.size === 2 && hasModifier && (hasT || hasR || hasW)) {
        setIsVirtualKeyboardMode(true);
        return;
    }
     if (requiredKeysForStepSet.size === 3 && hasModifier && hasV && requiredKeysForStepSet.has('alt')) {
        setIsVirtualKeyboardMode(true);
        return;
    }

    // On Mac, surface the on-screen keyboard when the step needs a key that
    // most Mac keyboards lack a dedicated cap for (Home/End/PgUp/PgDn/Insert).
    if (isMac && requiredKeys.some(k => MAC_ABSENT_KEYS.includes(k))) {
        setIsVirtualKeyboardMode(true);
        return;
    }


    if (!userProfile?.missingKeys) {
        setIsVirtualKeyboardMode(false);
        return;
    }

    const userMissingKeys = userProfile.missingKeys.map(k => k.toLowerCase());
    const normalizedRequired = requiredKeys.map(k => k.startsWith('f') && k.length > 1 && !isNaN(Number(k.substring(1))) ? 'f-keys (f1-f12)' : k);
    const needsVirtual = normalizedRequired.some(key => userMissingKeys.includes(key));
    setIsVirtualKeyboardMode(needsVirtual);
}, [currentStep, userProfile?.missingKeys, requiredKeys, isMac]);


  useEffect(() => {
    if (currentChallengeIndex === 0 && currentStepIndex === 0 && startTime === 0) {
      setStartTime(Date.now());
    }
  }, [currentChallengeIndex, currentStepIndex, startTime]);

  useEffect(() => {
    if (mode !== 'timed' || startTime === 0) return;

    const timer = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
    }, 100);
    return () => clearInterval(timer);
  }, [startTime, mode]);
  
  useEffect(() => {
      if (mode !== 'timed') return;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);

      setCountdown(8);

      const autoSkip = () => handleSkip();

      timeoutRef.current = setTimeout(autoSkip, 8000);
      
      intervalRef.current = setInterval(() => {
          setCountdown(prev => Math.max(0, prev - 1));
      }, 1000);

      return () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          if (intervalRef.current) clearInterval(intervalRef.current);
      };
  }, [currentChallengeIndex, currentStepIndex, handleSkip, mode]);

  const progress = ((currentChallengeIndex + 1) / set.challenges.length) * 100;
  
  if (!currentChallenge || !currentStep) {
    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Preparing the next challenge...</p>
            </CardContent>
        </Card>
    );
  }
  
  const isMultiStep = currentChallenge.steps.length > 1;
  const ActiveIcon = currentStep ? icons[currentStep.iconName] as ElementType : null;

  return (
    <>
    <Card
    className={cn(
        "w-full flex flex-col overflow-hidden transform transition-all duration-500",
        feedback === 'incorrect' && 'animate-shake border-destructive shadow-lg shadow-destructive/20'
    )}
    >
    <CardHeader className="flex-shrink-0 p-2 sm:p-3">
        <div className="flex justify-between items-center flex-wrap gap-y-2 mb-2">
            <CardTitle className="text-base md:text-lg">{set.name}</CardTitle>
            <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                {mode === 'timed' ? (
                    <>
                        <div className={cn(
                          "flex items-center gap-1.5 text-sm font-extrabold text-white px-3 py-1 rounded-full transition-colors duration-300",
                          countdown <= 3 ? "bg-destructive" : "bg-primary"
                        )}>
                            ⏱ {countdown}s
                        </div>
                        <div className="flex items-center gap-1">
                            Total: <Timer className="h-4 w-4" /> <span>{elapsedTime.toFixed(1)}s</span>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-2 text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full">
                        <BookOpen className="h-4 w-4" />
                        <span>Training Mode</span>
                    </div>
                )}
                <Button variant="outline" size="sm" onClick={handleSkip}>
                    Skip <ChevronsRight className="ml-2 h-4 w-4" />
                </Button>
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Dashboard
                    </Link>
                </Button>
            </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 h-1.5 overflow-hidden rounded-full bg-secondary">
            <Progress value={progress} className="absolute inset-0 h-full w-full" />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
            {isMultiStep ? 'Scenario' : 'Challenge'} {currentChallengeIndex + 1} / {set.challenges.length}
          </p>
        </div>
    </CardHeader>
    <CardContent className="flex-1 overflow-hidden flex flex-col border-t pt-0">
      <div className="flex-1 overflow-y-auto p-2 sm:p-3">
        <div className="grid md:grid-cols-2 gap-4 items-start">
          <div className="flex flex-col gap-4 min-w-0">
               {displayedGridState && (
                  <div className="relative">
                      <FindReplaceDialog state={finalDialogState} isSuccess={feedback === 'correct'} />
                      <CreateTableDialog
                          isVisible={!!finalDialogState.createTableDialogVisible}
                          isHighlighted={finalDialogState.createTableDialogHighlightedButton === 'ok'}
                          range={getSelectionRangeString(displayedGridState?.sheets[displayedGridState.activeSheetIndex].selection!)}
                      />
                      <GoToDialog
                          isVisible={!!finalDialogState.goToDialogVisible}
                          reference={finalDialogState.goToDialogReference || ''}
                          isOkHighlighted={finalDialogState.goToDialogHighlightedButton === 'ok'}
                          isInputHighlighted={!!finalDialogState.goToDialogHighlightedInput}
                      />
                      <SortDialog isVisible={!!finalDialogState.sortDialogVisible} />
                      <FormatCellsDialog state={finalDialogState} />
                      <FilterDropdown state={finalDialogState} />
                      <FillColorDropdown state={finalDialogState} />
                      <PasteSpecialDialog state={finalDialogState} />
                      <VisualGrid
                          gridState={displayedGridState}
                          cellStyles={displayedCellStyles}
                          previewState={previewGridState ? {
                              gridState: previewGridState,
                              cellStyles: previewCellStyles,
                          } : null}
                          isAccentuating={isAccentuating}
                      />
                      {(finalDialogState.isVisible || finalDialogState.createTableDialogVisible || finalDialogState.goToDialogVisible || finalDialogState.sortDialogVisible || finalDialogState.formatCellsDialogVisible || finalDialogState.filterDropdownVisible || finalDialogState.fillColorDropdownVisible || finalDialogState.pasteSpecialDialogVisible) && (
                        <div className="absolute inset-0 bg-background/60 rounded pointer-events-none z-10" />
                      )}
                  </div>
              )}
          </div>
          <div className="flex flex-col gap-4 min-w-0">
              <div
                ref={stepsContainerRef}
                className="flex flex-col overflow-y-auto max-h-80 pr-1"
              >
                  {currentChallenge.steps.map((step, index) => {
                      const ChallengeIcon = icons[step.iconName] as ElementType;
                      const isCompleted = index < currentStepIndex;
                      const isActive = index === currentStepIndex;

                      return (
                        <div
                          key={index}
                          ref={el => { stepRowRefs.current[index] = el; }}
                          className="relative flex gap-2.5 py-[5px]"
                        >
                          {index < currentChallenge.steps.length - 1 && (
                            <div className={cn(
                              "absolute left-[10px] top-[27px] bottom-[-5px] w-0.5 rounded-full z-0",
                              isCompleted ? "bg-primary" : "bg-border"
                            )} />
                          )}
                          <div className="pt-[6px] z-10 flex-shrink-0">
                            {isCompleted || (isActive && isAccentuating) ? (
                              <div className="w-[22px] h-[22px] rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            ) : (
                              <div className={cn(
                                "w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 transition-all",
                                isActive
                                  ? "border-2 border-primary text-primary bg-card shadow-[0_0_0_3px_hsl(142_76%_36%_/_0.15)]"
                                  : "bg-muted text-muted-foreground border-2 border-transparent"
                              )}>
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <div className={cn(
                            "flex-1 p-2.5 rounded-lg z-10 transition-all",
                            isCompleted && "bg-green-500/10 border border-green-500/30",
                            isActive && feedback === 'incorrect' && "border-[1.5px] border-destructive",
                            isActive && isAccentuating && "border-[1.5px] border-green-500",
                            isActive && !feedback && !isAccentuating && "bg-card border-[1.5px] border-primary shadow-[0_2px_10px_hsl(142_76%_36%_/_0.1)]",
                            !isCompleted && !isActive && "border border-transparent"
                          )}>
                            <div className="flex items-center gap-2 sm:gap-3">
                              {ChallengeIcon && (
                                <ChallengeIcon className={cn(
                                  "w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0",
                                  isCompleted ? "text-green-500" : isActive ? (isAccentuating ? "text-green-500" : "text-primary") : "text-muted-foreground/50"
                                )} />
                              )}
                              <p className={cn(
                                "flex-1 font-medium text-sm",
                                isCompleted && "text-green-700 line-through",
                                isActive && isAccentuating && "text-green-700",
                                !isActive && !isCompleted && "text-muted-foreground"
                              )}>
                                {step.description}
                              </p>
                              {isActive && (
                                <Badge variant={resolveIsSequential(step, isMac) ? 'outline' : 'secondary'} className="ml-auto text-xs">
                                  {resolveIsSequential(step, isMac) ? 'Sequence' : 'Combo'}
                                </Badge>
                              )}
                            </div>
                            {isActive && step.warningMessage && (
                              <div className="mt-1.5 flex items-start gap-1.5 rounded-md bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 px-2 py-1.5">
                                <AlertTriangle className="h-3.5 w-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-orange-700 dark:text-orange-300 leading-snug">
                                  {step.warningMessage}
                                </p>
                              </div>
                            )}
                            {isActive && isStepWindowsOnly(step, isMac) && (
                              <div className="mt-1.5 flex items-start gap-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-1.5">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700 dark:text-amber-300 leading-snug">
                                  Windows-only shortcut — no Mac equivalent. Use the Windows keys shown
                                  (press <span className="font-semibold">⌥ Option</span> where it says Alt);
                                  click the on-screen keyboard for any key your Mac lacks.
                                </p>
                              </div>
                            )}
                            {isActive && feedback !== null && (
                              <div className="flex items-center justify-center gap-2 h-6 mt-2">
                                {feedback === 'correct' && <CheckCircle className="h-5 w-5 text-green-500" />}
                                {feedback === 'incorrect' && <XCircle className="h-5 w-5 text-destructive" />}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                  })}
              </div>
          </div>
        </div>
      </div>

      {isVirtualKeyboardMode ? (
        <div className="flex-shrink-0 border-t bg-muted/40 p-3">
          <div className="flex justify-between items-center mb-2 min-h-[28px]">
            <span className="text-xs font-bold text-primary uppercase tracking-wide">
              Virtual Keyboard — Click to press
            </span>
            <div className="flex items-center gap-1.5 min-h-[28px]">
              {pressedKeys.length > 0 ? (
                pressedKeys.map((key, i) => <KeyDisplay key={`${key}-${i}`} value={key} isMac={isMac} />)
              ) : (
                <span className="text-xs text-muted-foreground">{isSequential ? "Press keys in sequence..." : "Press the required keys..."}</span>
              )}
            </div>
          </div>
          <div className="max-w-[660px] mx-auto">
            <VisualKeyboard
              highlightedKeys={pressedKeys}
              onKeyClick={handleVirtualKeyClick}
              isMac={isMac}
            />
          </div>
        </div>
      ) : (
        <CardFooter className="bg-muted/50 flex items-center justify-center gap-1.5 p-2 min-h-[44px] flex-shrink-0">
            {pressedKeys.length > 0 ? (
                pressedKeys.map((key, index) => <KeyDisplay key={`${key}-${index}`} value={key} isMac={isMac} />)
            ) : (
                <div className="flex items-center justify-center gap-2 font-semibold text-muted-foreground text-sm">
                    <Keyboard className="h-5 w-5" />
                    <span>{isSequential ? "Press keys in sequence..." : "Press the required keys..."}</span>
                </div>
            )}
        </CardFooter>
      )}
    </CardContent>
    </Card>
    </>
  );
}


"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Drill, ALL_DRILL_STEPS, DrillStep } from "@/lib/drills";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { cn, getPlatformKeys, getSelectionRangeString } from "@/lib/utils";
import { Check, CheckCircle, Keyboard, XCircle, ArrowLeft, ArrowUp, ArrowDown, ArrowRight, AlertTriangle } from "lucide-react";
import { useAuth } from "./auth-provider";
import { updateUserPerformance } from "@/app/actions/update-user-performance";
import { toast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";
import { VisualGrid } from "./visual-grid";
import { calculateGridStateForStep } from "@/lib/grid-engine";
import * as icons from 'lucide-react';
import { VisualKeyboard } from "./visual-keyboard";
import { Button } from "./ui/button";
import Link from "next/link";
import { FindReplaceDialog } from "./find-replace-dialog";
import { calculateDialogStateForStep, applyDialogEffect } from "@/lib/dialog-engine";
import { CreateTableDialog } from "./create-table-dialog";
import { GoToDialog } from "./go-to-dialog";
import { FilterDropdown } from "./filter-dropdown";
import { Badge } from "./ui/badge";
import { SortDialog } from "./sort-dialog";
import { FormatCellsDialog } from "./format-cells-dialog";
import { FillColorDropdown } from "./fill-color-dropdown";
import { useShortcutEngine } from "@/hooks/use-shortcut-engine";
import { PasteSpecialDialog } from "./paste-special-dialog";

interface DrillUIProps {
  drill: Drill;
  drillNumber: string | null;
}

enum RepStatus {
  Pending,
  Correct,
  Incorrect,
}

const KeyDisplay = ({ value, isMac, small }: { value: string, isMac: boolean, small?: boolean }) => {
    const isModifier = ["control", "shift", "alt", "meta"].includes(value);
    const isLetter = value.length === 1 && value.match(/[a-z]/i);

     const keyDisplayMap: Record<string, string | JSX.Element> = {
        'esc': 'Esc', 'backspace': 'Backspace', 'delete': 'Del', 'tab': 'Tab',
        'capslock': 'Caps Lock', 'enter': 'Enter', 'return': 'Return', 'shift': 'Shift',
        'control': '⌃', 'meta': '⌘', 'alt': '⌥', ' ': 'Space', 'fn': 'fn',
        'insert': 'Ins', 'home': 'Home', 'pageup': 'PgUp', 'end': 'End', 'pagedown': 'PgDn',
        'arrowup': <ArrowUp size={14} />, 'arrowdown': <ArrowDown size={14} />,
        'arrowleft': <ArrowLeft size={14} />, 'arrowright': <ArrowRight size={14} />,
    };

    const windowsKeyDisplayMap: Record<string, string | JSX.Element> = {
        ...keyDisplayMap, 'control': 'Ctrl', 'meta': 'Win', 'alt': 'Alt', 'delete': 'Del'
    };

    const displayValue = isMac ? (keyDisplayMap[value] || value.toUpperCase()) : (windowsKeyDisplayMap[value] || value.toUpperCase());

    return (
        <kbd className={cn(
            "font-semibold rounded border-b-2 text-muted-foreground bg-muted",
            small ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1.5 text-xs",
            isModifier && !small ? "min-w-[4rem] text-center" : "",
            isLetter ? "uppercase" : ""
        )}>
            {displayValue}
        </kbd>
    );
};

export function DrillUI({ drill, drillNumber }: DrillUIProps) {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [reps, setReps] = useState<RepStatus[]>(() => Array(drill.repetitions).fill(RepStatus.Pending));
  const [currentRep, setCurrentRep] = useState(0);

  const [logicalStepIndex, setLogicalStepIndex] = useState(0);
  const [visualStepIndex, setVisualStepIndex] = useState(0);

  const [stepFeedback, setStepFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [isMac, setIsMac] = useState(false);
  const [isVirtualKeyboardMode, setIsVirtualKeyboardMode] = useState(false);

  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const stepRowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setIsMac(navigator.userAgent.toLowerCase().includes('mac'));
  }, []);

  useEffect(() => {
    const activeEl = stepRowRefs.current[visualStepIndex];
    if (!activeEl) return;
    activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [visualStepIndex]);

  const activeStep = drill.steps[logicalStepIndex] ? ALL_DRILL_STEPS[drill.steps[logicalStepIndex]] : null;
  const isSequential = !!activeStep?.isSequential;

  const requiredKeys = useMemo(() => {
    if (!activeStep) return [];
    return getPlatformKeys(activeStep, isMac);
  }, [activeStep, isMac]);

  const finishDrill = useCallback(async () => {
    setLogicalStepIndex(drill.steps.length);
    if (user) {
      try {
        await updateUserPerformance({ uid: user.uid, setId: drill.id, time: 0, score: 100 });
      } catch (error: any) {
        toast({
          title: "Error Saving Progress",
          description: "Could not save your drill completion. Your progress may not be tracked.",
          variant: "destructive",
        });
      }
    }
    router.push(`/drill-results?drillId=${drill.id}&drillNumber=${drillNumber}`);
  }, [drill.id, router, user, drill.steps.length, drillNumber]);

  const handleStepSuccess = useCallback(() => {
    if (stepFeedback === 'correct') return;
    setStepFeedback('correct');
    
    setTimeout(() => {
        const isLastVisualStep = visualStepIndex === drill.steps.length - 1;
        
        if (isLastVisualStep) {
            setReps(prevReps => {
                const newReps = [...prevReps];
                if (newReps[currentRep] !== RepStatus.Incorrect) {
                  newReps[currentRep] = RepStatus.Correct;
                }
                return newReps;
            });
            
            const isLastRepetition = currentRep === drill.repetitions - 1;
            if (isLastRepetition) {
                finishDrill();
            } else {
                setCurrentRep(prev => prev + 1);
                setLogicalStepIndex(0);
                setVisualStepIndex(0);
            }
        } else {
            setLogicalStepIndex(prev => prev + 1);
            setVisualStepIndex(prev => prev + 1);
        }
        
        setStepFeedback(null);
    }, 400);
  }, [visualStepIndex, currentRep, drill.steps.length, drill.repetitions, finishDrill, stepFeedback]);

  const resetDrill = useCallback(() => {
    toast({
        title: "Mistake Limit Reached",
        description: "Drill has been reset. Let's try again from the beginning!",
        variant: "destructive"
    });
    setReps(Array(drill.repetitions).fill(RepStatus.Pending));
    setCurrentRep(0);
    setLogicalStepIndex(0);
    setVisualStepIndex(0);
    setMistakes(0);
    setStepFeedback(null);
  }, [drill.repetitions]);

  const handleIncorrect = useCallback(() => {
    if (stepFeedback !== null) return;
    setStepFeedback('incorrect');

    setReps(prevReps => {
      const nextReps = [...prevReps];
      if (nextReps[currentRep] !== RepStatus.Incorrect) {
        nextReps[currentRep] = RepStatus.Incorrect;
      }
      return nextReps;
    });

    const newMistakes = mistakes + 1;
    setMistakes(newMistakes);

    if (newMistakes >= drill.mistakeLimit) {
      setTimeout(() => {
        resetDrill();
      }, 500);
    } else {
      setTimeout(() => {
        setStepFeedback(null);
      }, 500);
    }
  }, [currentRep, drill.mistakeLimit, mistakes, resetDrill, stepFeedback]);
  
  const { pressedKeys, handleVirtualKeyClick } = useShortcutEngine({
      requiredKeys,
      isSequential,
      onSuccess: handleStepSuccess,
      onIncorrect: handleIncorrect,
      isMac,
      isDisabled: stepFeedback !== null,
  });

  const drillStepsForEngine = drill.steps.map(stepId => ALL_DRILL_STEPS[stepId]);

  const dialogStateBefore = calculateDialogStateForStep(drillStepsForEngine, logicalStepIndex - 1);
  const dialogStateAfter = calculateDialogStateForStep(drillStepsForEngine, logicalStepIndex);

  // Apply previewDialogEffect on top of dialogStateBefore so button/input hints
  // are visible while the user is waiting to press the correct key.
  const currentStepForPreview = drillStepsForEngine[logicalStepIndex];
  const dialogStateWithPreview = currentStepForPreview?.previewDialogEffect
    ? applyDialogEffect(dialogStateBefore, currentStepForPreview.previewDialogEffect)
    : dialogStateBefore;

  const finalDialogState = stepFeedback === 'correct' ? dialogStateAfter : dialogStateWithPreview;

  useEffect(() => {
    if (!activeStep) {
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

    if (!userProfile?.missingKeys) {
        setIsVirtualKeyboardMode(false);
        return;
    }

    const userMissingKeys = userProfile.missingKeys.map(k => k.toLowerCase());
    const normalizedRequired = requiredKeys.map(k => k.startsWith('f') && k.length > 1 && !isNaN(Number(k.substring(1))) ? 'f-keys (f1-f12)' : k);
    const needsVirtual = normalizedRequired.some(key => userMissingKeys.includes(key));
    setIsVirtualKeyboardMode(needsVirtual);
  }, [activeStep, userProfile?.missingKeys, requiredKeys, isMac]);

  const drillStepsForGridEngine = drill.steps.map(stepId => ALL_DRILL_STEPS[stepId]);

  const { gridState: displayedGridState, cellStyles: displayedCellStyles } = drill.initialGridState ? calculateGridStateForStep(
    drillStepsForGridEngine,
    drill.initialGridState!,
    visualStepIndex - 1
  ) : { gridState: null, cellStyles: {} };

  const { gridState: previewGridState, cellStyles: previewCellStyles } = drill.initialGridState ? calculateGridStateForStep(
    drillStepsForGridEngine,
    drill.initialGridState!,
    visualStepIndex
  ) : { gridState: null, cellStyles: {} };
  
  const formatKeysForDisplay = (step: DrillStep, isMac: boolean): string => {
    const keysToDisplay = getPlatformKeys(step, isMac);

    const displayKeys = keysToDisplay.map(key => {
        const k = key.toLowerCase();

        switch(k) {
            case 'meta': return isMac ? '⌘' : 'Win';
            case 'control': return 'Ctrl';
            case 'alt': return isMac ? '⌥' : 'Alt';
            case 'shift': return 'Shift';
            case 'arrowup': return '↑';
            case 'arrowdown': return '↓';
            case 'arrowleft': return '←';
            case 'arrowright': return '→';
            case 'enter': return 'Enter';
            case 'return': return 'Return';
            case 'esc': return 'Esc';
            case 'backspace': return 'Backspace';
            case 'delete': return 'Del';
            case 'home': return 'Home';
            case 'end': return 'End';
            case 'pageup': return 'PgUp';
            case 'pagedown': return 'PgDn';
            case ' ': return 'Space';
            default: return key.toUpperCase();
        }
    });
    return `(${displayKeys.join(' + ')})`;
  };

  return (
    <>
    <Card className="w-full max-w-5xl flex flex-col overflow-hidden max-h-[90vh]">
      <CardHeader className="flex-shrink-0">
        <div className="flex justify-between items-start mb-4">
            <div>
                <CardTitle>{drillNumber ? `${drillNumber}. ` : ''}{drill.name}</CardTitle>
                <CardDescription>{drill.description}</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>
        
        <div className="flex justify-between items-center">
            <div className="flex justify-start flex-wrap gap-2">
              {reps.map((status, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-7 w-7 rounded-md flex items-center justify-center text-xs font-extrabold transition-all duration-200",
                    index === currentRep && "ring-2 ring-primary shadow-[0_0_0_4px_hsl(142_76%_36%_/_0.15)]",
                    status === RepStatus.Pending && "bg-muted text-muted-foreground",
                    status === RepStatus.Correct && "bg-primary text-white",
                    status === RepStatus.Incorrect && "bg-destructive text-white animate-shake"
                  )}
                >
                  {status === RepStatus.Correct ? '✓' : index + 1}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Mistakes</p>
                <div className="flex items-center gap-1.5">
                    {[...Array(drill.mistakeLimit)].map((_, i) => (
                        <div key={i} className={cn(
                          "w-3 h-3 rounded-full border-[1.5px] transition-all",
                          i < mistakes ? "bg-destructive border-destructive" : "bg-transparent border-border"
                        )} />
                    ))}
                </div>
                <span className={cn("text-[10px] font-semibold", mistakes > 0 ? "text-destructive" : "text-muted-foreground")}>
                  {mistakes}/{drill.mistakeLimit}
                </span>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col border-t pt-0">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
               {displayedGridState && (
                  <div className="max-w-md mx-auto relative">
                      <FindReplaceDialog state={finalDialogState} isSuccess={stepFeedback === 'correct'} />
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
                          isAccentuating={stepFeedback === 'correct'}
                      />
                  </div>
              )}
              <div className={cn(!displayedGridState && "md:col-span-2")}>
                  <div
                    ref={stepsContainerRef}
                    className="flex flex-col overflow-y-auto max-h-80 pr-1"
                  >
                      {drill.steps.map((stepId, index) => {
                          const step = ALL_DRILL_STEPS[stepId];
                          const Icon = icons[step.iconName];
                          const isStepActive = index === visualStepIndex;
                          const isStepCompleted = index < visualStepIndex;
                          const shortcutHint = currentRep === 0 ? formatKeysForDisplay(step, isMac) : '';

                          return (
                              <div
                                key={index}
                                ref={el => { stepRowRefs.current[index] = el; }}
                                className="relative flex gap-2.5 py-[5px]"
                              >
                                {index < drill.steps.length - 1 && (
                                  <div className={cn(
                                    "absolute left-[10px] top-[27px] bottom-[-5px] w-0.5 rounded-full z-0",
                                    isStepCompleted ? "bg-primary" : "bg-border"
                                  )} />
                                )}
                                <div className="pt-[6px] z-10 flex-shrink-0">
                                  {isStepCompleted || (isStepActive && stepFeedback === 'correct') ? (
                                    <div className="w-[22px] h-[22px] rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                      <Check className="w-3 h-3 text-white" />
                                    </div>
                                  ) : (
                                    <div className={cn(
                                      "w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 transition-all",
                                      isStepActive
                                        ? "border-2 border-primary text-primary bg-card shadow-[0_0_0_3px_hsl(142_76%_36%_/_0.15)]"
                                        : "bg-muted text-muted-foreground border-2 border-transparent"
                                    )}>
                                      {index + 1}
                                    </div>
                                  )}
                                </div>
                                <div className={cn(
                                  "flex-1 p-2.5 rounded-lg z-10 transition-all",
                                  isStepCompleted && "bg-green-500/10 border border-green-500/30",
                                  isStepActive && stepFeedback === 'incorrect' && "border-[1.5px] border-destructive",
                                  isStepActive && stepFeedback === 'correct' && "border-[1.5px] border-green-500",
                                  isStepActive && !stepFeedback && "bg-card border-[1.5px] border-primary shadow-[0_2px_10px_hsl(142_76%_36%_/_0.1)]",
                                  !isStepCompleted && !isStepActive && "border border-transparent"
                                )}>
                                  <div className="flex items-center gap-3">
                                    {Icon && <Icon className={cn("w-4 h-4 flex-shrink-0", isStepActive ? "text-primary" : "text-muted-foreground")} />}
                                    <p className={cn("flex-1 font-medium text-sm", isStepCompleted && "text-muted-foreground line-through")}>
                                        {step.description}
                                        {shortcutHint && (
                                            <span className="text-muted-foreground font-normal ml-2">{shortcutHint}</span>
                                        )}
                                    </p>
                                    {isStepActive && (
                                        <Badge variant={step.isSequential ? 'outline' : 'secondary'} className="ml-auto text-xs">
                                            {step.isSequential ? 'Sequential' : 'Combo'}
                                        </Badge>
                                    )}
                                  </div>
                                  {isStepActive && step.warningMessage && (
                                      <div className="mt-2 flex items-start gap-1.5 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-2 py-1.5">
                                          <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                                          <p className="text-xs text-red-700 dark:text-red-300 leading-snug">
                                              {step.warningMessage}
                                          </p>
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
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wide">
                Virtual Keyboard — Click to press
              </span>
              <div className="flex items-center gap-1.5">
                {pressedKeys.length > 0 ? (
                  pressedKeys.map((key, i) => <KeyDisplay key={`${key}-${i}`} value={key} isMac={isMac} small />)
                ) : (
                  <span className="text-xs text-muted-foreground">{isSequential ? "Press keys in sequence..." : "Press the required keys..."}</span>
                )}
              </div>
            </div>
            <div className="max-w-[660px] mx-auto">
              <VisualKeyboard
                highlightedKeys={pressedKeys}
                onKeyClick={handleVirtualKeyClick}
              />
            </div>
          </div>
        ) : (
          <CardFooter className="bg-muted/50 flex items-center justify-center gap-4 p-3 min-h-[46px] flex-shrink-0">
              {stepFeedback === 'correct' && <CheckCircle className="h-8 w-8 text-green-500" />}
              {stepFeedback === 'incorrect' && <XCircle className="h-8 w-8 text-destructive" />}
              {stepFeedback === null && activeStep && (
                <div className="flex items-center justify-center gap-2">
                    {pressedKeys.length > 0 ? (
                        pressedKeys.map((key, index) => <KeyDisplay key={`${key}-${index}`} value={key} isMac={isMac} />)
                    ) : (
                        <div className="flex items-center justify-center gap-2 font-semibold text-muted-foreground text-sm">
                            <Keyboard className="h-5 w-5" />
                            <span>{isSequential ? "Press keys in sequence..." : "Press the required keys..."}</span>
                        </div>
                    )}
                </div>
              )}
          </CardFooter>
        )}
      </CardContent>
    </Card>
</>
  );
}

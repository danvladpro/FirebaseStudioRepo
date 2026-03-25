
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Drill, ALL_DRILL_STEPS, DrillStep } from "@/lib/drills";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { cn, getPlatformKeys, getSelectionRangeString } from "@/lib/utils";
import { Check, X, CheckCircle, Circle, ChevronDown, Keyboard, XCircle, MousePointerClick, ArrowLeft, ArrowUp, ArrowDown, ArrowRight } from "lucide-react";
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

interface DrillUIProps {
  drill: Drill;
  drillNumber: string | null;
}

enum RepStatus {
  Pending,
  Correct,
  Incorrect,
}

const KeyDisplay = ({ value, isMac }: { value: string, isMac: boolean }) => {
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
            "px-2 py-1.5 text-xs font-semibold rounded-md border-b-2 text-muted-foreground bg-muted",
            isModifier ? "min-w-[4rem] text-center" : "",
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
  
  useEffect(() => {
    setIsMac(navigator.userAgent.toLowerCase().includes('mac'));
  }, []);

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
  const finalDialogState = stepFeedback === 'correct' ? dialogStateAfter : dialogStateBefore;

  useEffect(() => {
    if (!activeStep) {
        setIsVirtualKeyboardMode(false);
        return;
    }

    const requiredKeysForStepSet = new Set(requiredKeys);

    const hasT = requiredKeysForStepSet.has('t');
    const hasR = requiredKeysForStepSet.has('r');
    const hasW = requiredKeysForStepSet.has('w');
    const hasModifier = requiredKeysForStepSet.has('control') || requiredKeysForStepSet.has('meta');
    
    if (requiredKeysForStepSet.size === 2 && hasModifier && (hasT || hasR || hasW)) {
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
    <Card className="w-full max-w-5xl">
      <CardHeader>
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
                    "h-8 w-8 rounded-md transition-all duration-300 flex items-center justify-center font-bold text-base",
                    index === currentRep && "ring-2 ring-primary",
                    status === RepStatus.Pending && "bg-muted text-muted-foreground",
                    status === RepStatus.Correct && "bg-green-500 text-white",
                    status === RepStatus.Incorrect && "bg-destructive text-white animate-shake"
                  )}
                >
                  {index + 1}
                </div>
              ))}
            </div>
             <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-muted-foreground">Mistakes</p>
                <div className="flex items-center gap-1.5">
                    {[...Array(drill.mistakeLimit)].map((_, i) => (
                        <div key={i} className={cn("w-5 h-5 rounded-full border", i < mistakes ? "bg-destructive" : "bg-muted")}></div>
                    ))}
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent className="border-t pt-6 relative">
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
                <div className="flex flex-col gap-2">
                    {drill.steps.map((stepId, index) => {
                        const step = ALL_DRILL_STEPS[stepId];
                        const Icon = icons[step.iconName];
                        const isStepActive = index === visualStepIndex;
                        const isStepCompleted = index < visualStepIndex;
                        const feedbackClass = isStepActive && stepFeedback === 'incorrect' ? 'ring-2 ring-destructive' : '';
                        const successClass = isStepActive && stepFeedback === 'correct' ? 'ring-2 ring-green-500' : '';
                        const shortcutHint = currentRep === 0 ? formatKeysForDisplay(step, isMac) : '';


                        return (
                            <div key={index}>
                                <div className={cn(
                                    "p-4 rounded-lg transition-all",
                                    isStepCompleted ? "bg-green-500/10" : "bg-muted/50",
                                    isStepActive && !stepFeedback && "ring-2 ring-primary",
                                    feedbackClass,
                                    successClass
                                )}>
                                    <div className="flex items-center gap-4">
                                        {isStepCompleted || (isStepActive && stepFeedback === 'correct') ? (
                                            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                        ) : (
                                            <Circle className={cn("w-4 h-4 flex-shrink-0", isStepActive ? "text-primary" : "text-muted-foreground/50")} />
                                        )}
                                        {Icon && <Icon className={cn("w-5 h-5", isStepActive ? "text-primary" : "text-muted-foreground")} />}
                                        <p className={cn("flex-1 font-medium", isStepCompleted && "text-muted-foreground line-through")}>
                                            {step.description}
                                            {shortcutHint && (
                                                <span className="text-muted-foreground font-normal ml-2">{shortcutHint}</span>
                                            )}
                                        </p>
                                        {isStepActive && (
                                            <Badge variant={step.isSequential ? 'outline' : 'secondary'} className="ml-auto">
                                                {step.isSequential ? 'Sequential' : 'Combo'}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

      </CardContent>
       <CardFooter className="bg-muted/50 h-[60px] flex items-center justify-center gap-4 p-4">
            {stepFeedback === 'correct' && <CheckCircle className="h-8 w-8 text-green-500" />}
            {stepFeedback === 'incorrect' && <XCircle className="h-8 w-8 text-destructive" />}
            {stepFeedback === null && activeStep && (
              isVirtualKeyboardMode ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MousePointerClick className="h-8 w-8" />
                  <span className="text-lg">Click the keys below</span>
                </div>
              ) : (
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
              )
            )}
       </CardFooter>
        <div className={cn(
            "h-full min-h-0 flex items-center justify-center transition-colors",
            isVirtualKeyboardMode && "border-t"
        )}>
            {isVirtualKeyboardMode && activeStep && (
                <div className="p-4 w-full h-full max-w-[750px] ">
                    <div className="w-full h-full max-h-[250px] aspect-[3/1]">
                        <VisualKeyboard 
                            highlightedKeys={pressedKeys}
                            onKeyClick={handleVirtualKeyClick}
                        />
                    </div>
                </div>
            )}
        </div>
    </Card>
  );
}


"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

interface DrillUIProps {
  drill: Drill;
  drillNumber: string | null;
}

enum RepStatus {
  Pending,
  Correct,
  Incorrect,
}

const isModifier = (key: string) => ['control', 'shift', 'alt', 'meta'].includes(key);

const KeyDisplay = ({ value, isMac }: { value: string, isMac: boolean }) => {
    const isModifierKey = isModifier(value);
    const isLetter = value.length === 1 && value.match(/[a-z]/i);

    const displayMap: Record<string, string> = {
        'control': 'Ctrl',
        'meta': 'Cmd',
        'command': 'Cmd',
        'alt': 'Alt',
        'option': 'Opt',
        ' ': 'Space'
    };

    const displayValue = isMac ? (keyDisplayMap[value] || value.toUpperCase()) : (windowsKeyDisplayMap[value] || value.toUpperCase());


    return (
        <kbd className={cn(
            "px-2 py-1.5 text-xs font-semibold rounded-md border-b-2 text-muted-foreground bg-muted",
            isModifierKey ? "min-w-[4rem] text-center" : "",
            isLetter ? "uppercase" : ""
        )}>
            {displayValue}
        </kbd>
    );
};

const keyDisplayMap: Record<string, string | JSX.Element> = {
    'esc': 'Esc',
    'backspace': 'Backspace',
    'delete': 'Del',
    'tab': 'Tab',
    'capslock': 'Caps Lock',
    'enter': 'Enter',
    'return': 'Return',
    'shift': 'Shift',
    'control': '⌃',
    'meta': '⌘',
    'alt': '⌥',
    ' ': 'Space',
    'fn': 'fn',
    'insert': 'Ins',
    'home': 'Home',
    'pageup': 'PgUp',
    'end': 'End',
    'pagedown': 'PgDn',
    'arrowup': <ArrowUp size={14} />,
    'arrowdown': <ArrowDown size={14} />,
    'arrowleft': <ArrowLeft size={14} />,
    'arrowright': <ArrowRight size={14} />,
};

const windowsKeyDisplayMap: Record<string, string | JSX.Element> = {
    ...keyDisplayMap,
    'control': 'Ctrl',
    'meta': 'Win',
    'alt': 'Alt',
    'delete': 'Del'
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
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [sequence, setSequence] = useState<string[]>([]);
  const [isVirtualKeyboardMode, setIsVirtualKeyboardMode] = useState(false);
  const incorrectLockRef = useRef(false);
  const keyHandlersRef = useRef({
    handleKeyDown: (e: KeyboardEvent) => {},
    handleKeyUp: (e: KeyboardEvent) => {},
  });

  const drillStepsForEngine = drill.steps.map(stepId => ALL_DRILL_STEPS[stepId]);
  
  // Calculate state up to the step *before* the current one. This is what the user sees.
  const dialogStateBefore = calculateDialogStateForStep(drillStepsForEngine, logicalStepIndex - 1);
  
  // The state *after* the step is completed. This is shown on success.
  const dialogStateAfter = calculateDialogStateForStep(drillStepsForEngine, logicalStepIndex);

  const finalDialogState = stepFeedback === 'correct' ? dialogStateAfter : dialogStateBefore;


  const normalizeKey = (code: string) => {
    const lower = code.toLowerCase();

    // From event.code
    if (lower.startsWith('key')) return lower.substring(3);
    if (lower.startsWith('digit')) return lower.substring(5);
    if (lower.startsWith('numpad')) return lower.substring(6);
    if (lower.startsWith('arrow')) return lower;
    if (lower.startsWith('control')) return 'control';
    if (lower.startsWith('shift')) return 'shift';
    if (lower.startsWith('alt')) return 'alt';
    if (lower.startsWith('meta')) return 'meta';

    switch (lower) {
        case 'escape': return 'esc';
        case 'space': return ' ';
        case 'enter':
        case 'numpadenter':
          return isMac ? 'return' : 'enter';
        case 'backspace': return 'backspace';
        case 'delete': return 'delete';
        case 'pageup': return 'pageup';
        case 'pagedown': return 'pagedown';
        case 'home': return 'home';
        case 'end': return 'end';
        case 'insert': return 'insert';
        case 'tab': return 'tab';
        case 'backquote': return '`';
        case 'minus': return '-';
        case 'equal': return '=';
        case 'bracketleft': return '[';
        case 'bracketright': return ']';
        case 'backslash': return '\\';
        case 'semicolon': return ';';
        case 'quote': return "'";
        case 'comma': return ',';
        case 'period': return '.';
        case 'slash': return '/';
    }
    
    // For F-keys
    if (lower.startsWith('f') && lower.length > 1 && !isNaN(parseInt(lower.substring(1)))) {
        return lower;
    }

    // Fallback for any unmapped codes or if event.key was passed
    return code.toLowerCase();
  };
  
  useEffect(() => {
    setIsMac(navigator.userAgent.toLowerCase().includes('mac'));
  }, []);

  const activeStep = drill.steps[logicalStepIndex] ? ALL_DRILL_STEPS[drill.steps[logicalStepIndex]] : null;

  const getRequiredKeys = useCallback(() => {
    if (!activeStep) return new Set<string>();
    return new Set(getPlatformKeys(activeStep, isMac));
  }, [activeStep, isMac]);

  useEffect(() => {
    if (!activeStep) {
        setIsVirtualKeyboardMode(false);
        return;
    }

    const requiredKeysForStepSet = getRequiredKeys();

    // Check for browser-conflicting shortcuts
    const hasT = requiredKeysForStepSet.has('t');
    const hasR = requiredKeysForStepSet.has('r');
    const hasW = requiredKeysForStepSet.has('w');
    const hasModifier = requiredKeysForStepSet.has('control') || requiredKeysForStepSet.has('meta');
    
    if (requiredKeysForStepSet.size === 2 && hasModifier && (hasT || hasR || hasW)) {
        setIsVirtualKeyboardMode(true);
        return;
    }

    // Original logic for user's missing keys
    if (!userProfile?.missingKeys) {
        setIsVirtualKeyboardMode(false);
        return;
    }

    const requiredKeysForStep = Array.from(requiredKeysForStepSet);
    const userMissingKeys = userProfile.missingKeys.map(k => k.toLowerCase());
    
    const normalizedRequired = requiredKeysForStep.map(k => k.startsWith('f') && k.length > 1 && !isNaN(Number(k.substring(1))) ? 'f-keys (f1-f12)' : k);
    
    const needsVirtual = normalizedRequired.some(key => userMissingKeys.includes(key));
    setIsVirtualKeyboardMode(needsVirtual);
  }, [activeStep, userProfile?.missingKeys, getRequiredKeys, isMac]);

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
    setPressedKeys(new Set());
    setSequence([]);
    setStepFeedback(null);
    incorrectLockRef.current = false;
  }, [drill.repetitions]);
  
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

  const handleIncorrect = useCallback(() => {
    incorrectLockRef.current = true;
    setPressedKeys(new Set());
    setSequence([]);

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
        incorrectLockRef.current = false;
      }, 500);
    }
  }, [currentRep, drill.mistakeLimit, resetDrill, mistakes]);

  const handleStepSuccess = useCallback(() => {
    setStepFeedback('correct');
    setPressedKeys(new Set());
    setSequence([]);

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
  }, [visualStepIndex, currentRep, drill.steps.length, drill.repetitions, finishDrill]);


  const handleVirtualKeyClick = (key: string) => {
    if (stepFeedback !== null || incorrectLockRef.current) return;
    
    const normalized = normalizeKey(key);

    setPressedKeys(prev => {
        const newKeys = new Set(prev);
        if (newKeys.has(normalized)) {
            newKeys.delete(normalized);
        } else {
            newKeys.add(normalized);
        }
        return newKeys;
    });
    
    if (activeStep?.isSequential) {
        setSequence(prev => [...prev, normalized]);
    }
  };

  useEffect(() => {
    if (incorrectLockRef.current || stepFeedback !== null || !activeStep) return;
    
    if (activeStep.isSequential) {
      if (sequence.length === 0) return;
      const requiredSequence = Array.from(getRequiredKeys());

      for (let i = 0; i < sequence.length; i++) {
        if (sequence[i] !== requiredSequence[i]) {
          handleIncorrect();
          return;
        }
      }

      if (sequence.length === requiredSequence.length) {
        handleStepSuccess();
      }
    } else {
      if (pressedKeys.size === 0) return;
      const requiredKeys = getRequiredKeys();
      
      if (pressedKeys.size >= requiredKeys.size && [...requiredKeys].every(k => pressedKeys.has(k))) {
        handleStepSuccess();
      }
    }
  }, [pressedKeys, sequence, activeStep, getRequiredKeys, handleIncorrect, handleStepSuccess, stepFeedback]);

  useEffect(() => {
    keyHandlersRef.current = {
      handleKeyDown: (e: KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.repeat || stepFeedback !== null || incorrectLockRef.current) {
          return;
        }
        const key = normalizeKey(e.code);
        setPressedKeys(prev => new Set(prev).add(key));

        if (activeStep?.isSequential) {
          setSequence(prev => [...prev, key]);
        }
      },
      handleKeyUp: (e: KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        setPressedKeys(prev => {
          const newKeys = new Set(prev);
          newKeys.delete(normalizeKey(e.code));
          return newKeys;
        });
      },
    }
  }, [activeStep, stepFeedback]);
  
  useEffect(() => {
    if (logicalStepIndex >= drill.steps.length) return;
  
    const onKeyDown = (e: KeyboardEvent) => keyHandlersRef.current.handleKeyDown(e);
    const onKeyUp = (e: KeyboardEvent) => keyHandlersRef.current.handleKeyUp(e);

    const handleBlur = () => {
      setPressedKeys(new Set());
      setSequence([]);
    };
  
    window.addEventListener('keydown', onKeyDown, { capture: true });
    window.addEventListener('keyup', onKeyUp, { capture: true });
    window.addEventListener('blur', handleBlur);
  
    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true });
      window.removeEventListener('keyup', onKeyUp, { capture: true });
      window.removeEventListener('blur', handleBlur);
    };
  }, [logicalStepIndex, drill.steps.length]);
  
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
                    <FormatCellsDialog isVisible={!!finalDialogState.formatCellsDialogVisible} />
                    <FilterDropdown state={finalDialogState} />
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
                 <div className="flex items-center gap-2">
                    {activeStep.isSequential ? (
                    sequence.length > 0 ? (
                        sequence.map((key, index) => <KeyDisplay key={index} value={key} isMac={isMac} />)
                    ) : <span className="text-muted-foreground">Press the required keys in sequence...</span>
                    ) : (
                    pressedKeys.size > 0 ? (
                        Array.from(pressedKeys).map(key => <KeyDisplay key={key} value={key} isMac={isMac} />)
                    ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Keyboard className="h-8 w-8" />
                            <span className="text-lg">Use your keyboard</span>
                        </div>
                    )
                    )}
                </div>
              )
            )}
       </CardFooter>
        <div className={cn(
            "min-h-[310px] flex items-center justify-center transition-colors",
            isVirtualKeyboardMode && "border-t"
        )}>
            {isVirtualKeyboardMode && activeStep && (
                <div className="p-4">
                    <VisualKeyboard 
                        highlightedKeys={activeStep.isSequential ? sequence : Array.from(pressedKeys)}
                        onKeyClick={handleVirtualKeyClick}
                    />
                </div>
            )}
        </div>
    </Card>
  );
}

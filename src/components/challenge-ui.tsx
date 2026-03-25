
"use client";

import { useState, useEffect, useCallback, useRef, ElementType } from "react";
import { useRouter } from "next/navigation";
import { ChallengeSet, ChallengeStep, Sheet } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Timer, Keyboard, ChevronsRight, Circle, ChevronDown, BookOpen, MousePointerClick, ArrowLeft, ArrowUp, ArrowDown, ArrowRight } from "lucide-react";
import { cn, getPlatformKeys, getSelectionRangeString } from "@/lib/utils";
import { Button } from "./ui/button";
import * as icons from "lucide-react";
import { VisualGrid } from "./visual-grid";
import { calculateGridStateForStep } from "@/lib/grid-engine";
import { useAuth } from "./auth-provider";
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

interface ChallengeUIProps {
  set: ChallengeSet;
  mode: 'timed' | 'training';
}

const normalizeKey = (code: string, isMac: boolean) => {
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
    
    if (lower.startsWith('f') && lower.length > 1 && !isNaN(parseInt(lower.substring(1)))) {
        return lower;
    }
    return lower;
};

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
  const [isMac, setIsMac] = useState(false);
  const [isVirtualKeyboardMode, setIsVirtualKeyboardMode] = useState(false);

  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [sequence, setSequence] = useState<string[]>([]);
  const incorrectLockRef = useRef(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentChallenge = set.challenges[currentChallengeIndex];
  const currentStep = currentChallenge?.steps[currentStepIndex];
  const isSequential = !!currentStep?.isSequential;
  
  useEffect(() => {
    setIsMac(navigator.userAgent.toLowerCase().includes('mac'));
  }, []);
  
  const requiredKeys = useMemo(() => {
      if (!currentStep) return [];
      return getPlatformKeys(currentStep, isMac);
  }, [currentStep, isMac]);

  useEffect(() => {
      setPressedKeys(new Set());
      setSequence([]);
      incorrectLockRef.current = false;
  }, [requiredKeys, isSequential]);

  const advanceStepOrChallenge = useCallback(() => {
    if (incorrectLockRef.current) return;
    setFeedback("correct");
    setIsAccentuating(true);
    
    const delay = (currentStep?.dialogEffect?.action.startsWith('SHOW_') || currentStep?.dialogEffect?.action === 'SHOW') ? 1200 : 400;

    setTimeout(() => {
        const isLastStep = currentStepIndex === currentChallenge.steps.length - 1;
        if (isLastStep) {
            moveToNextChallenge();
        } else {
            setCurrentStepIndex(prev => prev + 1);
        }
        
        setFeedback(null);
        setIsAccentuating(false);
    }, delay);
  }, [currentStepIndex, currentChallenge, moveToNextChallenge, currentStep]);

  const handleIncorrect = useCallback(() => {
    if (incorrectLockRef.current) return;
    incorrectLockRef.current = true;
    setFeedback("incorrect");
    setTimeout(() => {
      setFeedback(null);
      incorrectLockRef.current = false;
    }, 500);
  }, []);

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

  const handleSkip = useCallback(() => {
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
  
  useEffect(() => {
    if (!currentStep) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || incorrectLockRef.current || feedback !== null) return;
      e.preventDefault();
      e.stopPropagation();

      const key = normalizeKey(e.code, isMac);
      setPressedKeys(prev => new Set(prev).add(key));

      if (isSequential) {
        setSequence(prevSeq => [...prevSeq, key]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setPressedKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(normalizeKey(e.code, isMac));
        return newKeys;
      });
    };

    const handleBlur = () => {
      setPressedKeys(new Set());
      setSequence([]);
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("keyup", handleKeyUp, { capture: true });
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("keyup", handleKeyUp, { capture: true });
      window.removeEventListener('blur', handleBlur);
    };
  }, [currentStep, isSequential, isMac, feedback]);

  useEffect(() => {
    if (incorrectLockRef.current || !currentStep || feedback !== null) return;

    if (isSequential) {
      if (sequence.length === 0) return;

      for (let i = 0; i < sequence.length; i++) {
        if (sequence[i] !== requiredKeys[i]) {
          handleIncorrect();
          setSequence([]);
          return;
        }
      }

      if (sequence.length === requiredKeys.length) {
        advanceStepOrChallenge();
      }
    } else {
      if (pressedKeys.size === 0) return;
      
      const requiredSet = new Set(requiredKeys);
      if (pressedKeys.size === requiredSet.size && [...requiredSet].every(k => pressedKeys.has(k))) {
        advanceStepOrChallenge();
      }
    }
  }, [pressedKeys, sequence, isSequential, requiredKeys, currentStep, feedback, advanceStepOrChallenge, handleIncorrect]);


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

  const handleVirtualKeyClick = (key: string) => {
    if (incorrectLockRef.current || feedback !== null) return;
    const normalizedKey = normalizeKey(key, isMac);

    if (isSequential) {
      setSequence(prev => [...prev, normalizedKey]);
    } else {
      // For combos, toggle the key in the pressed set
      setPressedKeys(prev => {
        const newKeys = new Set(prev);
        if (newKeys.has(normalizedKey)) {
          newKeys.delete(normalizedKey);
        } else {
          newKeys.add(normalizedKey);
        }
        return newKeys;
      });
    }
  };

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
    <Card
    className={cn(
        "w-full transform transition-all duration-500 flex flex-col flex-1 min-h-0",
        feedback === 'incorrect' && 'animate-shake border-destructive shadow-lg shadow-destructive/20'
    )}
    >
    <CardHeader className="p-2 sm:p-3">
        <div className="flex justify-between items-center flex-wrap gap-y-2 mb-2">
            <CardTitle className="text-base md:text-lg">{set.name}</CardTitle>
            <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                {mode === 'timed' ? (
                    <>
                        <div className={cn("flex items-center gap-1 transition-colors", countdown <= 3 && "text-destructive")}>
                            Remaining: <span className="font-mono text-sm font-semibold">{countdown}s</span>
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
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Dashboard
                    </Link>
                </Button>
            </div>
        </div>
        <div className="relative w-full h-4 overflow-hidden rounded-full bg-secondary">
          <Progress value={progress} className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-primary-foreground font-semibold">
                {isMultiStep ? 'Scenario' : 'Challenge'} {currentChallengeIndex + 1} of {set.challenges.length}
            </p>
          </div>
        </div>
    </CardHeader>
    <CardContent className="grid md:grid-cols-2 gap-4 items-start p-2 sm:p-3 flex-1 min-h-0">
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
                    <VisualGrid 
                        gridState={displayedGridState} 
                        cellStyles={displayedCellStyles}
                        previewState={previewGridState ? {
                            gridState: previewGridState,
                            cellStyles: previewCellStyles,
                        } : null}
                        isAccentuating={isAccentuating}
                    />
                </div>
            )}
        </div>
        <div className="flex flex-col gap-4 min-w-0">
            <div className="flex justify-center items-center gap-2">
                {ActiveIcon && <ActiveIcon className="w-5 h-5 text-primary" />}
                <h2 className="text-sm md:text-base font-semibold text-foreground text-center">{currentChallenge.description}</h2>
            </div>
            <div className="flex flex-col gap-2 text-left">
                {currentChallenge.steps.map((step, index) => {
                    const ChallengeIcon = icons[step.iconName] as ElementType;
                    const isCompleted = index < currentStepIndex;
                    const isActive = index === currentStepIndex;
                    const iconColor = cn(isCompleted ? "text-green-500" : (isActive ? (isAccentuating ? "text-green-500" : "text-primary") : "text-muted-foreground/50"));

                    return (
                    <div key={index}>
                        <div
                        className={cn(
                            "p-1.5 sm:p-2 rounded-lg transition-all",
                            isCompleted ? "bg-green-500/10" : "bg-muted/50",
                            isActive && feedback !== 'incorrect' && !isAccentuating && "ring-2 ring-primary",
                            isActive && isAccentuating && "ring-2 ring-green-500",
                            isActive && feedback === 'incorrect' && "ring-2 ring-destructive"
                        )}
                        >
                        <div className="flex items-center gap-2 sm:gap-3">
                            {isCompleted ? (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                            ) : (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 flex items-center justify-center">
                                <Circle className={cn("w-3 h-3 sm:w-4 sm:h-4", isActive ? (isAccentuating ? "text-green-500" : "text-primary") : "text-muted-foreground/50")} />
                            </div>
                            )}
                            {ChallengeIcon && (
                                <ChallengeIcon className={cn("w-4 h-4 sm:w-5 sm:h-5", iconColor)} />
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
                                <Badge variant={step.isSequential ? 'outline' : 'secondary'} className="ml-auto text-xs">
                                    {step.isSequential ? 'Sequence' : 'Combo'}
                                </Badge>
                            )}
                        </div>

                        {isActive && (
                            <div className="flex items-center justify-center gap-2 h-6 mt-2">
                            {feedback === 'correct' && <CheckCircle className="h-5 w-5 sm:h-6 sm:h-6 text-green-500" />}
                            {feedback === 'incorrect' && <XCircle className="h-5 w-5 sm:h-6 sm:h-6 text-destructive" />}
                            {feedback === null && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                {isVirtualKeyboardMode ? <MousePointerClick className="h-4 w-4 sm:h-5 sm:h-5" /> : <Keyboard className="h-4 w-4 sm:h-5 sm:h-5" />}
                                <span className="text-xs sm:text-sm">
                                    {isVirtualKeyboardMode ? "Click keys below" : "Use your keyboard"}
                                </span>
                                </div>
                            )}
                            </div>
                        )}
                        </div>
                        {index < currentChallenge.steps.length - 1 && (
                        <div className="h-3 sm:h-4 flex justify-center">
                            <ChevronDown className="w-4 h-4 text-muted-foreground/50" />
                        </div>
                        )}
                    </div>
                    );
                })}
                </div>
            </div>
    </CardContent>
    <CardFooter className="bg-muted/50 flex items-center justify-between gap-2 flex-wrap p-2">
        <div className="flex-1 flex items-center justify-center gap-1.5 min-h-[28px]">
            {currentStep.isSequential ? (
            sequence.length > 0 ? (
                sequence.map((key, index) => <KeyDisplay key={index} value={key} isMac={isMac} />)
            ) : (
                <div className="flex items-center justify-center gap-2 font-semibold text-muted-foreground text-sm">
                    <Keyboard className="h-5 w-5" />
                    <span>Press keys in sequence...</span>
                </div>
            )
            ) : (
            pressedKeys.size > 0 ? (
                Array.from(pressedKeys).map(key => <KeyDisplay key={key} value={key} isMac={isMac} />)
            ) : (
                <div className="flex items-center justify-center gap-2 font-semibold text-muted-foreground text-sm">
                    <Keyboard className="h-5 w-5" />
                    <span>Press the required keys...</span>
                </div>
            )
            )}
        </div>
        <Button variant="outline" size="sm" onClick={handleSkip}>
            Skip <ChevronsRight className="ml-2 h-4 w-4" />
        </Button>
    </CardFooter>
      <div className="flex h-full min-h-0 w-full items-center justify-center transition-colors">
        {isVirtualKeyboardMode && (
          <div className="h-full w-full max-w-[750px] p-1 sm:p-2">
            <div className="h-full w-full max-h-[250px] aspect-[3/1]">
                <VisualKeyboard 
                    highlightedKeys={isSequential ? sequence : Array.from(pressedKeys)}
                    onKeyClick={handleVirtualKeyClick}
                />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

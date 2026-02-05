
"use client";

import { useState, useEffect, useCallback, useRef, ElementType } from "react";
import { useRouter } from "next/navigation";
import { ChallengeSet, ChallengeStep } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Timer, Keyboard, ChevronsRight, Circle, ChevronDown, BookOpen, MousePointerClick, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import * as icons from "lucide-react";
import { VisualGrid } from "./visual-grid";
import { calculateGridStateForStep } from "@/lib/grid-engine";
import { useAuth } from "./auth-provider";
import { VisualKeyboard } from "./visual-keyboard";
import Link from "next/link";

interface ChallengeUIProps {
  set: ChallengeSet;
  mode: 'timed' | 'training';
}

const isModifier = (key: string) => ['control', 'shift', 'alt', 'meta'].includes(key);

const KeyDisplay = ({ value }: { value: string }) => {
    const isModifierKey = isModifier(value);
    const isLetter = value.length === 1 && value.match(/[a-z]/i);

    const displayValue: Record<string, string> = {
        'control': 'Ctrl',
        'meta': 'Cmd',
        'command': 'Cmd',
        'alt': 'Alt',
        'option': 'Opt',
        ' ': 'Space'
    }
    const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);

    return (
        <kbd className={cn(
            "px-2 py-1.5 text-xs font-semibold rounded-md border-b-2 text-muted-foreground bg-muted",
            isModifierKey ? "min-w-[4rem] text-center" : "",
            isLetter ? "uppercase" : ""
        )}>
            {displayValue[value] || capitalizedValue}
        </kbd>
    );
};

export default function ChallengeUI({ set, mode }: ChallengeUIProps) {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [sequence, setSequence] = useState<string[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [isAccentuating, setIsAccentuating] = useState(false);
  const [skippedIndices, setSkippedIndices] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [countdown, setCountdown] = useState(8);
  const [isMac, setIsMac] = useState(false);
  const [isVirtualKeyboardMode, setIsVirtualKeyboardMode] = useState(false);
  const incorrectLockRef = useRef(false);

  const currentChallenge = set.challenges[currentChallengeIndex];
  const currentStep = currentChallenge?.steps[currentStepIndex];
  const initialGridState = currentChallenge?.initialGridState ?? null;

  const { gridState: displayedGridState, cellStyles: displayedCellStyles } = initialGridState
    ? calculateGridStateForStep(currentChallenge.steps, initialGridState, currentStepIndex - 1)
    : { gridState: null, cellStyles: {} };

  const { gridState: previewGridState, cellStyles: previewCellStyles } = initialGridState
    ? calculateGridStateForStep(currentChallenge.steps, initialGridState, currentStepIndex)
    : { gridState: null, cellStyles: {} };

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const normalizeKey = (key: string) => {
    const lower = key.toLowerCase();
    if (["control", "ctrl", "controlleft", "controlright"].includes(lower)) return "control";
    if (["shift", "shiftleft", "shiftright"].includes(lower)) return "shift";
    if (["alt", "option", "altleft", "altright"].includes(lower)) return "alt";
    if (["meta", "command", "cmd", "win", "metaleft", "metaright"].includes(lower)) return "meta";
    if (lower === 'escape') return 'esc';
    if (lower === ' ') return ' ';
    if (lower.startsWith('arrow')) return lower;
    return lower;
  };

  const getRequiredKeys = useCallback(() => {
    if (!currentStep) return new Set<string>();

    const isStrikethrough = currentStep.description.toLowerCase().includes('strikethrough');

    const keys = currentStep.keys.map(k => {
      const lowerK = k.toLowerCase();
      if (isMac) {
        if (lowerK === 'control' && !isStrikethrough) {
          return 'meta'; 
        }
      }
      return lowerK;
    });
    return new Set(keys);
  }, [currentStep, isMac]);

  useEffect(() => {
    if (!currentStep || !userProfile?.missingKeys) {
        setIsVirtualKeyboardMode(false);
        return;
    }

    const requiredKeysForStep = Array.from(getRequiredKeys());
    const userMissingKeys = userProfile.missingKeys.map(k => k.toLowerCase());
    
    const normalizedRequired = requiredKeysForStep.map(k => k.startsWith('f') && k.length > 1 && !isNaN(Number(k.substring(1))) ? 'f-keys (f1-f12)' : k);
    
    const needsVirtual = normalizedRequired.some(key => userMissingKeys.includes(key));
    setIsVirtualKeyboardMode(needsVirtual);
}, [currentStep, userProfile?.missingKeys, getRequiredKeys]);


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

  const handleIncorrect = useCallback(() => {
    if (incorrectLockRef.current) return;
    incorrectLockRef.current = true;
    
    setIsProcessing(true);
    setFeedback("incorrect");
    setPressedKeys(new Set());
    setSequence([]);

    setTimeout(() => {
      setFeedback(null);
      setIsProcessing(false);
      incorrectLockRef.current = false;
    }, 500);
  }, []);

  const advanceStepOrChallenge = useCallback(() => {
    setIsProcessing(true);
    setFeedback("correct");
    setIsAccentuating(true);
    
    const requiredKeysForCompletedStep = getRequiredKeys();

    setTimeout(() => {
        const isLastStep = currentStepIndex === currentChallenge.steps.length - 1;
        if (isLastStep) {
            moveToNextChallenge();
        } else {
            setCurrentStepIndex(prev => prev + 1);
        }
        
        setPressedKeys(prev => {
            const newKeys = new Set(prev);
            const nonModifiers = [...requiredKeysForCompletedStep].filter(k => !isModifier(k));
            nonModifiers.forEach(k => newKeys.delete(k));
            return newKeys;
        });
        
        setSequence([]);
        setFeedback(null);
        setIsAccentuating(false);
        setIsProcessing(false);

    }, 400);
  }, [currentStepIndex, currentChallenge, moveToNextChallenge, getRequiredKeys]);

  const handleSkip = useCallback(() => {
    if (isProcessing) return;
    const newSkippedIndices = [...skippedIndices, currentChallengeIndex];
    setSkippedIndices(newSkippedIndices);
    
    setIsProcessing(true);
    setTimeout(() => {
        if (currentChallengeIndex === set.challenges.length - 1) {
            finishChallenge(newSkippedIndices);
        } else {
            moveToNextChallenge();
        }
        setIsProcessing(false);
    }, 100);
  }, [moveToNextChallenge, currentChallengeIndex, set.challenges.length, skippedIndices, finishChallenge, isProcessing]);
  
  const processSequentialKeyPress = useCallback((key: string) => {
    if (isProcessing || !currentStep?.isSequential) return;
    
    const requiredKeys = getRequiredKeys();
    const newSequence = [...sequence, key]; 
    setSequence(newSequence);
    
    const requiredSequence = Array.from(requiredKeys); 
    
    for (let i = 0; i < newSequence.length; i++) {
      if (newSequence[i] !== requiredSequence[i]) {
        handleIncorrect();
        return;
      }
    }
    if (newSequence.length === requiredSequence.length) {
      advanceStepOrChallenge();
    }
  }, [currentStep, sequence, getRequiredKeys, advanceStepOrChallenge, handleIncorrect, isProcessing]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (isProcessing || e.repeat || feedback !== null) {
            e.preventDefault();
            return;
        };
        e.preventDefault();
        const key = normalizeKey(e.key);

        setPressedKeys(prev => new Set(prev).add(key));

        if (currentStep?.isSequential) {
            processSequentialKeyPress(key);
        }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
        e.preventDefault();
        const key = normalizeKey(e.key);

        setPressedKeys(prev => {
            const newKeys = new Set(prev);
            newKeys.delete(key);
            return newKeys;
        });
    };

    const handleBlur = () => {
        setPressedKeys(new Set());
        setSequence([]);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [currentStep, isProcessing, processSequentialKeyPress, feedback]);
  
  useEffect(() => {
    if (isProcessing || !currentStep || currentStep.isSequential) return;

    const requiredKeys = getRequiredKeys();
    
    const pressedNonModifiers = new Set([...pressedKeys].filter(k => !isModifier(k)));
    if (pressedNonModifiers.size === 0) return;

    const requiredNonModifiers = new Set([...requiredKeys].filter(k => !isModifier(k)));

    const allRequiredNonModifiersPressed = [...requiredNonModifiers].every(k => pressedNonModifiers.has(k));
    const extraNonModifiersPressed = [...pressedNonModifiers].some(k => !requiredNonModifiers.has(k));

    if (extraNonModifiersPressed) {
        handleIncorrect();
        return;
    }
    
    if (allRequiredNonModifiersPressed && pressedNonModifiers.size === requiredNonModifiers.size) {
        const requiredModifiers = new Set([...requiredKeys].filter(isModifier));
        const pressedModifiers = new Set([...pressedKeys].filter(isModifier));
        const allRequiredModifiersPressed = [...requiredModifiers].every(k => pressedModifiers.has(k));
        const extraModifiersPressed = [...pressedModifiers].some(k => !requiredModifiers.has(k));
        
        if (allRequiredModifiersPressed && !extraModifiersPressed) {
            advanceStepOrChallenge();
        } else if (allRequiredModifiersPressed && extraModifiersPressed) {
            handleIncorrect();
        }
    }
  }, [pressedKeys, currentStep, getRequiredKeys, advanceStepOrChallenge, handleIncorrect, isProcessing]);

  const handleVirtualKeyClick = (key: string) => {
      if (isProcessing || feedback !== null) return;
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

      if (currentStep.isSequential) {
          processSequentialKeyPress(normalized);
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
    <div className={cn("relative mx-auto w-full", isVirtualKeyboardMode ? "max-w-4xl" : "max-w-2xl")}>
        <Button asChild variant="outline" className="absolute top-0 right-0 z-10">
            <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
        </Button>

        <Card className={cn(
            "w-full transform transition-all duration-500 mt-12",
            feedback === 'incorrect' && 'animate-shake border-destructive shadow-lg shadow-destructive/20'
        )}>
        <CardHeader>
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-sm">
                    <CardTitle className="text-2xl">{set.name}</CardTitle>
                </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {mode === 'timed' ? (
                    <>
                        <div className={cn("flex items-center gap-2 transition-colors", countdown <= 3 && "text-destructive")}>
                            Remaining time:
                            <span className="font-mono text-lg font-semibold">{countdown}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            Total time: <Timer className="h-4 w-4" />
                            <span>{elapsedTime.toFixed(1)}s</span>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-2 text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full">
                        <BookOpen className="h-4 w-4" />
                        <span>Training Mode</span>
                    </div>
                )}
            </div>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center pt-2">{isMultiStep ? 'Scenario' : 'Challenge'} {currentChallengeIndex + 1} of {set.challenges.length}</p>
        </CardHeader>
        <CardContent className="text-center py-8">
            
            {displayedGridState && (
                <div className="mb-6">
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

            <div className="flex justify-center items-center gap-3 mb-6">
            {ActiveIcon && <ActiveIcon className="w-7 h-7 text-primary" />}
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">{currentChallenge.description}</h2>
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
                        "p-4 rounded-lg transition-all",
                        isCompleted ? "bg-green-500/10" : "bg-muted/50",
                        isActive && feedback !== 'incorrect' && !isAccentuating && "ring-2 ring-primary",
                        isActive && isAccentuating && "ring-2 ring-green-500",
                        isActive && feedback === 'incorrect' && "ring-2 ring-destructive"
                    )}
                    >
                    <div className="flex items-center gap-4">
                        {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        ) : (
                        <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                            <Circle className={cn("w-4 h-4", isActive ? (isAccentuating ? "text-green-500" : "text-primary") : "text-muted-foreground/50")} />
                        </div>
                        )}
                        {ChallengeIcon && (
                            <ChallengeIcon className={cn("w-6 h-6", iconColor)} />
                        )}
                        <p className={cn(
                        "flex-1 font-medium",
                        isCompleted && "text-green-700 line-through",
                        isActive && isAccentuating && "text-green-700",
                        !isActive && !isCompleted && "text-muted-foreground"
                        )}>
                        {step.description}
                        </p>
                    </div>

                    {isActive && (
                        <div className="flex items-center justify-center gap-2 h-10 mt-4">
                        {feedback === 'correct' && <CheckCircle className="h-10 w-10 text-green-500" />}
                        {feedback === 'incorrect' && <XCircle className="h-10 w-10 text-destructive" />}
                        {feedback === null && !isVirtualKeyboardMode && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                            <Keyboard className="h-8 w-8" />
                            <span className="text-lg">Use your keyboard</span>
                            </div>
                        )}
                        {feedback === null && isVirtualKeyboardMode && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                            <MousePointerClick className="h-8 w-8" />
                            <span className="text-lg">Click the keys below</span>
                            </div>
                        )}
                        </div>
                    )}
                    </div>
                    {index < currentChallenge.steps.length - 1 && (
                    <div className="h-6 flex justify-center">
                        <ChevronDown className="w-5 h-5 text-muted-foreground/50" />
                    </div>
                    )}
                </div>
                );
            })}
            </div>
            {isVirtualKeyboardMode && (
                <div className="mt-8">
                    <VisualKeyboard 
                        highlightedKeys={currentStep.isSequential ? sequence : Array.from(pressedKeys)}
                        onKeyClick={handleVirtualKeyClick}
                    />
                </div>
            )}
        </CardContent>
        <CardFooter className="bg-muted/50 min-h-[80px] flex items-center justify-between gap-2 flex-wrap p-4">
            <div className="flex items-center justify-center gap-2">
                {currentStep.isSequential ? (
                sequence.length > 0 ? (
                    sequence.map((key, index) => <KeyDisplay key={index} value={key} />)
                ) : <span className="text-muted-foreground">Press the required keys in sequence...</span>
                ) : (
                pressedKeys.size > 0 ? (
                    Array.from(pressedKeys).map(key => <KeyDisplay key={key} value={key} />)
                ) : (
                    <span className="text-muted-foreground">Press the required keys...</span>
                )
                )}
            </div>
            <Button variant="outline" size="sm" onClick={handleSkip} disabled={isProcessing}>
                Skip {isMultiStep ? 'Scenario' : 'Challenge'} <ChevronsRight className="ml-2 h-4 w-4" />
            </Button>
        </CardFooter>
        </Card>
    </div>
  );
}

    

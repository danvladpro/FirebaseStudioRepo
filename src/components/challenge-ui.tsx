
"use client";

import { useState, useEffect, useCallback, useRef, ElementType } from "react";
import { useRouter } from "next/navigation";
import { ChallengeSet, ChallengeStep, GridState } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Timer, Keyboard, ChevronsRight, Circle, ChevronDown, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import * as icons from "lucide-react";
import { VisualGrid } from "./visual-grid";
import { calculateGridStateForStep } from "@/lib/grid-engine";

interface ChallengeUIProps {
  set: ChallengeSet;
  mode: 'timed' | 'training';
}

const KeyDisplay = ({ value }: { value: string }) => {
    const isModifier = ["Control", "Shift", "Alt", "Meta", "Command", "Option"].includes(value);
    const isLetter = value.length === 1 && value.match(/[a-z]/i);

    const displayValue: Record<string, string> = {
        'Control': 'Ctrl',
        'Meta': 'Cmd',
        'Command': 'Cmd',
        'Alt': 'Alt',
        'Option': 'Opt',
        ' ': 'Space'
    }

    return (
        <kbd className={cn(
            "px-2 py-1.5 text-xs font-semibold rounded-md border-b-2 text-muted-foreground bg-muted",
            isModifier ? "min-w-[4rem] text-center" : "",
            isLetter ? "uppercase" : ""
        )}>
            {displayValue[value] || value}
        </kbd>
    );
};

export default function ChallengeUI({ set, mode }: ChallengeUIProps) {
  const router = useRouter();
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [sequence, setSequence] = useState<string[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [isAccentuating, setIsAccentuating] = useState(false);
  const [skippedIndices, setSkippedIndices] = useState<number[]>([]);
  
  const [countdown, setCountdown] = useState(8);
  const [isMac, setIsMac] = useState(false);

  const currentChallenge = set.challenges[currentChallengeIndex];
  const currentStep = currentChallenge?.steps[currentStepIndex];
  const initialGridState = currentChallenge?.initialGridState ?? null;

  const { gridState: displayedGridState, cellStyles: displayedCellStyles } = initialGridState
    ? calculateGridStateForStep(currentChallenge.steps, initialGridState, currentStepIndex - 1)
    : { gridState: null, cellStyles: {} };

  const { gridState: previewGridState, cellStyles: previewCellStyles } = initialGridState
    ? calculateGridStateForStep(currentChallenge.steps, initialGridState, currentStepIndex)
    : { gridState: null, cellStyles: {} };


  useEffect(() => {
    setIsMac(navigator.userAgent.toLowerCase().includes('mac'));
  }, []);

  const isAdvancing = useRef(false);
  const keydownProcessed = useRef(false);
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
    if (key === "Control" || key === "ControlLeft" || key === "ControlRight") return "Control";
    if (key === "Shift" || key === "ShiftLeft" || key === "ShiftRight") return "Shift";
    if (key === "Alt" || key === "AltLeft" || key === "AltRight") return "Alt";
    if (key === "Meta" || key === "MetaLeft" || key === "MetaRight") return "Meta";
    return key;
  };

  const getRequiredKeys = useCallback(() => {
    if (!currentStep) return new Set();

    const isStrikethrough = currentStep.description.toLowerCase().includes('strikethrough');

    const keys = currentStep.keys.map(k => {
      if (isMac) {
        if (k.toLowerCase() === 'control' && !isStrikethrough) {
          return 'Meta'; 
        }
      }
      return k;
    });
    return new Set(keys.map(k => normalizeKey(k)));
  }, [currentStep, isMac]);

  const resetForNextStep = () => {
    setFeedback(null);
    setIsAccentuating(false);
    setPressedKeys(new Set());
    setSequence([]);
    keydownProcessed.current = false;
  };

  
  const moveToNextChallenge = useCallback(() => {
    if (isAdvancing.current) return;
    isAdvancing.current = true;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    const isLastChallenge = currentChallengeIndex === set.challenges.length - 1;
    
    if (isLastChallenge) {
        finishChallenge();
        return;
    }

    setTimeout(() => {
        setCurrentChallengeIndex(prev => prev + 1);
        setCurrentStepIndex(0);
        resetForNextStep();
        setCountdown(8);
        isAdvancing.current = false;
    }, 300);
  }, [currentChallengeIndex, set.challenges.length, finishChallenge]);

  const handleSkip = useCallback(() => {
    const newSkippedIndices = [...skippedIndices, currentChallengeIndex];
    
    if (currentChallengeIndex === set.challenges.length - 1) {
      // If it's the last challenge, finish with the updated skipped list immediately.
      finishChallenge(newSkippedIndices);
    } else {
      // Otherwise, update state and move to the next challenge.
      setSkippedIndices(newSkippedIndices);
      moveToNextChallenge();
    }
  }, [moveToNextChallenge, currentChallengeIndex, set.challenges.length, skippedIndices, finishChallenge]);

  const advanceStepOrChallenge = useCallback(() => {
    setFeedback("correct");
    setIsAccentuating(true);
    keydownProcessed.current = true;

    setTimeout(() => {
        const isLastStep = currentStepIndex === currentChallenge.steps.length - 1;
        if (isLastStep) {
            moveToNextChallenge();
        } else {
            setCurrentStepIndex(prev => prev + 1);
            resetForNextStep();
        }
    }, 400); // Increased delay to allow accentuation to be visible
  }, [currentStepIndex, currentChallenge, moveToNextChallenge]);
  
  const handleIncorrect = () => {
    setFeedback("incorrect");
    setTimeout(() => {
      setFeedback(null);
      setPressedKeys(new Set());
      setSequence([]);
      keydownProcessed.current = false;
    }, 500);
  };
  
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

        const autoSkip = () => {
           handleSkip();
        }

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
    if (!currentStep || feedback === 'correct') return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
        e.preventDefault();
        if (isAdvancing.current || keydownProcessed.current) return;

        const key = normalizeKey(e.key);

        if (currentStep.isSequential) {
            const newSequence = [...sequence, key];
            setSequence(newSequence);

            const requiredSequence = Array.from(getRequiredKeys()).map(k => normalizeKey(k));
            
            for(let i = 0; i < newSequence.length; i++) {
                if (newSequence[i] !== requiredSequence[i]) {
                    handleIncorrect();
                    return;
                }
            }
            
            if (newSequence.length === requiredSequence.length) {
                keydownProcessed.current = true;
                advanceStepOrChallenge();
            }
        } else {
            const newKeys = new Set(pressedKeys);
            newKeys.add(key);
            setPressedKeys(newKeys);
            
            const requiredKeys = getRequiredKeys();
            
            const sortedPressed = [...newKeys].sort().join(',');
            const sortedRequired = [...requiredKeys].sort().join(',');

            if (sortedPressed === sortedRequired) {
                keydownProcessed.current = true;
                advanceStepOrChallenge();
            } else if (newKeys.size >= requiredKeys.size) {
                handleIncorrect();
            }
        }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
        e.preventDefault();
        
        if (!currentStep.isSequential && !keydownProcessed.current) {
            setPressedKeys(new Set());
        }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [pressedKeys, sequence, currentStep, advanceStepOrChallenge, getRequiredKeys, feedback]);


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
    <Card className={cn(
        "w-full max-w-2xl transform transition-transform duration-500",
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
        
        {displayedGridState && displayedGridState.data && (
            <div className="mb-6">
                <VisualGrid 
                    data={displayedGridState.data} 
                    selection={displayedGridState.selection} 
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
                      {feedback === null && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Keyboard className="h-8 w-8" />
                          <span className="text-lg">Use your keyboard</span>
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
        <Button variant="outline" size="sm" onClick={handleSkip} disabled={isAdvancing.current} className="hover:bg-primary/10 hover:text-primary">
            Skip {isMultiStep ? 'Scenario' : 'Challenge'} <ChevronsRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

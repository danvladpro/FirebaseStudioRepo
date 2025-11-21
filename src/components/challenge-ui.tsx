
"use client";

import { useState, useEffect, useCallback, useRef, ElementType } from "react";
import { useRouter } from "next/navigation";
import { ChallengeSet, ChallengeStep } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Timer, Keyboard, ChevronsRight, StepForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import * as icons from "lucide-react";

interface ChallengeUIProps {
  set: ChallengeSet;
}

const KeyDisplay = ({ value, isNext }: { value: string, isNext?: boolean }) => {
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
            "px-2 py-1.5 text-xs font-semibold rounded-md border-b-2",
             isNext ? "text-primary-foreground bg-primary" : "text-muted-foreground bg-muted",
            isModifier ? "min-w-[4rem] text-center" : "",
            isLetter ? "uppercase" : ""
        )}>
            {displayValue[value] || value}
        </kbd>
    );
};


export default function ChallengeUI({ set }: ChallengeUIProps) {
  const router = useRouter();
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [sequence, setSequence] = useState<string[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [skippedIndices, setSkippedIndices] = useState<number[]>([]);
  
  const [countdown, setCountdown] = useState(8);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.userAgent.toLowerCase().includes('mac'));
  }, []);

  const isAdvancing = useRef(false);
  const keydownProcessed = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentChallenge = set.challenges[currentChallengeIndex];
  const currentStep = currentChallenge?.steps[currentStepIndex];

  const finishChallenge = useCallback((finalSkipped: number[]) => {
      const duration = (Date.now() - startTime) / 1000;
      const skippedParam = finalSkipped.join(',');
      router.push(`/results?setId=${set.id}&time=${duration.toFixed(2)}&skipped=${finalSkipped.length}&skippedIndices=${skippedParam}`);
  },[router, set.id, startTime]);


  const normalizeKey = (key: string) => {
    if (key === "Control" || key === "ControlLeft" || key === "ControlRight") return "Control";
    if (key === "Shift" || key === "ShiftLeft" || key === "ShiftRight") return "Shift";
    if (key === "Alt" || key === "AltLeft" || key === "AltRight") return "Alt";
    if (key === "Meta" || key === "MetaLeft" || key === "MetaRight") return "Meta";
    return key;
  };

  const getRequiredKeys = useCallback(() => {
    if (!currentStep) return new Set();

    // Strikethrough (Ctrl+5) is an exception, it's the same on Mac and Windows.
    const isStrikethrough = currentStep.description.toLowerCase().includes('strikethrough');

    const keys = currentStep.keys.map(k => {
      if (isMac) {
        if (k.toLowerCase() === 'control' && !isStrikethrough) {
          return 'Meta'; // On Mac, 'Control' from challenges should map to 'Command' (Meta) key
        }
      }
      return k;
    });
    return new Set(keys.map(k => normalizeKey(k)));
  }, [currentStep, isMac]);

  
  const moveToNextChallenge = useCallback((updatedSkippedIndices: number[]) => {
    if (isAdvancing.current) return;
    isAdvancing.current = true;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    const isLastChallenge = currentChallengeIndex === set.challenges.length - 1;
    
    if (isLastChallenge) {
        finishChallenge(updatedSkippedIndices);
        return;
    }

    setTimeout(() => {
        setSkippedIndices(updatedSkippedIndices);
        setCurrentChallengeIndex(prev => prev + 1);
        setCurrentStepIndex(0);
        setFeedback(null);
        setPressedKeys(new Set());
        setSequence([]);
        setCountdown(8);
        keydownProcessed.current = false;
        isAdvancing.current = false;
    }, 300);
  }, [currentChallengeIndex, set.challenges.length, finishChallenge]);

  const handleSkip = useCallback(() => {
    const newSkipped = [...skippedIndices, currentChallengeIndex];
    moveToNextChallenge(newSkipped);
  }, [moveToNextChallenge, currentChallengeIndex, skippedIndices]);

  const advanceStepOrChallenge = useCallback(() => {
    const isLastStep = currentStepIndex === currentChallenge.steps.length - 1;
    if (isLastStep) {
        setFeedback("correct");
        moveToNextChallenge(skippedIndices);
    } else {
        setFeedback("correct");
        setTimeout(() => {
            setCurrentStepIndex(prev => prev + 1);
            setFeedback(null);
            setPressedKeys(new Set());
            setSequence([]);
            keydownProcessed.current = false;
        }, 300);
    }
  }, [currentStepIndex, currentChallenge, skippedIndices, moveToNextChallenge]);
  
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
    if(startTime === 0) return;

    const timer = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
    }, 100);
    return () => clearInterval(timer);
  }, [startTime]);
  
    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);

        setCountdown(8);

        const autoSkip = () => {
            const newSkipped = [...skippedIndices, currentChallengeIndex];
            moveToNextChallenge(newSkipped);
        }

        timeoutRef.current = setTimeout(autoSkip, 8000);
        
        intervalRef.current = setInterval(() => {
            setCountdown(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [currentChallengeIndex, currentStepIndex, skippedIndices, moveToNextChallenge]);


  useEffect(() => {
    if (!currentStep) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
        e.preventDefault();
        if (isAdvancing.current || keydownProcessed.current) return;

        const key = normalizeKey(e.key);

        if (currentStep.isSequential) {
            const newSequence = [...sequence, key];
            setSequence(newSequence);

            const requiredSequence = Array.from(getRequiredKeys()).map(k => normalizeKey(k));
            
            // Check if the current sequence is a valid prefix
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
  }, [pressedKeys, sequence, currentStep, advanceStepOrChallenge, getRequiredKeys]);


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

  const ChallengeIcon = icons[currentStep.iconName] as ElementType;
  const isMultiStep = currentChallenge.steps.length > 1;

  return (
    <Card className={cn(
        "w-full max-w-2xl transform transition-transform duration-500",
        feedback === 'correct' && 'border-green-500 shadow-lg shadow-green-500/20',
        feedback === 'incorrect' && 'animate-shake border-destructive shadow-lg shadow-destructive/20'
    )}>
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-sm">
                <CardTitle className="text-2xl">{set.name}</CardTitle>
            </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className={cn("flex items-center gap-2 transition-colors", countdown <= 3 && "text-destructive")}>
              Remaining time:
              <span className="font-mono text-lg font-semibold">{countdown}</span>
            </div>
            <div className="flex items-center gap-2">
                Total time: <Timer className="h-4 w-4" />
                <span>{elapsedTime.toFixed(1)}s</span>
            </div>
          </div>
        </div>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground text-center pt-2">{isMultiStep ? 'Scenario' : 'Challenge'} {currentChallengeIndex + 1} of {set.challenges.length}</p>
      </CardHeader>
      <CardContent className="text-center py-12">
        {isMultiStep && (
            <div className="mb-4">
                <p className="text-sm text-muted-foreground">Step {currentStepIndex + 1} of {currentChallenge.steps.length}</p>
            </div>
        )}
        <p className="text-xl md:text-2xl font-semibold text-foreground mb-6">{currentStep.description}</p>
        <div className="flex justify-center items-center h-24 bg-muted rounded-lg mb-6 overflow-hidden">
             {ChallengeIcon && <ChallengeIcon className="w-16 h-16 text-primary" />}
        </div>
        <div className="flex items-center justify-center gap-2 h-10">
          {feedback === 'correct' && <CheckCircle className="h-10 w-10 text-green-500" />}
          {feedback === 'incorrect' && <XCircle className="h-10 w-10 text-destructive" />}
          {feedback === null && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Keyboard className="h-8 w-8" />
              <span className="text-lg">Use your keyboard</span>
            </div>
          )}
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
        <Button variant="outline" size="sm" onClick={handleSkip} disabled={isAdvancing.current}>
            Skip Scenario <ChevronsRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

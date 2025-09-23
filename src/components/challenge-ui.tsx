
"use client";

import { useState, useEffect, useCallback, useRef, ElementType } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChallengeSet } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Timer, Keyboard, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import * as icons from "lucide-react";
import { useAuth } from "./auth-provider";


interface ChallengeUIProps {
  set: ChallengeSet;
}

const KeyDisplay = ({ value }: { value: string }) => {
    const isModifier = ["Control", "Shift", "Alt", "Meta"].includes(value);
    const isLetter = value.length === 1 && value.match(/[a-z]/i);

    return (
        <kbd className={cn(
            "px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted rounded-md border-b-2",
            isModifier ? "min-w-[4rem] text-center" : "",
            isLetter ? "uppercase" : ""
        )}>
            {value === " " ? "Space" : value}
        </kbd>
    );
};


export default function ChallengeUI({ set }: ChallengeUIProps) {
  const router = useRouter();
  const { isGuest } = useAuth();
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [skippedIndices, setSkippedIndices] = useState<number[]>([]);
  
  const [countdown, setCountdown] = useState(8);

  const isAdvancing = useRef(false);
  const keydownProcessed = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentChallenge = set.challenges[currentChallengeIndex];

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
  
  const moveToNext = useCallback((updatedSkippedIndices?: number[]) => {
    if (isAdvancing.current) return;
    isAdvancing.current = true;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }

    const isLastChallenge = currentChallengeIndex === set.challenges.length - 1;
    
    setTimeout(() => {
        if (isLastChallenge) {
           finishChallenge(updatedSkippedIndices || skippedIndices);
        } else {
            setCurrentChallengeIndex(prev => prev + 1);
            setFeedback(null);
            setPressedKeys(new Set());
            setCountdown(8);
            keydownProcessed.current = false;
            isAdvancing.current = false;
        }
    }, 300);
  }, [currentChallengeIndex, set.challenges.length, finishChallenge, skippedIndices]);

  const handleSkip = useCallback(() => {
    if (isAdvancing.current) return;
    const newSkipped = [...skippedIndices, currentChallengeIndex];
    setSkippedIndices(newSkipped);
    moveToNext(newSkipped);
  }, [moveToNext, currentChallengeIndex, skippedIndices]);

  const advanceChallenge = useCallback(() => {
    setFeedback("correct");
    moveToNext();
  }, [moveToNext]);
  
  const handleIncorrect = () => {
    setFeedback("incorrect");
    setTimeout(() => {
      setFeedback(null);
      setPressedKeys(new Set());
      keydownProcessed.current = false;
    }, 500);
  };
  
  useEffect(() => {
    if (currentChallengeIndex === 0 && startTime === 0) {
      setStartTime(Date.now());
    }
  }, [currentChallengeIndex, startTime]);

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

        timeoutRef.current = setTimeout(() => {
            handleSkip();
        }, 8000);
        
        intervalRef.current = setInterval(() => {
            setCountdown(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [currentChallengeIndex, handleSkip]);


  useEffect(() => {
    if (!currentChallenge) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      if (isAdvancing.current || keydownProcessed.current) return;

      const key = normalizeKey(e.key);
      const newKeys = new Set(pressedKeys);
      newKeys.add(key);
      setPressedKeys(newKeys);
      
      const requiredKeys = new Set(currentChallenge.keys.map(k => normalizeKey(k)));
      
      const sortedPressed = [...newKeys].sort().join(',');
      const sortedRequired = [...requiredKeys].sort().join(',');

      if (sortedPressed === sortedRequired) {
        keydownProcessed.current = true;
        advanceChallenge();
      } else if (newKeys.size >= requiredKeys.size) {
        handleIncorrect();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
        e.preventDefault();
        
        if (!keydownProcessed.current) {
            setPressedKeys(new Set());
        }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [pressedKeys, currentChallenge, advanceChallenge]);


  const progress = ((currentChallengeIndex + 1) / set.challenges.length) * 100;
  
  if (!currentChallenge) {
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

  const ChallengeIcon = icons[currentChallenge.iconName] as ElementType;

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
        <p className="text-sm text-muted-foreground text-center pt-2">{currentChallengeIndex + 1} of {set.challenges.length}</p>
      </CardHeader>
      <CardContent className="text-center py-12">
        <p className="text-xl md:text-2xl font-semibold text-foreground mb-6">{currentChallenge.description}</p>
        <div className="flex justify-center items-center h-24 bg-muted rounded-lg mb-6 overflow-hidden">
             {ChallengeIcon && <ChallengeIcon className="w-16 h-16 text-primary" />}
        </div>
        <div className="flex items-center justify-center gap-2 h-10">
          {feedback === 'correct' && <CheckCircle className="h-10 w-10 text-green-500" />}
          {feedback === 'incorrect' && <XCircle className="h-10 w-10 text-destructive" />}
          {feedback === null && <Keyboard className="h-10 w-10 text-muted-foreground" />}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 min-h-[80px] flex items-center justify-between gap-2 flex-wrap p-4">
        <div className="flex items-center justify-center gap-2">
            {pressedKeys.size > 0 ? (
            Array.from(pressedKeys).map(key => <KeyDisplay key={key} value={key} />)
            ) : (
            <span className="text-muted-foreground">Press the required keys...</span>
            )}
        </div>
        <Button variant="outline" size="sm" onClick={handleSkip} disabled={isAdvancing.current}>
            Skip <ChevronsRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

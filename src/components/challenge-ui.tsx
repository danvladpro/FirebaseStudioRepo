"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChallengeSet } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Timer, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  const currentChallenge = set.challenges[currentChallengeIndex];

  const normalizeKey = (key: string) => {
    if (key === "Control" || key === "ControlLeft" || key === "ControlRight") return "Control";
    if (key === "Shift" || key === "ShiftLeft" || key === "ShiftRight") return "Shift";
    if (key === "Alt" || key === "AltLeft" || key === "AltRight") return "Alt";
    if (key === "Meta" || key === "MetaLeft" || key === "MetaRight") return "Meta";
    return key;
  };

  const advanceChallenge = useCallback(() => {
    setFeedback("correct");
    setTimeout(() => {
      if (currentChallengeIndex < set.challenges.length - 1) {
        setCurrentChallengeIndex(prev => prev + 1);
        setFeedback(null);
      } else {
        const duration = (Date.now() - startTime) / 1000;
        router.push(`/results?setId=${set.id}&time=${duration.toFixed(2)}`);
      }
      setPressedKeys(new Set());
    }, 300);
  }, [currentChallengeIndex, set.challenges.length, set.id, startTime, router]);
  
  const handleIncorrect = () => {
    setFeedback("incorrect");
    setTimeout(() => {
      setFeedback(null);
      setPressedKeys(new Set());
    }, 500);
  };


  useEffect(() => {
    setStartTime(Date.now());
    const timer = setInterval(() => {
      setElapsedTime((Date.now() - startTime) / 1000);
    }, 100);

    return () => clearInterval(timer);
  }, [startTime]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      const key = normalizeKey(e.key);
      
      setPressedKeys(prev => {
          const newKeys = new Set(prev);
          newKeys.add(key);
          
          const requiredKeys = new Set(currentChallenge.keys.map(k => normalizeKey(k)));
          
          if (newKeys.size === requiredKeys.size) {
              const sortedPressed = [...newKeys].sort().join(',');
              const sortedRequired = [...requiredKeys].sort().join(',');
              
              if (sortedPressed === sortedRequired) {
                  // The keys match, but we need to wait for keyup to avoid continuous firing
              } else {
                  handleIncorrect();
              }
          } else if (newKeys.size > requiredKeys.size) {
              handleIncorrect();
          }
          
          return newKeys;
      });
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
        e.preventDefault();
        
        const requiredKeys = new Set(currentChallenge.keys.map(k => normalizeKey(k)));
        const sortedPressed = [...pressedKeys].sort().join(',');
        const sortedRequired = [...requiredKeys].sort().join(',');

        if (sortedPressed === sortedRequired) {
            advanceChallenge();
        }
        
        // Clear only the released key if not advancing. For simplicity, we clear all on advance/incorrect.
        const key = normalizeKey(e.key);
        setPressedKeys(prev => {
            const newKeys = new Set(prev);
            newKeys.delete(key);
            return newKeys;
        });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [pressedKeys, currentChallenge.keys, advanceChallenge]);


  const progress = ((currentChallengeIndex + 1) / set.challenges.length) * 100;

  return (
    <Card className={cn(
        "w-full max-w-2xl transform transition-transform duration-500",
        feedback === 'correct' && 'border-green-500 shadow-lg shadow-green-500/20',
        feedback === 'incorrect' && 'animate-shake border-destructive shadow-lg shadow-destructive/20'
    )}>
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-2xl">{set.name}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="h-4 w-4" />
            <span>{elapsedTime.toFixed(1)}s</span>
          </div>
        </div>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground text-center pt-2">{currentChallengeIndex + 1} of {set.challenges.length}</p>
      </CardHeader>
      <CardContent className="text-center py-16">
        <p className="text-xl md:text-3xl font-semibold text-foreground mb-8">{currentChallenge.description}</p>
        <div className="flex items-center justify-center gap-2 h-10">
          {feedback === 'correct' && <CheckCircle className="h-10 w-10 text-green-500" />}
          {feedback === 'incorrect' && <XCircle className="h-10 w-10 text-destructive" />}
          {feedback === null && <Keyboard className="h-10 w-10 text-muted-foreground" />}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 min-h-[80px] flex items-center justify-center gap-2 flex-wrap p-4">
        {pressedKeys.size > 0 ? (
          Array.from(pressedKeys).map(key => <KeyDisplay key={key} value={key} />)
        ) : (
          <span className="text-muted-foreground">Press the required keys...</span>
        )}
      </CardFooter>
    </Card>
  );
}


"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Drill } from "@/lib/drills";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, X, CheckCircle, Circle, ChevronDown, Keyboard, XCircle } from "lucide-react";
import Confetti from 'react-confetti';
import { useAuth } from "./auth-provider";
import { updateUserPerformance } from "@/app/actions/update-user-performance";
import { toast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";
import { VisualGrid } from "./visual-grid";
import { calculateGridStateForStep } from "@/lib/grid-engine";
import * as icons from 'lucide-react';

interface DrillUIProps {
  drill: Drill;
}

enum RepStatus {
  Pending,
  Correct,
  Incorrect,
}

export function DrillUI({ drill }: DrillUIProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [reps, setReps] = useState<RepStatus[]>(() => Array(drill.repetitions).fill(RepStatus.Pending));
  const [currentRep, setCurrentRep] = useState(0);
  
  const [logicalStepIndex, setLogicalStepIndex] = useState(0);
  const [visualStepIndex, setVisualStepIndex] = useState(0);

  const [stepFeedback, setStepFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [isMac, setIsMac] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [sequence, setSequence] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setIsMac(navigator.userAgent.toLowerCase().includes('mac'));
  }, []);

  const activeStep = drill.steps[logicalStepIndex];

  const { gridState: displayedGridState, cellStyles: displayedCellStyles } = calculateGridStateForStep(
    drill.steps,
    drill.initialGridState!,
    visualStepIndex - 1
  );

  const { gridState: previewGridState, cellStyles: previewCellStyles } = calculateGridStateForStep(
    drill.steps,
    drill.initialGridState!,
    visualStepIndex
  );
  
  const resetForNewRep = useCallback(() => {
    setLogicalStepIndex(0);
    setVisualStepIndex(0);
    setPressedKeys(new Set());
    setSequence([]);
  }, []);
  
  const resetDrill = useCallback(() => {
    setReps(Array(drill.repetitions).fill(RepStatus.Pending));
    setCurrentRep(0);
    setMistakes(0);
    setShowConfetti(false);
    setIsCompleted(false);
    resetForNewRep();
  }, [drill.repetitions, resetForNewRep]);
  
  const normalizeKey = (key: string) => {
    const lower = key.toLowerCase();
    if (["control", "controlleft", "controlright"].includes(lower)) return "Control";
    if (["shift", "shiftleft", "shiftright"].includes(lower)) return "Shift";
    if (["alt", "altleft", "altright"].includes(lower)) return "Alt";
    if (["meta", "metaleft", "metaright", "command", "cmd"].includes(lower)) return "Meta";
    return key;
  };

  const getRequiredKeys = useCallback(() => {
    if (!activeStep) return new Set();

    const keys = activeStep.keys.map(k => {
      if (isMac && k.toLowerCase() === 'control') {
        const isStrikethrough = drill.steps.some(s => s.keys.includes('5'));
        if (!isStrikethrough) {
          return 'Meta';
        }
      }
      return k;
    });
    return new Set(keys);
  }, [activeStep, isMac, drill.steps]);
  
  const finishDrill = useCallback(async () => {
    setIsCompleted(true);
    setLogicalStepIndex(drill.steps.length); // Prevent further input
    setShowConfetti(true);
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
    setTimeout(() => router.push('/dashboard'), 3000);
  }, [drill.id, drill.steps.length, router, user]);

  const handleStepSuccess = useCallback(() => {
    setStepFeedback('correct');

    const isLastStep = logicalStepIndex === drill.steps.length - 1;

    // Advance logical step immediately for next input
    if (isLastStep) {
        const newReps = [...reps];
        newReps[currentRep] = RepStatus.Correct;
        setReps(newReps);

        if (currentRep === drill.repetitions - 1) {
            finishDrill();
        } else {
            setCurrentRep(prev => prev + 1);
            setLogicalStepIndex(0);
        }
    } else {
        setLogicalStepIndex(prev => prev + 1);
    }
    
    setPressedKeys(new Set());
    setSequence([]);

    // After animation, sync visual step
    setTimeout(() => {
        setStepFeedback(null);
        if (isLastStep) {
             if (currentRep < drill.repetitions - 1) {
                setVisualStepIndex(0);
             }
        } else {
             setVisualStepIndex(prev => prev + 1);
        }
    }, 400);

  }, [logicalStepIndex, drill.steps.length, currentRep, reps, drill.repetitions, finishDrill]);


  const handleIncorrect = () => {
    setStepFeedback('incorrect');
    const newReps = [...reps];
    newReps[currentRep] = RepStatus.Incorrect;
    setReps(newReps);
    
    setMistakes(prev => {
        const newMistakeCount = prev + 1;
        if (newMistakeCount >= drill.mistakeLimit) {
            setTimeout(resetDrill, 1000);
        }
        return newMistakeCount;
    });
    
    setTimeout(() => {
        setStepFeedback(null);
        setPressedKeys(new Set());
        setSequence([]);
    }, 500);
  };
  
  const processKeyPress = useCallback((key: string) => {
    if (isCompleted || !activeStep || stepFeedback === 'correct') return;
  
    const requiredKeys = getRequiredKeys();
    const normalizedKey = normalizeKey(key.toLowerCase());
  
    if (activeStep.isSequential) {
      const newSequence = [...sequence, normalizedKey];
      setSequence(newSequence);
      
      const requiredSequence = Array.from(requiredKeys).map(k => normalizeKey(k.toLowerCase()));
      
      for (let i = 0; i < newSequence.length; i++) {
        if (newSequence[i] !== requiredSequence[i]) {
          handleIncorrect();
          return;
        }
      }
      if (newSequence.length === requiredSequence.length) {
        handleStepSuccess();
      }
    } else {
      const newKeys = new Set(pressedKeys);
      newKeys.add(normalizedKey);
      setPressedKeys(newKeys);
      
      const sortedPressed = [...newKeys].sort().join(',');
      const sortedRequired = [...Array.from(requiredKeys).map(k => normalizeKey(k.toLowerCase()))].sort().join(',');
  
      if (sortedPressed === sortedRequired) {
        handleStepSuccess();
      } else if (newKeys.size >= requiredKeys.size) {
        handleIncorrect();
      }
    }
  }, [activeStep, sequence, pressedKeys, getRequiredKeys, handleStepSuccess, handleIncorrect, isCompleted, stepFeedback]);

  useEffect(() => {
    if (isCompleted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      processKeyPress(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
       if (!activeStep?.isSequential) {
          setPressedKeys(new Set());
       }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [pressedKeys, sequence, activeStep, isCompleted, processKeyPress]);

  return (
    <>
     {showConfetti && <Confetti recycle={false} />}
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{drill.name}</CardTitle>
        <CardDescription>{drill.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-center">
            <p className="text-sm text-muted-foreground">Mistakes</p>
            <div className="flex justify-center gap-2 mt-1">
                {[...Array(drill.mistakeLimit)].map((_, i) => (
                    <div key={i} className={cn("w-6 h-6 rounded-full border", i < mistakes ? "bg-destructive" : "bg-muted")}></div>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-8">
          {reps.map((status, index) => (
            <div
              key={index}
              className={cn(
                "h-10 rounded-md transition-all duration-300 flex items-center justify-center font-bold text-lg",
                index === currentRep && !isCompleted && "ring-2 ring-primary",
                status === RepStatus.Pending && "bg-muted text-muted-foreground",
                status === RepStatus.Correct && "bg-green-500 text-white",
                status === RepStatus.Incorrect && "bg-destructive text-white animate-shake"
              )}
            >
              {index + 1}
            </div>
          ))}
        </div>

        <Separator />
        
        <div className="mt-8 grid md:grid-cols-2 gap-8 items-center">
             {displayedGridState && (
                <div className="max-w-md mx-auto">
                    <VisualGrid 
                        data={displayedGridState.data}
                        selection={displayedGridState.selection}
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
                <p className="text-sm text-muted-foreground text-center mb-4">Repetition {currentRep + 1} of {drill.repetitions}</p>
                <div className="flex flex-col gap-2">
                    {drill.steps.map((step, index) => {
                        const Icon = icons[step.iconName];
                        const isStepActive = index === visualStepIndex;
                        const isStepCompleted = index < visualStepIndex;
                        const feedbackClass = isStepActive && stepFeedback === 'incorrect' ? 'ring-2 ring-destructive' : '';
                        const successClass = isStepActive && stepFeedback === 'correct' ? 'ring-2 ring-green-500' : '';

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
                                        </p>
                                    </div>
                                </div>
                                {index < drill.steps.length - 1 && (
                                    <div className="h-6 flex justify-center">
                                        <ChevronDown className="w-5 h-5 text-muted-foreground/50" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

      </CardContent>
       <CardFooter className="bg-muted/50 min-h-[80px] flex items-center justify-center gap-2 flex-wrap p-4">
            {stepFeedback === null && (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Keyboard className="h-8 w-8" />
                    <span className="text-lg">Use your keyboard</span>
                </div>
            )}
            {stepFeedback === 'correct' && <CheckCircle className="h-10 w-10 text-green-500" />}
            {stepFeedback === 'incorrect' && <XCircle className="h-10 w-10 text-destructive" />}
       </CardFooter>
    </Card>
    </>
  );
}

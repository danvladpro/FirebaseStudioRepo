
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Drill } from "@/lib/drills";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, X, CheckCircle, Circle, ChevronDown, Keyboard, XCircle, MousePointerClick, ArrowLeft } from "lucide-react";
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

interface DrillUIProps {
  drill: Drill;
}

enum RepStatus {
  Pending,
  Correct,
  Incorrect,
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

export function DrillUI({ drill }: DrillUIProps) {
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


  useEffect(() => {
    setIsMac(navigator.userAgent.toLowerCase().includes('mac'));
  }, []);

  const activeStep = drill.steps[logicalStepIndex];

  useEffect(() => {
    if (!activeStep || !userProfile?.missingKeys) {
        setIsVirtualKeyboardMode(false);
        return;
    }

    const requiredKeysForStep = activeStep.keys.map(k => k.toLowerCase());
    const userMissingKeys = userProfile.missingKeys.map(k => k.toLowerCase());
    
    // Normalize F-Keys for checking
    const normalizedRequired = requiredKeysForStep.map(k => k.startsWith('f') && k.length > 1 && !isNaN(Number(k.substring(1))) ? 'f-keys (f1-f12)' : k);
    
    const needsVirtual = normalizedRequired.some(key => userMissingKeys.includes(key));
    setIsVirtualKeyboardMode(needsVirtual);
  }, [activeStep, userProfile?.missingKeys]);


  const { gridState: displayedGridState, cellStyles: displayedCellStyles } = drill.initialGridState ? calculateGridStateForStep(
    drill.steps,
    drill.initialGridState!,
    visualStepIndex - 1
  ) : { gridState: null, cellStyles: {} };

  const { gridState: previewGridState, cellStyles: previewCellStyles } = drill.initialGridState ? calculateGridStateForStep(
    drill.steps,
    drill.initialGridState!,
    visualStepIndex
  ) : { gridState: null, cellStyles: {} };
  
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
    resetForNewRep();
  }, [drill.repetitions, resetForNewRep]);
  
  const normalizeKey = (key: string) => {
    const lower = key.toLowerCase();
    if (["control", "ctrl"].includes(lower)) return "control";
    if (["shift"].includes(lower)) return "shift";
    if (["alt", "option"].includes(lower)) return "alt";
    if (["meta", "command", "cmd", "win"].includes(lower)) return "meta";
    if (["delete", "del"].includes(lower)) return "delete";
    if (["enter", "return"].includes(lower)) return isMac ? 'return' : 'enter';
    if (key === ' ') return ' ';
    if (key.startsWith('Arrow')) return key.toLowerCase();
    return lower;
  };

  const getRequiredKeys = useCallback(() => {
    if (!activeStep) return new Set();

    const keys = activeStep.keys.map(k => {
      if (isMac && k.toLowerCase() === 'control') {
        const isStrikethrough = drill.steps.some(s => s.keys.includes('5'));
        if (!isStrikethrough) {
          return 'meta';
        }
      }
      return k;
    });
    return new Set(keys);
  }, [activeStep, isMac, drill.steps]);
  
  const finishDrill = useCallback(async () => {
    setLogicalStepIndex(drill.steps.length); // Prevent further input
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
    router.push(`/drill-results?drillId=${drill.id}`);
  }, [drill.id, router, user]);

  const handleStepSuccess = useCallback(() => {
    setStepFeedback('correct');

    setTimeout(() => {
        setStepFeedback(null);
        setPressedKeys(new Set());
        setSequence([]);

        const isLastVisualStep = visualStepIndex === drill.steps.length - 1;
        
        if (isLastVisualStep) {
            setReps(prevReps => {
                const newReps = [...prevReps];
                newReps[currentRep] = RepStatus.Correct;
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
    }, 400);
  }, [visualStepIndex, currentRep, drill.steps.length, drill.repetitions, finishDrill]);


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
    if (logicalStepIndex >= drill.steps.length || stepFeedback === 'correct') return;
  
    const requiredKeys = getRequiredKeys();
    const normalizedKey = normalizeKey(key);
    
    if (requiredKeys.size === 1 && activeStep.isSequential !== true) {
      const singleRequiredKey = normalizeKey(requiredKeys.values().next().value.toLowerCase());
      if (normalizedKey === singleRequiredKey) {
        handleStepSuccess();
        return;
      }
    }
  
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
  }, [logicalStepIndex, drill.steps.length, stepFeedback, getRequiredKeys, activeStep, sequence, pressedKeys, handleStepSuccess, handleIncorrect]);

  const handleVirtualKeyClick = (key: string) => {
      const normalized = normalizeKey(key);

      if (activeStep.isSequential) {
          processKeyPress(normalized);
      } else {
        const newKeys = new Set(pressedKeys);
        if (newKeys.has(normalized)) {
            newKeys.delete(normalized);
        } else {
            newKeys.add(normalized);
        }
        setPressedKeys(newKeys);
        
        const requiredKeys = getRequiredKeys();
        const normalizedRequiredKeys = new Set(Array.from(requiredKeys).map(k => normalizeKey(k.toLowerCase())));
        const sortedPressed = [...newKeys].sort().join(',');
        const sortedRequired = [...normalizedRequiredKeys].sort().join(',');

        if (sortedPressed === sortedRequired) {
            handleStepSuccess();
        }
      }
  };

  useEffect(() => {
    if (logicalStepIndex >= drill.steps.length || isVirtualKeyboardMode) return;

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
  }, [logicalStepIndex, pressedKeys, sequence, activeStep, processKeyPress, isVirtualKeyboardMode]);

  return (
    <>
    <Card className="w-full max-w-5xl">
      <CardHeader>
        <div className="flex justify-between items-start mb-4">
            <div>
                <CardTitle>{drill.name}</CardTitle>
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
      <CardContent className="border-t pt-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
             {displayedGridState && (
                <div className="max-w-md mx-auto">
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
       <CardFooter className="bg-muted/50 min-h-[50px] flex items-center justify-center gap-4 flex-wrap p-4">
            {stepFeedback === 'correct' && <CheckCircle className="h-10 w-10 text-green-500" />}
            {stepFeedback === 'incorrect' && <XCircle className="h-10 w-10 text-destructive" />}
            {stepFeedback === null && (
              isVirtualKeyboardMode ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MousePointerClick className="h-8 w-8" />
                  <span className="text-lg">Click the keys below</span>
                </div>
              ) : (
                 <div className="flex items-center gap-2">
                    {activeStep.isSequential ? (
                    sequence.length > 0 ? (
                        sequence.map((key, index) => <KeyDisplay key={index} value={key} />)
                    ) : <span className="text-muted-foreground">Press the required keys in sequence...</span>
                    ) : (
                    pressedKeys.size > 0 ? (
                        Array.from(pressedKeys).map(key => <KeyDisplay key={key} value={key} />)
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
        {isVirtualKeyboardMode && (
          <div className="border-t p-4">
              <VisualKeyboard 
                  highlightedKeys={activeStep.isSequential ? sequence : Array.from(pressedKeys)}
                  onKeyClick={handleVirtualKeyClick}
              />
          </div>
        )}
    </Card>
    </>
  );
}

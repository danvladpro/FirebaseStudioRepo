
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
    const isModifier = ["control", "shift", "alt", "meta"].includes(value);
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
            isModifier ? "min-w-[4rem] text-center" : "",
            isLetter ? "uppercase" : ""
        )}>
            {displayValue[value] || capitalizedValue}
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

  const normalizeKey = (key: string) => {
    const lower = key.toLowerCase();
    if (["control", "ctrl", "controlleft", "controlright"].includes(lower)) return "control";
    if (["shift", "shiftleft", "shiftright"].includes(lower)) return "shift";
    if (["alt", "option", "altleft", "altright"].includes(lower)) return "alt";
    if (["meta", "command", "cmd", "win", "metaleft", "metaright"].includes(lower)) return "meta";
    if (lower === 'escape') return 'esc';
    if (lower === ' ') return ' ';
    if (lower.startsWith('arrow')) return lower;
    if (lower === 'enter' || lower === 'return') return isMac ? 'return' : 'enter';
    if (lower === 'backspace') return 'backspace';
    if (lower === 'delete') return 'delete';
    if (lower === 'pageup') return 'pageup';
    if (lower === 'pagedown') return 'pagedown';
    if (lower === 'home') return 'home';
    if (lower === 'end') return 'end';
    if (lower === 'insert') return 'insert';
    return lower;
  };

  const getRequiredKeys = useCallback(() => {
    if (!activeStep) return new Set<string>();
    const isStrikethrough = drill.steps.some(s => s.keys.includes('5'));
    
    const keys = activeStep.keys.map(k => {
      const lowerK = k.toLowerCase();
      if (isMac && lowerK === 'control' && !isStrikethrough) {
          return 'meta';
      }
      return lowerK;
    });
    return new Set(keys);
  }, [activeStep, isMac, drill.steps]);

  useEffect(() => {
    if (!activeStep || !userProfile?.missingKeys) {
        setIsVirtualKeyboardMode(false);
        return;
    }

    const requiredKeysForStep = Array.from(getRequiredKeys());
    const userMissingKeys = userProfile.missingKeys.map(k => k.toLowerCase());
    
    const normalizedRequired = requiredKeysForStep.map(k => k.startsWith('f') && k.length > 1 && !isNaN(Number(k.substring(1))) ? 'f-keys (f1-f12)' : k);
    
    const needsVirtual = normalizedRequired.some(key => userMissingKeys.includes(key));
    setIsVirtualKeyboardMode(needsVirtual);
  }, [activeStep, userProfile?.missingKeys, getRequiredKeys]);


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
  
  const resetDrill = useCallback(() => {
    setReps(Array(drill.repetitions).fill(RepStatus.Pending));
    setCurrentRep(0);
    setMistakes(0);
    setLogicalStepIndex(0);
    setVisualStepIndex(0);
    setPressedKeys(new Set());
    setSequence([]);
  }, [drill.repetitions]);
  
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
  }, [drill.id, router, user, drill.steps.length]);

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

  const handleIncorrect = useCallback(() => {
    setStepFeedback('incorrect');
    setReps(prevReps => {
        const newReps = [...prevReps];
        if (newReps[currentRep] !== RepStatus.Incorrect) {
            newReps[currentRep] = RepStatus.Incorrect;
            setMistakes(prev => {
                const newMistakeCount = prev + 1;
                if (newMistakeCount >= drill.mistakeLimit) {
                    setTimeout(resetDrill, 1000);
                }
                return newMistakeCount;
            });
        }
        return newReps;
    });
    
    setTimeout(() => {
        setStepFeedback(null);
        setPressedKeys(new Set());
        setSequence([]);
    }, 500);
  }, [currentRep, drill.mistakeLimit, resetDrill]);

  const handleVirtualKeyClick = (key: string) => {
      const normalized = normalizeKey(key);

      if (activeStep.isSequential) {
          setSequence(prev => [...prev, normalized]);
      } else {
        setPressedKeys(prev => {
            const newKeys = new Set(prev);
            if (newKeys.has(normalized)) {
                newKeys.delete(normalized);
            } else {
                newKeys.add(normalized);
            }
            return newKeys;
        });
      }
  };

  // Effect for handling physical keyboard input
  useEffect(() => {
    if (logicalStepIndex >= drill.steps.length || stepFeedback !== null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      e.preventDefault();
      const key = normalizeKey(e.key);
      
      setPressedKeys(prev => new Set(prev).add(key));

      if (activeStep?.isSequential) {
        setSequence(prev => [...prev, key]);
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

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [logicalStepIndex, drill.steps.length, stepFeedback, activeStep?.isSequential, isMac]);

  // Effect for processing non-sequential (chord) shortcuts
  useEffect(() => {
    if (logicalStepIndex >= drill.steps.length || stepFeedback !== null || activeStep.isSequential || pressedKeys.size === 0) return;

    const requiredKeys = getRequiredKeys();
    
    const heldNonModifierKeys = Array.from(pressedKeys).filter(k => !['control', 'shift', 'alt', 'meta'].includes(k));

    if (heldNonModifierKeys.length === 0 && requiredKeys.size > 1) {
      if (Array.from(requiredKeys).every(k => ['control', 'shift', 'alt', 'meta'].includes(k))) {
         // All required keys are modifiers, check on size match
      } else {
        return;
      }
    }
    
    const sortedPressed = [...pressedKeys].sort().join(',');
    const sortedRequired = [...requiredKeys].sort().join(',');
  
    if (sortedPressed === sortedRequired) {
        handleStepSuccess();
    } else if (pressedKeys.size >= requiredKeys.size) {
        handleIncorrect();
    }
  }, [pressedKeys, logicalStepIndex, drill.steps.length, stepFeedback, activeStep, getRequiredKeys, handleStepSuccess, handleIncorrect]);

  // Effect for processing sequential shortcuts
  useEffect(() => {
    if (logicalStepIndex >= drill.steps.length || stepFeedback !== null || !activeStep?.isSequential || sequence.length === 0) return;
    
    const requiredKeys = getRequiredKeys();
    const requiredSequence = Array.from(requiredKeys);

    for (let i = 0; i < sequence.length; i++) {
        if (sequence[i] !== requiredSequence[i]) {
            handleIncorrect();
            return;
        }
    }

    if (sequence.length === requiredSequence.length) {
        handleStepSuccess();
    }
  }, [sequence, logicalStepIndex, drill.steps.length, stepFeedback, activeStep, getRequiredKeys, handleIncorrect, handleStepSuccess]);


  return (
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
        <div className="grid md:grid-cols-2 gap-12 items-start">
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
        <div className={cn(
            "min-h-[310px] flex items-center justify-center",
            isVirtualKeyboardMode && "border-t"
        )}>
            {isVirtualKeyboardMode && (
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


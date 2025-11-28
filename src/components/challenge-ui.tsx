
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
import { VisualGrid, GridSelection } from "./visual-grid";

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


const applyGridEffect = (gridState: GridState, step: ChallengeStep, cellStyles: Record<string, React.CSSProperties>): { newGridState: GridState, newCellStyles: Record<string, React.CSSProperties> } => {
    if (!step.gridEffect) return { newGridState: gridState, newCellStyles: cellStyles };

    const { action } = step.gridEffect;
    let newGridData = gridState.data.map(row => [...row]);
    let newSelection: GridSelection = { 
        activeCell: { ...gridState.selection.activeCell },
        selectedCells: new Set(gridState.selection.selectedCells)
    };
    let newCellStyles = { ...cellStyles };

    const { activeCell, selectedCells } = newSelection;

    switch (action) {
        case 'SELECT_ROW':
            newSelection.selectedCells.clear();
            for (let c = 0; c < newGridData[0].length; c++) {
                newSelection.selectedCells.add(`${activeCell.row}-${c}`);
            }
            break;
        case 'SELECT_COLUMN':
            newSelection.selectedCells.clear();
            for (let r = 0; r < newGridData.length; r++) {
                newSelection.selectedCells.add(`${r}-${activeCell.col}`);
            }
            break;
        case 'SELECT_ALL':
            newSelection.selectedCells.clear();
            for (let r = 0; r < newGridData.length; r++) {
                for (let c = 0; c < newGridData[r].length; c++) {
                    newSelection.selectedCells.add(`${r}-${c}`);
                }
            }
            break;
        case 'DELETE_ROW':
            const rowsToDelete = new Set<number>();
            if (selectedCells.size > 0) {
                selectedCells.forEach(cell => rowsToDelete.add(parseInt(cell.split('-')[0])));
            } else {
                rowsToDelete.add(activeCell.row);
            }
            newGridData = newGridData.filter((_, index) => !rowsToDelete.has(index));
            newSelection.selectedCells.clear();
            newSelection.activeCell.row = Math.min(activeCell.row, newGridData.length - 1);
            break;
        case 'CUT':
            (selectedCells.size > 0 ? selectedCells : new Set([`${activeCell.row}-${activeCell.col}`])).forEach(cellId => {
                newCellStyles[cellId] = { ...newCellStyles[cellId], opacity: 0.3, border: '2px dashed gray' };
            });
            break;
        case 'APPLY_STYLE_BOLD':
            (selectedCells.size > 0 ? selectedCells : new Set([`${activeCell.row}-${activeCell.col}`])).forEach(cellId => {
                newCellStyles[cellId] = { ...newCellStyles[cellId], fontWeight: 'bold' };
            });
            break;
        case 'APPLY_STYLE_CURRENCY':
            const cellsToFormat = selectedCells.size > 0 ? selectedCells : new Set([`${activeCell.row}-${activeCell.col}`]);
            cellsToFormat.forEach(cellId => {
                const [r, c] = cellId.split('-').map(Number);
                if (r < newGridData.length && c < newGridData[r].length) {
                    const numericValue = parseFloat(newGridData[r][c].replace(/[^0-9.-]+/g, ""));
                    if (!isNaN(numericValue)) {
                        newGridData[r][c] = `$${numericValue.toFixed(2)}`;
                    }
                }
            });
            break;
    }

    return {
        newGridState: { data: newGridData, selection: newSelection },
        newCellStyles
    };
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
  const [skippedIndices, setSkippedIndices] = useState<number[]>([]);
  
  const [countdown, setCountdown] = useState(8);
  const [isMac, setIsMac] = useState(false);

  const currentChallenge = set.challenges[currentChallengeIndex];
  const currentStep = currentChallenge?.steps[currentStepIndex];
  const initialGridState = currentChallenge?.initialGridState ?? null;

  const deepCloneGridState = (state: GridState): GridState => {
      const newSelectedCells = new Set<string>();
      state.selection.selectedCells.forEach(cell => newSelectedCells.add(cell));
      return {
          data: state.data.map(row => [...row]),
          selection: {
              activeCell: { ...state.selection.activeCell },
              selectedCells: newSelectedCells,
          }
      };
  };

  const calculateGridStateForStep = useCallback((stepIndex: number) => {
    if (!initialGridState) return { gridState: null, cellStyles: {} };

    let runningGridState: GridState = deepCloneGridState(initialGridState);
    let runningCellStyles: Record<string, React.CSSProperties> = {};
    
    for (let i = 0; i <= stepIndex; i++) {
        const step = currentChallenge.steps[i];
        if (step && step.gridEffect) {
            const { newGridState, newCellStyles } = applyGridEffect(runningGridState, step, runningCellStyles);
            runningGridState = newGridState;
            runningCellStyles = { ...runningCellStyles, ...newCellStyles };
        }
    }
    return { gridState: runningGridState, cellStyles: runningCellStyles };
  }, [initialGridState, currentChallenge?.steps]);

  const { gridState: displayedGridState, cellStyles: displayedCellStyles } = calculateGridStateForStep(currentStepIndex - 1);
  const { gridState: previewGridState, cellStyles: previewCellStyles } = calculateGridStateForStep(currentStepIndex);


  useEffect(() => {
    setIsMac(navigator.userAgent.toLowerCase().includes('mac'));
  }, []);

  const isAdvancing = useRef(false);
  const keydownProcessed = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const finishChallenge = useCallback((finalSkipped: number[]) => {
      if (mode === 'training') {
        router.push('/dashboard');
        return;
      }
      const duration = (Date.now() - startTime) / 1000;
      const skippedParam = finalSkipped.join(',');
      router.push(`/results?setId=${set.id}&time=${duration.toFixed(2)}&skipped=${finalSkipped.length}&skippedIndices=${skippedParam}`);
  },[router, set.id, startTime, mode]);


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
    setPressedKeys(new Set());
    setSequence([]);
    keydownProcessed.current = false;
  };

  
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
        resetForNextStep();
        setCountdown(8);
        isAdvancing.current = false;
    }, 300);
  }, [currentChallengeIndex, set.challenges.length, finishChallenge]);

  const handleSkip = useCallback(() => {
    const newSkipped = mode === 'timed' ? [...skippedIndices, currentChallengeIndex] : skippedIndices;
    moveToNextChallenge(newSkipped);
  }, [moveToNextChallenge, currentChallengeIndex, skippedIndices, mode]);

  const advanceStepOrChallenge = useCallback(() => {
    setFeedback("correct");
    keydownProcessed.current = true;

    setTimeout(() => {
        const isLastStep = currentStepIndex === currentChallenge.steps.length - 1;
        if (isLastStep) {
            moveToNextChallenge(skippedIndices);
        } else {
            setCurrentStepIndex(prev => prev + 1);
            resetForNextStep();
        }
    }, 300);
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
    }, [currentChallengeIndex, currentStepIndex, skippedIndices, moveToNextChallenge, mode]);


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
        
        {displayedGridState && displayedGridState.data && displayedGridState.selection && (
            <div className="mb-6">
                <VisualGrid 
                    data={displayedGridState.data} 
                    selection={displayedGridState.selection} 
                    cellStyles={displayedCellStyles}
                    previewState={previewGridState ? {
                        gridState: previewGridState,
                        cellStyles: previewCellStyles,
                    } : null}
                />
            </div>
        )}

        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-6">{currentChallenge.description}</h2>

        <div className="flex flex-col gap-2 text-left">
          {currentChallenge.steps.map((step, index) => {
            const ChallengeIcon = icons[step.iconName] as ElementType;
            const isCompleted = index < currentStepIndex;
            const isActive = index === currentStepIndex;

            return (
              <div key={index}>
                <div
                  className={cn(
                    "p-4 rounded-lg transition-all",
                    isCompleted ? "bg-green-500/10" : "bg-muted/50",
                    isActive && feedback !== 'incorrect' && "ring-2 ring-primary",
                    isActive && feedback === 'incorrect' && "ring-2 ring-destructive"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                         <Circle className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground/50")} />
                      </div>
                    )}
                    <p className={cn(
                      "flex-1 font-medium",
                      isCompleted && "text-green-700 line-through",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}>
                      {step.description}
                    </p>
                    {ChallengeIcon && !initialGridState && <ChallengeIcon className={cn(
                        "w-10 h-10",
                         isCompleted ? "text-green-500" : (isActive ? "text-primary" : "text-muted-foreground/50")
                    )} />}
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
        <Button variant="outline" size="sm" onClick={handleSkip} disabled={isAdvancing.current}>
            Skip {isMultiStep ? 'Scenario' : 'Challenge'} <ChevronsRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

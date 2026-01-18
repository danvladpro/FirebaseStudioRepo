
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Drill } from "@/lib/drills";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import Confetti from 'react-confetti';
import { useAuth } from "./auth-provider";
import { updateUserPerformance } from "@/app/actions/update-user-performance";
import { toast } from "@/hooks/use-toast";

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
  const [mistakes, setMistakes] = useState(0);
  const [isMac, setIsMac] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const keydownProcessed = useRef(false);

  useEffect(() => {
    setIsMac(navigator.userAgent.toLowerCase().includes('mac'));
  }, []);

  const resetDrill = useCallback(() => {
    setReps(Array(drill.repetitions).fill(RepStatus.Pending));
    setCurrentRep(0);
    setMistakes(0);
    setShowConfetti(false);
    setIsCompleted(false);
  }, [drill.repetitions]);

  const normalizeKey = (key: string) => {
    const lower = key.toLowerCase();
    if (lower === "control" || lower === "controlleft" || lower === "controlright") return "Control";
    if (lower === "shift" || lower === "shiftleft" || lower === "shiftright") return "Shift";
    if (lower === "alt" || lower === "altleft" || lower === "altright") return "Alt";
    if (lower === "meta" || lower === "metaleft" || lower === "metaright" || lower === "command" || lower === "cmd") return "Meta";
    return key;
  };

  const getRequiredKeys = useCallback(() => {
    const keys = drill.shortcut.map(k => {
      if (isMac && k.toLowerCase() === 'control') {
        // Basic substitution, can be made more robust
        if (!drill.shortcut.join('').includes('5')) return 'Meta';
      }
      return k;
    });
    return new Set(keys);
  }, [drill.shortcut, isMac]);
  
  const handleSuccess = useCallback(async () => {
    keydownProcessed.current = true;
    const newReps = [...reps];
    newReps[currentRep] = RepStatus.Correct;
    setReps(newReps);

    if (currentRep === drill.repetitions - 1) {
      setIsCompleted(true);
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
    } else {
      setTimeout(() => {
          setCurrentRep(currentRep + 1);
          setPressedKeys(new Set());
          keydownProcessed.current = false;
      }, 100);
    }
  }, [reps, currentRep, drill.id, drill.repetitions, router, user]);


  const handleIncorrect = () => {
    setMistakes(prev => {
        const newMistakeCount = prev + 1;
        const newReps = [...reps];
        newReps[currentRep] = RepStatus.Incorrect;
        setReps(newReps);

        if (newMistakeCount >= drill.mistakeLimit) {
            setTimeout(resetDrill, 1000);
        } else {
             setTimeout(() => {
                 const newRepsAfterMistake = [...reps];
                 newRepsAfterMistake[currentRep] = RepStatus.Pending;
                 setReps(newRepsAfterMistake);
             }, 500);
        }
        return newMistakeCount;
    });
    
    setPressedKeys(new Set());
    keydownProcessed.current = false;
  };


  useEffect(() => {
    if (isCompleted || keydownProcessed.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      const key = normalizeKey(e.key);
      
      const currentPressed = new Set(pressedKeys);
      currentPressed.add(key);
      setPressedKeys(currentPressed);

      const requiredKeys = getRequiredKeys();
      const sortedPressed = [...currentPressed].sort().join(',');
      const sortedRequired = [...requiredKeys].sort().join(',');

      if (sortedPressed === sortedRequired) {
        handleSuccess();
      } else if (currentPressed.size >= requiredKeys.size) {
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
  }, [pressedKeys, getRequiredKeys, handleSuccess, handleIncorrect, isCompleted]);


  return (
    <>
     {showConfetti && <Confetti recycle={false} />}
    <Card className="w-full max-w-2xl">
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

        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {reps.map((status, index) => (
            <div
              key={index}
              className={cn(
                "h-10 rounded-md transition-all duration-300 flex items-center justify-center",
                index === currentRep && !isCompleted && "ring-2 ring-primary",
                status === RepStatus.Pending && "bg-muted",
                status === RepStatus.Correct && "bg-green-500",
                status === RepStatus.Incorrect && "bg-destructive animate-shake"
              )}
            >
                {status === RepStatus.Correct && <Check className="text-white" />}
                {status === RepStatus.Incorrect && <X className="text-white" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
  );
}

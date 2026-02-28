
"use client";

import { useState, useEffect } from "react";
import { AppHeader } from "@/components/app-header";
import { DrillUI } from "@/components/drill-ui";
import { DRILL_SET, ALL_DRILL_STEPS } from "@/lib/drills";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit, Repeat, Target, XCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VisualGrid } from "@/components/visual-grid";
import { calculateGridStateForStep } from "@/lib/grid-engine";
import { FindReplaceDialog } from "@/components/find-replace-dialog";
import { calculateDialogStateForStep, applyDialogEffect } from "@/lib/dialog-engine";
import { CreateTableDialog } from "@/components/create-table-dialog";
import { getSelectionRangeString } from "@/lib/utils";


export default function DrillPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [isStarted, setIsStarted] = useState(false);
  const [animationStep, setAnimationStep] = useState(-1);
  
  const drill = DRILL_SET.drills.find(d => d.id === params.id);
  const drillNumber = searchParams.get('drillNumber');

  useEffect(() => {
    if (isStarted || !drill?.initialGridState || drill.steps.length === 0) return;

    const interval = setInterval(() => {
        setAnimationStep(prev => (prev >= drill.steps.length - 1 ? -1 : prev + 1));
    }, 1200);

    return () => clearInterval(interval);
  }, [isStarted, drill]);

  if (loading) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  if (!user) {
      router.push('/login');
      return null;
  }

  if (!drill) {
    notFound();
  }
  
  if (!isStarted) {
    const drillStepsForEngine = drill.steps.map(stepId => ALL_DRILL_STEPS[stepId]);

    const { gridState: initialDisplayGridState, cellStyles: initialDisplayCellStyles } = drill.initialGridState ? calculateGridStateForStep(
        drillStepsForEngine,
        drill.initialGridState,
        animationStep - 1
    ) : { gridState: null, cellStyles: {} };

    const { gridState: finalDisplayGridState, cellStyles: finalDisplayCellStyles } = drill.initialGridState ? calculateGridStateForStep(
        drillStepsForEngine,
        drill.initialGridState,
        animationStep
    ) : { gridState: null, cellStyles: {} };

    const dialogStateBeforeStep = calculateDialogStateForStep(drillStepsForEngine, animationStep - 1);
    const currentAnimatedStep = drillStepsForEngine[animationStep];
    
    let displayDialogState = dialogStateBeforeStep;

    if (animationStep >= 0 && currentAnimatedStep) {
        // Apply the main effect (e.g., SET_FIND_VALUE), but only if it's not a 'HIDE' action,
        // so we can see the highlight before the dialog disappears.
        if (currentAnimatedStep.dialogEffect && currentAnimatedStep.dialogEffect.action !== 'HIDE') {
            displayDialogState = applyDialogEffect(displayDialogState, currentAnimatedStep.dialogEffect);
        }

        // Now, apply the preview effect to get the highlights.
        if (currentAnimatedStep.previewDialogEffect) {
            displayDialogState = applyDialogEffect(displayDialogState, currentAnimatedStep.previewDialogEffect);
        }
    }

    return (
        <>
            <AppHeader />
            <main className="min-h-screen w-full flex flex-col items-center justify-center bg-muted/40 p-4 pt-20">
                 <div className="w-full max-w-lg mx-auto mb-4 text-right">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>
                <Card className="w-full max-w-lg">
                    <CardHeader className="text-center items-center">
                        <BrainCircuit className="w-12 h-12 text-primary mb-2" />
                        <CardTitle className="text-2xl">Muscle Memory Drill</CardTitle>
                        <CardDescription>Prepare to build speed and accuracy.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg text-center mb-2">{drillNumber ? `${drillNumber}. ` : ''}{drill.name}</h3>
                            <p className="text-sm text-muted-foreground text-center">{drill.description}</p>
                             {drill.initialGridState && (
                                <div className="mt-4 w-full max-w-md mx-auto relative">
                                  <FindReplaceDialog state={displayDialogState} isSuccess={animationStep >= 0} />
                                  <CreateTableDialog
                                    isVisible={!!displayDialogState.createTableDialogVisible}
                                    isHighlighted={displayDialogState.createTableDialogHighlightedButton === 'ok'}
                                    range={getSelectionRangeString(initialDisplayGridState?.sheets[initialDisplayGridState.activeSheetIndex]?.selection)}
                                  />
                                  <VisualGrid
                                     gridState={initialDisplayGridState}
                                     cellStyles={initialDisplayCellStyles}
                                     previewState={finalDisplayGridState ? {
                                         gridState: finalDisplayGridState,
                                         cellStyles: finalDisplayCellStyles,
                                     } : null}
                                     isAccentuating={animationStep >= 0}
                                  />
                                </div>
                            )}
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <h4 className="font-semibold flex items-center justify-center gap-2"><Repeat className="w-4 h-4"/> Repetitions</h4>
                                <p className="text-2xl font-bold text-primary">{drill.repetitions}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold flex items-center justify-center gap-2"><XCircle className="w-4 h-4"/> Mistake Limit</h4>
                                <p className="text-2xl font-bold text-primary">{drill.mistakeLimit}</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" size="lg" onClick={() => setIsStarted(true)}>
                            <Target className="mr-2 h-5 w-5" />
                            Start Drill
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </>
    )
  }

  return (
    <>
        <AppHeader />
        <main className="min-h-screen w-full flex flex-col items-center justify-center bg-muted/40 p-4 pt-20">
            <DrillUI drill={drill} drillNumber={drillNumber} />
        </main>
    </>
  );
}

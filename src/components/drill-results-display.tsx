
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { DRILL_SET } from '@/lib/drills';
import Confetti from 'react-confetti';
import Image from 'next/image';

export default function DrillResultsDisplay() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
      setShowConfetti(true);
  }, []);

  const drillId = searchParams.get('drillId');
  const drill = DRILL_SET.drills.find(d => d.id === drillId);

  if (!drill) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4">
        <p>Invalid drill results data.</p>
        <Button onClick={() => router.push('/dashboard')}>Go Home</Button>
      </div>
    );
  }

  const dashboardPath = `/dashboard`;
  const drillPath = `/drills/${drillId}`;

  return (
    <>
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={1300}
          gravity={0.1}
        />
      )}
      <div className="min-h-screen w-full flex items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle className="text-3xl">
              Drill Complete!
            </CardTitle>
            <CardDescription>{drill.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
                <Image
                    src="/NinjaCelebrate.svg"
                    alt="Ninja Celebrating"
                    width={150}
                    height={150}
                />
            </div>
             <p className="text-muted-foreground">
                Fantastic work! You've strengthened your muscle memory for this flow.
            </p>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button variant="outline" className="w-full" onClick={() => router.push(dashboardPath)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go to Dashboard
            </Button>
            <Button className="w-full" onClick={() => router.push(drillPath)}>
              <RefreshCw className="mr-2 h-4 w-4" /> Play Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

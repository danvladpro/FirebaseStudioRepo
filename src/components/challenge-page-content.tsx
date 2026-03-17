"use client";

import { useState } from 'react';
import { ChallengeSet } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import ChallengeUI from '@/components/challenge-ui';
import { useAuth } from './auth-provider';
import { ChallengePreloader } from './challenge-preloader';

type ChallengeMode = 'timed' | 'training';

export function ChallengePageContent({ challengeSet }: { challengeSet: ChallengeSet }) {
  const { user } = useAuth();
  const [mode, setMode] = useState<ChallengeMode | null>(null);

  if (!user) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
            <p>Please log in to start a challenge.</p>
        </div>
    )
  }

  const handleStart = (selectedMode: ChallengeMode) => {
    setMode(selectedMode);
  };

  return (
    <div className="bg-muted/40 min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1 flex flex-col pt-16">
        {mode === null ? (
          <div className="flex-1 w-full flex items-center justify-center p-4">
            <div className="w-full max-w-4xl flex flex-col items-center gap-4">
              <ChallengePreloader challengeSet={challengeSet} onStart={handleStart} />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-6xl mx-auto flex flex-col flex-1 min-h-0 p-2 sm:p-4">
            <ChallengeUI set={challengeSet} mode={mode} />
          </div>
        )}
      </main>
    </div>
  );
}


"use client";

import { useState, useEffect, useCallback } from 'react';
import { UserStats } from '@/lib/types';
import { CHALLENGE_SETS } from '@/lib/challenges';
import { useAuth } from '@/components/auth-provider';

const getInitialStats = (userId: string | null): UserStats => {
  if (typeof window === 'undefined' || !userId) {
    return {};
  }
  try {
    const item = window.localStorage.getItem(`excel-ninja-stats-${userId}`);
    return item ? JSON.parse(item) : {};
  } catch (error) {
    console.error("Could not load stats from localStorage", error);
    return {};
  }
};

export const usePerformanceTracker = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // When user changes, reload stats from localStorage for that user
    setStats(getInitialStats(user?.uid || null));
    setIsLoaded(true);
  }, [user]);


  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded && user) {
      try {
        window.localStorage.setItem(`excel-ninja-stats-${user.uid}`, JSON.stringify(stats));
      } catch (error) {
        console.error("Could not save stats to localStorage", error);
      }
    }
  }, [stats, isLoaded, user]);

  const updateStats = useCallback((setId: string, time: number, score: number) => {
    const currentSetStats = stats[setId];
    const isPerfectScore = score === 100;
    let newBestTime = currentSetStats?.bestTime ?? null;

    if (isPerfectScore) {
      newBestTime = currentSetStats?.bestTime ? Math.min(currentSetStats.bestTime, time) : time;
    }
    
    setStats(prevStats => ({
      ...prevStats,
      [setId]: {
        bestTime: newBestTime,
        lastTrained: new Date().toISOString(),
        lastScore: score,
      },
    }));
  }, [stats]);
  
  const getTrainedDates = () => {
     return Object.values(stats)
      .map(stat => stat.lastTrained)
      .filter((date): date is string => !!date)
      .map(date => new Date(date));
  }

  const getCompletedSetsCount = () => {
    const practiceSetIds = new Set(CHALLENGE_SETS.map(s => s.id));
    return Object.keys(stats).filter(setId => practiceSetIds.has(setId) && stats[setId].lastTrained).length;
  }
  
  const resetAllStats = useCallback(() => {
    if (typeof window !== 'undefined' && user) {
      try {
        window.localStorage.removeItem(`excel-ninja-stats-${user.uid}`);
        setStats({}); // Reset the state to an empty object
      } catch (error) {
        console.error("Could not reset stats in localStorage", error);
      }
    }
  }, [user]);

  return { stats, isLoaded, updateStats, getTrainedDates, getCompletedSetsCount, resetAllStats };
};

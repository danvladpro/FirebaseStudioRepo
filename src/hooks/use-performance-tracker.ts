
"use client";

import { useState, useEffect, useCallback } from 'react';
import { UserStats } from '@/lib/types';
import { CHALLENGE_SETS } from '@/lib/challenges';
import { useAuth } from '@/components/auth-provider';

const getInitialStats = (): UserStats => {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const item = window.localStorage.getItem('excel-ninja-stats');
    return item ? JSON.parse(item) : {};
  } catch (error) {
    console.error("Could not load stats from localStorage", error);
    return {};
  }
};

export const usePerformanceTracker = () => {
  const [stats, setStats] = useState<UserStats>(getInitialStats());
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();


  useEffect(() => {
    // When user changes, reload stats from localStorage
    setStats(getInitialStats());
    setIsLoaded(true);
  }, [user]);


  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      try {
        window.localStorage.setItem('excel-ninja-stats', JSON.stringify(stats));
      } catch (error) {
        console.error("Could not save stats to localStorage", error);
      }
    }
  }, [stats, isLoaded]);

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
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('excel-ninja-stats');
        setStats({}); // Reset the state to an empty object
      } catch (error) {
        console.error("Could not reset stats in localStorage", error);
      }
    }
  }, []);

  return { stats, isLoaded, updateStats, getTrainedDates, getCompletedSetsCount, resetAllStats };
};


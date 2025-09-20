
"use client";

import { useState, useEffect, useCallback } from 'react';
import { UserStats } from '@/lib/types';
import { CHALLENGE_SETS } from '@/lib/challenges';

const aDay = 1000 * 60 * 60 * 24;

export const usePerformanceTracker = () => {
  const [stats, setStats] = useState<UserStats>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedStats = localStorage.getItem('excel-ninja-stats');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error("Could not load stats from local storage", error);
    }
    setIsLoaded(true);
  }, []);

  const updateStats = useCallback((setId: string, time: number, score: number) => {
    setStats(prevStats => {
      const newStats = { ...prevStats };
      const currentSetStats = newStats[setId];
      
      const isPerfectScore = score === 100;
      let newBestTime = currentSetStats?.bestTime;

      if(isPerfectScore) {
          newBestTime = currentSetStats?.bestTime ? Math.min(currentSetStats.bestTime, time) : time;
      }

      newStats[setId] = {
        bestTime: newBestTime,
        lastTrained: new Date().toISOString(),
        lastScore: score,
      };

      try {
        localStorage.setItem('excel-ninja-stats', JSON.stringify(newStats));
      } catch (error) {
        console.error("Could not save stats to local storage", error);
      }

      return newStats;
    });
  }, []);
  
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

  return { stats, isLoaded, updateStats, getTrainedDates, getCompletedSetsCount };
};

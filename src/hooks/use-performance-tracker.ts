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

  const updateStats = useCallback((setId: string, time: number) => {
    setStats(prevStats => {
      const newStats = { ...prevStats };
      const currentSetStats = newStats[setId];
      const newBestTime = currentSetStats?.bestTime ? Math.min(currentSetStats.bestTime, time) : time;

      newStats[setId] = {
        bestTime: newBestTime,
        lastTrained: new Date().toISOString(),
      };

      try {
        localStorage.setItem('excel-ninja-stats', JSON.stringify(newStats));
      } catch (error) {
        console.error("Could not save stats to local storage", error);
      }

      return newStats;
    });
  }, []);

  const getOverallBestTime = () => {
    const allTimes = Object.values(stats)
      .map(stat => stat.bestTime)
      .filter((time): time is number => time !== null);

    return allTimes.length > 0 ? Math.min(...allTimes) : null;
  };
  
  const getLastTrainedDate = () => {
    const allDates = Object.values(stats)
      .map(stat => stat.lastTrained)
      .filter((date): date is string => date !== null)
      .map(date => new Date(date));
      
    if (allDates.length === 0) return null;

    const mostRecentDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    const today = new Date();
    
    const diffDays = Math.floor((today.getTime() - mostRecentDate.getTime()) / aDay);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const getPerformanceDataForAI = () => {
    const performanceData: Record<string, number> = {};
    CHALLENGE_SETS.forEach(set => {
      if (stats[set.id] && stats[set.id].bestTime) {
        performanceData[set.category] = stats[set.id].bestTime!;
      }
    });
    return performanceData;
  };

  return { stats, isLoaded, updateStats, getOverallBestTime, getLastTrainedDate, getPerformanceDataForAI };
};

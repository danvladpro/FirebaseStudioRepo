
"use client";

import { useState, useEffect, useCallback } from 'react';
import { UserStats } from '@/lib/types';
import { CHALLENGE_SETS } from '@/lib/challenges';
import { useAuth } from '@/components/auth-provider';
import { getPerformanceStats, updateUserStats } from '@/lib/performance-service';

export const usePerformanceTracker = () => {
  const [stats, setStats] = useState<UserStats>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (user) {
        try {
          const fetchedStats = await getPerformanceStats(user.uid);
          setStats(fetchedStats);
        } catch (error) {
          console.error("Could not load stats from Firestore", error);
        } finally {
          setIsLoaded(true);
        }
      } else {
        // Not logged in, no stats to fetch from DB
        setIsLoaded(true);
        setStats({});
      }
    };

    fetchStats();
  }, [user]);

  const updateStats = useCallback(async (setId: string, time: number, score: number) => {
    if (!user) return;

    const currentSetStats = stats[setId];
    const isPerfectScore = score === 100;
    let newBestTime = currentSetStats?.bestTime ?? null;

    if (isPerfectScore) {
      newBestTime = currentSetStats?.bestTime ? Math.min(currentSetStats.bestTime, time) : time;
    }
    
    const newRecord = {
      bestTime: newBestTime,
      lastTrained: new Date().toISOString(),
      lastScore: score,
    };

    setStats(prevStats => ({
      ...prevStats,
      [setId]: newRecord,
    }));

    try {
      await updateUserStats(user.uid, setId, newRecord);
    } catch (error) {
      console.error("Could not save stats to Firestore", error);
      // Optionally revert state or show an error to the user
    }
  }, [user, stats]);
  
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

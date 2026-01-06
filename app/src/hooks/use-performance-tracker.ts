
"use client";

import { useState, useEffect } from 'react';
import { UserStats } from '@/lib/types';
import { ALL_CHALLENGE_SETS, CHALLENGE_SETS } from '@/lib/challenges';
import { useAuth } from '@/components/auth-provider';
import { XP_CONFIG, LEVEL_THRESHOLDS } from '@/components/home-page-client';

export const usePerformanceTracker = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<UserStats>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(LEVEL_THRESHOLDS[0]);

  useEffect(() => {
    if (userProfile) {
      const userStats = userProfile.performance || {};
      setStats(userStats);

      const xp = Object.keys(userStats).reduce((acc, setId) => {
        const set = ALL_CHALLENGE_SETS.find(s => s.id === setId);
        if (set?.level && userStats[setId]?.bestScore === 100) {
          return acc + (XP_CONFIG[set.level] || 0);
        }
        return acc;
      }, 0);
      setTotalXP(xp);

      const level = LEVEL_THRESHOLDS.slice().reverse().find(l => xp >= l.xp) || LEVEL_THRESHOLDS[0];
      setCurrentLevel(level);

      setIsLoaded(true);
    } else {
      setStats({});
      setTotalXP(0);
      setCurrentLevel(LEVEL_THRESHOLDS[0]);
      setIsLoaded(true); 
    }
  }, [userProfile]);

  const getTrainedDates = () => {
     return Object.values(stats)
      .map(stat => stat.lastTrained)
      .filter((date): date is string => !!date)
      .map(date => new Date(date));
  }

  const getCompletedSetsCount = () => {
    const practiceSetIds = new Set(CHALLENGE_SETS.map(s => s.id));
    return Object.keys(stats).filter(setId => 
        practiceSetIds.has(setId) && stats[setId]?.bestScore === 100
    ).length;
  }

  return { stats, isLoaded, totalXP, currentLevel, getTrainedDates, getCompletedSetsCount };
};


"use client";

import { useState, useEffect, useCallback } from 'react';
import { UserStats } from '@/lib/types';
import { CHALLENGE_SETS } from '@/lib/challenges';
import { useAuth } from '@/components/auth-provider';

export const usePerformanceTracker = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<UserStats>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setStats(userProfile.performance || {});
      setIsLoaded(true);
    } else {
      // Handle case where there is no user profile (e.g., logged out)
      setStats({});
      setIsLoaded(true); // Still loaded, just with no data
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
    // A set is completed if it has stats recorded against it
    return Object.keys(stats).filter(setId => practiceSetIds.has(setId) && stats[setId]).length;
  }
  
  // This hook no longer handles updates directly, so reset/update functions are removed.
  // It is now a read-only hook for consuming performance data from AuthContext.

  return { stats, isLoaded, getTrainedDates, getCompletedSetsCount };
};

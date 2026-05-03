import type { ChallengeLevel } from './types';

export const XP_CONFIG: Record<ChallengeLevel | 'General' | 'Scenario', number> = {
  General: 10,
  Apprentice: 20,
  Master: 40,
  Ninja: 60,
  Scenario: 100,
};

export const DRILL_XP = 5;

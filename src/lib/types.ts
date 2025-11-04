
import { type LucideIcon, type LucideProps } from "lucide-react";
import { ElementType } from "react";

export interface Challenge {
  description: string;
  keys: string[];
  iconName: keyof typeof import("lucide-react");
  isSequential?: boolean;
}

export type ChallengeLevel = "Beginner" | "Intermediate" | "Advanced";

export interface ChallengeSet {
  id: string;
  name: string;
  description: string;
  category: string;
  challenges: Challenge[];
  iconName: keyof typeof import("lucide-react");
  level?: ChallengeLevel;
}

export interface PerformanceRecord {
  bestTime: number | null;
  lastTrained: string | null;
  bestScore?: number | null;
}

export interface UserStats {
  [setId: string]: PerformanceRecord;
}

export interface Subscription {
  type: 'one-week' | 'lifetime' | 'weekly';
  status: 'active' | 'inactive';
  expiresAt: string | null; // ISO date string or null for lifetime
  stripeCustomerId?: string | null;
  stripeSessionId?: string;
}


export interface UserProfile {
  email: string;
  name?: string;
  subscription?: Subscription;
  performance?: UserStats;
}

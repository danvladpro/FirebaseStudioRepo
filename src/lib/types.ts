
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
  lastScore?: number | null;
}

export interface UserStats {
  [setId: string]: PerformanceRecord;
}

export interface UserProfile {
  email: string;
  name?: string;
  isPremium: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string | null;
}

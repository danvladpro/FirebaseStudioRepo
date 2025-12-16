
import { type LucideIcon, type LucideProps } from "lucide-react";
import { ElementType } from "react";

export interface GridState {
  data: string[][];
  selection: {
    activeCell: { row: number; col: number };
    selectedCells: Set<string>;
  };
}

export type GridEffectAction =
  | 'SELECT_ROW'
  | 'SELECT_COLUMN'
  | 'SELECT_ALL'
  | 'DELETE_ROW'
  | 'DELETE_COLUMN'
  | 'CUT'
  | 'PASTE'
  | 'MOVE_SELECTION'
  | 'APPLY_STYLE_BOLD'
  | 'APPLY_STYLE_CURRENCY';

export interface GridEffect {
  action: GridEffectAction;
  payload?: any;
}


export interface ChallengeStep {
  description: string;
  keys: string[];
  iconName: keyof typeof import("lucide-react");
  isSequential?: boolean;
  gridEffect?: GridEffect;
}

export interface Challenge {
  description: string;
  keys?: string[]; // Optional for multi-step
  iconName?: keyof typeof import("lucide-react"); // Optional for multi-step
  isSequential?: boolean; // Optional for multi-step
  steps: ChallengeStep[];
  initialGridState?: GridState;
}

export type ChallengeLevel = "Beginner" | "Intermediate" | "Advanced" | "Scenario";

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
  lastTrainedDate?: string;
  certificateId?: string | null;
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

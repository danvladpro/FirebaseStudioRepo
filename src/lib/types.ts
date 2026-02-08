
import { type LucideIcon, type LucideProps } from "lucide-react";
import { ElementType } from "react";

export interface Sheet {
  name: string;
  data: string[][];
  selection: {
    activeCell: { row: number; col: number };
    anchorCell: { row: number; col: number };
  };
}

export interface GridState {
  sheets: Sheet[];
  activeSheetIndex: number;
  clipboard: {
    data: string[][];
    isCut: boolean;
    sourceSheetIndex: number;
    sourceSelection: Sheet['selection'];
  } | null;
}

export type GridEffectAction =
  | 'SELECT_ROW'
  | 'SELECT_COLUMN'
  | 'SELECT_ALL'
  | 'INSERT_ROW'
  | 'DELETE_ROW'
  | 'DELETE_COLUMN'
  | 'DELETE_CONTENT'
  | 'CUT'
  | 'COPY'
  | 'PASTE'
  | 'MOVE_SELECTION'
  | 'MOVE_SELECTION_ADVANCED'
  | 'EXTEND_SELECTION'
  | 'SELECT_TO_EDGE'
  | 'SELECT_TO_END'
  | 'PASTE_STATIC_VALUE'
  | 'APPLY_STYLE_BOLD'
  | 'APPLY_STYLE_ITALIC'
  | 'APPLY_STYLE_UNDERLINE'
  | 'APPLY_STYLE_STRIKETHROUGH'
  | 'APPLY_STYLE_CURRENCY'
  | 'APPLY_STYLE_PERCENTAGE'
  | 'SWITCH_SHEET';

export interface GridEffect {
  action: GridEffectAction;
  payload?: any;
}

export interface FindReplaceDialogState {
  isVisible: boolean;
  activeTab: 'find' | 'replace';
  findValue: string;
  replaceValue: string;
  highlightedButton?: 'findNext' | 'replace' | 'replaceAll' | 'close' | null;
}

export type DialogEffectAction = 'SHOW' | 'HIDE' | 'SET_TAB' | 'SET_FIND_VALUE' | 'SET_REPLACE_VALUE' | 'HIGHLIGHT_BUTTON' | 'CLEAR_HIGHLIGHT';

export interface DialogEffect {
    action: DialogEffectAction;
    payload?: any;
}

export interface ChallengeStep {
  description: string;
  keys: string[];
  iconName: keyof typeof import("lucide-react");
  isSequential?: boolean;
  gridEffect?: GridEffect;
  dialogEffect?: DialogEffect;
}

export interface Challenge {
  description: string;
  keys?: string[]; // Optional for multi-step
  iconName?: keyof typeof import("lucide-react"); // Optional for multi-step
  isSequential?: boolean; // Optional for multi-step
  steps: ChallengeStep[];
  initialGridState?: GridState;
  gridEffect?: GridEffect; // For single-step challenges
}

export type ChallengeLevel = "Beginner" | "Intermediate" | "Advanced" | "Scenario" | "General";

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
  masteryCertificateId?: string | null;
  missingKeys?: string[];
  preview?: boolean;
}

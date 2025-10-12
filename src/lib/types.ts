
import { type LucideIcon, type LucideProps } from "lucide-react";
import { ElementType } from "react";

export interface Challenge {
  description: string;
  keys: string[];
  iconName: keyof typeof import("lucide-react");
  isSequential?: boolean;
}

export interface ChallengeSet {
  id: string;
  name: string;
  description: string;
  category: string;
  challenges: Challenge[];
  iconName: "ClipboardCopy" | "ArrowRightLeft" | "MousePointerSquareDashed" | "Pilcrow" | "FunctionSquare" | "BookMarked" | "Layers" | "Filter" | "GalleryVerticalEnd";
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
  isPremium: boolean;
  stripeCustomerId?: string;
}

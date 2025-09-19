import { type LucideIcon } from "lucide-react";

export interface Challenge {
  description: string;
  keys: string[];
  imageUrl: string;
  imageHint: string;
}

export interface ChallengeSet {
  id: string;
  name: string;
  description: string;
  category: string;
  challenges: Challenge[];
  iconName: "ClipboardCopy" | "ArrowRightLeft" | "MousePointerSquareDashed" | "Pilcrow" | "FunctionSquare" | "BookMarked";
}

export interface PerformanceRecord {
  bestTime: number | null;
  lastTrained: string | null;
}

export interface UserStats {
  [setId: string]: PerformanceRecord;
}

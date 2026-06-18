
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { User } from "firebase/auth";
import type { ChallengeStep, Sheet } from "./types";
import type { DrillStep } from "./drills";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const buildLinkedInUrl = (user: User, certId: string) => {
    if (!user) return "";

    const certName = "Excel Ninja: Certificate of Mastery";
    const issueDate = new Date();
    const issueYear = issueDate.getFullYear();
    const issueMonth = issueDate.getMonth() + 1;

    const linkedInUrl = new URL("https://www.linkedin.com/profile/add");
    linkedInUrl.searchParams.append("startTask", "CERTIFICATION_NAME");
    linkedInUrl.searchParams.append("name", certName);
    // You can register your organization on LinkedIn and get an ID
    // linkedInUrl.searchParams.append("organizationId", "YOUR_LINKEDIN_ORG_ID");
    linkedInUrl.searchParams.append("issueYear", issueYear.toString());
    linkedInUrl.searchParams.append("issueMonth", issueMonth.toString());
    linkedInUrl.searchParams.append("certId", certId);
    
    // Add skills to the certificate
    linkedInUrl.searchParams.append("skills", "Keyboard Shortcuts,Microsoft Excel,Data Analysis,Productivity");
    
    // The URL to a page where someone can verify the certificate.
    const certUrl = `${window.location.origin}/verify?id=${certId}`;
    linkedInUrl.searchParams.append("certUrl", certUrl);

    return linkedInUrl.toString();
  };

// Normalise a `macKeys` field (single combo OR list of alternatives) into a
// uniform list-of-alternatives. `[['control','g'],['f5']]` stays as-is;
// `['meta','c']` becomes `[['meta','c']]`; empty/undefined becomes `[]`.
const toKeySets = (macKeys?: string[] | string[][]): string[][] => {
  if (!macKeys || macKeys.length === 0) return [];
  return Array.isArray(macKeys[0])
    ? (macKeys as string[][])
    : [macKeys as string[]];
};

// FALLBACK only: heuristic Windows→Mac mapping for steps that don't yet carry an
// explicit `macKeys` (currently the inline steps in challenges.ts). Drills are
// fully annotated and never reach this branch. Remove once challenges/flashcards
// are annotated with explicit macKeys.
const heuristicMacKeys = (step: ChallengeStep | DrillStep, winKeys: string[]): string[] => {
  const description = step.description.toLowerCase();

  if (description.includes("autosum")) return ["alt", "meta", "="];
  if (description.includes("replace all")) return ['meta', 'a'];

  // Keys that should remain Control on Mac and not be mapped to Cmd.
  const ctrlExceptions = [
    "date format", "general format", "time format", "strikethrough",
    "currency", "percentage", "create from selection", "name manager",
    "toggle formulas", "toggle autofilter", "replace", "find",
  ];
  const isCtrlException = ctrlExceptions.some(ex => description.includes(ex));

  return winKeys.map(k => {
    if (k === 'enter') return 'return';
    if (k === 'control' && !isCtrlException) return 'meta';
    return k;
  });
};

// Resolve the acceptable key combinations for a step on the current platform,
// as a list of alternatives. Matching succeeds if the user presses ANY one.
export const getPlatformKeySets = (step: ChallengeStep | DrillStep, isMac: boolean): string[][] => {
  const winKeys = (step.keys ?? []).map(k => k.toLowerCase());
  if (winKeys.length === 0) return [];

  if (!isMac) {
    // For "Replace All", Windows uses Alt+A regardless of the base definition.
    if (step.description.toLowerCase().includes("replace all")) return [['alt', 'a']];
    return [winKeys];
  }

  // On Mac the engine reports the Return key as 'return', so map any 'enter' in a
  // Mac combination to 'return' (a platform-input concern, not a shortcut choice).
  const macNormalize = (set: string[]) => set.map(k => (k === 'enter' ? 'return' : k));

  // Explicit Mac mapping wins.
  const macSets = toKeySets(step.macKeys).map(set => macNormalize(set.map(k => k.toLowerCase())));
  if (macSets.length > 0) return macSets;

  // Windows-only: keep the Windows keys (Option stands in for Alt on Mac); the
  // UI surfaces a "Windows-only" call-out separately.
  if (step.windowsOnly) return [macNormalize(winKeys)];

  // Un-annotated (challenges) — temporary heuristic fallback.
  return [macNormalize(heuristicMacKeys(step, winKeys))];
};

// First acceptable combination, for display purposes (key-cap rows, hints).
export const getPlatformKeys = (step: ChallengeStep | DrillStep, isMac: boolean): string[] =>
  getPlatformKeySets(step, isMac)[0] ?? [];

export const isStepWindowsOnly = (step: ChallengeStep | DrillStep, isMac: boolean): boolean =>
  isMac && !!step.windowsOnly;

// Sequential vs combo. Windows ribbon shortcuts (Alt → H → B …) are sequential,
// but their Mac equivalents (in `macKeys`) are all combos — so on Mac a step is
// a combo whenever it has an explicit Mac mapping. Windows-only steps fall back
// to their Windows sequence (which may contain repeated keys, e.g. Alt,W,F,F),
// so they keep `isSequential`.
export const resolveIsSequential = (step: ChallengeStep | DrillStep, isMac: boolean): boolean => {
  if (isMac && step.macKeys && step.macKeys.length > 0) return false;
  return !!step.isSequential;
};

// Keys that most Mac keyboards lack a dedicated cap for — when a step needs one,
// the on-screen (clickable) keyboard is surfaced so Mac users can still input it.
export const MAC_ABSENT_KEYS = ['home', 'end', 'pageup', 'pagedown', 'insert'];

export function getSelectionRangeString(selection: Sheet['selection']): string {
  if (!selection) return '';
  const { activeCell, anchorCell } = selection;
  const minRow = Math.min(anchorCell.row, activeCell.row) + 1;
  const maxRow = Math.max(anchorCell.row, activeCell.row) + 1;
  const minCol = Math.min(anchorCell.col, activeCell.col);
  const maxCol = Math.max(anchorCell.col, activeCell.col);

  const minColChar = String.fromCharCode(65 + minCol);
  const maxColChar = String.fromCharCode(65 + maxCol);

  if (minRow === maxRow && minCol === maxCol) {
    return `=$${minColChar}$${minRow}`;
  }
  return `=$${minColChar}$${minRow}:$${maxColChar}$${maxRow}`;
}

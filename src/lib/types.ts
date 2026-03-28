
import { type LucideIcon, type LucideProps } from "lucide-react";
import { ElementType } from "react";

export interface Sheet {
  name: string;
  data: string[][];
  selection: {
    activeCell: { row: number; col: number };
    anchorCell: { row: number; col: number };
    visibleOnly?: boolean;
  };
  hiddenRows?: Set<number>;
  hiddenColumns?: Set<number>;
  viewport?: {
    startRow: number;
    rowCount: number;
  };
  frozenAt?: { row: number; col: number } | null;
  showGridlines?: boolean;
  groupedRowRanges?: { start: number; end: number }[];
  colWidths?: (number | undefined)[];
  mergedRanges?: {
    start: { row: number; col: number };
    end: { row: number; col: number };
  }[];
  comments?: Record<string, string>;
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
  | 'PASTE_MULTIPLE_VALUES'
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
  | 'APPLY_STYLE_GENERAL'
  | 'SWITCH_SHEET'
  | 'START_EDITING'
  | 'TOGGLE_ABS_REF'
  | 'HIDE_ROW'
  | 'HIDE_COLUMN'
  | 'UNHIDE_ROWS'
  | 'UNHIDE_COLUMNS'
  | 'SCROLL_PAGE_DOWN'
  | 'SCROLL_PAGE_UP'
  | 'AUTOSUM'
  | 'APPLY_TABLE_FORMATTING'
  | 'UPDATE_ACTIVE_CELL_CONTENT'
  | 'SET_SELECTION_MODE'
  | 'APPLY_STYLE_CENTER_ALIGN'
  | 'APPLY_STYLE_MERGE_CENTER'
  | 'APPLY_STYLE_ALL_BORDERS'
  | 'APPLY_STYLE_THICK_BORDER'
  | 'APPLY_STYLE_WRAP_TEXT'
  | 'FREEZE_PANES'
  | 'TOGGLE_GRIDLINES'
  | 'GROUP_ROWS'
  | 'UNGROUP_ROWS'
  | 'AUTOFIT_COLUMNS'
  | 'APPLY_FILL_COLOR'
  | 'INCREASE_DECIMAL'
  | 'DECREASE_DECIMAL'
  | 'SHOW_COMMENT'
  | 'INSERT_LINE_BREAK_IN_FORMULA';

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
  highlightedInput?: 'find' | 'replace' | null;
  createTableDialogVisible?: boolean;
  createTableDialogHighlightedButton?: 'ok' | null;
  goToDialogVisible?: boolean;
  goToDialogReference?: string;
  goToDialogHighlightedButton?: 'ok' | null;
  goToDialogHighlightedInput?: boolean;
  filterDropdownVisible?: boolean;
  filterDropdownHighlightedIndex?: number;
  filterDropdownCheckedState?: boolean[];
  sortDialogVisible?: boolean;
  formatCellsDialogVisible?: boolean;
  formatCellsDialogActiveCategory?: string;
  formatCellsDialogHighlightedCategoryIndex?: number;
  fillColorDropdownVisible?: boolean;
  fillColorDropdownHighlightedColor?: string | null;
}

export type DialogEffectAction = 'SHOW' | 'HIDE' | 'SET_TAB' | 'SET_FIND_VALUE' | 'SET_REPLACE_VALUE' | 'HIGHLIGHT_BUTTON' | 'CLEAR_HIGHLIGHT' | 'HIGHLIGHT_INPUT' | 'SHOW_CREATE_TABLE' | 'HIDE_CREATE_TABLE' | 'HIGHLIGHT_CREATE_TABLE_OK' | 'SHOW_GO_TO' | 'HIDE_GO_TO' | 'SET_GO_TO_REF' | 'HIGHLIGHT_GO_TO_OK' | 'HIGHLIGHT_GO_TO_INPUT' | 'SHOW_FILTER_DROPDOWN' | 'HIDE_FILTER_DROPDOWN' | 'HIGHLIGHT_NEXT_FILTER_ITEM' | 'TOGGLE_FILTER_ITEM' | 'SHOW_SORT_DIALOG' | 'HIDE_SORT_DIALOG' | 'SHOW_FORMAT_CELLS_DIALOG' | 'HIDE_FORMAT_CELLS_DIALOG' | 'MOVE_FORMAT_CELLS_HIGHLIGHT'
 | 'SHOW_FILL_COLOR_DROPDOWN' | 'HIDE_FILL_COLOR_DROPDOWN' | 'MOVE_FILL_COLOR_HIGHLIGHT';

export interface ChallengeStep {
  description: string;
  keys: string[];
  iconName: keyof typeof import("lucide-react");
  isSequential?: boolean;
  gridEffect?: GridEffect;
  dialogEffect?: DialogEffect;
  previewDialogEffect?: DialogEffect;
}

export interface Challenge {
  description: string;
  keys?: string[]; // Optional for multi-step
  iconName?: keyof typeof import("lucide-react"); // Optional for multi-step
  isSequential?: boolean; // Optional for multi-step
  steps: ChallengeStep[];
  initialGridState?: GridState;
  gridEffect?: GridEffect; // For single-step challenges
  dialogEffect?: DialogEffect; // For single-step challenges
}

export type ChallengeLevel = "Apprentice" | "Master" | "Ninja" | "Scenario" | "General";

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

    

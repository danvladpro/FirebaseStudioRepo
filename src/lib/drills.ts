
import { ChallengeLevel, GridEffect, GridState } from "./types";
import { type LucideIcon } from "lucide-react";

export interface DrillStep {
  description: string;
  keys: string[];
  isSequential?: boolean;
  iconName: keyof typeof import("lucide-react");
  gridEffect?: GridEffect;
}

export interface Drill {
    id: string;
    name: string;
    description: string;
    level: ChallengeLevel;
    repetitions: number;
    mistakeLimit: number;
    steps: DrillStep[];
    initialGridState?: GridState;
}

export interface DrillSet {
    id: string;
    name: string;
    drills: Drill[];
}

const defaultDrillGridState: GridState = {
    data: [
        ['Value to Copy', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
    ],
    selection: { activeCell: { row: 0, col: 0 }, selectedCells: new Set(['0-0']) },
};

const dataWithContent: GridState = {
    data: [
        ['Value to Delete', '', ''],
        ['Another Value', '', ''],
        ['', '', ''],
    ],
    selection: { activeCell: { row: 0, col: 0 }, selectedCells: new Set(['0-0']) },
};


const drills: Drill[] = [
    // =======================
// BEGINNER COMBINATION DRILLS
// =======================


{
    id: 'delete-undo-redo',
    level: 'Beginner',
    name: 'Delete, Undo & Redo',
    description: 'Safely remove data and verify changes.',
    repetitions: 15,
    mistakeLimit: 2,
    initialGridState: dataWithContent,
    steps: [
      { description: 'Delete cell content', keys: ['Delete'], iconName: 'Trash2', gridEffect: { action: 'DELETE_CONTENT' } },
      { description: 'Undo deletion', keys: ['Control', 'z'], iconName: 'Undo2', gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value: 'Value to Delete' } } },
      { description: 'Redo deletion', keys: ['Control', 'y'], iconName: 'Redo2', gridEffect: { action: 'DELETE_CONTENT' } }
    ]
  },
  
  {
    id: 'search-cycle-results',
    level: 'Beginner',
    name: 'Search and Cycle Results',
    description: 'Find repeated values quickly.',
    repetitions: 15,
    mistakeLimit: 2,
    steps: [
      { description: 'Open Find', keys: ['Control', 'f'], iconName: 'Search' },
      { description: 'Find next match', keys: ['Enter'], iconName: 'ArrowDownToLine' },
      { description: 'Find next match', keys: ['Enter'], iconName: 'ArrowDownToLine' }
    ]
  },
  
  {
    id: 'replace-decimal',
    level: 'Beginner',
    name: 'Find and Replace Decimal',
    description: 'Replace formatting characters.',
    repetitions: 12,
    mistakeLimit: 2,
    steps: [
      { description: 'Open Replace dialog', keys: ['Control', 'h'], iconName: 'Replace' },
      { description: 'Confirm replacement', keys: ['Enter'], iconName: 'Check' }
    ]
  },
  
  {
    id: 'copy-to-next-sheet',
    level: 'Beginner',
    name: 'Copy to Another Sheet',
    description: 'Move data across worksheets.',
    repetitions: 15,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: [
      { description: 'Copy cell', keys: ['Control', 'c'], iconName: 'Copy', gridEffect: { action: 'CUT' } },
      { description: 'Go to next sheet', keys: ['Control', 'PageDown'], iconName: 'ArrowRightToLine' },
      { description: 'Paste cell', keys: ['Control', 'v'], iconName: 'ClipboardPaste', gridEffect: { action: 'PASTE_STATIC_VALUE', payload: {value: 'Value to Copy'} } }
    ]
  },
  
  {
    id: 'emphasize-and-save',
    level: 'Beginner',
    name: 'Emphasize & Save',
    description: 'Highlight important data and save.',
    repetitions: 12,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: [
      { description: 'Bold text', keys: ['Control', 'b'], iconName: 'Bold', gridEffect: { action: 'APPLY_STYLE_BOLD' } },
      { description: 'Underline text', keys: ['Control', 'u'], iconName: 'Underline', gridEffect: { action: 'APPLY_STYLE_UNDERLINE' } },
      { description: 'Save workbook', keys: ['Control', 's'], iconName: 'Save' }
    ]
  },
  
  {
    id: 'delete-end-of-table',
    level: 'Beginner',
    name: 'Delete End of Table',
    description: 'Quickly reach and clean last value.',
    repetitions: 12,
    mistakeLimit: 2,
    initialGridState: dataWithContent,
    steps: [
      { description: 'Jump to last cell', keys: ['Control', 'End'], iconName: 'PanelBottomOpen', gridEffect: { action: 'MOVE_SELECTION', payload: { direction: 'end' } } },
      { description: 'Delete value', keys: ['Delete'], iconName: 'Trash2', gridEffect: { action: 'DELETE_CONTENT' } }
    ]
  },
  
  {
    id: 'move-up-and-format',
    level: 'Beginner',
    name: 'Move Data Up & Reformat',
    description: 'Relocate and restyle content.',
    repetitions: 12,
    mistakeLimit: 2,
    initialGridState: {
        data: [
            ['', ''],
            ['Value to Move', ''],
        ],
        selection: { activeCell: { row: 1, col: 0 }, selectedCells: new Set(['1-0']) },
    },
    steps: [
      { description: 'Cut value', keys: ['Control', 'x'], iconName: 'Scissors', gridEffect: { action: 'CUT' } },
      { description: 'Move up', keys: ['ArrowUp'], iconName: 'ArrowUp', gridEffect: { action: 'MOVE_SELECTION', payload: { direction: 'up' } } },
      { description: 'Paste value', keys: ['Control', 'v'], iconName: 'ClipboardPaste', gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value: 'Value to Move' } } },
      { description: 'Underline', keys: ['Control', 'u'], iconName: 'Underline', gridEffect: { action: 'APPLY_STYLE_UNDERLINE' } },
      { description: 'Bold', keys: ['Control', 'b'], iconName: 'Bold', gridEffect: { action: 'APPLY_STYLE_BOLD' } }
    ]
  },
  
  {
    id: 'scan-large-data',
    level: 'Beginner',
    name: 'Scan Large Dataset',
    description: 'Review big tables quickly.',
    repetitions: 10,
    mistakeLimit: 2,
    steps: [
      { description: 'Page down', keys: ['PageDown'], iconName: 'ArrowDownToLine' },
      { description: 'Page down', keys: ['PageDown'], iconName: 'ArrowDownToLine' },
      { description: 'Page up', keys: ['PageUp'], iconName: 'ArrowUpToLine' }
    ]
  },
  
  {
    id: 'copy-to-row-edge',
    level: 'Beginner',
    name: 'Copy to Row Edge',
    description: 'Extend values across a row.',
    repetitions: 12,
    mistakeLimit: 2,
    initialGridState: {
        data: [
            ['Copy Me', '', '', 'Paste Here'],
        ],
        selection: { activeCell: { row: 0, col: 0 }, selectedCells: new Set(['0-0']) },
    },
    steps: [
      { description: 'Go to row start', keys: ['Home'], iconName: 'Home', gridEffect: { action: 'MOVE_SELECTION', payload: { direction: 'home' } } },
      { description: 'Copy cell', keys: ['Control', 'c'], iconName: 'Copy' },
      { description: 'Jump to row edge', keys: ['Control', 'ArrowRight'], iconName: 'MoveRight', gridEffect: { action: 'MOVE_SELECTION', payload: { direction: 'edgeRight' } } },
      { description: 'Paste value', keys: ['Control', 'v'], iconName: 'ClipboardPaste', gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value: 'Copy Me' } } }
    ]
  },
  
  {
    id: 'cycle-worksheets',
    level: 'Beginner',
    name: 'Cycle Through Worksheets',
    description: 'Navigate sheets efficiently.',
    repetitions: 10,
    mistakeLimit: 2,
    steps: [
      { description: 'Next worksheet', keys: ['Control', 'PageDown'], iconName: 'ArrowRightToLine' },
      { description: 'Next worksheet', keys: ['Control', 'PageDown'], iconName: 'ArrowRightToLine' },
      { description: 'Previous worksheet', keys: ['Control', 'PageUp'], iconName: 'ArrowLeftToLine' },
      { description: 'Previous worksheet', keys: ['Control', 'PageUp'], iconName: 'ArrowLeftToLine' }
    ]
  },
  
  
    {
        id: 'select-row-delete-flow',
        level: 'Intermediate',
        name: 'Select & Delete Row',
        description: 'Practice selecting and deleting a full row.',
        repetitions: 10,
        mistakeLimit: 2,
        initialGridState: {
            data: [ ['A', 'B'], ['C', 'D'], ['E', 'F'] ],
            selection: { activeCell: { row: 1, col: 0 }, selectedCells: new Set() },
        },
        steps: [
            { description: 'Select Row', keys: ['Shift', ' '], iconName: 'Rows3', gridEffect: { action: 'SELECT_ROW' } },
            { description: 'Delete Row', keys: ['Control', '-'], iconName: 'Trash2', gridEffect: { action: 'DELETE_ROW' } }
        ]
    },
    {
        id: 'filter-column-flow',
        level: 'Intermediate',
        name: 'Apply Filter',
        description: 'Practice adding a filter to a column.',
        repetitions: 10,
        mistakeLimit: 2,
        steps: [
            { description: 'Apply/Clear Filter', keys: ['Control', 'Shift', 'l'], iconName: 'Filter' }
        ]
    },
    {
        id: 'hide-row-flow',
        level: 'Advanced',
        name: 'Hide & Unhide Row',
        description: 'Practice hiding and unhiding a row.',
        repetitions: 8,
        mistakeLimit: 2,
        steps: [
            { description: 'Hide Row', keys: ['Control', '9'], iconName: 'EyeOff' },
            { description: 'Unhide Row', keys: ['Control', 'Shift', '('], iconName: 'Eye' }
        ]
    },
    {
        id: 'center-align-flow',
        level: 'Advanced',
        name: 'Center Align Text',
        description: 'Practice center aligning text using the ribbon shortcut.',
        repetitions: 8,
        mistakeLimit: 2,
        steps: [
            { description: 'Center align cell contents', keys: ['Alt', 'h', 'a', 'c'], isSequential: true, iconName: 'AlignCenter' },
        ]
    }
];

export const DRILL_SET: DrillSet = {
    id: 'micro-flow-drills',
    name: 'Micro-Flow Drills',
    drills: drills,
};

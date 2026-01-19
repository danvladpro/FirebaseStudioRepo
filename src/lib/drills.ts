
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

const drills: Drill[] = [
    {
        id: 'copy-paste-flow',
        level: 'Beginner',
        name: 'Copy & Paste Flow',
        description: 'Practice copying a cell, moving down, and pasting.',
        repetitions: 15,
        mistakeLimit: 2,
        initialGridState: defaultDrillGridState,
        steps: [
            { description: 'Copy', keys: ['Control', 'c'], iconName: 'Copy', gridEffect: { action: 'CUT' } }, // Using CUT for visual effect
            { description: 'Move Down', keys: ['ArrowDown'], iconName: 'ArrowDown', gridEffect: { action: 'MOVE_SELECTION', payload: { direction: 'down', amount: 1 } } },
            { description: 'Paste', keys: ['Control', 'v'], iconName: 'ClipboardPaste', gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value: 'Value to Copy' } } }
        ]
    },
    {
        id: 'bold-italic-flow',
        level: 'Beginner',
        name: 'Formatting Flow',
        description: 'Practice applying bold and then italic formatting.',
        repetitions: 15,
        mistakeLimit: 2,
        initialGridState: defaultDrillGridState,
        steps: [
            { description: 'Bold', keys: ['Control', 'b'], iconName: 'Bold', gridEffect: { action: 'APPLY_STYLE_BOLD' } },
            { description: 'Italicize', keys: ['Control', 'i'], iconName: 'Italic', gridEffect: { action: 'APPLY_STYLE_ITALIC' } }
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

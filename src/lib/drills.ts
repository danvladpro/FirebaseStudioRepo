
import { ChallengeLevel } from "./types";

export interface DrillStep {
  description: string;
  keys: string[];
  isSequential?: boolean;
}

export interface Drill {
    id: string;
    name: string;
    description: string;
    level: ChallengeLevel;
    repetitions: number;
    mistakeLimit: number;
    steps: DrillStep[];
}

export interface DrillSet {
    id: string;
    name: string;
    drills: Drill[];
}

const drills: Drill[] = [
    {
        id: 'copy-paste-flow',
        level: 'Beginner',
        name: 'Copy & Paste Flow',
        description: 'Practice copying a cell, moving down, and pasting.',
        repetitions: 15,
        mistakeLimit: 2,
        steps: [
            { description: 'Copy', keys: ['Control', 'c'] },
            { description: 'Move Down', keys: ['ArrowDown'] },
            { description: 'Paste', keys: ['Control', 'v'] }
        ]
    },
    {
        id: 'bold-italic-flow',
        level: 'Beginner',
        name: 'Formatting Flow',
        description: 'Practice applying bold and then italic formatting.',
        repetitions: 15,
        mistakeLimit: 2,
        steps: [
            { description: 'Bold', keys: ['Control', 'b'] },
            { description: 'Italicize', keys: ['Control', 'i'] }
        ]
    },
    {
        id: 'select-row-delete-flow',
        level: 'Intermediate',
        name: 'Select & Delete Row',
        description: 'Practice selecting and deleting a full row.',
        repetitions: 10,
        mistakeLimit: 2,
        steps: [
            { description: 'Select Row', keys: ['Shift', ' '] },
            { description: 'Delete Row', keys: ['Control', '-'] }
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
            { description: 'Apply/Clear Filter', keys: ['Control', 'Shift', 'l'] }
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
            { description: 'Hide Row', keys: ['Control', '9'] },
            { description: 'Unhide Row', keys: ['Control', 'Shift', '('] }
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
            { description: 'Center align cell contents', keys: ['Alt', 'h', 'a', 'c'], isSequential: true },
        ]
    }
];

export const DRILL_SET: DrillSet = {
    id: 'micro-flow-drills',
    name: 'Micro-Flow Drills',
    drills: drills,
};

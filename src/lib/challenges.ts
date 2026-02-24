
import { ChallengeSet, ChallengeLevel, Challenge, GridState, DialogEffect } from "./types";

const singleStep = (challenge: Omit<Challenge, 'steps'>): Challenge => ({
    ...challenge,
    steps: [{ 
      description: challenge.description, 
      keys: challenge.keys!, 
      iconName: challenge.iconName!, 
      isSequential: challenge.isSequential, 
      gridEffect: challenge.gridEffect,
      dialogEffect: challenge.dialogEffect,
    }]
});

const createDefaultGridState = (): GridState => ({
  sheets: [
    {
      name: 'Sheet1',
      data: [
        ['ID', 'Product', 'Region', 'Sales', 'Commission'],
        ['#101', 'Gadget', 'North', '1200', '5%'],
        ['#102', 'Widget', 'South', '850', '6%'],
        ['#103', 'Doohickey', 'East', '2100', '4%'],
        ['#104', 'Thingamajig', 'West', '500', '7%'],
      ],
      selection: { activeCell: { row: 2, col: 2 }, anchorCell: { row: 2, col: 2 } },
    },
  ],
  activeSheetIndex: 0,
  clipboard: null,
});

const createMultiSheetGridState = (activeSheet: number = 0): GridState => ({
  sheets: [
    {
      name: 'Sheet1',
      data: [
        ['ID', 'Product', 'Region', 'Sales', 'Commission'],
        ['#101', 'Gadget', 'North', '1200', '5%'],
        ['#102', 'Widget', 'South', '850', '6%'],
        ['#103', 'Doohickey', 'East', '2100', '4%'],
        ['#104', 'Thingamajig', 'West', '500', '7%'],
      ],
      selection: { activeCell: { row: 0, col: 0 }, anchorCell: { row: 0, col: 0 } },
    },
    {
      name: 'Sheet2',
      data: [
        ['Summary', 'Total','','',''],
        ['North', '1200','','',''],
        ['South', '850','','',''],
        ['', '','','',''],
        ['', '','','',''],
      ],
      selection: { activeCell: { row: 0, col: 0 }, anchorCell: { row: 0, col: 0 } },
    },
     {
      name: 'Sheet3',
      data: [
        ['Notes', '','','',''],
        ['Check numbers for Q3', '','','',''],
        ['', '','','',''],
        ['', '','','',''],
        ['', '','','','']
      ],
      selection: { activeCell: { row: 0, col: 0 }, anchorCell: { row: 0, col: 0 } },
    }
  ],
  activeSheetIndex: activeSheet,
  clipboard: null,
});

export const CHALLENGE_SETS: ChallengeSet[] = [
  // ==========================================
  // LEVEL 1: BEGINNER (Warp Speed)
  // ==========================================
  {
    id: "warp-speed-navigation",
    name: "Warp Speed Navigation",
    description: "Move across the worksheet like lightning.",
    level: "Beginner",
    category: "Navigation",
    iconName: "Zap",
    challenges: [
      singleStep({ description: "Jump to: Most Right cell", keys: ["Control", "ArrowRight"], iconName: "MoveRight", initialGridState: createDefaultGridState(), gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'edgeRight' } } }),
      singleStep({ description: "Jump to: Beginning of row", keys: ["Home"], iconName: "Home", initialGridState: createDefaultGridState(), gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'home' } } }),
      singleStep({ description: "Jump to: Top-Left (A1)", keys: ["Control", "Home"], iconName: "PanelTopOpen", initialGridState: createDefaultGridState(), gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'topLeft' } } }),
      singleStep({ description: "Jump to: Last Used Cell", keys: ["Control", "End"], iconName: "PanelBottomOpen", initialGridState: createDefaultGridState(), gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'end' } } }),
      singleStep({ description: "Scroll: one Page Down", keys: ["PageDown"], iconName: "ArrowDownToLine", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Scroll: one Page Up", keys: ["PageUp"], iconName: "ArrowUpToLine", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Go to: Next WorkSheet", keys: ["Control", "PageDown"], iconName: "ArrowRightToLine", initialGridState: createMultiSheetGridState(0), gridEffect: { action: 'SWITCH_SHEET', payload: { direction: 'next' } } }),
      singleStep({ description: "Go to: Previous sheet", keys: ["Control", "PageUp"], iconName: "ArrowLeftToLine", initialGridState: createMultiSheetGridState(1), gridEffect: { action: 'SWITCH_SHEET', payload: { direction: 'previous' } } }),
      singleStep({ description: "Open 'Go To' dialog", keys: ["F5"], iconName: "Locate" }),
    ],
  },
  {
    id: "rapid-selection",
    name: "Rapid Selection",
    description: "Selection shortcuts that bypass the mouse.",
    level: "Beginner",
    category: "Selection",
    iconName: "MousePointerSquareDashed",
    challenges: [
      singleStep({ description: "Extend selection", keys: ["Shift", "ArrowRight"], iconName: "MoveRight", initialGridState: createDefaultGridState(), gridEffect: { action: 'EXTEND_SELECTION', payload: { direction: 'right' } } }),
      singleStep({ description: "Select to edge", keys: ["Control", "Shift", "ArrowRight"], iconName: "ArrowRight", initialGridState: createDefaultGridState(), gridEffect: { action: 'SELECT_TO_EDGE', payload: { direction: 'right' } } }),
      singleStep({ description: "Select current region", keys: ["Control", "Shift", "8"], iconName: "AppWindow", initialGridState: createDefaultGridState(), gridEffect: { action: 'SELECT_ALL' } }),
      singleStep({ description: "Select entire sheet", keys: ["Control", "a"], iconName: "Frame" , gridEffect: { action: 'SELECT_ALL' }, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Select to last cell", keys: ["Control", "Shift", "End"], iconName: "ArrowDownRightSquare", initialGridState: createDefaultGridState(), gridEffect: { action: 'SELECT_TO_END' } }),
    ],
  },
  {
    id: "daily-basics",
    name: "Daily Basics",
    description: "Must-know shortcuts for every session.",
    level: "Beginner",
    category: "General",
    iconName: "ClipboardPaste",
    challenges: [
      singleStep({ description: "Save workbook", keys: ["Control", "s"], iconName: "Save", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Undo", keys: ["Control", "z"], iconName: "Undo2", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Redo", keys: ["Control", "y"], iconName: "Redo2", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Copy", keys: ["Control", "c"], iconName: "Copy", gridEffect: { action: 'COPY' }, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Cut", keys: ["Control", "x"], iconName: "Scissors", gridEffect: { action: 'CUT' }, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Paste", keys: ["Control", "v"], iconName: "ClipboardPaste", initialGridState: createDefaultGridState(), gridEffect: { action: 'PASTE' } }),
      singleStep({ description: "Bold", keys: ["Control", "b"], iconName: "Bold", gridEffect: { action: 'APPLY_STYLE_BOLD' }, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Italicize", keys: ["Control", "i"], iconName: "Italic", gridEffect: { action: 'APPLY_STYLE_ITALIC' }, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Underline", keys: ["Control", "u"], iconName: "Underline", gridEffect: { action: 'APPLY_STYLE_UNDERLINE' }, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Strikethrough", keys: ["Control", "5"], iconName: "Strikethrough", gridEffect: { action: 'APPLY_STYLE_STRIKETHROUGH' }, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Open Find", keys: ["Control", "f"], iconName: "Search", initialGridState: createDefaultGridState(), dialogEffect: { action: 'SHOW', payload: { activeTab: 'find' } } }),
      singleStep({ description: "Open Replace", keys: ["Control", "h"], iconName: "Replace", initialGridState: createDefaultGridState(), dialogEffect: { action: 'SHOW', payload: { activeTab: 'replace' } } }),
    ],
  },

  // ==========================================
  // LEVEL 2: INTERMEDIATE (Grid Surgeon)
  // ==========================================
  {
    id: "structural-management",
    name: "Structural Management",
    description: "Add, remove, and hide rows or columns.",
    level: "Intermediate",
    category: "Management",
    iconName: "Layers",
    challenges: [
      singleStep({ description: "Select column", keys: ["Control", " "], iconName: "Columns3", initialGridState: createDefaultGridState(), gridEffect: { action: 'SELECT_COLUMN' } }),
      singleStep({ description: "Select row", keys: ["Shift", " "], iconName: "Rows3", initialGridState: createDefaultGridState(), gridEffect: { action: 'SELECT_ROW' } }),
      singleStep({ description: "Insert row/col", keys: ["Control", "Shift", "="], iconName: "Sheet", initialGridState: createDefaultGridState(), gridEffect: { action: 'INSERT_ROW' } }),
      singleStep({ description: "Delete row/col", keys: ["Control", "-"], iconName: "Trash2", initialGridState: createDefaultGridState(), gridEffect: { action: 'DELETE_ROW' } }),
      singleStep({ description: "Hide rows", keys: ["Control", "9"], iconName: "EyeOff", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Unhide rows", keys: ["Control", "Shift", "9"], iconName: "Eye", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Hide columns", keys: ["Control", "0"], iconName: "EyeOff", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Select visible only", keys: ["Alt", ";"], iconName: "Aperture", initialGridState: createDefaultGridState() }),
    ],
  },
  {
    id: "formula-data-wizard",
    name: "Formula & Data Wizard",
    description: "Handle the logic of the spreadsheet.",
    level: "Intermediate",
    category: "Formulas",
    iconName: "FunctionSquare",
    challenges: [
      singleStep({ description: "Edit cell", keys: ["F2"], iconName: "Pencil", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Start formula", keys: ["="], iconName: "Sigma", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Lock reference (F4)", keys: ["F4"], iconName: "Anchor", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Repeat last action", keys: ["F4"], iconName: "Repeat", initialGridState: createDefaultGridState() }),
      singleStep({ description: "AutoSum", keys: ["Alt", "="], iconName: "Calculator", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Toggle formulas", keys: ["Control", "`"], iconName: "FileCode", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Name Manager", keys: ["Control", "F3"], iconName: "BookUser", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Create from selection", keys: ["Control", "Shift", "F3"], iconName: "CaseUpper", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Create Table", keys: ["Control", "t"], iconName: "Table", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Apply Filter", keys: ["Control", "Shift", "l"], iconName: "Filter", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Filter dropdown", keys: ["Alt", "ArrowDown"], iconName: "ChevronDownSquare", initialGridState: createDefaultGridState() }),
    ],
  },
  {
    id: "data-entry-shortcuts",
    name: "Speed Data Entry",
    description: "Fill data faster than typing.",
    level: "Intermediate",
    category: "Data",
    iconName: "Wand2",
    challenges: [
      singleStep({ description: "Flash Fill", keys: ["Control", "e"], iconName: "Wand2", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Fill Down", keys: ["Control", "d"], iconName: "ArrowDownSquare", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Fill Right", keys: ["Control", "r"], iconName: "ArrowRightSquare", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Insert Date", keys: ["Control", ";"], iconName: "CalendarDays", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Insert Time", keys: ["Control", "Shift", ";"], iconName: "Clock", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Insert line break", keys: ["Alt", "Enter"], iconName: "WrapText", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Insert Comment", keys: ["Shift", "F2"], iconName: "MessageSquarePlus", initialGridState: createDefaultGridState() }),
    ],
  },

  // ==========================================
  // LEVEL 3: ADVANCED (No-Ribbon Master)
  // ==========================================
  {
    id: "presentation-polish",
    name: "Presentation Polish",
    description: "Make it look professional using Alt sequences.",
    level: "Advanced",
    category: "Ribbon",
    iconName: "Palette",
    challenges: [
      singleStep({ description: "Center align", keys: ["Alt", "h", "a", "c"], iconName: "AlignCenter", isSequential: true, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Merge & Center", keys: ["Alt", "h", "m", "c"], iconName: "Merge", isSequential: true, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Wrap Text", keys: ["Alt", "h", "w"], iconName: "WrapText", isSequential: true, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Apply all borders", keys: ["Alt", "h", "b", "a"], iconName: "Grid", isSequential: true, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Thick box border", keys: ["Alt", "h", "b", "t"], iconName: "RectangleHorizontal", isSequential: true, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Fill Color", keys: ["Alt", "h", "h"], iconName: "PaintBucket", isSequential: true, initialGridState: createDefaultGridState() }), // NEW
      singleStep({ description: "Clear formatting", keys: ["Alt", "h", "e", "f"], iconName: "RemoveFormatting", isSequential: true, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Auto-fit width", keys: ["Alt", "h", "o", "i"], iconName: "ArrowUpNarrowWide", isSequential: true, initialGridState: createDefaultGridState() }), // NEW
      singleStep({ description: "Set column width", keys: ["Alt", "h", "o", "w"], iconName: "Columns", isSequential: true, initialGridState: createDefaultGridState() }),
    ],
  },
  {
    id: "number-formatting",
    name: "Financial Formatting",
    description: "Format currencies, dates, and precision.",
    level: "Advanced",
    category: "Formatting",
    iconName: "DollarSign",
    challenges: [
      singleStep({ description: "Currency format", keys: ["Control", "Shift", "4"], iconName: "DollarSign", initialGridState: createDefaultGridState(), gridEffect: { action: 'APPLY_STYLE_CURRENCY' } }),
      singleStep({ description: "Percentage format", keys: ["Control", "Shift", "5"], iconName: "Percent", initialGridState: createDefaultGridState(), gridEffect: { action: 'APPLY_STYLE_PERCENTAGE' } }),
      singleStep({ description: "General format", keys: ["Control", "Shift", "`"], iconName: "Hash", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Date format", keys: ["Control", "Shift", "3"], iconName: "Calendar", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Time format", keys: ["Control", "Shift", "2"], iconName: "Clock", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Increase decimal", keys: ["Alt", "h", "0"], iconName: "PlusCircle", isSequential: true, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Decrease decimal", keys: ["Alt", "h", "9"], iconName: "MinusCircle", isSequential: true, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Open Format Cells", keys: ["Control", "1"], iconName: "Settings2", initialGridState: createDefaultGridState() }),
    ],
  },
  {
    id: "expert-view-management",
    name: "Expert Controls",
    description: "Sorting, freezing, and pasting special.",
    level: "Advanced",
    category: "Data",
    iconName: "ShieldCheck",
    challenges: [
      singleStep({ description: "Open Sort dialog", keys: ["Alt", "d", "s"], iconName: "ArrowDownUp", isSequential: true, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Paste Special", keys: ["Control", "Alt", "v"], iconName: "ClipboardSignature", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Group rows/cols", keys: ["Alt", "Shift", "ArrowRight"], iconName: "Group", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Ungroup rows/cols", keys: ["Alt", "Shift", "ArrowLeft"], iconName: "Ungroup", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Toggle Gridlines", keys: ["Alt", "w", "v", "g"], iconName: "Grid3X3", isSequential: true, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Freeze Panes", keys: ["Alt", "w", "f", "f"], iconName: "Lock", isSequential: true, initialGridState: createDefaultGridState() }),
    ],
  },
];

export const SCENARIO_SETS: ChallengeSet[] = [
    {
        id: "data-manipulation-scenarios",
        name: "Data Manipulation Scenarios",
        description: "Practice common, multi-step data tasks.",
        level: "Scenario",
        category: "Scenario",
        iconName: "BrainCircuit",
        challenges: [
            {
                description: "Select a full row, then delete it.",
                initialGridState: createDefaultGridState(),
                steps: [
                    { description: "Select the entire row", keys: ["Shift", " "], iconName: "Rows3", gridEffect: { action: 'SELECT_ROW' } },
                    { description: "Delete the selected row(s)", keys: ["Control", "-"], iconName: "Trash2", gridEffect: { action: 'DELETE_ROW' } },
                ]
            },
            {
                description: "Select the current table, then cut it.",
                initialGridState: createDefaultGridState(),
                steps: [
                    { description: "Select the entire table", keys: ["Control", "a"], iconName: "Frame", gridEffect: { action: 'SELECT_ALL' } },
                    { description: "Cut the selection", keys: ["Control", "x"], iconName: "Scissors", gridEffect: { action: 'CUT' } },
                ]
            },
            {
                description: "Select a column and format it as Currency.",
                initialGridState: createDefaultGridState(),
                steps: [
                    { description: "Select the entire column", keys: ["Control", " "], iconName: "Columns3", gridEffect: { action: 'SELECT_COLUMN' } },
                    { description: "Apply the Currency format", keys: ["Control", "Shift", "4"], iconName: "DollarSign", gridEffect: { action: 'APPLY_STYLE_CURRENCY'} },
                ]
            },
             {
                description: "Select a range, then bold it.",
                initialGridState: createDefaultGridState(),
                steps: [
                    { description: "Select the entire table", keys: ["Control", "a"], iconName: "Frame", gridEffect: { action: 'SELECT_ALL' }},
                    { description: "Bold the current selection", keys: ["Control", "b"], iconName: "Bold", gridEffect: { action: 'APPLY_STYLE_BOLD' } },
                ]
            },
            {
                description: "Switch to formula view to check your work, then switch back.",
                initialGridState: createDefaultGridState(),
                steps: [
                    { description: "Toggle displaying formulas or values", keys: ["Control", "`"], iconName: "FileCode" },
                    { description: "Toggle displaying formulas or values", keys: ["Control", "`"], iconName: "FileText" },
                ]
            },
        ]
    }
];

const getChallengesByLevel = (level: ChallengeLevel) => {
  return CHALLENGE_SETS.filter(set => set.level === level).flatMap(set => set.challenges);
}

export const BASIC_EXAM: ChallengeSet = {
  id: "exam-basic",
  name: "Basic Exam",
  description: "Test your knowledge of fundamental shortcuts.",
  category: "Exam",
  iconName: "Award",
  challenges: getChallengesByLevel("Beginner")
};

export const INTERMEDIATE_EXAM: ChallengeSet = {
  id: "exam-intermediate",
  name: "Intermediate Exam",
  description: "Test your skills with navigation and data handling.",
  category: "Exam",
  iconName: "Medal",
  challenges: getChallengesByLevel("Intermediate")
};

export const ADVANCED_EXAM: ChallengeSet = {
  id: "exam-advanced",
  name: "Advanced Exam",
  description: "A comprehensive test of all your Excel skills.",
  category: "Exam",
  iconName: "Trophy",
  challenges: [
      ...getChallengesByLevel("Advanced"),
      // Also include some tricky ones from other levels
      singleStep({ description: "Use Flash Fill to automatically fill a column", keys: ["Control", "e"], iconName: "Wand2", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Select only the visible cells in a selection", keys: ["Alt", ";"], iconName: "Aperture", initialGridState: createDefaultGridState() })
  ]
};

export const ALL_EXAM_SETS = [BASIC_EXAM, INTERMEDIATE_EXAM, ADVANCED_EXAM];

export const ALL_CHALLENGE_SETS = [...CHALLENGE_SETS, ...SCENARIO_SETS, ...ALL_EXAM_SETS];

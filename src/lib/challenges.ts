
import { ChallengeSet, ChallengeLevel, Challenge, GridState } from "./types";

const singleStep = (challenge: Omit<Challenge, 'steps'>): Challenge => ({
    ...challenge,
    steps: [{ description: challenge.description, keys: challenge.keys!, iconName: challenge.iconName!, isSequential: challenge.isSequential, gridEffect: challenge.gridEffect }]
});

const defaultGridState: GridState = {
    data: [
      ['ID', 'Product', 'Region', 'Sales', 'Commission'],
      ['#101', 'Gadget', 'North', '1200', '5%'],
      ['#102', 'Widget', 'South', '850', '6%'],
      ['#103', 'Doohickey', 'East', '2100', '4%'],
      ['#104', 'Thingamajig', 'West', '500', '7%'],
    ],
    selection: { activeCell: { row: 0, col: 0 }, selectedCells: new Set(['0-0', '0-1', '0-2', '0-3', '0-4']) },
};
export const CHALLENGE_SETS: ChallengeSet[] = [
  // ==========================================
  // LEVEL 1: BEGINNER (Warp Speed)
  // Goal: Movement and basic selection.
  // ==========================================
  {
    id: "warp-speed-navigation",
    name: "Warp Speed Navigation",
    description: "Move across the worksheet like lightning.",
    level: "Beginner",
    category: "Navigation",
    iconName: "Zap",
    challenges: [
      singleStep({ description: "Move to edge of data", keys: ["Control", "ArrowRight"], iconName: "MoveRight" }),
      singleStep({ description: "Beginning of row", keys: ["Home"], iconName: "Home" }),
      singleStep({ description: "Top-left (A1)", keys: ["Control", "Home"], iconName: "PanelTopOpen" }),
      singleStep({ description: "Last used cell", keys: ["Control", "End"], iconName: "PanelBottomOpen" }),
      singleStep({ description: "Page down", keys: ["PageDown"], iconName: "ArrowDownToLine" }),
      singleStep({ description: "Page up", keys: ["PageUp"], iconName: "ArrowUpToLine" }),
      singleStep({ description: "Next sheet", keys: ["Control", "PageDown"], iconName: "ArrowRightToLine" }),
      singleStep({ description: "Previous sheet", keys: ["Control", "PageUp"], iconName: "ArrowLeftToLine" }),
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
      singleStep({ description: "Extend selection", keys: ["Shift", "ArrowRight"], iconName: "MoveRight" }),
      singleStep({ description: "Select to edge", keys: ["Control", "Shift", "ArrowRight"], iconName: "ArrowRight" }),
      singleStep({ description: "Select current region", keys: ["Control", "Shift", "8"], iconName: "AppWindow" }),
      singleStep({ description: "Select entire sheet", keys: ["Control", "a"], iconName: "SelectAll", gridEffect: { action: 'SELECT_ALL' } }),
      singleStep({ description: "Select to last cell", keys: ["Control", "Shift", "End"], iconName: "ArrowDownRightSquare" }),
      singleStep({ description: "Add non-adjacent cells", keys: ["Shift", "F8"], iconName: "PlusSquare" }),
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
      singleStep({ description: "Save workbook", keys: ["Control", "s"], iconName: "Save" }),
      singleStep({ description: "Undo", keys: ["Control", "z"], iconName: "Undo2" }),
      singleStep({ description: "Redo", keys: ["Control", "y"], iconName: "Redo2" }),
      singleStep({ description: "Copy", keys: ["Control", "c"], iconName: "Copy" }),
      singleStep({ description: "Cut", keys: ["Control", "x"], iconName: "Scissors", gridEffect: { action: 'CUT' } }),
      singleStep({ description: "Paste", keys: ["Control", "v"], iconName: "ClipboardPaste" }),
      singleStep({ description: "Bold", keys: ["Control", "b"], iconName: "Bold", gridEffect: { action: 'APPLY_STYLE_BOLD' } }),
      singleStep({ description: "Italicize", keys: ["Control", "i"], iconName: "Italic", gridEffect: { action: 'APPLY_STYLE_ITALIC' } }),
      singleStep({ description: "Underline", keys: ["Control", "u"], iconName: "Underline", gridEffect: { action: 'APPLY_STYLE_UNDERLINE' } }),
      singleStep({ description: "Strikethrough", keys: ["Control", "5"], iconName: "Strikethrough", gridEffect: { action: 'APPLY_STYLE_STRIKETHROUGH' } }),
      singleStep({ description: "Open Find", keys: ["Control", "f"], iconName: "Search" }),
      singleStep({ description: "Open Replace", keys: ["Control", "h"], iconName: "Replace" }),
    ],
  },

  // ==========================================
  // LEVEL 2: INTERMEDIATE (Grid Surgeon)
  // Goal: Formula logic and data structure.
  // ==========================================
  {
    id: "structural-management",
    name: "Structural Management",
    description: "Add, remove, and hide rows or columns.",
    level: "Intermediate",
    category: "Management",
    iconName: "Layers",
    challenges: [
      singleStep({ description: "Select column", keys: ["Control", " "], iconName: "Columns3", gridEffect: { action: 'SELECT_COLUMN' } }),
      singleStep({ description: "Select row", keys: ["Shift", " "], iconName: "Rows3", gridEffect: { action: 'SELECT_ROW' } }),
      singleStep({ description: "Insert row/col", keys: ["Control", "Shift", "="], iconName: "Sheet", gridEffect: { action: 'INSERT_ROW' } }),
      singleStep({ description: "Delete row/col", keys: ["Control", "-"], iconName: "Trash2", gridEffect: { action: 'DELETE_ROW' } }),
      singleStep({ description: "Hide rows", keys: ["Control", "9"], iconName: "EyeOff" }),
      singleStep({ description: "Unhide rows", keys: ["Control", "Shift", "("], iconName: "Eye" }),
      singleStep({ description: "Hide columns", keys: ["Control", "0"], iconName: "EyeOff" }),
      singleStep({ description: "Select visible only", keys: ["Alt", ";"], iconName: "Aperture" }),
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
      singleStep({ description: "Edit cell", keys: ["F2"], iconName: "Pencil" }),
      singleStep({ description: "Start formula", keys: ["="], iconName: "Sigma" }),
      singleStep({ description: "Lock reference (F4)", keys: ["F4"], iconName: "Anchor" }),
      singleStep({ description: "Repeat last action", keys: ["F4"], iconName: "Repeat" }),
      singleStep({ description: "AutoSum", keys: ["Alt", "="], iconName: "Calculator" }),
      singleStep({ description: "Toggle formulas", keys: ["Control", "`"], iconName: "FileCode" }),
      singleStep({ description: "Name Manager", keys: ["Control", "F3"], iconName: "BookUser" }),
      singleStep({ description: "Create from selection", keys: ["Control", "Shift", "F3"], iconName: "CaseUpper" }),
      singleStep({ description: "Create Table", keys: ["Control", "t"], iconName: "Table" }),
      singleStep({ description: "Apply Filter", keys: ["Control", "Shift", "l"], iconName: "Filter" }),
      singleStep({ description: "Filter dropdown", keys: ["Alt", "ArrowDown"], iconName: "ChevronDownSquare" }),
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
      singleStep({ description: "Flash Fill", keys: ["Control", "e"], iconName: "Wand2" }),
      singleStep({ description: "Fill Down", keys: ["Control", "d"], iconName: "ArrowDownSquare" }),
      singleStep({ description: "Fill Right", keys: ["Control", "r"], iconName: "ArrowRightSquare" }),
      singleStep({ description: "Insert Date", keys: ["Control", ";"], iconName: "CalendarDays" }),
      singleStep({ description: "Insert Time", keys: ["Control", "Shift", ";"], iconName: "Clock" }),
      singleStep({ description: "Insert line break", keys: ["Alt", "Enter"], iconName: "WrapText" }),
      singleStep({ description: "Insert Comment", keys: ["Shift", "F2"], iconName: "MessageSquarePlus" }),
    ],
  },

  // ==========================================
  // LEVEL 3: ADVANCED (No-Ribbon Master)
  // Goal: Sequential Alt-codes and formatting.
  // ==========================================
  {
    id: "presentation-polish",
    name: "Presentation Polish",
    description: "Make it look professional using Alt sequences.",
    level: "Advanced",
    category: "Ribbon",
    iconName: "Palette",
    challenges: [
      singleStep({ description: "Center align", keys: ["Alt", "h", "a", "c"], iconName: "AlignCenter", isSequential: true }),
      singleStep({ description: "Merge & Center", keys: ["Alt", "h", "m", "c"], iconName: "Merge", isSequential: true }),
      singleStep({ description: "Wrap Text", keys: ["Alt", "h", "w"], iconName: "WrapText", isSequential: true }),
      singleStep({ description: "Apply all borders", keys: ["Alt", "h", "b", "a"], iconName: "Grid", isSequential: true }),
      singleStep({ description: "Thick box border", keys: ["Alt", "h", "b", "t"], iconName: "RectangleHorizontal", isSequential: true }),
      singleStep({ description: "Fill Color", keys: ["Alt", "h", "h"], iconName: "PaintBucket", isSequential: true }), // NEW
      singleStep({ description: "Clear formatting", keys: ["Alt", "h", "e", "f"], iconName: "RemoveFormatting", isSequential: true }),
      singleStep({ description: "Auto-fit width", keys: ["Alt", "h", "o", "i"], iconName: "ArrowsLeftRight", isSequential: true }), // NEW
      singleStep({ description: "Set column width", keys: ["Alt", "h", "o", "w"], iconName: "Columns", isSequential: true }),
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
      singleStep({ description: "Currency format", keys: ["Control", "Shift", "$"], iconName: "DollarSign" }),
      singleStep({ description: "Percentage format", keys: ["Control", "Shift", "%"], iconName: "Percent" }),
      singleStep({ description: "General format", keys: ["Control", "Shift", "~"], iconName: "Hash" }),
      singleStep({ description: "Date format", keys: ["Control", "Shift", "#"], iconName: "Calendar" }),
      singleStep({ description: "Time format", keys: ["Control", "Shift", "@"], iconName: "Clock" }),
      singleStep({ description: "Increase decimal", keys: ["Alt", "h", "0"], iconName: "PlusCircle", isSequential: true }),
      singleStep({ description: "Decrease decimal", keys: ["Alt", "h", "9"], iconName: "MinusCircle", isSequential: true }),
      singleStep({ description: "Open Format Cells", keys: ["Control", "1"], iconName: "Settings2" }),
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
      singleStep({ description: "Open Sort dialog", keys: ["Alt", "d", "s"], iconName: "ArrowDownUp", isSequential: true }),
      singleStep({ description: "Paste Special", keys: ["Control", "Alt", "v"], iconName: "ClipboardSignature" }),
      singleStep({ description: "Group rows/cols", keys: ["Alt", "Shift", "ArrowRight"], iconName: "Group" }),
      singleStep({ description: "Ungroup rows/cols", keys: ["Alt", "Shift", "ArrowLeft"], iconName: "Ungroup" }),
      singleStep({ description: "Toggle Gridlines", keys: ["Alt", "w", "v", "g"], iconName: "Grid3X3", isSequential: true }), // NEW
      singleStep({ description: "Freeze Panes", keys: ["Alt", "w", "f", "f"], iconName: "Lock", isSequential: true }), // NEW
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
                initialGridState: defaultGridState,
                steps: [
                    { description: "Select the entire row", keys: ["Shift", " "], iconName: "Rows3", gridEffect: { action: 'SELECT_ROW' } },
                    { description: "Delete the selected row(s)", keys: ["Control", "-"], iconName: "Trash2", gridEffect: { action: 'DELETE_ROW' } },
                ]
            },
            {
                description: "Select the current table, then cut it.",
                initialGridState: defaultGridState,
                steps: [
                    { description: "Select the entire table", keys: ["Control", "a"], iconName: "SelectAll", gridEffect: { action: 'SELECT_ALL' } },
                    { description: "Cut the selection", keys: ["Control", "x"], iconName: "Scissors", gridEffect: { action: 'CUT' } },
                ]
            },
            {
                description: "Select a column and format it as Currency.",
                initialGridState: {
                    ...defaultGridState,
                    selection: { activeCell: { row: 1, col: 3 }, selectedCells: new Set() }
                },
                steps: [
                    { description: "Select the entire column", keys: ["Control", " "], iconName: "Columns3", gridEffect: { action: 'SELECT_COLUMN' } },
                    { description: "Apply the Currency format", keys: ["Control", "Shift", "$"], iconName: "DollarSign", gridEffect: { action: 'APPLY_STYLE_CURRENCY'} },
                ]
            },
             {
                description: "Select a range, then bold it.",
                initialGridState: defaultGridState,
                steps: [
                    { description: "Select the entire table", keys: ["Control", "a"], iconName: "SelectAll", gridEffect: { action: 'SELECT_ALL' }},
                    { description: "Bold the current selection", keys: ["Control", "b"], iconName: "Bold", gridEffect: { action: 'APPLY_STYLE_BOLD' } },
                ]
            },
            {
                description: "Switch to formula view to check your work, then switch back.",
                initialGridState: defaultGridState,
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
      singleStep({ description: "Use Flash Fill to automatically fill a column", keys: ["Control", "e"], iconName: "Wand2" }),
      singleStep({ description: "Select only the visible cells in a selection", keys: ["Alt", ";"], iconName: "Aperture" })
  ]
};

export const ALL_EXAM_SETS = [BASIC_EXAM, INTERMEDIATE_EXAM, ADVANCED_EXAM];

export const ALL_CHALLENGE_SETS = [...CHALLENGE_SETS, ...SCENARIO_SETS, ...ALL_EXAM_SETS];

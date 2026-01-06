
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
  {
    id: "formatting-basics",
    name: "Formatting Basics",
    description: "Learn the most common formatting shortcuts.",
    level: "Beginner",
    category: "Formatting",
    iconName: "Pilcrow",
    challenges: [
      singleStep({ description: "Bold the current selection", keys: ["Control", "b"], iconName: "Bold", initialGridState: defaultGridState, gridEffect: { action: 'APPLY_STYLE_BOLD' } }),
      singleStep({ description: "Italicize the current selection", keys: ["Control", "i"], iconName: "Italic", initialGridState: defaultGridState, gridEffect: { action: 'APPLY_STYLE_ITALIC' } }),
      singleStep({ description: "Underline the current selection", keys: ["Control", "u"], iconName: "Underline", initialGridState: defaultGridState, gridEffect: { action: 'APPLY_STYLE_UNDERLINE' } }),
      singleStep({ description: "Apply or remove strikethrough", keys: ["Control", "5"], iconName: "Strikethrough", initialGridState: defaultGridState, gridEffect: { action: 'APPLY_STYLE_STRIKETHROUGH' } }),
      singleStep({ description: "Open the Format Cells dialog", keys: ["Control", "1"], iconName: "Settings2" }),
    ],
  },
  {
    id: "essential-navigation",
    name: "Essential Navigation",
    description: "Move around your worksheet like a pro.",
    level: "Beginner",
    category: "Navigation",
    iconName: "ArrowRightLeft",
    challenges: [
      singleStep({ description: "Go to the beginning of the row", keys: ["Home"], iconName: "Home" }),
      singleStep({ description: "Go to the beginning of the worksheet", keys: ["Control", "Home"], iconName: "PanelTopOpen" }),
      singleStep({ description: "Go to the last cell on the worksheet", keys: ["Control", "End"], iconName: "PanelBottomOpen" }),
      singleStep({ description: "Move to the edge of the current data region", keys: ["Control", "ArrowRight"], iconName: "MoveRight" }),
      singleStep({ description: "Move down one screen", keys: ["PageDown"], iconName: "ArrowDownToLine" }),
      singleStep({ description: "Move up one screen", keys: ["PageUp"], iconName: "ArrowUpToLine" }),
      singleStep({ description: "Open the 'Go To' dialog box", keys: ["F5"], iconName: "Locate" }),
    ],
  },
  {
    id: "clipboard-mastery",
    name: "Clipboard Mastery",
    description: "Master the art of copy, cut, and paste.",
    level: "Beginner",
    category: "Clipboard",
    iconName: "ClipboardCopy",
    challenges: [
      singleStep({ description: "Copy the selection", keys: ["Control", "c"], iconName: "Copy" }),
      singleStep({ description: "Cut the selection", keys: ["Control", "x"], iconName: "Scissors", initialGridState: defaultGridState, gridEffect: { action: 'CUT' } }),
      singleStep({ description: "Paste content", keys: ["Control", "v"], iconName: "ClipboardPaste" }),
      singleStep({ description: "Undo the last action", keys: ["Control", "z"], iconName: "Undo2" }),
      singleStep({ description: "Redo the last action", keys: ["Control", "y"], iconName: "Redo2" }),
    ],
  },
  {
    id: "quick-selection",
    name: "Quick Selection",
    description: "Select data ranges without using your mouse.",
    level: "Intermediate",
    category: "Selection",
    iconName: "MousePointerSquareDashed",
    challenges: [
      singleStep({ description: "Select the entire column", keys: ["Control", " "], iconName: "Columns3", initialGridState: { ...defaultGridState, selection: { activeCell: { row: 2, col: 2}, selectedCells: new Set() }}, gridEffect: { action: 'SELECT_COLUMN' } }),
      singleStep({ description: "Select the entire row", keys: ["Shift", " "], iconName: "Rows3", initialGridState: { ...defaultGridState, selection: { activeCell: { row: 2, col: 2}, selectedCells: new Set() }}, gridEffect: { action: 'SELECT_ROW' } }),
      singleStep({ description: "Select the entire worksheet", keys: ["Control", "a"], iconName: "SelectAll", initialGridState: defaultGridState, gridEffect: { action: 'SELECT_ALL' } }),
      singleStep({ description: "Extend selection to the last used cell", keys: ["Control", "Shift", "End"], iconName: "ArrowDownRightSquare" }),
      singleStep({ description: "Add non-adjacent cells to selection", keys: ["Shift", "F8"], iconName: "PlusSquare" }),
    ],
  },
    {
    id: "formula-wizardry",
    name: "Formula Wizardry",
    description: "Handle formulas with speed and precision.",
    level: "Intermediate",
    category: "Formulas",
    iconName: "FunctionSquare",
    challenges: [
      singleStep({ description: "Start a formula", keys: ["="], iconName: "Sigma" }),
      singleStep({ description: "Toggle absolute/relative references", keys: ["F4"], iconName: "Anchor" }),
      singleStep({ description: "Insert the AutoSum formula", keys: ["Alt", "="], iconName: "Calculator" }),
      singleStep({ description: "Toggle displaying formulas or values", keys: ["Control", "`"], iconName: "FileCode" }),
      singleStep({ description: "Edit the active cell", keys: ["F2"], iconName: "Pencil" }),
    ],
  },
  {
    id: "data-operations",
    name: "Data Operations",
    description: "Sort, filter, and manage data with ease.",
    level: "Intermediate",
    category: "Data",
    iconName: "Filter",
    challenges: [
      singleStep({ description: "Apply or clear the filter", keys: ["Control", "Shift", "l"], iconName: "Filter" }),
      singleStep({ description: "Open the Create Table dialog", keys: ["Control", "t"], iconName: "Table" }),
      singleStep({ description: "Automatically fill values down", keys: ["Control", "d"], iconName: "ArrowDownSquare" }),
      singleStep({ description: "Automatically fill values to the right", keys: ["Control", "r"], iconName: "ArrowRightSquare" }),
      singleStep({ description: "Use Flash Fill to automatically fill a column", keys: ["Control", "e"], iconName: "Wand2" }),
      singleStep({ description: "Select only the visible cells in a selection", keys: ["Alt", ";"], iconName: "Aperture" })
    ],
  },
  {
    id: "ribbon-power-user",
    name: "Ribbon Power User",
    description: "Navigate the ribbon using keyboard sequences.",
    level: "Advanced",
    category: "Ribbon",
    iconName: "GalleryVerticalEnd",
    challenges: [
      singleStep({ description: "Center align cell contents", keys: ["Alt", "h", "a", "c"], iconName: "AlignCenter", isSequential: true }),
      singleStep({ description: "Merge and center cells", keys: ["Alt", "h", "m", "c"], iconName: "Merge", isSequential: true }),
      singleStep({ description: "Apply all borders to selection", keys: ["Alt", "h", "b", "a"], iconName: "Grid", isSequential: true }),
      singleStep({ description: "Apply a thick box border", keys: ["Alt", "h", "b", "t"], iconName: "RectangleHorizontal", isSequential: true }),
      singleStep({ description: "Wrap text in a cell", keys: ["Alt", "h", "w"], iconName: "WrapText", isSequential: true }),
      singleStep({ description: "Set column width", keys: ["Alt", "h", "o", "w"], iconName: "Columns", isSequential: true }),
      singleStep({ description: "Apply the Currency format", keys: ["Control", "Shift", "$"], iconName: "DollarSign", initialGridState: { ...defaultGridState, selection: { activeCell: { row: 1, col: 3}, selectedCells: new Set(['1-3', '2-3', '3-3', '4-3']) }}, gridEffect: { action: 'APPLY_STYLE_CURRENCY'} }),
      singleStep({ description: "Apply the Percentage format", keys: ["Control", "Shift", "5"], iconName: "Percent", initialGridState: { ...defaultGridState, selection: { activeCell: { row: 1, col: 4}, selectedCells: new Set(['1-4', '2-4', '3-4', '4-4']) }}, gridEffect: { action: 'APPLY_STYLE_PERCENTAGE'} }),
    ],
  },
  {
    id: "row-column-management",
    name: "Row & Column Management",
    description: "Efficiently manage rows and columns.",
    level: "Advanced",
    category: "Management",
    iconName: "Layers",
    challenges: [
      singleStep({ description: "Insert new row(s)", keys: ["Control", "Shift", "="], iconName: "Sheet", initialGridState: { ...defaultGridState, selection: { activeCell: { row: 2, col: 2}, selectedCells: new Set() }}, gridEffect: { action: 'INSERT_ROW' } }),
      singleStep({ description: "Delete selected row(s)", keys: ["Control", "-"], iconName: "Trash2", initialGridState: { ...defaultGridState, selection: { activeCell: { row: 2, col: 2}, selectedCells: new Set() }}, gridEffect: { action: 'DELETE_ROW' } }),
      singleStep({ description: "Hide the selected rows", keys: ["Control", "9"], iconName: "EyeOff" }),
      singleStep({ description: "Unhide any hidden rows within the selection", keys: ["Control", "Shift", "("], iconName: "Eye" }),
      singleStep({ description: "Hide the selected columns", keys: ["Control", "0"], iconName: "EyeOff" }),
      singleStep({ description: "Group rows or columns", keys: ["Alt", "Shift", "ArrowRight"], iconName: "Group" }),
      singleStep({ description: "Ungroup rows or columns", keys: ["Alt", "Shift", "ArrowLeft"], iconName: "Ungroup" }),
      singleStep({ description: "Open Paste Special dialog", keys: ["Control", "Alt", "v"], iconName: "ClipboardSignature" }),
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

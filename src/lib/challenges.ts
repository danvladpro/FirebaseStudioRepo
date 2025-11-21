
import { ChallengeSet, ChallengeLevel, Challenge } from "./types";

const singleStep = (challenge: Omit<Challenge, 'steps'>): Challenge => ({
    ...challenge,
    steps: [{ description: challenge.description, keys: challenge.keys, iconName: challenge.iconName, isSequential: challenge.isSequential }]
});

export const CHALLENGE_SETS: ChallengeSet[] = [
  {
    id: "formatting-basics",
    name: "Formatting Basics",
    description: "Learn the most common formatting shortcuts.",
    level: "Beginner",
    category: "Formatting",
    iconName: "Pilcrow",
    challenges: [
      singleStep({ description: "Bold the current selection", keys: ["Control", "b"], iconName: "Bold" }),
      singleStep({ description: "Italicize the current selection", keys: ["Control", "i"], iconName: "Italic" }),
      singleStep({ description: "Underline the current selection", keys: ["Control", "u"], iconName: "Underline" }),
      singleStep({ description: "Apply or remove strikethrough", keys: ["Control", "5"], iconName: "Strikethrough" }),
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
      singleStep({ description: "Cut the selection", keys: ["Control", "x"], iconName: "Scissors" }),
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
      singleStep({ description: "Select the entire column", keys: ["Control", " "], iconName: "Columns3" }),
      singleStep({ description: "Select the entire row", keys: ["Shift", " "], iconName: "Rows3" }),
      singleStep({ description: "Select the entire worksheet", keys: ["Control", "a"], iconName: "SelectAll" }),
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
      singleStep({ description: "Apply the Currency format", keys: ["Control", "Shift", "4"], iconName: "DollarSign" }),
      singleStep({ description: "Apply the Percentage format", keys: ["Control", "Shift", "5"], iconName: "Percent" }),
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
      singleStep({ description: "Insert new row(s)", keys: ["Control", "Shift", "="], iconName: "Sheet" }),
      singleStep({ description: "Delete selected row(s)", keys: ["Control", "-"], iconName: "Trash2" }),
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
                steps: [
                    { description: "Select the entire row.", keys: ["Shift", " "], iconName: "Rows3" },
                    { description: "Delete the selected row(s).", keys: ["Control", "-"], iconName: "Trash2" },
                ]
            },
            {
                description: "Select the current table, cut it, and paste it 5 cells down.",
                steps: [
                    { description: "Select the entire table/worksheet.", keys: ["Control", "a"], iconName: "SelectAll" },
                    { description: "Cut the selection.", keys: ["Control", "x"], iconName: "Scissors" },
                    { description: "Paste the content.", keys: ["Control", "v"], iconName: "ClipboardPaste" },
                ]
            },
            {
                description: "Navigate to the right edge of your data, then enter edit mode.",
                steps: [
                    { description: "Move to the edge of the current data region.", keys: ["Control", "ArrowRight"], iconName: "MoveRight" },
                    { description: "Edit the active cell.", keys: ["F2"], iconName: "Pencil" },
                ]
            },
            {
                description: "Select all data, then clear all formatting.",
                steps: [
                    { description: "Select all content.", keys: ["Control", "a"], iconName: "SelectAll" },
                    { description: "Clear all formatting from selection.", keys: ["Alt", "h", "e", "f"], iconName: "Eraser", isSequential: true },
                ]
            },
            {
                description: "Activate filters on a table, then deactivate them.",
                steps: [
                    { description: "Apply or clear the filter for the data range.", keys: ["Control", "Shift", "l"], iconName: "Filter" },
                    { description: "Remove the filter from the data range.", keys: ["Control", "Shift", "l"], iconName: "FilterX" },
                ]
            },
            {
                description: "Select a column and format it as Currency.",
                steps: [
                    { description: "Select the entire column.", keys: ["Control", " "], iconName: "Columns3" },
                    { description: "Apply the Currency format.", keys: ["Control", "Shift", "4"], iconName: "DollarSign" },
                ]
            },
             {
                description: "Select a range, bold it, then underline it.",
                steps: [
                    { description: "Bold the current selection.", keys: ["Control", "b"], iconName: "Bold" },
                    { description: "Underline the current selection.", keys: ["Control", "u"], iconName: "Underline" },
                ]
            },
            {
                description: "Add an AutoSum to a column of numbers, then force a recalculation.",
                steps: [
                    { description: "Insert the AutoSum formula.", keys: ["Alt", "="], iconName: "Calculator" },
                    { description: "Recalculate all worksheets.", keys: ["F9"], iconName: "RefreshCw" },
                ]
            },
            {
                description: "Switch to formula view to check your work, then switch back.",
                steps: [
                    { description: "Toggle displaying formulas or values.", keys: ["Control", "`"], iconName: "FileCode" },
                    { description: "Toggle displaying values or formulas.", keys: ["Control", "`"], iconName: "FileText" },
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
  challenges: getChallengesByLevel("Advanced")
};

export const ALL_EXAM_SETS = [BASIC_EXAM, INTERMEDIATE_EXAM, ADVANCED_EXAM];

export const ALL_CHALLENGE_SETS = [...CHALLENGE_SETS, ...SCENARIO_SETS, ...ALL_EXAM_SETS];

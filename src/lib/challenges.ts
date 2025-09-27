
import { ChallengeSet } from "./types";

export const CHALLENGE_SETS: ChallengeSet[] = [
  {
    id: "formatting-basics",
    name: "Formatting Basics",
    description: "Learn the most common formatting shortcuts.",
    category: "Formatting",
    iconName: "Pilcrow",
    challenges: [
      { description: "Bold the current selection", keys: ["Control", "b"], iconName: "Bold" },
      { description: "Italicize the current selection", keys: ["Control", "i"], iconName: "Italic" },
      { description: "Underline the current selection", keys: ["Control", "u"], iconName: "Underline" },
      { description: "Apply or remove strikethrough", keys: ["Control", "5"], iconName: "Strikethrough" },
      { description: "Open the Format Cells dialog", keys: ["Control", "1"], iconName: "Settings2" },
      { description: "Apply the General number format", keys: ["Control", "Shift", "`"], iconName: "Hash" },
      { description: "Apply the Currency format", keys: ["Control", "Shift", "4"], iconName: "DollarSign" },
      { description: "Apply the Percentage format", keys: ["Control", "Shift", "5"], iconName: "Percent" },
    ],
  },
  {
    id: "essential-navigation",
    name: "Essential Navigation",
    description: "Move around your worksheet like a pro.",
    category: "Navigation",
    iconName: "ArrowRightLeft",
    challenges: [
      { description: "Go to the beginning of the row", keys: ["Home"], iconName: "Home" },
      { description: "Go to the beginning of the worksheet", keys: ["Control", "Home"], iconName: "PanelTopOpen" },
      { description: "Go to the last cell on the worksheet", keys: ["Control", "End"], iconName: "PanelBottomOpen" },
      { description: "Move to the edge of the current data region", keys: ["Control", "ArrowRight"], iconName: "MoveRight" },
      { description: "Move down one screen", keys: ["PageDown"], iconName: "ArrowDownToLine" },
      { description: "Move up one screen", keys: ["PageUp"], iconName: "ArrowUpToLine" },
      { description: "Open the 'Go To' dialog box", keys: ["F5"], iconName: "Locate" },
    ],
  },
  {
    id: "quick-selection",
    name: "Quick Selection",
    description: "Select data ranges without using your mouse.",
    category: "Selection",
    iconName: "MousePointerSquareDashed",
    challenges: [
      { description: "Select the entire column", keys: ["Control", " "], iconName: "Columns3" },
      { description: "Select the entire row", keys: ["Shift", " "], iconName: "Rows3" },
      { description: "Select the entire worksheet", keys: ["Control", "a"], iconName: "SelectAll" },
      { description: "Extend selection to the last used cell", keys: ["Control", "Shift", "End"], iconName: "ArrowDownRightSquare" },
      { description: "Add non-adjacent cells to selection", keys: ["Shift", "F8"], iconName: "PlusSquare" },
    ],
  },
  {
    id: "clipboard-mastery",
    name: "Clipboard Mastery",
    description: "Master the art of copy, cut, and paste.",
    category: "Clipboard",
    iconName: "ClipboardCopy",
    challenges: [
      { description: "Copy the selection", keys: ["Control", "c"], iconName: "Copy" },
      { description: "Cut the selection", keys: ["Control", "x"], iconName: "Scissors" },
      { description: "Paste content", keys: ["Control", "v"], iconName: "ClipboardPaste" },
      { description: "Open Paste Special dialog", keys: ["Control", "Alt", "v"], iconName: "ClipboardSignature" },
      { description: "Undo the last action", keys: ["Control", "z"], iconName: "Undo2" },
      { description: "Redo the last action", keys: ["Control", "y"], iconName: "Redo2" },
    ],
  },
  {
    id: "formula-wizardry",
    name: "Formula Wizardry",
    description: "Handle formulas with speed and precision.",
    category: "Formulas",
    iconName: "FunctionSquare",
    challenges: [
      { description: "Start a formula", keys: ["="], iconName: "Sigma" },
      { description: "Toggle absolute/relative references", keys: ["F4"], iconName: "Anchor" },
      { description: "Insert the AutoSum formula", keys: ["Alt", "="], iconName: "Calculator" },
      { description: "Toggle displaying formulas or values", keys: ["Control", "`"], iconName: "FileCode" },
      { description: "Open the Function Arguments dialog", keys: ["Control", "Shift", "a"], iconName: "Binary" },
      { description: "Edit the active cell", keys: ["F2"], iconName: "Pencil" },
    ],
  },
  {
    id: "row-column-management",
    name: "Row & Column Management",
    description: "Efficiently manage rows and columns.",
    category: "Management",
    iconName: "Layers",
    challenges: [
      { description: "Insert new row(s)", keys: ["Control", "Shift", "="], iconName: "Sheet" },
      { description: "Delete selected row(s)", keys: ["Control", "-"], iconName: "Trash2" },
      { description: "Hide the selected rows", keys: ["Control", "9"], iconName: "EyeOff" },
      { description: "Unhide any hidden rows within the selection", keys: ["Control", "Shift", "("], iconName: "Eye" },
      { description: "Hide the selected columns", keys: ["Control", "0"], iconName: "EyeOff" },
      { description: "Group rows or columns", keys: ["Alt", "Shift", "ArrowRight"], iconName: "Group" },
      { description: "Ungroup rows or columns", keys: ["Alt", "Shift", "ArrowLeft"], iconName: "Ungroup" },
    ],
  },
  {
    id: "data-operations",
    name: "Data Operations",
    description: "Sort, filter, and manage data with ease.",
    category: "Data",
    iconName: "Filter",
    challenges: [
      { description: "Apply or clear the filter", keys: ["Control", "Shift", "l"], iconName: "Filter" },
      { description: "Open the Create Table dialog", keys: ["Control", "t"], iconName: "Table" },
      { description: "Automatically fill values down", keys: ["Control", "d"], iconName: "ArrowDownSquare" },
      { description: "Automatically fill values to the right", keys: ["Control", "r"], iconName: "ArrowRightSquare" },
      { description: "Use Flash Fill to automatically fill a column", keys: ["Control", "e"], iconName: "Wand2" },
      { description: "Select only the visible cells in a selection", keys: ["Alt", ";"], iconName: "Aperture" }
    ],
  }
];

export const EXAM_SET: ChallengeSet = {
  id: "exam",
  name: "Final Exam",
  description: "A comprehensive test of all your Excel skills.",
  category: "Exam",
  iconName: "BookMarked",
  challenges: CHALLENGE_SETS.flatMap(set => set.challenges)
};

export const ALL_CHALLENGE_SETS = [...CHALLENGE_SETS, EXAM_SET];

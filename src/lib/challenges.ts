
import { ChallengeSet } from "./types";

export const CHALLENGE_SETS: ChallengeSet[] = [
  {
    id: "formatting-basics",
    name: "Formatting Basics",
    description: "Learn the most common formatting shortcuts.",
    category: "Formatting",
    iconName: "Pilcrow",
    challenges: [
      { description: "Bold the current selection", keys: ["Control", "b"], imageUrl: "https://picsum.photos/seed/bold/200/80", imageHint: "bold icon" },
      { description: "Italicize the current selection", keys: ["Control", "i"], imageUrl: "https://picsum.photos/seed/italic/200/80", imageHint: "italic icon" },
      { description: "Underline the current selection", keys: ["Control", "u"], imageUrl: "https://picsum.photos/seed/underline/200/80", imageHint: "underline icon" },
      { description: "Apply or remove strikethrough", keys: ["Control", "5"], imageUrl: "https://picsum.photos/seed/strikethrough/200/80", imageHint: "strikethrough text" },
      { description: "Open the Format Cells dialog", keys: ["Control", "1"], imageUrl: "https://picsum.photos/seed/formatcells/200/80", imageHint: "dialog box" },
      { description: "Apply the General number format", keys: ["Control", "Shift", "~"], imageUrl: "https://picsum.photos/seed/generalformat/200/80", imageHint: "number grid" },
      { description: "Apply the Currency format", keys: ["Control", "Shift", "$"], imageUrl: "https://picsum.photos/seed/currencyformat/200/80", imageHint: "dollar sign" },
      { description: "Apply the Percentage format", keys: ["Control", "Shift", "%"], imageUrl: "https://picsum.photos/seed/percentformat/200/80", imageHint: "percent sign" },
    ],
  },
  {
    id: "essential-navigation",
    name: "Essential Navigation",
    description: "Move around your worksheet like a pro.",
    category: "Navigation",
    iconName: "ArrowRightLeft",
    challenges: [
      { description: "Go to the beginning of the row", keys: ["Home"], imageUrl: "https://picsum.photos/seed/homekey/200/80", imageHint: "home key" },
      { description: "Go to the beginning of the worksheet", keys: ["Control", "Home"], imageUrl: "https://picsum.photos/seed/ctrlhome/200/80", imageHint: "control home" },
      { description: "Go to the last cell on the worksheet", keys: ["Control", "End"], imageUrl: "https://picsum.photos/seed/ctrlend/200/80", imageHint: "control end" },
      { description: "Move to the edge of the current data region", keys: ["Control", "ArrowRight"], imageUrl: "https://picsum.photos/seed/ctrlnav/200/80", imageHint: "arrow navigation" },
      { description: "Move down one screen", keys: ["PageDown"], imageUrl: "https://picsum.photos/seed/pagedown/200/80", imageHint: "arrow down" },
      { description: "Move up one screen", keys: ["PageUp"], imageUrl: "https://picsum.photos/seed/pageup/200/80", imageHint: "arrow up" },
      { description: "Open the 'Go To' dialog box", keys: ["F5"], imageUrl: "https://picsum.photos/seed/goto/200/80", imageHint: "dialog box" },
    ],
  },
  {
    id: "quick-selection",
    name: "Quick Selection",
    description: "Select data ranges without using your mouse.",
    category: "Selection",
    iconName: "MousePointerSquareDashed",
    challenges: [
      { description: "Select the entire column", keys: ["Control", " "], imageUrl: "https://picsum.photos/seed/selectcolumn/200/80", imageHint: "column select" },
      { description: "Select the entire row", keys: ["Shift", " "], imageUrl: "https://picsum.photos/seed/selectrow/200/80", imageHint: "row select" },
      { description: "Select the entire worksheet", keys: ["Control", "a"], imageUrl: "https://picsum.photos/seed/selectall/200/80", imageHint: "select all" },
      { description: "Extend selection to the last used cell", keys: ["Control", "Shift", "End"], imageUrl: "https://picsum.photos/seed/selecttoend/200/80", imageHint: "selection box" },
      { description: "Add non-adjacent cells to selection", keys: ["Shift", "F8"], imageUrl: "https://picsum.photos/seed/addselection/200/80", imageHint: "plus sign" },
    ],
  },
  {
    id: "clipboard-mastery",
    name: "Clipboard Mastery",
    description: "Master the art of copy, cut, and paste.",
    category: "Clipboard",
    iconName: "ClipboardCopy",
    challenges: [
      { description: "Copy the selection", keys: ["Control", "c"], imageUrl: "https://picsum.photos/seed/copy/200/80", imageHint: "copy icon" },
      { description: "Cut the selection", keys: ["Control", "x"], imageUrl: "https://picsum.photos/seed/cut/200/80", imageHint: "cut icon" },
      { description: "Paste content", keys: ["Control", "v"], imageUrl: "https://picsum.photos/seed/paste/200/80", imageHint: "paste icon" },
      { description: "Open Paste Special dialog", keys: ["Control", "Alt", "v"], imageUrl: "https://picsum.photos/seed/pastespecial/200/80", imageHint: "special paste" },
      { description: "Undo the last action", keys: ["Control", "z"], imageUrl: "https://picsum.photos/seed/undo/200/80", imageHint: "undo arrow" },
      { description: "Redo the last action", keys: ["Control", "y"], imageUrl: "https://picsum.photos/seed/redo/200/80", imageHint: "redo arrow" },
    ],
  },
    {
    id: "formula-wizardry",
    name: "Formula Wizardry",
    description: "Handle formulas with speed and precision.",
    category: "Formulas",
    iconName: "FunctionSquare",
    challenges: [
      { description: "Start a formula", keys: ["="], imageUrl: "https://picsum.photos/seed/equal/200/80", imageHint: "equals sign" },
      { description: "Toggle absolute/relative references", keys: ["F4"], imageUrl: "https://picsum.photos/seed/f4key/200/80", imageHint: "F4 key" },
      { description: "Insert the AutoSum formula", keys: ["Alt", "="], imageUrl: "https://picsum.photos/seed/autosum/200/80", imageHint: "sum symbol" },
      { description: "Toggle displaying formulas or values", keys: ["Control", "`"], imageUrl: "https://picsum.photos/seed/showformulas/200/80", imageHint: "code formula" },
      { description: "Open the Function Arguments dialog", keys: ["Control", "Shift", "a"], imageUrl: "https://picsum.photos/seed/functionargs/200/80", imageHint: "function arguments" },
      { description: "Edit the active cell", keys: ["F2"], imageUrl: "https://picsum.photos/seed/editcell/200/80", imageHint: "pencil edit" },
    ],
  },
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

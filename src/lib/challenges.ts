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
      { description: "Display the Formula Auditing toolbar", keys: ["Alt", "M"], imageUrl: "https://picsum.photos/seed/formulaauditing/200/80", imageHint: "formula audit" },
    ],
  },
];

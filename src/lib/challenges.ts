import { ChallengeSet } from "./types";

export const CHALLENGE_SETS: ChallengeSet[] = [
  {
    id: "formatting-basics",
    name: "Formatting Basics",
    description: "Learn the most common formatting shortcuts.",
    category: "Formatting",
    iconName: "Pilcrow",
    challenges: [
      { description: "Bold the current selection", keys: ["Control", "b"] },
      { description: "Italicize the current selection", keys: ["Control", "i"] },
      { description: "Underline the current selection", keys: ["Control", "u"] },
    ],
  },
  {
    id: "essential-navigation",
    name: "Essential Navigation",
    description: "Move around your worksheet like a pro.",
    category: "Navigation",
    iconName: "ArrowRightLeft",
    challenges: [
      { description: "Go to the beginning of the row", keys: ["Home"] },
      { description: "Go to the beginning of the worksheet", keys: ["Control", "Home"] },
      { description: "Go to the last cell on the worksheet", keys: ["Control", "End"] },
    ],
  },
  {
    id: "quick-selection",
    name: "Quick Selection",
    description: "Select data ranges without using your mouse.",
    category: "Selection",
    iconName: "MousePointerSquareDashed",
    challenges: [
      { description: "Select the entire column", keys: ["Control", " "] },
      { description: "Select the entire row", keys: ["Shift", " "] },
      { description: "Select the entire worksheet", keys: ["Control", "a"] },
    ],
  },
  {
    id: "clipboard-mastery",
    name: "Clipboard Mastery",
    description: "Master the art of copy, cut, and paste.",
    category: "Clipboard",
    iconName: "ClipboardCopy",
    challenges: [
      { description: "Copy the selection", keys: ["Control", "c"] },
      { description: "Cut the selection", keys: ["Control", "x"] },
      { description: "Paste content", keys: ["Control", "v"] },
    ],
  },
    {
    id: "formula-wizardry",
    name: "Formula Wizardry",
    description: "Handle formulas with speed and precision.",
    category: "Formulas",
    iconName: "FunctionSquare",
    challenges: [
      { description: "Start a formula", keys: ["="] },
      { description: "Toggle absolute/relative references", keys: ["F4"] },
      { description: "Display the Formula Auditing toolbar", keys: ["Alt", "M"] },
    ],
  },
];

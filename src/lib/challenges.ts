
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

const createDefaultGridState = (rows = 30): GridState => ({
  sheets: [
    {
      name: 'Sheet1',
      data: [
        ['ID', 'Product', 'Region', 'Sales', ''],
        ['#101', 'Gadget', 'North', '1200', ''],
        ['#102', 'Widget', 'South', '850', ''],
        ['#103', 'Doohickey', 'East', '2100', ''],
        ['', '', '', '', ''],
      ],
      selection: { activeCell: { row: 2, col: 2 }, anchorCell: { row: 2, col: 2 } },
      viewport: { startRow: 0, rowCount: 15 },
    },
  ],
  activeSheetIndex: 0,
  clipboard: null,
});

const createSummableGridState = (): GridState => ({
  sheets: [
    {
      name: 'Sheet1',
      data: [
        ['Item', 'Sales'],
        ['Gadget', '1200'],
        ['Widget', '850'],
        ['Doohickey', '2100'],
        ['', ''],
      ],
      selection: { activeCell: { row: 4, col: 1 }, anchorCell: { row: 4, col: 1 } },
    },
  ],
  activeSheetIndex: 0,
  clipboard: null,
});

const createAutofitGridState = (): GridState => ({
  sheets: [
    {
      name: 'Sheet1',
      data: [
        ['This is a very long header for column A', 'Short Header B'],
        ['Short content', 'This content is much longer and should make the column wider'],
        ['12345', '123'],
        ['Another row', 'Another value']
      ],
      selection: { activeCell: { row: 0, col: 0 }, anchorCell: { row: 0, col: 0 } },
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
  // LEVEL 1: APPRENTICE (Warp Speed)
  // ==========================================
  {
    id: "warp-speed-navigation",
    name: "Warp Speed Navigation",
    description: "Move across the worksheet like lightning.",
    level: "Apprentice",
    category: "Navigation",
    iconName: "Zap",
    challenges: [
      singleStep({ description: "Jump to: Most Right cell", keys: ["control", "arrowright"], iconName: "MoveRight", initialGridState: createDefaultGridState(), gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'edgeRight' } } }),
      singleStep({ description: "Jump to: Beginning of row", keys: ["home"], iconName: "Home", initialGridState: createDefaultGridState(), gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'home' } } }),
      singleStep({ description: "Jump to: Top-Left (A1)", keys: ["control", "home"], iconName: "PanelTopOpen", initialGridState: createDefaultGridState(), gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'topLeft' } } }),
      singleStep({ description: "Jump to: Last Used Cell", keys: ["control", "end"], iconName: "PanelBottomOpen", initialGridState: createDefaultGridState(), gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'end' } } }),
      singleStep({ description: "Scroll: one Page Down", keys: ["pagedown"], iconName: "ArrowDownToLine", initialGridState: createDefaultGridState(), gridEffect: { action: 'SCROLL_PAGE_DOWN' } }),
      singleStep({ description: "Scroll: one Page Up", keys: ["pageup"], iconName: "ArrowUpToLine", initialGridState: createDefaultGridState(), gridEffect: { action: 'SCROLL_PAGE_UP' } }),
      singleStep({ description: "Go to: Next WorkSheet", keys: ["control", "pagedown"], iconName: "ArrowRightToLine", initialGridState: createMultiSheetGridState(0), gridEffect: { action: 'SWITCH_SHEET', payload: { direction: 'next' } } }),
      singleStep({ description: "Go to: Previous sheet", keys: ["control", "pageup"], iconName: "ArrowLeftToLine", initialGridState: createMultiSheetGridState(1), gridEffect: { action: 'SWITCH_SHEET', payload: { direction: 'previous' } } }),
      singleStep({ description: "Open 'Go To' dialog", keys: ["f5"], iconName: "Locate", dialogEffect: { action: 'SHOW_GO_TO' } }),
    ],
  },
  {
    id: "rapid-selection",
    name: "Rapid Selection",
    description: "Selection shortcuts that bypass the mouse.",
    level: "Apprentice",
    category: "Selection",
    iconName: "MousePointerSquareDashed",
    challenges: [
      singleStep({ description: "Extend selection", keys: ["shift", "arrowright"], iconName: "MoveRight", initialGridState: createDefaultGridState(), gridEffect: { action: 'EXTEND_SELECTION', payload: { direction: 'right' } } }),
      singleStep({ description: "Select to edge", keys: ["control", "shift", "arrowright"], iconName: "ArrowRight", initialGridState: createDefaultGridState(), gridEffect: { action: 'SELECT_TO_EDGE', payload: { direction: 'right' } } }),
      singleStep({ description: "Select current region", keys: ["control", "shift", "8"], iconName: "AppWindow", initialGridState: createDefaultGridState(), gridEffect: { action: 'SELECT_ALL' } }),
      singleStep({ description: "Select entire sheet", keys: ["control", "a"], iconName: "Frame" , gridEffect: { action: 'SELECT_ALL' }, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Select to last cell", keys: ["control", "shift", "end"], iconName: "ArrowDownRightSquare", initialGridState: createDefaultGridState(), gridEffect: { action: 'SELECT_TO_END' } }),
    ],
  },
  {
    id: "daily-basics",
    name: "Daily Basics",
    description: "Must-know shortcuts for every session.",
    level: "Apprentice",
    category: "General",
    iconName: "ClipboardPaste",
    challenges: [
      singleStep({ description: "Save workbook", keys: ["control", "s"], iconName: "Save", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Undo", keys: ["control", "z"], iconName: "Undo2", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Redo", keys: ["control", "y"], iconName: "Redo2", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Copy", keys: ["control", "c"], iconName: "Copy", gridEffect: { action: 'COPY' }, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Cut", keys: ["control", "x"], iconName: "Scissors", gridEffect: { action: 'CUT' }, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Paste", keys: ["control", "v"], iconName: "ClipboardPaste", initialGridState: createDefaultGridState(), gridEffect: { action: 'PASTE' } }),
      singleStep({ description: "Bold", keys: ["control", "b"], iconName: "Bold", gridEffect: { action: 'APPLY_STYLE_BOLD' }, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Italicize", keys: ["control", "i"], iconName: "Italic", gridEffect: { action: 'APPLY_STYLE_ITALIC' }, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Underline", keys: ["control", "u"], iconName: "Underline", gridEffect: { action: 'APPLY_STYLE_UNDERLINE' }, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Strikethrough", keys: ["control", "5"], iconName: "Strikethrough", gridEffect: { action: 'APPLY_STYLE_STRIKETHROUGH' }, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Open Find", keys: ["control", "f"], iconName: "Search", initialGridState: createDefaultGridState(), dialogEffect: { action: 'SHOW', payload: { activeTab: 'find' } } }),
      singleStep({ description: "Open Replace", keys: ["control", "h"], iconName: "Replace", initialGridState: createDefaultGridState(), dialogEffect: { action: 'SHOW', payload: { activeTab: 'replace' } } }),
    ],
  },

  // ==========================================
  // LEVEL 2: MASTER (Grid Surgeon)
  // ==========================================
  {
    id: "structural-management",
    name: "Structural Management",
    description: "Add, remove, and hide rows or columns.",
    level: "Master",
    category: "Management",
    iconName: "Layers",
    challenges: [
      singleStep({ description: "Select column", keys: ["control", " "], iconName: "Columns3", initialGridState: createDefaultGridState(), gridEffect: { action: 'SELECT_COLUMN' } }),
      singleStep({ description: "Select row", keys: ["shift", " "], iconName: "Rows3", initialGridState: createDefaultGridState(), gridEffect: { action: 'SELECT_ROW' } }),
      singleStep({ description: "Insert row/col", keys: ["control", "shift", "="], iconName: "Sheet", initialGridState: createDefaultGridState(), gridEffect: { action: 'INSERT_ROW' } }),
      singleStep({ description: "Delete row/col", keys: ["control", "-"], iconName: "Trash2", initialGridState: createDefaultGridState(), gridEffect: { action: 'DELETE_ROW' } }),
      singleStep({ description: "Hide rows", keys: ["control", "9"], iconName: "EyeOff", initialGridState: createDefaultGridState(), gridEffect: { action: 'HIDE_ROW' } }),
      singleStep({ description: "Unhide rows", keys: ["control", "shift", "9"], iconName: "Eye", initialGridState: createDefaultGridState(), gridEffect: { action: 'UNHIDE_ROWS' } }),
      singleStep({ description: "Hide columns", keys: ["control", "0"], iconName: "EyeOff", initialGridState: createDefaultGridState(), gridEffect: { action: 'HIDE_COLUMN' } }),
      singleStep({ description: "Select visible only", keys: ["alt", ";"], iconName: "Aperture", initialGridState: createDefaultGridState(), gridEffect: { action: 'SET_SELECTION_MODE', payload: 'visibleOnly' } }),
    ],
  },
  {
    id: "formula-data-wizard",
    name: "Formula & Data Wizard",
    description: "Handle the logic of the spreadsheet.",
    level: "Master",
    category: "Formulas",
    iconName: "FunctionSquare",
    challenges: [
      singleStep({ description: "Edit cell", keys: ["f2"], iconName: "Pencil", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Start formula", keys: ["="], iconName: "Sigma", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Lock reference (F4)", keys: ["f4"], iconName: "Anchor", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Repeat last action", keys: ["f4"], iconName: "Repeat", initialGridState: createDefaultGridState() }),
      singleStep({ description: "AutoSum", keys: ["alt", "="], iconName: "Calculator", initialGridState: createSummableGridState(), gridEffect: { action: 'AUTOSUM' } }),
      singleStep({ description: "Toggle formulas", keys: ["control", "`"], iconName: "FileCode", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Name Manager", keys: ["control", "f3"], iconName: "BookUser", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Create from selection", keys: ["control", "shift", "f3"], iconName: "CaseUpper", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Create Table", keys: ["control", "t"], iconName: "Table", initialGridState: createDefaultGridState(), dialogEffect: { action: 'SHOW_CREATE_TABLE' } }),
      singleStep({ description: "Apply Filter", keys: ["control", "shift", "l"], iconName: "Filter", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Filter dropdown", keys: ["alt", "arrowdown"], iconName: "ChevronDownSquare", initialGridState: createDefaultGridState() }),
    ],
  },
  {
    id: "data-entry-shortcuts",
    name: "Speed Data Entry",
    description: "Fill data faster than typing.",
    level: "Master",
    category: "Data",
    iconName: "Wand2",
    challenges: [
      singleStep({ description: "Flash Fill", keys: ["control", "e"], iconName: "Wand2", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Fill Down", keys: ["control", "d"], iconName: "ArrowDownSquare", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Fill Right", keys: ["control", "r"], iconName: "ArrowRightSquare", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Insert Date", keys: ["control", ";"], iconName: "CalendarDays", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Insert Time", keys: ["control", "shift", ";"], iconName: "Clock", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Insert line break", keys: ["alt", "enter"], iconName: "WrapText", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Insert Comment", keys: ["shift", "f2"], iconName: "MessageSquarePlus", initialGridState: createDefaultGridState() }),
    ],
  },

  // ==========================================
  // LEVEL 3: NINJA (No-Ribbon Master)
  // ==========================================
  {
    id: "presentation-polish",
    name: "Presentation Polish",
    description: "Make it look professional using Alt sequences.",
    level: "Ninja",
    category: "Ribbon",
    iconName: "Palette",
    challenges: [
      singleStep({ description: "Center align", keys: ["alt", "h", "a", "c"], iconName: "AlignCenter", isSequential: true, initialGridState: createDefaultGridState(), gridEffect: { action: 'APPLY_STYLE_CENTER_ALIGN' } }),
      singleStep({ description: "Merge & Center", keys: ["alt", "h", "m", "c"], iconName: "Merge", isSequential: true, initialGridState: createDefaultGridState(), gridEffect: { action: 'APPLY_STYLE_MERGE_CENTER' } }),
      singleStep({ description: "Wrap Text", keys: ["alt", "h", "w"], iconName: "WrapText", isSequential: true, initialGridState: createDefaultGridState(), gridEffect: { action: 'APPLY_STYLE_WRAP_TEXT' } }),
      singleStep({ description: "Apply all borders", keys: ["alt", "h", "b", "a"], iconName: "Grid", isSequential: true, initialGridState: createDefaultGridState(), gridEffect: { action: 'APPLY_STYLE_ALL_BORDERS' } }),
      singleStep({ description: "Thick box border", keys: ["alt", "h", "b", "t"], iconName: "RectangleHorizontal", isSequential: true, initialGridState: createDefaultGridState(), gridEffect: { action: 'APPLY_STYLE_THICK_BORDER' } }),
      {
        description: "Fill Color",
        initialGridState: createDefaultGridState(),
        steps: [
          { description: 'Open Fill Color Menu', keys: ['alt', 'h', 'h'], iconName: 'PaintBucket', isSequential: true, dialogEffect: { action: 'SHOW_FILL_COLOR_DROPDOWN' } },
          { description: 'Select a color', keys: ['arrowright'], iconName: 'ArrowRight', dialogEffect: { action: 'MOVE_FILL_COLOR_HIGHLIGHT', payload: 'right' } },
          { description: 'Apply the color', keys: ['enter'], iconName: 'Check', dialogEffect: { action: 'HIDE_FILL_COLOR_DROPDOWN' }, gridEffect: { action: 'APPLY_FILL_COLOR' } }
        ]
      },
      singleStep({ description: "Clear formatting", keys: ["alt", "h", "e", "f"], iconName: "RemoveFormatting", isSequential: true, initialGridState: createDefaultGridState() }),
      singleStep({ description: "Auto-fit width", keys: ["alt", "h", "o", "i"], iconName: "ArrowUpNarrowWide", isSequential: true, initialGridState: createAutofitGridState(), gridEffect: { action: 'AUTOFIT_COLUMNS' } }),
      singleStep({ description: "Set column width", keys: ["alt", "h", "o", "w"], iconName: "Columns", isSequential: true, initialGridState: createDefaultGridState() }),
    ],
  },
  {
    id: "number-formatting",
    name: "Financial Formatting",
    description: "Format currencies, dates, and precision.",
    level: "Ninja",
    category: "Formatting",
    iconName: "DollarSign",
    challenges: [
      singleStep({ description: "Currency format", keys: ["control", "shift", "4"], iconName: "DollarSign", initialGridState: createDefaultGridState(), gridEffect: { action: 'APPLY_STYLE_CURRENCY' } }),
      singleStep({ description: "Percentage format", keys: ["control", "shift", "5"], iconName: "Percent", initialGridState: createDefaultGridState(), gridEffect: { action: 'APPLY_STYLE_PERCENTAGE' } }),
      singleStep({ description: "General format", keys: ["control", "shift", "`"], iconName: "Hash", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Date format", keys: ["control", "shift", "3"], iconName: "Calendar", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Time format", keys: ["control", "shift", "2"], iconName: "Clock", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Increase decimal", keys: ["alt", "h", "0"], iconName: "PlusCircle", isSequential: true, initialGridState: createDefaultGridState(), gridEffect: { action: 'INCREASE_DECIMAL' } }),
      singleStep({ description: "Decrease decimal", keys: ["alt", "h", "9"], iconName: "MinusCircle", isSequential: true, initialGridState: createDefaultGridState(), gridEffect: { action: 'DECREASE_DECIMAL' } }),
      singleStep({ description: "Open Format Cells", keys: ["control", "1"], iconName: "Settings2", dialogEffect: { action: 'SHOW_FORMAT_CELLS_DIALOG' } }),
    ],
  },
  {
    id: "expert-view-management",
    name: "Expert Controls",
    description: "Sorting, freezing, and pasting special.",
    level: "Ninja",
    category: "Data",
    iconName: "ShieldCheck",
    challenges: [
      singleStep({ description: "Open Sort dialog", keys: ["alt", "d", "s"], iconName: "ArrowDownUp", isSequential: true, dialogEffect: { action: 'SHOW_SORT_DIALOG' } }),
      singleStep({ description: "Paste Special", keys: ["control", "alt", "v"], iconName: "ClipboardSignature", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Group rows/cols", keys: ["alt", "shift", "arrowright"], iconName: "Group", initialGridState: createDefaultGridState(), gridEffect: { action: 'GROUP_ROWS' } }),
      singleStep({ description: "Ungroup rows/cols", keys: ["alt", "shift", "arrowleft"], iconName: "Ungroup", initialGridState: createDefaultGridState() }),
      singleStep({ description: "Toggle Gridlines", keys: ["alt", "w", "v", "g"], iconName: "Grid3X3", isSequential: true, initialGridState: createDefaultGridState(), gridEffect: { action: 'TOGGLE_GRIDLINES' } }),
      singleStep({ description: "Freeze Panes", keys: ["alt", "w", "f", "f"], iconName: "Lock", isSequential: true, initialGridState: createDefaultGridState(), gridEffect: { action: 'FREEZE_PANES' } }),
    ],
  },
];

export const ALL_CHALLENGE_SETS = [...CHALLENGE_SETS];

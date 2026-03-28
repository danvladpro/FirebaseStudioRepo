
import { ChallengeSet, ChallengeLevel, Challenge, GridState } from "./types";

const singleStep = (challenge: Omit<Challenge, 'steps'>): Challenge => ({
    ...challenge,
    steps: [{ 
      description: challenge.description, 
      keys: challenge.keys!, 
      iconName: challenge.iconName!, 
      isSequential: challenge.isSequential, 
      gridEffect: challenge.gridEffect,
      dialogEffect: challenge.dialogEffect,
      previewDialogEffect: challenge.previewDialogEffect,
    }]
});



const createGridState = (data: string[][], activeSheetIndex: number = 0, Row: number = 0, Col: number = 0, totalRows: number = 0): GridState => {
    const finalData = data.map(r => [...r]); // deep copy
    const numCols = data.length > 0 ? data[0].length : 1;

    if (totalRows > data.length) {
        const emptyRowsToAdd = totalRows - data.length;
        for (let i = 0; i < emptyRowsToAdd; i++) {
            finalData.push(Array(numCols).fill(''));
        }
    }

    return {
        sheets: [{
            name: 'Sheet1',
            data: finalData,
            selection: { activeCell: { row: Row, col: Col }, anchorCell: { row: Row, col: Col } },
            viewport: { startRow: 0, rowCount: 6 }
        }],
        activeSheetIndex: activeSheetIndex,
        clipboard: null,
    };
};


const bigTable = [['ID', 'Name', 'Date', 'Amount'],
    ['1', 'Project A', '2026-01-01', '500.75'],
    ['2', 'Project B', '2026-01-05', '1200.50'],
    ['3', 'Project C', '2026-01-10', '750.00'],
    ['4', 'Project D', '2026-01-15', '2000.25'],
];

const leanTable = [['','ID', 'Name',  'Amount',''],
    ['','1', 'Project A',  '500.75',''],
    ['','2', 'Project B', '1200.50',''],
    ['','3', 'Project C',  '750.00',''],
    ['','4', 'Project D', '2000.25',''],
];

const formatTable = [['Number','Date', 'Time','General'],
    ['1','46108', '0.63', '2.000'],
    ['','', '',''],
];

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
    id: "daily-basics",
    name: "Daily Basics",
    description: "Must-know shortcuts for every session.",
    level: "Apprentice",
    category: "General",
    iconName: "ClipboardPaste",
    challenges: [
      singleStep({ description: "Save workbook", keys: ["control", "s"], iconName: "Save", initialGridState: createGridState(bigTable,0,2,0),}),
      singleStep({ description: "Undo", keys: ["control", "z"], iconName: "Undo2", initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Redo", keys: ["control", "y"], iconName: "Redo2", initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Copy", keys: ["control", "c"], iconName: "Copy", gridEffect: { action: 'COPY' }, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Cut", keys: ["control", "x"], iconName: "Scissors", gridEffect: { action: 'CUT' }, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Paste", keys: ["control", "v"], iconName: "ClipboardPaste", initialGridState: createGridState(bigTable,0,2,0), gridEffect: { action: 'PASTE' } }),
      singleStep({ description: "Bold", keys: ["control", "b"], iconName: "Bold", gridEffect: { action: 'APPLY_STYLE_BOLD' }, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Italicize", keys: ["control", "i"], iconName: "Italic", gridEffect: { action: 'APPLY_STYLE_ITALIC' }, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Underline", keys: ["control", "u"], iconName: "Underline", gridEffect: { action: 'APPLY_STYLE_UNDERLINE' }, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Strikethrough", keys: ["control", "5"], iconName: "Strikethrough", gridEffect: { action: 'APPLY_STYLE_STRIKETHROUGH' }, initialGridState: createGridState(bigTable,0,2,0) }),
      {
        description: "Open and close the Find dialog",initialGridState: createGridState(bigTable,0,2,0),
        steps: [
            {description: "Open Find dialog",keys: ["control", "f"],iconName: "Search",dialogEffect: { action: 'SHOW', payload: { activeTab: 'find' } }},
            {description: "Close the dialog",keys: ["esc"],iconName: "X",dialogEffect: { action: 'HIDE' },previewDialogEffect: { action: 'HIGHLIGHT_BUTTON', payload: 'close' }}
        ]
      },
      {
        description: "Open and close the Replace dialog",initialGridState: createGridState(bigTable,0,2,0),
        steps: [
            {description: "Open Replace dialog",keys: ["control", "h"],iconName: "Replace",dialogEffect: { action: 'SHOW', payload: { activeTab: 'replace' } }},
            {description: "Close the dialog",keys: ["esc"],iconName: "X",dialogEffect: { action: 'HIDE' },previewDialogEffect: { action: 'HIGHLIGHT_BUTTON', payload: 'close' }}
        ]
      }
    ],
  },
  
  
  {
    id: "warp-speed-navigation",
    name: "Warp Speed Navigation",
    description: "Move across the worksheet like lightning.",
    level: "Apprentice",
    category: "Navigation",
    iconName: "Zap",
    challenges: [
      singleStep({ description: "Jump to most left cell", keys: ["control", "arrowleft"], iconName: "MoveLeft", gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'edgeLeft' } }, initialGridState: createGridState(leanTable, 0, 2, 3) }),
      singleStep({ description: "Jump to beginning of row", keys: ["home"], iconName: "Home", gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'home' } }, initialGridState: createGridState(leanTable, 0, 2, 3) }),
      singleStep({ description: "Jump to top-left (A1)", keys: ["control", "home"], iconName: "PanelTopOpen", gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'topLeft' } }, initialGridState: createGridState(leanTable, 0, 2, 3) }),
      singleStep({ description: "Jump to last used cell", keys: ["control", "end"], iconName: "PanelBottomOpen", gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'end' } }, initialGridState: createGridState(leanTable, 0, 0, 1, 0) }),
      {
        description: "Scan pages up and down",
        initialGridState: createGridState(leanTable, 0, 4, 3, 20),
        steps: [
            {description: "Scroll one page down",keys: ["pagedown"],iconName: "ArrowDownToLine",gridEffect: { action: 'SCROLL_PAGE_DOWN' }},
            {description: "Scroll one page up",keys: ["pageup"],iconName: "ArrowUpToLine",gridEffect: { action: 'SCROLL_PAGE_UP' }}
        ]
      },
      singleStep({ description: "Go to next worksheet", keys: ["control", "pagedown"], iconName: "ArrowRightToLine", gridEffect: { action: 'SWITCH_SHEET', payload: { direction: 'next' } }, initialGridState: createMultiSheetGridState(0) }),
      singleStep({ description: "Go to previous worksheet", keys: ["control", "pageup"], iconName: "ArrowLeftToLine", gridEffect: { action: 'SWITCH_SHEET', payload: { direction: 'previous' } }, initialGridState: createMultiSheetGridState(1) }),
      {
        description: "Open and close the 'Go To' dialog",
        initialGridState: createGridState(bigTable, 0, 2, 0),
        steps: [
            {description: "Open 'Go To' dialog",keys: ["f5"],iconName: "Locate",dialogEffect: { action: 'SHOW_GO_TO' },},
            {description: "Close the dialog",keys: ["esc"],iconName: "X",dialogEffect: { action: 'HIDE_GO_TO' }}
        ]
      }
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
      singleStep({ description: "Extend selection right", keys: ["shift", "arrowright"], iconName: "MoveRight", gridEffect: { action: 'EXTEND_SELECTION', payload: { direction: 'right' } }, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Select to edge right", keys: ["control", "shift", "arrowright"], iconName: "ArrowRight", gridEffect: { action: 'SELECT_TO_EDGE', payload: { direction: 'right' } }, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Select current region", keys: ["control", "a"], iconName: "Frame" , gridEffect: { action: 'SELECT_ALL' }, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Select to last cell", keys: ["control", "shift", "end"], iconName: "ArrowDownRightSquare", gridEffect: { action: 'SELECT_TO_END' }, initialGridState: createGridState(bigTable,0,2,0) }),
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
      {
        description: "Select and delete a column",initialGridState: createGridState(bigTable, 0, 2, 1),
        steps: [
          {description: "Select the current column",keys: ["control", " "],iconName: "Columns3",gridEffect: { action: 'SELECT_COLUMN' },},
          {description: "Delete the selected column",keys: ["control", "-"],iconName: "Trash2",gridEffect: { action: 'DELETE_COLUMN' },}
        ]
      },
      {
        description: "Select and insert a row",initialGridState: createGridState(bigTable, 0, 2, 0),
        steps: [
          {description: "Select the current row",keys: ["shift", " "],iconName: "Rows3",gridEffect: { action: 'SELECT_ROW' },},
          {description: "Insert a new row above",keys: ["control", "shift", "="],iconName: "Sheet",gridEffect: { action: 'INSERT_ROW' },}
        ]},
      {
        description: "Manipulate row visibility",initialGridState: createGridState(bigTable, 0, 2, 0),
        steps: [
          {description: "Hide Row",keys: ["control", "9"],iconName: "EyeOff",gridEffect: { action: 'HIDE_ROW' },},
          {description: "Unhide rows",keys: ["control", "shift", "9"],iconName: "Eye",gridEffect: { action: 'UNHIDE_ROWS' },},
          {description: "Hide column",keys: ["control", "0"],iconName: "EyeOff",gridEffect: { action: 'HIDE_COLUMN' },},
          {description: "Unhide columns",keys: ["control", "shift", "0"],iconName: "Eye",gridEffect: { action: 'UNHIDE_COLUMNS' },},
          {description: "Select visible cells only",keys: ["alt", ";"],iconName: "Aperture",gridEffect: { action: 'SET_SELECTION_MODE', payload: 'visibleOnly' },}
        ]},
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
      {
        description: "Edit and lock a formula reference",
        initialGridState: createGridState([['A', 'B'], ['1', '2']], 0, 1, 1),
        steps: [
          {description: "Edit the cell formula",keys: ["f2"],iconName: "Pencil",gridEffect: { action: 'START_EDITING', payload: { formula: '=A1' } },},
          {description: "Toggle absolute reference",keys: ["f4"],iconName: "Anchor",gridEffect: { action: 'TOGGLE_ABS_REF' },},
        ]
      },

      singleStep({ description: "AutoSum", keys: ["alt", "="], iconName: "Calculator", initialGridState: createSummableGridState(), gridEffect: { action: 'AUTOSUM' } }),
      singleStep({ description: "Repeat last action", keys: ["f4"], iconName: "Repeat", initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Toggle formulas", keys: ["control", "`"], iconName: "FileCode", initialGridState: createGridState(bigTable,0,2,0) }),
      //singleStep({ description: "Name Manager", keys: ["control", "f3"], iconName: "BookUser", initialGridState: createGridState(bigTable,0,2,0) }),
      //singleStep({ description: "Create from selection", keys: ["control", "shift", "f3"], iconName: "CaseUpper", initialGridState: createGridState(bigTable,0,2,0) }),
      {
        description: "Create a table and open filter",
        initialGridState: createGridState(bigTable,0,0,0),
        steps: [
            {description: "Select current region", keys: ["control", "a"], iconName: "Frame" , gridEffect: { action: 'SELECT_ALL' },},
            {description: "Open Create Table dialog",keys: ["control", "t"],iconName: "Table",dialogEffect: { action: 'SHOW_CREATE_TABLE' }},
            {description: "Confirm table creation",keys: ["enter"],iconName: "Check",dialogEffect: { action: 'HIDE_CREATE_TABLE' },gridEffect: { action: 'APPLY_TABLE_FORMATTING' },previewDialogEffect: { action: 'HIGHLIGHT_CREATE_TABLE_OK' }},
            {description: "Toggle AutoFilter",keys: ["control", "shift", "l"],iconName: "Filter",},
            {description: "Open filter dropdown",keys: ["alt", "arrowdown"],iconName: "ChevronDownSquare",dialogEffect: { action: 'SHOW_FILTER_DROPDOWN' },},
            {description: "Close the dropdown",keys: ["esc"],iconName: "X",dialogEffect: { action: 'HIDE_FILTER_DROPDOWN' },},
        ]
      },
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
      singleStep({ description: "Flash Fill", keys: ["control", "e"], iconName: "Wand2", initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Fill Down", keys: ["control", "d"], iconName: "ArrowDownSquare", initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Fill Right", keys: ["control", "r"], iconName: "ArrowRightSquare", initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Insert Date", keys: ["control", ";"], iconName: "CalendarDays", initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Insert Time", keys: ["control", "shift", ";"], iconName: "Clock", initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Insert line break", keys: ["alt", "enter"], iconName: "WrapText", initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Insert Comment", keys: ["shift", "f2"], iconName: "MessageSquarePlus", initialGridState: createGridState(bigTable,0,2,0) }),
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
      singleStep({ description: "Center align", keys: ["alt", "h", "a", "c"], iconName: "AlignCenter", isSequential: true, initialGridState: createGridState(bigTable,0,2,0), gridEffect: { action: 'APPLY_STYLE_CENTER_ALIGN' } }),
      {
        description: "Merge and Center",
        initialGridState: createGridState(bigTable, 0, 2, 0),
        steps: [
            {description: "Extend selection right", keys: ["shift", "arrowright"], iconName: "MoveRight", gridEffect: { action: 'EXTEND_SELECTION', payload: { direction: 'right' } } },
            {description: 'Open Fill Color Menu',keys: ['alt', 'h', 'h'],iconName: 'PaintBucket',isSequential: true,dialogEffect: { action: 'SHOW_FILL_COLOR_DROPDOWN' }},
            {description: "Merge & Center", keys: ["alt", "h", "m", "c"], iconName: "Merge", isSequential: true, gridEffect: { action: 'APPLY_STYLE_MERGE_CENTER' } }
        ]
      },
      singleStep({ 
        description: "Wrap Text", 
        keys: ["alt", "h", "w"], 
        iconName: "WrapText", 
        isSequential: true, 
        initialGridState: createGridState(
          [['Long Text Here','', '','', ''],
          ['Long Text Here', '','','', ''],
          ['','','', '',''],
          ['','','', '',''],],0,0,0),
        gridEffect: { action: 'APPLY_STYLE_WRAP_TEXT' } }),
      singleStep({ description: "Apply all borders", keys: ["alt", "h", "b", "a"], iconName: "Grid", isSequential: true, initialGridState: createGridState(bigTable,0,2,0), gridEffect: { action: 'APPLY_STYLE_ALL_BORDERS' } }),
      singleStep({ description: "Thick box border", keys: ["alt", "h", "b", "t"], iconName: "RectangleHorizontal", isSequential: true, initialGridState: createGridState(bigTable,0,2,0), gridEffect: { action: 'APPLY_STYLE_THICK_BORDER' } }),
      {
        description: "Use the ribbon to apply a fill color",
        initialGridState: createGridState(bigTable, 0, 2, 0),
        steps: [
            {description: 'Open Fill Color Menu',keys: ['alt', 'h', 'h'],iconName: 'PaintBucket',isSequential: true,dialogEffect: { action: 'SHOW_FILL_COLOR_DROPDOWN' }},
            {description: 'Select a color and apply',keys: ['enter'],iconName: 'Check',dialogEffect: { action: 'HIDE_FILL_COLOR_DROPDOWN' },gridEffect: { action: 'APPLY_FILL_COLOR' }}
        ]
      },
      singleStep({ description: "Clear formatting", keys: ["alt", "h", "e", "f"], iconName: "RemoveFormatting", isSequential: true, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Auto-fit width", keys: ["alt", "h", "o", "i"], iconName: "ArrowUpNarrowWide", isSequential: true, initialGridState: createGridState(bigTable,0,2,0), gridEffect: { action: 'AUTOFIT_COLUMNS' } }),
    ],
  },
  {
    id: "number-formatting",
    name: "Number Formatting",
    description: "Format currencies, dates, and precision.",
    level: "Ninja",
    category: "Formatting",
    iconName: "DollarSign",
    challenges: [
      singleStep({ description: "Currency format", keys: ["control", "shift", "4"], iconName: "DollarSign", initialGridState: createGridState(formatTable,0,1,0), gridEffect: { action: 'APPLY_STYLE_CURRENCY' } }),
      singleStep({ description: "Percentage format", keys: ["control", "shift", "5"], iconName: "Percent", initialGridState: createGridState(formatTable,0,1,0), gridEffect: { action: 'APPLY_STYLE_PERCENTAGE' } }),
      singleStep({ description: "General format", keys: ["control", "shift", "`"], iconName: "Hash", initialGridState: createGridState(formatTable,0,1,3),gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value:'2' } } }),
      singleStep({ description: "Date format", keys: ["control", "shift", "3"], iconName: "Calendar", initialGridState: createGridState(formatTable,0,1,1), gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value:'27-Mar-26' } } }),
      singleStep({ description: "Time format", keys: ["control", "shift", "2"], iconName: "Clock", initialGridState: createGridState(formatTable,0,1,2), gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value:'3 PM' } } }),
      singleStep({ description: "Increase decimal", keys: ["alt", "h", "0"], iconName: "PlusCircle", isSequential: true, initialGridState: createGridState(formatTable,0,1,3), gridEffect: { action: 'INCREASE_DECIMAL' } }),
      singleStep({ description: "Decrease decimal", keys: ["alt", "h", "9"], iconName: "MinusCircle", isSequential: true, initialGridState: createGridState(formatTable,0,1,3), gridEffect: { action: 'DECREASE_DECIMAL' } }),
      singleStep({ description: "Open Format Cells dialog",keys: ["control", "1"],iconName: "Settings2",initialGridState: createGridState(formatTable,0,1,0),dialogEffect: { action: 'SHOW_FORMAT_CELLS_DIALOG' } }),
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
      {
        description: "Open and close the Sort dialog",initialGridState: createGridState(bigTable,0,2,0),
        steps: [
            {description: "Open Sort dialog",keys: ["alt", "a", "s","s"],iconName: "ArrowDownUp",isSequential: true,dialogEffect: { action: 'SHOW_SORT_DIALOG' }},
            {description: "Close the dialog",keys: ["esc"],iconName: "X",dialogEffect: { action: 'HIDE_SORT_DIALOG' }}
        ]
      },
      {
        description: "Group & Ungroup Rows",initialGridState: createGridState(bigTable,0,2,0),
        steps: [
            {description: "Group rows", keys: ["alt", "shift", "arrowright"], iconName: "Group", gridEffect: { action: 'GROUP_ROWS' } },
            {description: "Ungroup rows/cols", keys: ["alt", "shift", "arrowleft"], iconName: "Ungroup", gridEffect: { action: 'UNGROUP_ROWS' } }
        ]
      },
      singleStep({ description: "Paste Special", keys: ["control", "alt", "v"], iconName: "ClipboardSignature", initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Toggle Gridlines", keys: ["alt", "w", "v", "g"], iconName: "Grid3X3", isSequential: true, initialGridState: createGridState(bigTable,0,2,0), gridEffect: { action: 'TOGGLE_GRIDLINES' } }),
      singleStep({ description: "Freeze Panes", keys: ["alt", "w", "f", "f"], iconName: "Lock", isSequential: true, initialGridState: createGridState(bigTable,0,2,0), gridEffect: { action: 'FREEZE_PANES' } }),
    ],
  },
];

export const ALL_CHALLENGE_SETS = [...CHALLENGE_SETS];


import { ChallengeSet, Challenge, GridState } from "./types";

const singleStep = (challenge: Omit<Challenge, 'steps'> & { warningMessage?: string }): Challenge => ({
    ...challenge,
    steps: [{
      description: challenge.description,
      keys: challenge.keys!,
      macKeys: challenge.macKeys,
      windowsOnly: challenge.windowsOnly,
      iconName: challenge.iconName!,
      isSequential: challenge.isSequential,
      gridEffect: challenge.gridEffect,
      dialogEffect: challenge.dialogEffect,
      previewDialogEffect: challenge.previewDialogEffect,
      warningMessage: challenge.warningMessage,
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

const warningSequence = "Internet Browser Limitation -  press 'Cntr'/'Command' last."



const flashTable = [['','ID', 'Name',  '',''],
    ['','1', 'Project 1',  '',''],
    ['','2', 'Project 2', '',''],
    ['','3', 'Project 3',  '',''],
    ['','4', '', '',''],
];
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

const wrapTable = [['Long Text Here','', '','', ''],
['Long Text Here', '','','', ''],
['','','', '',''],
['','','', '',''],]

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
    id: "free-trial",
    name: "Free Trial",
    description: "Example of the shorcuts",
    level: "Apprentice",
    category: "General",
    iconName: "DollarSign",
    challenges: [
      singleStep({ description: "Bold", keys: ["control", "b"], macKeys: [['meta','b'],['control','b']], iconName: "Bold", gridEffect: { action: 'APPLY_STYLE_BOLD' }, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({description: "Open Find dialog",keys: ["control", "f"], macKeys: ['control','f'],iconName: "Search",dialogEffect: { action: 'SHOW', payload: { activeTab: 'find' } }, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Center align", keys: ["alt", "h", "a", "c"], macKeys: ['meta','e'], iconName: "AlignCenter", isSequential: true, initialGridState: createGridState(bigTable,0,2,0), gridEffect: { action: 'APPLY_STYLE_CENTER_ALIGN' } }),
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
      singleStep({ description: "Save workbook", keys: ["control", "s"], macKeys: [['meta','s'],['control','s']], iconName: "Save", initialGridState: createGridState(bigTable,0,2,0),}),
      singleStep({ description: "Undo", keys: ["control", "z"], macKeys: [['meta','z'],['control','z']], iconName: "Undo2", initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Redo", keys: ["control", "y"], macKeys: [['meta','y'],['control','y']], iconName: "Redo2", initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Copy", keys: ["control", "c"], macKeys: [['meta','c'],['control','c']], iconName: "Copy", gridEffect: { action: 'COPY' }, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Cut", keys: ["control", "x"], macKeys: [['meta','x'],['control','x']], iconName: "Scissors", gridEffect: { action: 'CUT' }, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Paste", keys: ["control", "v"], macKeys: [['meta','v'],['control','v']], iconName: "ClipboardPaste", initialGridState: createGridState(bigTable,0,2,0), gridEffect: { action: 'PASTE' } }),
      singleStep({ description: "Bold", keys: ["control", "b"], macKeys: [['meta','b'],['control','b']], iconName: "Bold", gridEffect: { action: 'APPLY_STYLE_BOLD' }, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Italicize", keys: ["control", "i"], macKeys: [['meta','i'],['control','i']], iconName: "Italic", gridEffect: { action: 'APPLY_STYLE_ITALIC' }, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Underline", keys: ["control", "u"], macKeys: ['meta','u'], iconName: "Underline", gridEffect: { action: 'APPLY_STYLE_UNDERLINE' }, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Strikethrough", keys: ["control", "5"], macKeys: [['meta','shift','x'],['control','5']], iconName: "Strikethrough", gridEffect: { action: 'APPLY_STYLE_STRIKETHROUGH' }, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({description: "Open Find dialog",keys: ["control", "f"], macKeys: ['control','f'],iconName: "Search",dialogEffect: { action: 'SHOW', payload: { activeTab: 'find' } }, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Open Replace dialog",keys: ["control", "h"], macKeys: [['control','h'],['meta','shift','h']],iconName: "Replace",dialogEffect: { action: 'SHOW', payload: { activeTab: 'replace' } }, initialGridState: createGridState(bigTable,0,2,0) }),
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
      singleStep({ description: "Jump to most left edge", keys: ["control", "arrowleft"], macKeys: ['meta','arrowleft'], iconName: "MoveLeft", gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'edgeLeft' } }, initialGridState: createGridState(leanTable, 0, 2, 3) }),
      singleStep({ description: "Jump to beginning of row", keys: ["home"], macKeys: ['home'], iconName: "Home", gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'home' } }, initialGridState: createGridState(leanTable, 0, 2, 3) }),
      singleStep({ description: "Jump to top-left (A1)", keys: ["control", "home"], windowsOnly: true, iconName: "PanelTopOpen", gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'topLeft' } }, initialGridState: createGridState(leanTable, 0, 2, 3) }),
      singleStep({ description: "Jump to last used cell", keys: ["control", "end"], windowsOnly: true, iconName: "PanelBottomOpen", gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'end' } }, initialGridState: createGridState(leanTable, 0, 0, 1, 0) }),
      singleStep({ description: "Go to next worksheet", keys: ["control", "pagedown"], macKeys: ["alt", "arrowright"], iconName: "ArrowRightToLine", gridEffect: { action: 'SWITCH_SHEET', payload: { direction: 'next' } }, initialGridState: createMultiSheetGridState(0) }),
      singleStep({ description: "Go to previous worksheet", keys: ["control", "pageup"], macKeys: ["alt", "arrowleft"], iconName: "ArrowLeftToLine", gridEffect: { action: 'SWITCH_SHEET', payload: { direction: 'previous' } }, initialGridState: createMultiSheetGridState(1) }),
      {
        description: "Open 'Go To' dialog",initialGridState: createGridState(bigTable, 0, 2, 0),
        steps: [
          {description: "Open 'Go To' dialog",keys: ["f5"], macKeys: [['control','g'],['f5']],iconName: "Locate",dialogEffect: { action: 'SHOW_GO_TO' }},
          {description: "Close dialog",keys: ["esc"], macKeys: ['esc'],iconName: "X",dialogEffect: { action: 'HIDE_GO_TO' }}
        ]
      },
      {
        description: "Scan pages up and down",
        initialGridState: createGridState(leanTable, 0, 4, 3, 20),
        steps: [
            {description: "Scroll one page down",keys: ["pagedown"], macKeys: ['pagedown'],iconName: "ArrowDownToLine",gridEffect: { action: 'SCROLL_PAGE_DOWN' }},
            {description: "Scroll one page up",keys: ["pageup"], macKeys: ['pageup'],iconName: "ArrowUpToLine",gridEffect: { action: 'SCROLL_PAGE_UP' }}
        ]
      },
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
      singleStep({ description: "Extend selection right", keys: ["shift", "arrowright"], macKeys: ['shift','arrowright'], iconName: "MoveRight", gridEffect: { action: 'EXTEND_SELECTION', payload: { direction: 'right' } }, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Select to edge right", keys: ["control", "shift", "arrowright"], macKeys: [['meta','shift','arrowright'],['control','shift','arrowright']], iconName: "ArrowRight", gridEffect: { action: 'SELECT_TO_EDGE', payload: { direction: 'right' } }, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Select current region", keys: ["control", "a"], macKeys: [['meta','a'],['control','a']], iconName: "Frame" , gridEffect: { action: 'SELECT_ALL' }, initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: "Select to last cell", keys: ["control", "shift", "end"], windowsOnly: true, iconName: "ArrowDownRightSquare", gridEffect: { action: 'SELECT_TO_END' }, initialGridState: createGridState(bigTable,0,2,0) }),
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
          {description: "Select the current column",keys: ["control", " "], macKeys: ['control',' '],iconName: "Columns3",gridEffect: { action: 'SELECT_COLUMN' },warningMessage: warningSequence},
          {description: "Delete the selected column",keys: ["control", "-"], macKeys: [['meta','-'],['control','-']],iconName: "Trash2",gridEffect: { action: 'DELETE_COLUMN' },}
        ]
      },
      {
        description: "Select and insert a row",initialGridState: createGridState(bigTable, 0, 2, 0),
        steps: [
          {description: "Select the current row",keys: ["shift", " "], macKeys: ['shift',' '],iconName: "Rows3",gridEffect: { action: 'SELECT_ROW' },warningMessage: warningSequence},
          {description: "Insert a new row above",keys: ["control", "shift", "="], macKeys: [['meta','shift','='],['control','shift','=']],iconName: "Sheet",gridEffect: { action: 'INSERT_ROW' },}
        ]},
      {
        description: "Manipulate row and column visibility",initialGridState: createGridState(bigTable, 0, 2, 0),
        steps: [
          {description: "Hide Row",keys: ["control", "9"], macKeys: [['control','9'],['meta','9']],iconName: "EyeOff",gridEffect: { action: 'HIDE_ROW' },},
          {description: "Unhide rows",keys: ["control", "shift", "9"], macKeys: [['control','shift','9'],['meta','shift','9']],iconName: "Eye",gridEffect: { action: 'UNHIDE_ROWS' },},
          {description: "Hide column",keys: ["control", "0"], macKeys: [['control','0'],['meta','0']],iconName: "EyeOff",gridEffect: { action: 'HIDE_COLUMN' },},
          {description: "Unhide columns",keys: ["control", "shift", "0"], macKeys: [['control','shift','0'],['meta','shift','0']],iconName: "Eye",gridEffect: { action: 'UNHIDE_COLUMNS' },},
        ]},
        {
          description: "Select visible cells in a range",initialGridState: createGridState(bigTable, 0, 2, 0),
          steps: [
            {description: "Select current region", keys: ["control", "a"], macKeys: [['meta','a'],['control','a']], iconName: "Frame" , gridEffect: { action: 'SELECT_ALL' },},
            {description: "Select visible cells",keys: ["alt", ";"], macKeys: ['alt',';'],iconName: "Aperture",gridEffect: { action: 'SET_SELECTION_MODE', payload: 'visibleOnly' },}
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
          {description: "Edit the cell formula",keys: ["f2"], macKeys: [['control','u'],['f2']],iconName: "Pencil",gridEffect: { action: 'START_EDITING', payload: { formula: '=A1' } },},
          {description: "Toggl formula reference",keys: ["f4"], macKeys: [['meta','t'],['f4']],iconName: "Anchor",gridEffect: { action: 'TOGGLE_ABS_REF' },},
        ]
      },
      singleStep({ description: 'Recalculate Workbook', keys: ['f9'], macKeys: [['meta','='],['f9']], iconName: 'RefreshCw' , initialGridState: createGridState(bigTable,0,2,0) }),
      singleStep({ description: 'Recalculate Current Sheet', keys: ['shift','f9'], macKeys: ['shift','f9'], iconName: 'RefreshCw', initialGridState: createGridState(bigTable,0,2,0)}),
      singleStep({ description: "AutoSum", keys: ["alt", "="], macKeys: ['meta','shift','t'], iconName: "Calculator", initialGridState: createSummableGridState(), gridEffect: { action: 'AUTOSUM' } }),
      singleStep({ description: "Repeat last action (Bold)", keys: ["f4"], macKeys: [['meta','y'],['f4']], iconName: "Repeat", initialGridState: createGridState(bigTable,0,2,0),gridEffect: { action: 'APPLY_STYLE_BOLD' },}),
      singleStep({ description: "Toggle formulas", keys: ["control", "`"], macKeys: ['control','`'], iconName: "FileCode", initialGridState: createGridState([['Amt1','Amt2','Amt3','Amt4'],['30','40','50','60']],0,1,0),gridEffect: {action: 'PASTE_MULTIPLE_VALUES',payload: { values: [['30','=Z4','50','=Q33']] },},warningMessage: warningSequence}),
      {
        description: "Create a table",
        initialGridState: createGridState(bigTable,0,0,0),
        steps: [
            {description: "Select current region", keys: ["control", "a"], macKeys: [['meta','a'],['control','a']], iconName: "Frame" , gridEffect: { action: 'SELECT_ALL' },},
            {description: "Open Create Table dialog",keys: ["control", "t"], macKeys: [['control','t'],['meta','t']],iconName: "Table",dialogEffect: { action: 'SHOW_CREATE_TABLE' },warningMessage: warningSequence},
            {description: "Confirm table creation",keys: ["enter"], macKeys: ['enter'],iconName: "Check",dialogEffect: { action: 'HIDE_CREATE_TABLE' },gridEffect: { action: 'APPLY_TABLE_FORMATTING' },previewDialogEffect: { action: 'HIGHLIGHT_CREATE_TABLE_OK' }}
        ]
      },
      {
        description: "Togle filter & show dropdown",
        initialGridState: createGridState(bigTable,0,0,1),
        steps: [
            {description: "Toggle AutoFilter",keys: ["control", "shift", "l"], macKeys: [['meta','shift','f'],['control','shift','l']],iconName: "Filter", gridEffect: { action: 'TOGGLE_AUTOFILTER' }},
            {description: "Open filter dropdown",keys: ["alt", "arrowdown"], macKeys: ['alt','arrowdown'],iconName: "ChevronDownSquare",dialogEffect: { action: 'SHOW_FILTER_DROPDOWN' },},
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
      singleStep({ description: "Flash Fill", keys: ["control", "e"], macKeys: ['control','e'], iconName: "Wand2", initialGridState: createGridState(flashTable,0,4,2),gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value:'Project 4' } }}),
      singleStep({ description: "Fill Down", keys: ["control", "d"], macKeys: [['meta','d'],['control','d']], iconName: "ArrowDownSquare",initialGridState: createGridState(flashTable,0,4,2),gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value:'Project 3' } }}),
      singleStep({ description: "Insert Date", keys: ["control", ";"], macKeys: ['control',';'], iconName: "CalendarDays", initialGridState: createGridState(bigTable,0,2,0),gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value:'12-Mar-2026' } }}),
      singleStep({ description: "Insert Time", keys: ["control", "shift", ";"], macKeys: ['meta',';'], iconName: "Clock", initialGridState: createGridState(bigTable,0,2,0),gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value:'3 PM' } }}),
      singleStep({ description: "Add a comment", keys: ["shift", "f2"], macKeys: ['shift','f2'], iconName: "MessageSquarePlus", initialGridState: createGridState(bigTable,0,2,0), gridEffect: { action: 'SHOW_COMMENT' } }),

// double step 
 {
        description: "Create a table and open filter",
        initialGridState: createGridState(bigTable,0,0,0),
        steps: [
            {description: "Select current region", keys: ["control", "a"], macKeys: [['meta','a'],['control','a']], iconName: "Frame" , gridEffect: { action: 'SELECT_ALL' },},
            {description: 'Type "9"', keys: ['9'], macKeys: ['9'], iconName: 'Type', gridEffect: { action: 'UPDATE_ACTIVE_CELL_CONTENT', payload: { value: '9' } } },
            {description: 'Fill all', keys: ['control', 'enter'], macKeys: ['meta','enter'], iconName: 'CheckCheck', gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value: '9' } } },

        ]
      },
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
      {
        description: "Merge and Center",
        initialGridState: createGridState(bigTable, 0, 2, 0),
        steps: [
            {description: "Extend selection right", keys: ["shift", "arrowright"], macKeys: ['shift','arrowright'], iconName: "MoveRight", gridEffect: { action: 'EXTEND_SELECTION', payload: { direction: 'right' } } },
            {description: "Merge & Center", keys: ["alt", "h", "m", "c"], windowsOnly: true, iconName: "Merge", isSequential: true, gridEffect: { action: 'APPLY_STYLE_MERGE_CENTER' } }
        ]
      },
      singleStep({ description: "Center align", keys: ["alt", "h", "a", "c"], macKeys: ['meta','e'], iconName: "AlignCenter", isSequential: true, initialGridState: createGridState(bigTable,0,2,0), gridEffect: { action: 'APPLY_STYLE_CENTER_ALIGN' } }),
      singleStep({ description: "Wrap Text", keys: ["alt", "h", "w"], windowsOnly: true, iconName: "WrapText", isSequential: true, initialGridState: createGridState(wrapTable,0,0,0),gridEffect: { action: 'APPLY_STYLE_WRAP_TEXT' } }),
      singleStep({ description: "Clear only formatting", keys: ["alt", "h", "e", "f"], windowsOnly: true, iconName: "RemoveFormatting", isSequential: true, initialGridState: createGridState(bigTable,0,3,3), gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value:'700' } } }),
      singleStep({ description: "Clear all values and formatting", keys: ["alt", "h", "e", "a"], windowsOnly: true, iconName: "RemoveFormatting", isSequential: true, initialGridState: createGridState(bigTable,0,3,3), gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value:'' } } }),
      
      
      singleStep({ description: "Apply all borders", keys: ["alt", "h", "b", "a"], macKeys: ['meta','alt','0'], iconName: "Grid", isSequential: true, initialGridState: createGridState(bigTable,0,2,1), gridEffect: { action: 'APPLY_STYLE_ALL_BORDERS' } }),
      singleStep({ description: "Thick box border", keys: ["alt", "h", "b", "t"], windowsOnly: true, iconName: "RectangleHorizontal", isSequential: true, initialGridState: createGridState(bigTable,0,2,2), gridEffect: { action: 'APPLY_STYLE_THICK_BORDER' } }),
      singleStep({ description: 'Open Fill Color Menu',keys: ['alt', 'h', 'h'], windowsOnly: true,iconName: 'PaintBucket',isSequential: true, initialGridState: createGridState(bigTable,0,2,0),dialogEffect: { action: 'SHOW_FILL_COLOR_DROPDOWN' } }),
      singleStep({ description: "Auto-fit width", keys: ["alt", "h", "o", "i"], windowsOnly: true, iconName: "ArrowUpNarrowWide", isSequential: true, initialGridState: createGridState(bigTable,0,2,0), gridEffect: { action: 'AUTOFIT_COLUMNS' } }),
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
      singleStep({ description: "Currency format", keys: ["control", "shift", "4"], macKeys: ['control','shift','4'], iconName: "DollarSign", initialGridState: createGridState(formatTable,0,1,0), gridEffect: { action: 'APPLY_STYLE_CURRENCY' } }),
      singleStep({ description: "Percentage format", keys: ["control", "shift", "5"], macKeys: ['control','shift','5'], iconName: "Percent", initialGridState: createGridState(formatTable,0,1,0), gridEffect: { action: 'APPLY_STYLE_PERCENTAGE' } }),
      singleStep({ description: "General format", keys: ["control", "shift", "`"], macKeys: ['control','shift','`'], iconName: "Hash", initialGridState: createGridState(formatTable,0,1,3),gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value:'2' } } }),
      singleStep({ description: "Date format", keys: ["control", "shift", "3"], macKeys: ['control','shift','3'], iconName: "Calendar", initialGridState: createGridState(formatTable,0,1,1), gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value:'27-Mar-26' } } }),
      singleStep({ description: "Time format", keys: ["control", "shift", "2"], macKeys: ['control','shift','2'], iconName: "Clock", initialGridState: createGridState(formatTable,0,1,2), gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value:'3 PM' } } }),
      singleStep({ description: "Increase decimal", keys: ["alt", "h", "0"], windowsOnly: true, iconName: "PlusCircle", isSequential: true, initialGridState: createGridState(formatTable,0,1,3), gridEffect: { action: 'INCREASE_DECIMAL' } }),
      singleStep({ description: "Decrease decimal", keys: ["alt", "h", "9"], windowsOnly: true, iconName: "MinusCircle", isSequential: true, initialGridState: createGridState(formatTable,0,1,3), gridEffect: { action: 'DECREASE_DECIMAL' } }),
      singleStep({ description: "Open Format Cells dialog",keys: ["control", "1"], macKeys: [['meta','1'],['control','1']],iconName: "Settings2",initialGridState: createGridState(formatTable,0,1,0),dialogEffect: { action: 'SHOW_FORMAT_CELLS_DIALOG' } }),
    ],
  },
  {
    id: "expert-view-management",
    name: "Power View & Layout",
    description: "Sort data, freeze panes, group rows, and paste special.",
    level: "Ninja",
    category: "Data",
    iconName: "ShieldCheck",
    challenges: [
      singleStep({ description: "Open Sort dialog",keys: ["alt", "a", "s","s"], macKeys: ['meta','shift','r'],iconName: "ArrowDownUp",isSequential: true,initialGridState: createGridState(bigTable,0,2,0),dialogEffect: { action: 'SHOW_SORT_DIALOG' }}),
      {
        description: "Use Paste Special to paste values",
        initialGridState: createGridState(bigTable, 0, 2, 0),
        steps: [
          { description: "Open Paste Special dialog", keys: ["control", "alt", "v"], macKeys: [['control','meta','v'],['meta','alt','v']], iconName: "ClipboardSignature", dialogEffect: { action: 'SHOW_PASTE_SPECIAL_DIALOG' } },
          { description: "Select 'Formulas' to paste", keys: ["f"], macKeys: ['f'], isSequential: true, iconName: "Baseline", previewDialogEffect: { action: 'MOVE_PASTE_SPECIAL_HIGHLIGHT', payload: 'Formulas' }, dialogEffect: { action: 'SELECT_PASTE_SPECIAL_OPTION', payload: 'Formulas' } },
          { description: "Select 'Formats' to paste", keys: ["t"], macKeys: ['t'], isSequential: true, iconName: "Baseline", previewDialogEffect: { action: 'MOVE_PASTE_SPECIAL_HIGHLIGHT', payload: 'Formats' }, dialogEffect: { action: 'SELECT_PASTE_SPECIAL_OPTION', payload: 'Formats' } },
          { description: "Select 'Values' to paste", keys: ["v"], macKeys: ['v'], isSequential: true, iconName: "Baseline", previewDialogEffect: { action: 'MOVE_PASTE_SPECIAL_HIGHLIGHT', payload: 'Values' }, dialogEffect: { action: 'SELECT_PASTE_SPECIAL_OPTION', payload: 'Values' } },
          { description: "Confirm Paste Special", keys: ["enter"], macKeys: ['enter'], iconName: "Check", previewDialogEffect: { action: 'HIGHLIGHT_BUTTON', payload: 'ok' }, dialogEffect: { action: 'HIDE_PASTE_SPECIAL_DIALOG' }, gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value: 'Pasted Value' } } }
        ]
      },
      singleStep({ description: "Toggle Gridlines", keys: ["alt", "w", "v", "g"], windowsOnly: true, iconName: "Grid3X3", isSequential: true, initialGridState: createGridState(bigTable,0,2,0), gridEffect: { action: 'TOGGLE_GRIDLINES' } }),
      singleStep({ description: "Freeze Panes", keys: ["alt", "w", "f", "f"], windowsOnly: true, iconName: "Lock", isSequential: true, initialGridState: createGridState(bigTable,0,2,0), gridEffect: { action: 'FREEZE_PANES' } }),
      {
        description: "Group & Ungroup Rows",initialGridState: createGridState(bigTable,0,2,0),
        steps: [
            {description: "Select the current row",keys: ["shift", " "], macKeys: ['shift',' '],iconName: "Rows3",gridEffect: { action: 'SELECT_ROW' },warningMessage: warningSequence},
            {description: "Group rows", keys: ["alt", "shift", "arrowright"], macKeys: [['meta','shift','k'],['alt','shift','arrowright']], iconName: "Group", gridEffect: { action: 'GROUP_ROWS' } },
            {description: "Ungroup rows", keys: ["alt", "shift", "arrowleft"], macKeys: [['meta','shift','j'],['alt','shift','arrowleft']], iconName: "Ungroup", gridEffect: { action: 'UNGROUP_ROWS' } }
        ]
      },
    ],
  },
];

export const ALL_CHALLENGE_SETS = [...CHALLENGE_SETS];

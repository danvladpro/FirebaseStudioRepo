

import { MoveRight } from "lucide-react";
import { ChallengeLevel, GridEffect, GridState, DialogEffect, FindReplaceDialogState } from "./types";

export interface DrillStep {
  description: string;
  keys: string[];
  isSequential?: boolean;
  iconName: keyof typeof import("lucide-react");
  gridEffect?: GridEffect;
  dialogEffect?: DialogEffect;
  previewDialogEffect?: DialogEffect;
}

const formulaDrillValues = [
    ['Header A', 'Header B', 'Header C'],
    ['100', '250', '350'],
    ['150', '300', '450'],
    ['200', '350', '550']
];

const formulaDrillFormulas = [
    ['Header A', 'Header B', 'Header C'],
    ['=Z4', '=Z5', '=SUM(B2:C2)'],
    ['=A2+50', '=B2+50', '=SUM(B3:C3)'],
    ['=A3+50', '=B3+50', '=SUM(B4:C4)']
];

// This is the new centralized repository of all possible drill steps.
export const ALL_DRILL_STEPS: Record<string, DrillStep> = {
  // ----- Navigation
  // Arrows
  moveDown: { description: 'Move down', keys: ['arrowdown'], iconName: 'ArrowDown', gridEffect: { action: 'MOVE_SELECTION', payload: { direction: 'down' } } },
  moveUp: { description: 'Move up', keys: ['arrowup'], iconName: 'ArrowUp', gridEffect: { action: 'MOVE_SELECTION', payload: { direction: 'up' } } },
  moveLeft: { description: 'Move left', keys: ['arrowleft'], iconName: 'ArrowLeft', gridEffect: { action: 'MOVE_SELECTION', payload: { direction: 'left' } } },
  MoveRight: { description: 'Move right', keys: ['arrowright'], iconName: 'ArrowRight', gridEffect: { action: 'MOVE_SELECTION', payload: { direction: 'right' } } },
  // Jumping
  jumpTop: { description: 'Jump Top', keys: ['control', 'arrowup'], iconName: 'ArrowUp', gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'edgeUp' } } },
  jumpRight: { description: 'Jump Right', keys: ['control', 'arrowright'], iconName: 'ArrowRight', gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'edgeRight' } } },
  jumpBottom: { description: 'Jump Bottom', keys: ['control', 'arrowdown'], iconName: 'ArrowDown', gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'edgeDown' } } },
  jumpLeft: { description: 'Jump Left', keys: ['control', 'arrowleft'], iconName: 'ArrowLeft', gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'edgeLeft' } } },
  // Home & End
  jumpStart: { description: 'Go to Start', keys: ['control', 'home'], iconName: 'ArrowUpLeft', gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'topLeft' } } },
  jumpEnd: { description: 'Go to End', keys: ['control', 'end'], iconName: 'ArrowDownRight', gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'end' } } },
  // Jumping sheets/pages
  nextSheet: { description: 'Next worksheet', keys: ['control', 'pagedown'], iconName: 'ArrowRightToLine', gridEffect: { action: 'SWITCH_SHEET', payload: { direction: 'next' } } },
  prevSheet: { description: 'Previous worksheet', keys: ['control', 'pageup'], iconName: 'ArrowLeftToLine', gridEffect: { action: 'SWITCH_SHEET', payload: { direction: 'previous' } } },
  pageDown: { description: 'Page down', keys: ['pagedown'], iconName: 'ArrowDownToLine', gridEffect: { action: 'SCROLL_PAGE_DOWN' } },
  pageUp: { description: 'Page up', keys: ['pageup'], iconName: 'ArrowUpToLine', gridEffect: { action: 'SCROLL_PAGE_UP' } },
  // other
  openGoTo: { description: 'Open Go To', keys: ['f5'], iconName: 'Navigation', dialogEffect: { action: 'SHOW_GO_TO' } },
  confirmGoTo: { description: 'Confirm Go To', keys: ['enter'], iconName: 'CornerDownLeft', dialogEffect: { action: 'HIDE_GO_TO' }, previewDialogEffect: { action: 'HIGHLIGHT_GO_TO_OK' } },
  

  // ------ Selection
  selectRow: { description: 'Select row', keys: ['shift', ' '], iconName: 'Rows', gridEffect: { action: 'SELECT_ROW' } },
  selectCol: { description: 'Select column', keys: ['control', ' '], iconName: 'Columns', gridEffect: { action: 'SELECT_COLUMN' } },
 
  selectCurrentRegion:  { description: 'Select All', keys: ['control', 'a'], iconName: 'Frame', gridEffect: { action: 'SELECT_ALL' } },
  selectCurrentRegion8: { description: 'Select current region', keys: ['control', 'shift', '8'], iconName: 'Scan', gridEffect: { action: 'SELECT_ALL' } },

  expandRight: { description: 'Expand right', keys: ['shift', 'arrowright'], iconName: 'ArrowRight', gridEffect: { action: 'EXTEND_SELECTION', payload: { direction: 'right' } } },
  extendDown:  { description: 'Extend down', keys: ['shift', 'arrowdown'], iconName: 'ArrowDown', gridEffect: { action: 'EXTEND_SELECTION', payload: { direction: 'down' } } },
  expandLeft:  { description: 'Expand left', keys: ['shift', 'arrowleft'], iconName: 'ArrowLeft', gridEffect: { action: 'EXTEND_SELECTION', payload: { direction: 'left' } } },
  expandUp:    { description: 'Expand up', keys: ['shift', 'arrowup'], iconName: 'ArrowUp', gridEffect: { action: 'EXTEND_SELECTION', payload: { direction: 'up' } } },

  selectRightToEdge: { description: 'Select all to the right', keys: ['control', 'shift', 'arrowright'], iconName: 'ArrowRight', gridEffect: { action: 'SELECT_TO_EDGE', payload: { direction: 'right' } } },
  selectDownToEdge:  { description:  'Select all to the bottom', keys: ['control', 'shift', 'arrowdown'], iconName: 'ArrowDown', gridEffect: { action: 'SELECT_TO_EDGE', payload: { direction: 'down' } } },
  selectLeftToEdge:  { description:  'Select all to the left', keys: ['control', 'shift', 'arrowleft'], iconName: 'ArrowLeft', gridEffect: { action: 'SELECT_TO_EDGE', payload: { direction: 'left' } } },
  selectUpToEdge:    { description:  'Select all to the top', keys: ['control', 'shift', 'arrowup'], iconName: 'ArrowUp', gridEffect: { action: 'SELECT_TO_EDGE', payload: { direction: 'up' } } },
  selectToEnd:       { description: 'Extend to end', keys: ['control', 'shift', 'end'], iconName: 'ArrowDownRight', gridEffect: { action: 'SELECT_TO_END' } },
  selectVisible:     { description: 'Select visible cells', keys: ['alt', ';'], iconName: 'Eye', gridEffect: { action: 'SET_SELECTION_MODE', payload: 'visibleOnly' } },

  // Actions (Copy, Paste, Undo, etc.)
  copySelection: { description: 'Copy selection', keys: ['control', 'c'], iconName: 'Copy', gridEffect: { action: 'COPY' } },
  pasteData: { description: 'Paste', keys: ['control', 'v'], iconName: 'ClipboardPaste', gridEffect: { action: 'PASTE' } },
  
  pasteValuesOnly: { description: 'Paste values', keys: ['control', 'alt', 'v'], iconName: 'ClipboardSignature' , gridEffect: { action: 'PASTE' } },
  cut: { description: 'Cut value', keys: ['control', 'x'], iconName: 'Scissors', gridEffect: { action: 'CUT' } },
  deleteContent: { description: 'Delete content', keys: ['delete'], iconName: 'Trash2', gridEffect: { action: 'DELETE_CONTENT' } },

  undo: { description: 'Undo deletion', keys: ['control', 'z'], iconName: 'Undo2', gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value: 'Value to Delete' } } },
  undoStrikethrough: { description: 'Undo action', keys: ['control', 'z'], iconName: 'Undo2',gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value: 'Strikethrough' } }},
  undoInsert: { description: 'Undo insert', keys: ['control', 'z'], iconName: 'Undo2' },

  redo: { description: 'Redo deletion', keys: ['control', 'y'], iconName: 'Redo2', gridEffect: { action: 'DELETE_CONTENT' } },
  redoStrike: { description: 'Redo deletion', keys: ['control', 'y'], iconName: 'Redo2', gridEffect: { action: 'APPLY_STYLE_STRIKETHROUGH' } },
  save: { description: 'Save workbook', keys: ['control', 's'], iconName: 'Save' },

  // Formatting
  bold:          { description: 'Apply Bold', keys: ['control', 'b'], iconName: 'Bold', gridEffect: { action: 'APPLY_STYLE_BOLD' } },
  italic:        { description: 'Apply italic', keys: ['control', 'i'], iconName: 'Italic', gridEffect: { action: 'APPLY_STYLE_ITALIC' } },
  underline:     { description: 'Underline', keys: ['control', 'u'], iconName: 'Underline', gridEffect: { action: 'APPLY_STYLE_UNDERLINE' } },
  strikethrough: { description: 'Strikethrough', keys: ['control', '5'], iconName: 'Strikethrough', gridEffect: { action: 'APPLY_STYLE_STRIKETHROUGH' } },
  
  applyCurrency: { description: 'Apply currency', keys: ['control', 'shift', '4'], iconName: 'DollarSign', gridEffect: { action: 'APPLY_STYLE_CURRENCY' } },
  applyPercentage: { description: 'Apply percentage', keys: ['control', 'shift', '5'], iconName: 'Percent', gridEffect: { action: 'APPLY_STYLE_PERCENTAGE' } },

  applyGeneralFormat: { description: 'Apply General format', keys: ['control', 'shift', '`'], iconName: 'Hash' },
  
  decreaseDecimals: { description: 'Decrease decimals', keys: ['alt', 'h', '9'], iconName: 'MinusCircle', isSequential: true },
  increaseDecimals: { description: 'Increase decimals', keys: ['alt', 'h', '0'], iconName: 'PlusCircle', isSequential: true },
  centerAlign: { description: 'Center align', keys: ['alt', 'h', 'a', 'c'], iconName: 'AlignCenter', isSequential: true, gridEffect: { action: 'APPLY_STYLE_CENTER_ALIGN' } },
  mergeCenter: { description: 'Merge & center', keys: ['alt', 'h', 'm', 'c'], iconName: 'Merge', isSequential: true, gridEffect: { action: 'APPLY_STYLE_MERGE_CENTER' } },
  wrapText: { description: 'Wrap text', keys: ['alt', 'h', 'w'], iconName: 'WrapText', isSequential: true, gridEffect: { action: 'APPLY_STYLE_WRAP_TEXT' } },
  applyAllBorders: { description: 'Apply all borders', keys: ['alt', 'h', 'b', 'a'], iconName: 'Grid', isSequential: true, gridEffect: { action: 'APPLY_STYLE_ALL_BORDERS' } },
  applyThickBorder: { description: 'Apply thick border', keys: ['alt', 'h', 'b', 't'], iconName: 'RectangleHorizontal', isSequential: true, gridEffect: { action: 'APPLY_STYLE_THICK_BORDER' } },
  clearFormatting: { description: 'Clear formatting', keys: ['alt', 'h', 'e', 'f'], iconName: 'RemoveFormatting', isSequential: true },
  autofitColumns: { description: 'Auto-fit width', keys: ['alt', 'h', 'o', 'i'], iconName: 'Frame', isSequential: true },
  openFillColor: { description: 'Open Fill Color', keys: ['alt', 'h', 'h'], iconName: 'PaintBucket', isSequential: true },
  openFormatCells: { description: 'Open Format Cells', keys: ['control', '1'], iconName: 'Settings2' },
  
  // Formatting - Workarounds
  applyGeneralFormatFloat: { description: 'Apply General format', keys: ['control', 'shift', '`'], iconName: 'Hash', gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value:'1' } } },
  applyGeneralFormatOnDate: { description: 'Apply General format', keys: ['control', 'shift', '`'], iconName: 'Hash', gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value: '46083' } } },
  applyDateFormatFromGeneral: { description: 'Apply Date format', keys: ['control', 'shift', '3'], iconName: 'Calendar' , gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value:'02-Mar-26' } } },
  applyPercentageFromGeneral: { description: 'Apply percentage', keys: ['control', 'shift', '5'], iconName: 'Percent', gridEffect: { action: 'APPLY_STYLE_PERCENTAGE' } },

  // Data & Formulas 
  editFormula: { description: 'Edit formula', keys: ['f2'], iconName: 'Edit3', gridEffect: { action: 'START_EDITING', payload: { formula: '=Z4' } } },
  toggleAbsRef: { description: 'Toggle absolute reference', keys: ['f4'], iconName: 'Lock', gridEffect: { action: 'TOGGLE_ABS_REF' } },
  confirmFormula: { description: 'Confirm formula', keys: ['enter'], iconName: 'CornerDownLeft' },
  autoSum: { description: 'Insert AutoSum', keys: ['alt', '='], iconName: 'Sigma', gridEffect: { action: 'AUTOSUM' } },
  
  toggleFormulas: {description: 'Show formulas',keys: ['control', '`'],iconName: 'Code',gridEffect: {action: 'PASTE_MULTIPLE_VALUES',payload: { values: formulaDrillFormulas },},},
  hideFormulas: {description: 'Hide formulas',keys: ['control', '`'],iconName: 'EyeOff',gridEffect: {action: 'PASTE_MULTIPLE_VALUES',payload: { values: formulaDrillValues },},},

  createTable: { description: 'Create table', keys: ['control', 't'], iconName: 'Table', dialogEffect: { action: 'SHOW_CREATE_TABLE' } },
  confirmTable: { description: 'Confirm table', keys: ['enter'], iconName: 'CornerDownLeft', dialogEffect: { action: 'HIDE_CREATE_TABLE' }, gridEffect: { action: 'APPLY_TABLE_FORMATTING' }, previewDialogEffect: { action: 'HIGHLIGHT_CREATE_TABLE_OK' } },
  flashFill: { description: 'Apply Flash Fill', keys: ['control', 'e'], iconName: 'Zap', gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value: 'Flash Filled' } } },
  repeatFormatting: { description: 'Repeat formatting', keys: ['f4'], iconName: 'RotateCw', gridEffect: { action: 'APPLY_STYLE_UNDERLINE' } },
  insertDate: { description: 'Insert date', keys: ['control', ';'], iconName: 'Calendar', gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value: '2026-01-24' } } },
  insertTime: { description: 'Insert time', keys: ['control', 'shift', ';'], iconName: 'Clock', gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value: '14:00' } } },
  confirmEntry: { description: 'Enter', keys: ['enter'], iconName: 'CornerDownLeft' },
  confirm: { description: 'Confirm', keys: ['enter'], iconName: 'CornerDownLeft' },
  type9: { description: 'Type "9"', keys: ['9'], iconName: 'Type', gridEffect: { action: 'UPDATE_ACTIVE_CELL_CONTENT', payload: { value: '9' } } },
  fillAll: { description: 'Fill all', keys: ['control', 'enter'], iconName: 'CheckCheck', gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value: '9' } } },
  openFilterDropdown: { description: 'Open filter dropdown', keys: ['alt', 'arrowdown'], iconName: 'Filter', dialogEffect: { action: 'SHOW_FILTER_DROPDOWN' } },
  moveToFilterItem: { description: 'Move to next item', keys: ['arrowdown'], iconName: 'ArrowDown', dialogEffect: { action: 'HIGHLIGHT_NEXT_FILTER_ITEM' } },
  applyFilterSelection: { description: 'Confirm selection', keys: ['enter'], iconName: 'Check', dialogEffect: { action: 'HIDE_FILTER_DROPDOWN' } },
  toggleFilterItem: { description: 'Toggle item selection', keys: [' '], iconName: 'CheckSquare', dialogEffect: { action: 'TOGGLE_FILTER_ITEM' }, previewDialogEffect: { action: 'TOGGLE_FILTER_ITEM'} },
  
  // Structure & Dialogs
  insertRow: { description: 'Insert row', keys: ['control', 'shift', '='], iconName: 'Sheet', gridEffect: { action: 'INSERT_ROW' } },
  deleteRow: { description: 'Delete row', keys: ['control', '-'], iconName: 'Trash2', gridEffect: { action: 'DELETE_ROW' } },
  deleteCol: { description: 'Delete Column', keys: ['control', '-'], iconName: 'Trash2', gridEffect: { action: 'DELETE_COLUMN' } },

  
  hideRow: { description: 'Hide row', keys: ['control', '9'], iconName: 'EyeOff', gridEffect: { action: 'HIDE_ROW' } },
  unhideRows: { description: 'Unhide all rows', keys: ['control', 'shift', '9'], iconName: 'Eye', gridEffect: { action: 'UNHIDE_ROWS' } },
  groupRows: { description: 'Group selected', keys: ['shift', 'alt', 'arrowright'], iconName: 'FolderPlus' },
  openFind: { description: 'Open Find', keys: ['control', 'f'], iconName: 'Search', dialogEffect: { action: 'SHOW', payload: { activeTab: 'find' } } },
  findNext: { description: 'Find next match', keys: ['enter'], iconName: 'ArrowDownToLine', previewDialogEffect: { action: 'HIGHLIGHT_BUTTON', payload: 'findNext' } },
  confirmFind: { description: 'Confirm Find', keys: ['enter'], iconName: 'CornerDownLeft', previewDialogEffect: { action: 'HIGHLIGHT_BUTTON', payload: 'findNext' } },
  findNextResult: { description: 'Find next result', keys: ['enter'], iconName: 'ArrowDown', previewDialogEffect: { action: 'HIGHLIGHT_BUTTON', payload: 'findNext' } },
  closeDialog: { description: 'Close Dialog', keys: ['esc'], iconName: 'X', dialogEffect: {action: 'HIDE'}, previewDialogEffect: { action: 'HIGHLIGHT_BUTTON', payload: 'close' } },
  openReplace: { description: 'Open Replace dialog', keys: ['control', 'h'], iconName: 'Replace', dialogEffect: { action: 'SHOW', payload: { activeTab: 'replace' } } },
  confirmReplace: { description: 'Confirm replacement', keys: ['enter'], iconName: 'Check', previewDialogEffect: { action: 'HIGHLIGHT_BUTTON', payload: 'replace' } },
  replaceAll: { description: 'Replace All', keys: ['alt','a'], isSequential: true, iconName: 'CheckCheck', previewDialogEffect: { action: 'HIGHLIGHT_BUTTON', payload: 'replaceAll' } },
  tabToNext: { description: 'Tab to next field', keys: ['tab'], iconName: 'ArrowRight', dialogEffect: { action: 'HIGHLIGHT_INPUT', payload: 'replace' } },
  typeComma: { description: 'Type comma for "Find what"', keys: [','], iconName: 'Type', dialogEffect: { action: 'SET_FIND_VALUE', payload: ',' }, previewDialogEffect: { action: 'HIGHLIGHT_INPUT', payload: 'find' } },
  typePeriod: { description: 'Type period for "Replace with"', keys: ['.'], iconName: 'Type', dialogEffect: { action: 'SET_REPLACE_VALUE', payload: '.' }, previewDialogEffect: { action: 'HIGHLIGHT_INPUT', payload: 'replace' } },
  openSortDialog: { description: 'Sort menu', keys: ['alt', 'd', 's'], iconName: 'ArrowUpDown', isSequential: true },
  freezePanes: { description: 'Freeze Panes', keys: ['alt', 'w', 'f', 'f'], iconName: 'Lock', isSequential: true, gridEffect: { action: 'FREEZE_PANES' } },
  removeGridlines: { description: 'Remove gridlines', keys: ['alt', 'w', 'v', 'g'], iconName: 'Grid3X3', isSequential: true, gridEffect: { action: 'TOGGLE_GRIDLINES' } },
  tabToTabs: { description: 'Tab to tabs', keys: ['control', 'tab'], iconName: 'ArrowRightLeft' },
};


export interface Drill {
    id: string;
    name: string;
    description: string;
    level: ChallengeLevel;
    repetitions: number;
    mistakeLimit: number;
    steps: string[];
    initialGridState?: GridState;
}

export interface DrillSet {
    id: string;
    name: string;
    drills: Drill[];
}

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

const createMultiSheetGridState = (activeSheetIndex: number = 0): GridState => ({
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
      selection: { activeCell: { row: 1, col: 1 }, anchorCell: { row: 1, col: 1 } },
    },
    {
      name: 'Sheet2',
      data: [
        ['2', 'Sheet','','',''],
        ['', '','','',''],
        ['', '','','',''],
        ['', '','','',''],
        ['', '','','',''],
      ],
      selection: { activeCell: { row: 0, col: 0 }, anchorCell: { row: 0, col: 0 } },
    },
     {
      name: 'Sheet3',
      data: [
        ['3', 'Sheet','','',''],
        ['', '','','',''],
        ['', '','','',''],
        ['', '','','',''],
        ['', '','','','']
      ],
      selection: { activeCell: { row: 0, col: 0 }, anchorCell: { row: 0, col: 0 } },
    }
  ],
  activeSheetIndex,
  clipboard: null,
});


const defaultDrillGridState = createGridState([
  ['Value to Copy', ''],
  ['', ''],
  ['', ''],
  ['', ''],
  ['', ''],
]);



const bigTable = [['ID', 'Name', 'Date', 'Amount'],
    ['1', 'Project A', '2026-01-01', '500'],
    ['2', 'Project B', '2026-01-05', '1200'],
    ['3', 'Project C', '2026-01-10', '750'],
    ['4', 'Project D', '2026-01-15', '2000'],
]

const bigTableEmptyRow = [['ID', 'Name', 'Date', 'Amount',''],
    ['1', 'Project A', '2026-01-01', '500',''],
    ['2', 'Project B', '2026-01-05', '1200',''],
    ['3', 'Project C', '2026-01-10', '750',''],
    ['4', 'Project D', '2026-01-15', '2000',''],
    ['', '', '', '','']
]


const emptyTable = [['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', '']
]



const drills: Drill[] = [
  
// ==========================================
  // LEVEL 1: BEGINNER (Warp Speed)
  // Focus: Navigation, Selection, & Basic Moves
  // ==========================================
  {
    id: 'strikethrough-undo',
    level: 'Beginner',
    name: 'Strikethrough Logic',
    description: 'Apply strikethrough and revert.',
    repetitions: 10, mistakeLimit: 2,
    initialGridState: createGridState([
      ['Strikethrough', '', ''],
      ['ABC', '', ''],
      ['', '', ''],
    ]),
    steps: ['strikethrough', 'undoStrikethrough', 'redoStrike']
  },

  {
    id: 'navigate-block-edges',
    level: 'Beginner',
    name: 'Navigate Data Block Edges',
    description: 'Jump around the perimeter of a table using Control.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,4,0),
    steps: ['jumpTop', 'jumpRight', 'jumpBottom', 'jumpLeft']
  },
  {
    id: 'copy-to-row-edge',
    level: 'Beginner',
    name: 'Jump and Paste',
    description: 'Move values across a row using jump navigation.',
    repetitions: 12, mistakeLimit: 2,
    initialGridState: createGridState([
      ['Copy Me', '', '', 'Paste Here'],
      ['','','',''],
      ['','','',''],
      ['','','','']
     ],0,3,0),
    steps: ['jumpTop', 'copySelection', 'jumpRight', 'pasteData']
  },  
  {
    id: 'expand-selection-horizontally',
    level: 'Beginner',
    name: 'Expanding Selection',
    description: 'Select all 3 cells to your right.',
    repetitions: 12,mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,2,0),
    steps: ['expandRight', 'expandRight', 'copySelection', 'moveDown', 'pasteData']
  },
  {
    id: 'cycle-worksheets',
    level: 'Beginner',
    name: 'Sheet Surfing',
    description: 'Navigate between tabs efficiently.',
    repetitions: 10, mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(0),
    steps: ['nextSheet', 'nextSheet', 'prevSheet', 'prevSheet']
  },
  {
    id: 'copy-to-next-sheet',
    level: 'Beginner',
    name: 'Cross-Sheet Copy',
    description: 'Move data across worksheets.',
    repetitions: 15,mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(0),
    steps: ['copySelection', 'nextSheet', 'pasteData']
  },
  {
    id: 'select-and-italic-table',
    level: 'Beginner',
    name: 'Select and Italicize Table',
    description: 'Quickly select a whole data table and apply italic formatting.',
    repetitions: 10, mistakeLimit: 2,
    initialGridState: createGridState(bigTableEmptyRow, 0, 0, 0),
    steps: ['selectDownToEdge', 'selectRightToEdge', 'italic']
  },
  {
    id: 'select-all-and-delete',
    level: 'Beginner',
    name: 'Select All and Delete',
    description: 'Quickly select all data in the current region and delete it.',
    repetitions: 12,mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['selectCurrentRegion', 'deleteContent']
  },
  {
    id: 'select-rectangular-range',
    level: 'Beginner',
    name: 'Select & Move Range',
    description: 'Capture a block and move it to another sheet.',
    repetitions: 10, mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(0),
    steps: ['selectRightToEdge', 'extendDown', 'copySelection', 'nextSheet', 'pasteData']
  },
  {
    id: 'extend-row-selection-down',
    level: 'Beginner',
    name: 'Quick Multiple Row Selection',
    description: 'Highlight multiple full rows instantly.',
    repetitions: 12, mistakeLimit: 2,
    initialGridState: createGridState(bigTableEmptyRow,0,0,2),
    steps: ['selectRow', 'selectDownToEdge', 'bold']
  },

  {
    id: 'scan-large-data',
    level: 'Beginner',
    name: 'Scan Large Dataset',
    description: 'Review big tables quickly using Page keys.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0, 30),
    steps: ['pageDown', 'pageUp']
  },
  {
    id: 'emphasize-and-save',
    level: 'Beginner',
    name: 'Emphasize & Save',
    description: 'Highlight important data and save your work.',
    repetitions: 12, mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(0),
    steps: ['selectCurrentRegion8', 'bold', 'underline', 'save']
  },
  {
    id: 'move-up-and-format',
    level: 'Beginner',
    name: 'Relocate & Style',
    description: 'Relocate and restyle content using arrow keys.',
    repetitions: 12, mistakeLimit: 2,
    initialGridState: createGridState([['', ''], ['', ''],['Value to Move', ''],['', ''],],0,2,0),
    steps: ['cut', 'jumpTop', 'pasteData', 'underline', 'bold']
  },
  {
    id: 'emphasize-start-end',
    level: 'Beginner',
    name: 'Start and End Focus',
    description: 'Underline the very first and last cells using Home/End jumps.',
    repetitions: 10, mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,2,0),
    steps: ['jumpStart', 'underline', 'jumpEnd', 'underline']
  },
  {
    id: 'bold-header-delete-last',
    level: 'Beginner',
    name: 'Boundary Cleanup',
    description: 'Quick clean up of a small range headers and footers.',
    repetitions: 12, mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,2,0),
    steps: ['selectCol', 'bold', 'jumpRight', 'selectCol', 'strikethrough']
  },
  {
    id: 'extend-selection-last-cell',
    level: 'Beginner',
    name: 'One-Shot Workspace Selection',
    description: 'Select everything from current cell to the end of data.',
    repetitions: 12, mistakeLimit: 2,
    initialGridState: createGridState(bigTableEmptyRow,0,2,0),
    steps: ['selectToEnd', 'underline']
  },
  {
    id: 'find-and-cycle',
    level: 'Beginner',
    name: 'Find and Cycle Results',
    description: 'Practice finding a term and cycling through the results.',
    repetitions: 12,mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['openFind', 'typeComma','findNextResult', 'findNextResult', 'closeDialog']
  },
  {
    id: 'replace-comma-with-dot',
    level: 'Beginner',
    name: 'Quick Replace',
    description: 'Learn the sequence to open Replace, enter values, and confirm.',
    repetitions: 12, mistakeLimit: 2,
    initialGridState: createGridState([['Sales,North', 'Sales,South'], ['Profit,North', 'Profit,South']], 0, 0, 0),
    steps: ['openReplace', 'typeComma', 'tabToNext', 'typePeriod', 'replaceAll', 'closeDialog']
  },


  {
    id: 'select-all-copy-new-paste',
    level: 'Beginner',
    name: 'Workspace Duplication',
    description: 'Select all data, copy it, and paste it into a new context.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(0),
    steps: ['selectCurrentRegion', 'copySelection', 'nextSheet', 'pasteData']
  },


  // ==========================================
  // LEVEL 2: INTERMEDIATE (Grid Surgeon)
  // Focus: Data Tools, Selection, & Structure
  // ==========================================
  

  {
    id: 'convert-region-to-table',
    level: 'Intermediate',
    name: 'Convert Region to Table',
    description: 'Turn a raw data block into a functional table.',
    repetitions: 14,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['selectCurrentRegion', 'createTable', 'confirmTable']
  },
  {
    id: 'copy-visible-rows',
    level: 'Intermediate',
    name: 'Copy Visible Rows',
    description: 'Copy filtered data while ignoring hidden rows.',
    repetitions: 14,
    mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(0),
    steps: [ 'hideRow','moveDown','selectCurrentRegion','selectVisible', 'copySelection', 'nextSheet', 'pasteValuesOnly']
  },
  {
    id: 'lock-formula-reference',
    level: 'Intermediate',
    name: 'Lock Formula Reference',
    description: 'Lock a cell reference while editing a formula.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['jumpBottom','editFormula', 'toggleAbsRef', 'confirmFormula']
  },
  {
    id: 'toggle-formula-view',
    level: 'Intermediate',
    name: 'Toggle Formula View',
    description: 'Audit back-end formulas and return to values.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(formulaDrillValues, 0, 0, 0),
    steps: ['toggleFormulas', 'hideFormulas','selectRightToEdge','selectDownToEdge','copySelection','pasteValuesOnly']
  },
  {
    id: 'autosum-column',
    level: 'Intermediate',
    name: 'AutoSum Column',
    description: 'Trigger a quick calculation total.',
    repetitions: 14,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTableEmptyRow, 0, 2, 0),
    steps: ['jumpRight','selectDownToEdge', 'autoSum']
  },
  {
    id: 'kill-formulas',
    level: 'Intermediate',
    name: 'Kill all Formulas in a range',
    description: 'Copy a range and paste it as values to kill the formulas.',
    repetitions: 12,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,0,0),
    steps: ['selectCurrentRegion', 'copySelection', 'pasteValuesOnly']
  },
  {
    id: 'repeat-formatting-f4',
    level: 'Intermediate',
    name: 'Repeat Formatting (F4)',
    description: 'Use F4 to quickly apply the same style elsewhere.',
    repetitions: 12,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTableEmptyRow,0,2,0),
    steps: ['underline', 'moveDown', 'repeatFormatting','selectRightToEdge','repeatFormatting']
  },

  {
    id: 'fill-current-region',
    level: 'Intermediate',
    name: 'Fill Current Region',
    description: 'Select a block and fill every cell with a single value.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(emptyTable,0,0,0),
    steps: ['expandRight','extendDown', 'type9', 'fillAll']
  },
  {
    id: 'open-filter-dropdown',
    level: 'Intermediate',
    name: 'Filter Navigation',
    description: 'Access the filter menu without a mouse.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,0,1),
    steps: ['openFilterDropdown', 'toggleFilterItem', 'moveToFilterItem', 'moveToFilterItem', 'toggleFilterItem', 'applyFilterSelection']
  },
  {
    id: 'insert-current-time',
    level: 'Intermediate',
    name: 'Insert Current Time',
    description: 'Stamp time and underline it.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(emptyTable,0,0,0),
    steps: ['insertTime', 'MoveRight','insertDate','expandLeft','underline']
  },
  {
    id: 'navigate-to-cell-f5',
    level: 'Intermediate',
    name: 'The "Go To" Jump',
    description: 'Use the "Go To" dialog for precision movement.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['jumpStart','selectDownToEdge','openGoTo', 'confirmGoTo']
  },
  {
    id: 'insert-row-undo',
    level: 'Intermediate',
    name: 'Create Space ',
    description: 'Create some space between rows.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 3, 0),
    steps: ['selectRow', 'insertRow', 'insertRow']
  },
  {
    id: 'delete-full-row',
    level: 'Intermediate',
    name: 'Delete Full Row',
    description: 'Remove unnecessary data rows structurally.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(0),
    steps: [ 'nextSheet',	'selectCol','deleteCol']
  },
  {
    id: 'reset-general-format',
    level: 'Intermediate',
    name: 'Reset Number Format',
    description: 'Normalize numeric formatting across a whole sheet.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(
      [['ID', 'DateNum','Date', 'Amount'],['1.0', '02-Mar-26', '46083','500'],['', '','', '']],0,1,1
    ),
    steps: ['applyGeneralFormatOnDate','MoveRight','applyDateFormatFromGeneral','MoveRight', 'applyCurrency','selectCol','bold']
  },
  {
    id: 'format-date-time-cols',
    level: 'Intermediate',
    name: 'Format Date & Time Columns',
    description: 'Format adjacent columns with distinct data types.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(
      [['ID', 'Date', 'Amount','Share'],['1.0', '02-Mar-26', '500','0.2'],],0,0,0
    ),
    steps: ['jumpRight','moveDown', 'applyPercentageFromGeneral','jumpLeft','applyGeneralFormatFloat']
  },

  // ==========================================
  // LEVEL 3: ADVANCED (No-Ribbon Master)
  // Focus: Alt Sequences & Advanced Layout
  // ==========================================
  {
    id: 'center-align-column',
    level: 'Advanced',
    name: 'Mastering Column Alignment',
    description: 'Align values cleanly using Alt-sequences.',
    repetitions: 12,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 3, 0),
    steps: ['jumpTop','selectRow', 'centerAlign']
  },
  {
    id: 'merge-center-header',
    level: 'Advanced',
    name: 'Merged Headers',
    description: 'Create a professional centered header across a range.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(
      [['Share','', '','Amount', ''],
      ['2025', '2026','','2025', '2026'],
      ['10%','20%','', '100','200'],],0,0,0
    ),
    steps: ['expandRight', 'mergeCenter','jumpRight','expandRight','mergeCenter']
  },
  {
    id: 'apply-borders-sheet',
    level: 'Advanced',
    name: 'Global Borders',
    description: 'Add structure to a full dataset using the Home border menu.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(1),
    steps: ['prevSheet','selectCurrentRegion', 'applyAllBorders']
  },
  {
    id: 'thick-border-block',
    level: 'Advanced',
    name: 'Block Emphasis Border',
    description: 'Emphasize a horizontal data block with thick borders.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(0),
    steps: ['jumpEnd','selectLeftToEdge', 'applyThickBorder']
  },
  {
    id: 'wrap-and-center-header',
    level: 'Advanced',
    name: 'Readable Headers',
    description: 'Improve header readability with Wrap Text and Alignment.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(
      [['Long Text','', '','', ''],
      ['Long Text', '','','', ''],
      ['','','', '',''],
      ['','','', '',''],],0,0,0
    ),
    steps: ['selectCol','centerAlign', 'wrapText']
  },
  {
    id: 'clear-formatting-selection',
    level: 'Advanced',
    name: 'Nuke Formatting',
    description: 'Remove messy imported styles completely.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 3, 0),
    steps: ['jumpTop','selectDownToEdge', 'clearFormatting']
  },
  {
    id: 'currency-decimal-cleanup',
    level: 'Advanced',
    name: 'Currency Precision',
    description: 'Adjust decimal precision for financial presentation.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 3, 0),
    steps: ['jumpRight','applyCurrency', 'decreaseDecimals', 'increaseDecimals']
  },

  {
    id: 'cleanup-percentages',
    level: 'Advanced',
    name: 'Reformat Percentages',
    description: 'Fix broken percentage formatting using Clear and Re-apply.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 3, 0),
    steps: ['clearFormatting', 'applyPercentage','moveDown','repeatFormatting']
  },
  {
    id: 'sort-dialog-full',
    level: 'Advanced',
    name: 'Sort Dialog Legacy',
    description: 'Access deep sorting options via legacy Alt shortcuts.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 0, 0),
    steps: ['selectCurrentRegion', 'openSortDialog']
  },

  {
    id: 'autofit-columns',
    level: 'Advanced',
    name: 'The Data Cleanup',
    description: 'Instantly fix column widths so no data is cut off.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,2,0),
    steps: ['selectCol','expandRight', 'autofitColumns']
  },
  {
    id: 'highlight-header-fill',
    level: 'Advanced',
    name: 'Header Highlight',
    description: 'Open the fill color menu to highlight a selection.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,0,0),
    steps: ['selectRow','extendDown','bold','openFillColor']
  },
  {
    id: 'group-rows-data',
    level: 'Advanced',
    name: 'Structural Grouping',
    description: 'Create collapsible row groups for large datasets.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,2,0),
    steps: ['selectRow','extendDown', 'groupRows']
  },
  {
    id: 'format-cells-dialog',
    level: 'Advanced',
    name: 'The Master Dialog',
    description: 'Access deep formatting options via the Format Cells window.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['clearFormatting','openFormatCells', 'tabToTabs', 'confirm']
  },
  {
    id: 'freeze-panes-view',
    level: 'Advanced',
    name: 'Lock Headers (Freeze)',
    description: 'Keep headers visible while scrolling down.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['MoveRight','selectCol','freezePanes']
  },
  {
    id: 'jump-clean-view',
    level: 'Advanced',
    name: 'Jump & Whiteout',
    description: 'Jump to a new worksheet and immediately toggle off gridlines for a clean look.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(0),
    steps: ['nextSheet', 'removeGridlines']
  }
];

export const DRILL_SET: DrillSet = {
  id: "muscle-memory-drills",
  name: "Muscle Memory Drills",
  drills: drills,
};

    

    

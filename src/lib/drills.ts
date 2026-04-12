
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
  moveRight: { description: 'Move right', keys: ['arrowright'], iconName: 'ArrowRight', gridEffect: { action: 'MOVE_SELECTION', payload: { direction: 'right' } } },
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
  pasteWelcome: { description: 'Paste', keys: ['control', 'v'], iconName: 'ClipboardPaste', gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value: 'Welcome' } } },
  
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

  applyGeneralFormat: { description: 'Apply General format', keys: ['control', 'shift', '`'], iconName: 'Hash', gridEffect: { action: 'APPLY_STYLE_GENERAL' } },
  
  decreaseDecimals: { description: 'Decrease decimals', keys: ['alt', 'h', '9'], iconName: 'MinusCircle', isSequential: true, gridEffect: { action: 'DECREASE_DECIMAL' } },
  increaseDecimals: { description: 'Increase decimals', keys: ['alt', 'h', '0'], iconName: 'PlusCircle', isSequential: true, gridEffect: { action: 'INCREASE_DECIMAL' } },
  centerAlign: { description: 'Center align', keys: ['alt', 'h', 'a', 'c'], iconName: 'AlignCenter', isSequential: true, gridEffect: { action: 'APPLY_STYLE_CENTER_ALIGN' } },
  mergeCenter: { description: 'Merge & center', keys: ['alt', 'h', 'm', 'c'], iconName: 'Merge', isSequential: true, gridEffect: { action: 'APPLY_STYLE_MERGE_CENTER' } },
  wrapText: { description: 'Wrap text', keys: ['alt', 'h', 'w'], iconName: 'WrapText', isSequential: true, gridEffect: { action: 'APPLY_STYLE_WRAP_TEXT' } },
  applyAllBorders: { description: 'Apply all borders', keys: ['alt', 'h', 'b', 'a'], iconName: 'Grid', isSequential: true, gridEffect: { action: 'APPLY_STYLE_ALL_BORDERS' } },
  applyThickBorder: { description: 'Apply thick border', keys: ['alt', 'h', 'b', 't'], iconName: 'RectangleHorizontal', isSequential: true, gridEffect: { action: 'APPLY_STYLE_THICK_BORDER' } },
  clearFormatting: { description: 'Clear formatting', keys: ['alt', 'h', 'e', 'f'], iconName: 'RemoveFormatting', isSequential: true, gridEffect: { action: 'APPLY_STYLE_GENERAL' } },
  autofitColumns: { description: 'Auto-fit width', keys: ['alt', 'h', 'o', 'i'], iconName: 'Frame', isSequential: true, gridEffect: { action: 'AUTOFIT_COLUMNS' } },
  openFillColor: { description: 'Open Fill Color', keys: ['alt', 'h', 'h'], iconName: 'PaintBucket', isSequential: true, dialogEffect: { action: 'SHOW_FILL_COLOR_DROPDOWN' } },
  moveColorHighlightRight: { description: 'Move highlight right', keys: ['arrowright'], iconName: 'ArrowRight', dialogEffect: { action: 'MOVE_FILL_COLOR_HIGHLIGHT', payload: 'right' } },
  moveColorHighlightLeft: { description: 'Move highlight left', keys: ['arrowleft'], iconName: 'ArrowLeft', dialogEffect: { action: 'MOVE_FILL_COLOR_HIGHLIGHT', payload: 'left' } },
  confirmFillColor: { description: 'Apply fill color', keys: ['enter'], iconName: 'Check', dialogEffect: { action: 'HIDE_FILL_COLOR_DROPDOWN' }, gridEffect: { action: 'APPLY_FILL_COLOR' } },
  openFormatCells: { description: 'Open Format Cells', keys: ['control', '1'], iconName: 'Settings2', dialogEffect: { action: 'SHOW_FORMAT_CELLS_DIALOG' } },
  moveDownFormatCategory: { description: 'Move to next category', keys: ['arrowdown'], iconName: 'ArrowDown', dialogEffect: { action: 'MOVE_FORMAT_CELLS_HIGHLIGHT', payload: 'down' } },
  moveUpFormatCategory: { description: 'Move to previous category', keys: ['arrowup'], iconName: 'ArrowUp', dialogEffect: { action: 'MOVE_FORMAT_CELLS_HIGHLIGHT', payload: 'up' } },
  
  // Formatting - Workarounds
  applyDateFormatFromGeneral: { description: 'Apply Date format', keys: ['control', 'shift', '3'], iconName: 'Calendar' , gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value:'02-Mar-26' } } },
  applyPercentageFromGeneral: { description: 'Apply percentage', keys: ['control', 'shift', '5'], iconName: 'Percent', gridEffect: { action: 'APPLY_STYLE_PERCENTAGE' } },
  repeatFormattingGeneral:  { description: 'Repeat formatting', keys: ['f4'], iconName: 'RotateCw', gridEffect: { action: 'APPLY_STYLE_GENERAL' } },

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
  confirm: { description: 'Confirm', keys: ['enter'], iconName: 'CornerDownLeft', dialogEffect: { action: 'HIDE_FORMAT_CELLS_DIALOG' } },
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
  groupRows: { description: 'Group selected', keys: ['shift', 'alt', 'arrowright'], iconName: 'Group', gridEffect: { action: 'GROUP_ROWS' } },
  ungroupRows: { description: 'Ungroup rows', keys: ['shift', 'alt', 'arrowleft'], iconName: 'Ungroup', gridEffect: { action: 'UNGROUP_ROWS' } },
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
  openSortDialog: { description: 'Sort menu', keys: ['alt', 'a','s', 's'], iconName: 'ArrowUpDown', isSequential: true, dialogEffect: { action: 'SHOW_SORT_DIALOG' } },
  closeSortDialog: { description: 'Close Dialog', keys: ['esc'], iconName: 'X', dialogEffect: { action: 'HIDE_SORT_DIALOG' } },
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
        ['', '','','','']
      ],
      selection: { activeCell: { row: 0, col: 0 }, anchorCell: { row: 0, col: 0 } },
    }
  ],
  activeSheetIndex,
  clipboard: null,
});


const bigTable = [['ID', 'Name', 'Date', 'Amount'],
    ['1', 'Project A', '2026-01-01', '500.75'],
    ['2', 'Project B', '2026-01-05', '1200.50'],
    ['3', 'Project C', '2026-01-10', '750.00'],
    ['4', 'Project D', '2026-01-15', '2000.25'],
];

const bigTableEmptyRow = [['ID', 'Name', 'Date', 'Amount',''],
    ['1', 'Project A', '2026-01-01', '500',''],
    ['2', 'Project B', '2026-01-05', '1200',''],
    ['3', 'Project C', '2026-01-10', '750',''],
    ['4', 'Project D', '2026-01-15', '2000',''],
    ['', '', '', '','']
]

const dirtyTable = [['Share', '', 'Amount', '',''],
    ['100%', '', '$100', '',''],
    ['200%', '', '$200', '',''],
    ['', '', '', '','']
]


const emptyTable = [['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', '']
]

const autofitGrid = [
    ['This is a very long header for column A', 'Short Header B', 'This content is much longer and should make the column wider'],
    ['Short content', '12345', '123'],
    ['Another row', 'Another value', ''],
];


const drills: Drill[] = [
  
// ==========================================
  // LEVEL 1: APPRENTICE (Warp Speed)
  // Focus: Navigation, Selection, & Basic Moves
  // ==========================================
  {
    id: 'strikethrough-undo',
    level: 'Apprentice',
    name: 'Strikethrough Toggle',
    description: 'Apply strikethrough, undo it, then redo to toggle the effect.',
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
    level: 'Apprentice',
    name: 'Navigate Block Edges',
    description: 'Jump around the perimeter of a table using Control.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,4,0),
    steps: ['jumpTop', 'jumpRight', 'jumpBottom', 'jumpLeft']
  },
  {
    id: 'copy-to-row-edge',
    level: 'Apprentice',
    name: 'Jump & Paste',
    description: 'Copy a value from one end of a row to the other using jump navigation.',
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
    level: 'Apprentice',
    name: 'Expand & Copy Range',
    description: 'Select a horizontal range of cells, copy it, and paste below.',
    repetitions: 12,mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,2,0),
    steps: ['expandRight', 'expandRight', 'copySelection', 'moveDown', 'pasteData']
  },
  {
    id: 'cycle-worksheets',
    level: 'Apprentice',
    name: 'Cycle Worksheets',
    description: 'Navigate forward and backward through worksheet tabs.',
    repetitions: 10, mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(0),
    steps: ['nextSheet', 'nextSheet', 'prevSheet', 'prevSheet']
  },
  {
    id: 'copy-to-next-sheet',
    level: 'Apprentice',
    name: 'Cross-Sheet Copy',
    description: 'Move data across worksheets.',
    repetitions: 15,mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(0),
    steps: ['copySelection', 'nextSheet', 'pasteData']
  },
  {
    id: 'select-and-italic-table',
    level: 'Apprentice',
    name: 'Italicize Table',
    description: 'Select the entire table and apply italic formatting to all cells.',
    repetitions: 10, mistakeLimit: 2,
    initialGridState: createGridState(bigTableEmptyRow, 0, 0, 0),
    steps: ['selectDownToEdge', 'selectRightToEdge', 'italic']
  },
  {
    id: 'select-all-and-delete',
    level: 'Apprentice',
    name: 'Clear Data Block',
    description: 'Select the entire current data region and clear its contents.',
    repetitions: 12,mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['selectCurrentRegion', 'deleteContent']
  },
  {
    id: 'select-rectangular-range',
    level: 'Apprentice',
    name: 'Transfer Block',
    description: 'Select a rectangular data block, cut it, and paste into another worksheet.',
    repetitions: 10, mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(0),
    steps: ['selectRightToEdge', 'extendDown', 'cut', 'nextSheet', 'pasteData']
  },
  {
    id: 'extend-row-selection-down',
    level: 'Apprentice',
    name: 'Bold Multiple Rows',
    description: 'Select multiple rows from current position to the bottom and apply bold formatting.',
    repetitions: 12, mistakeLimit: 2,
    initialGridState: createGridState(bigTableEmptyRow,0,0,2),
    steps: ['selectRow', 'selectDownToEdge', 'bold']
  },

  {
    id: 'scan-large-data',
    level: 'Apprentice',
    name: 'Page Scrolling',
    description: 'Navigate through large datasets using page up and down keys.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0, 30),
    steps: ['pageDown', 'pageUp']
  },
  {
    id: 'emphasize-and-save',
    level: 'Apprentice',
    name: 'Highlight & Save',
    description: 'Select all data, apply bold and underline formatting, then save the workbook.',
    repetitions: 12, mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(0),
    steps: ['selectCurrentRegion8', 'bold', 'underline', 'save']
  },
  {
    id: 'move-up-and-format',
    level: 'Apprentice',
    name: 'Move and Format',
    description: 'Cut a value, move it to the top of the column, paste, and apply underline and bold formatting.',
    repetitions: 12, mistakeLimit: 2,
    initialGridState: createGridState([['', ''], ['', ''],['Value to Move', ''],['', ''],],0,2,0),
    steps: ['cut', 'jumpTop', 'pasteData', 'underline', 'bold']
  },
  {
    id: 'emphasize-start-end',
    level: 'Apprentice',
    name: 'Start & End',
    description: 'Navigate to the first cell of the data, underline it, then to the last cell and strikethrough it.',
    repetitions: 10, mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,2,0),
    steps: ['jumpStart', 'underline', 'jumpEnd', 'strikethrough']
  },
  {
    id: 'bold-header-delete-last',
    level: 'Apprentice',
    name: 'Jump Columns',
    description: 'Bold the first column, then strikethrough the last column.',
    repetitions: 12, mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,2,0),
    steps: ['selectCol', 'bold', 'jumpRight', 'selectCol', 'strikethrough']
  },
  {
    id: 'extend-selection-last-cell',
    level: 'Apprentice',
    name: 'Select to End',
    description: 'Select from the current cell to the very end of the data and apply underline formatting.',
    repetitions: 12, mistakeLimit: 2,
    initialGridState: createGridState(bigTableEmptyRow,0,2,0),
    steps: ['selectToEnd', 'underline']
  },
  {
    id: 'find-and-cycle',
    level: 'Apprentice',
    name: 'Find and Cycle Results',
    description: 'Practice finding a term and cycling through the results.',
    repetitions: 12,mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['openFind', 'typeComma','findNextResult', 'findNextResult', 'closeDialog']
  },
  {
    id: 'replace-comma-with-dot',
    level: 'Apprentice',
    name: 'Quick Replace',
    description: 'Learn the sequence to open Replace, enter values, and confirm.',
    repetitions: 12, mistakeLimit: 2,
    initialGridState: createGridState([['Sales,North', 'Sales,South'], ['Profit,North', 'Profit,South']], 0, 0, 0),
    steps: ['openReplace', 'typeComma', 'tabToNext', 'typePeriod', 'replaceAll', 'closeDialog']
  },


  {
    id: 'select-all-copy-new-paste',
    level: 'Apprentice',
    name: 'Duplicate Data',
    description: 'Select the entire data region, copy it, and paste into the next worksheet.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(0),
    steps: ['selectCurrentRegion', 'copySelection', 'nextSheet', 'pasteData']
  },


  // ==========================================
  // LEVEL 2: MASTER (Grid Surgeon)
  // Focus: Data Tools, Selection, & Structure
  // ==========================================
  

  {
    id: 'convert-region-to-table',
    level: 'Master',
    name: 'Create Table',
    description: 'Convert a selected data range into an Excel table for better data management.',
    repetitions: 14,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['selectCurrentRegion', 'createTable', 'confirmTable']
  },
  {
    id: 'copy-visible-rows',
    level: 'Master',
    name: 'Copy Visible Rows',
    description: 'After hiding rows, select only visible cells and copy them to another sheet.',
    repetitions: 14,
    mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(0),
    steps: [ 'hideRow','moveDown','selectCurrentRegion','selectVisible', 'copySelection', 'nextSheet', 'pasteData']
  },
  {
    id: 'lock-formula-reference',
    level: 'Master',
    name: 'Edit Formula Reference',
    description: 'Edit a formula and make a cell reference absolute.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['jumpBottom','editFormula', 'toggleAbsRef', 'confirmFormula']
  },
  {
    id: 'toggle-formula-view',
    level: 'Master',
    name: 'Toggle Formulas',
    description: 'Toggle to view formulas, then back to values, and clear the selected range.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(formulaDrillValues, 0, 0, 0),
    steps: ['toggleFormulas', 'hideFormulas','selectRightToEdge','selectDownToEdge','cut']
  },
  {
    id: 'autosum-column',
    level: 'Master',
    name: 'AutoSum Column',
    description: 'Select a column of numbers and insert an AutoSum formula at the bottom.',
    repetitions: 14,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTableEmptyRow, 0, 2, 0),
    steps: ['jumpRight','selectDownToEdge', 'autoSum']
  },
  {
    id: 'repeat-formatting-f4',
    level: 'Master',
    name: 'Repeat Formatting',
    description: 'Apply underline formatting and repeat it on adjacent cells',
    repetitions: 12,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTableEmptyRow,0,2,0),
    steps: ['underline', 'moveDown', 'repeatFormatting','selectRightToEdge','repeatFormatting']
  },

  {
    id: 'fill-current-region',
    level: 'Master',
    name: 'Fill Range',
    description: 'Select a range and fill all cells with the same value',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(emptyTable,0,0,0),
    steps: ['expandRight','extendDown', 'type9', 'fillAll']
  },
  {
    id: 'open-filter-dropdown',
    level: 'Master',
    name: 'Filter Dropdown',
    description: 'Open the filter dropdown, select and deselect items, then apply the filter.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,0,1),
    steps: ['openFilterDropdown', 'toggleFilterItem', 'moveToFilterItem', 'moveToFilterItem', 'toggleFilterItem', 'applyFilterSelection']
  },
  {
    id: 'insert-current-time',
    level: 'Master',
    name: 'Insert Timestamp',
    description: 'Insert current time and date, then underline both entries.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(emptyTable,0,0,0),
    steps: ['insertTime', 'moveRight','insertDate','expandLeft','underline']
  },
  {
    id: 'navigate-to-cell-f5',
    level: 'Master',
    name: 'Go To Selection',
    description: 'Select a range and use Go To dialog to navigate precisely.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['jumpStart','selectDownToEdge','openGoTo', 'confirmGoTo']
  },
  {
    id: 'insert-row-undo',
    level: 'Master',
    name: 'Insert Rows',
    description: 'Insert multiple rows to create space in the table.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 3, 0),
    steps: ['selectRow', 'insertRow', 'insertRow']
  },
  {
    id: 'delete-column',
    level: 'Master',
    name: 'Column Delete',
    description: 'Navigate to another sheet and delete an entire column.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(0),
    steps: [ 'nextSheet',	'selectCol','deleteCol']
  },


  // ==========================================
  // LEVEL 3: NINJA (No-Ribbon Master)
  // Focus: Alt Sequences & Advanced Layout
  // ==========================================
  {
    id: 'center-align-column',
    level: 'Ninja',
    name: 'Center Header',
    description: 'Select the header row and center-align its contents.',
    repetitions: 12,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 3, 0),
    steps: ['jumpTop','selectRow', 'centerAlign']
  },
  {
    id: 'kill-formulas',
    level: 'Ninja',
    name: 'Kill Formulas',
    description: 'Copy a range and paste it as values to kill the formulas.',
    repetitions: 12,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,0,0),
    steps: ['selectCurrentRegion', 'copySelection', 'pasteValuesOnly']
  },
  {
    id: 'merge-center-header',
    level: 'Ninja',
    name: 'Merge Headers',
    description: 'Merge and center cells to create spanning headers.',
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
    id: 'reset-general-format',
    level: 'Ninja',
    name: 'Reset Formats',
    description: 'Reset formats to general, apply date and currency formats, and bold a column.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(
      [['ID', 'DateNum','Date', 'Amount'],['1.0', '02-Mar-26', '46083','500'],['', '','', '']],0,1,1
    ),
    steps: ['applyGeneralFormat','moveRight','applyDateFormatFromGeneral','moveRight', 'applyCurrency','selectCol','bold']
  },
  {
    id: 'apply-borders-sheet',
    level: 'Ninja',
    name: 'Apply Borders',
    description: 'Select the entire data region and apply all borders for structure.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(1),
    steps: ['prevSheet','selectCurrentRegion', 'applyAllBorders']
  },
  {
    id: 'format-date-time-cols',
    level: 'Ninja',
    name: 'Format Columns',
    description: 'Apply percentage format to one column and general format to another.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(
      [['ID', 'Date', 'Amount','Share'],['1.0', '02-Mar-26', '500','0.2'],],0,0,0
    ),
    steps: ['jumpRight','moveDown', 'applyPercentageFromGeneral','jumpLeft','applyGeneralFormat']
  },
  {
    id: 'thick-border-block',
    level: 'Ninja',
    name: 'Thick Border',
    description: 'Select a row and apply thick borders to emphasize it.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(0),
    steps: ['jumpEnd','selectLeftToEdge', 'applyThickBorder']
  },
  {
    id: 'wrap-and-center-header',
    level: 'Ninja',
    name: 'Wrap Headers',
    description: 'Center-align and wrap text in header columns for better readability.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(
      [['Long Text Here','', '','', ''],
      ['Long Text Here', '','','', ''],
      ['','','', '',''],
      ['','','', '',''],],0,0,0
    ),
    steps: ['selectCol','centerAlign', 'wrapText']
  },
  {
    id: 'currency-decimal-cleanup',
    level: 'Ninja',
    name: 'Adjust Decimals',
    description: 'Apply currency format and reduce decimal places for clean financial display.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 1, 0),
    steps: ['jumpRight','selectDownToEdge','applyCurrency', 'decreaseDecimals', 'decreaseDecimals']
  },

  {
    id: 'cleanup-percentages',
    level: 'Ninja',
    name: 'Clear Formats',
    description: 'Clear formatting from a range and reapply general format using repeat.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(dirtyTable, 0, 1, 0),
    steps: ['extendDown','clearFormatting','jumpRight','extendDown','repeatFormattingGeneral']
  },
  {
    id: 'sort-dialog-full',
    level: 'Ninja',
    name: 'Open Sort Dialog',
    description: 'Italicize a range and open the sort dialog using Alt shortcuts.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 0, 0),
    steps: ['selectRow','italic','selectDownToEdge', 'openSortDialog', 'closeSortDialog']
  },

  {
    id: 'autofit-columns',
    level: 'Ninja',
    name: 'Column Autofit',
    description: 'Select multiple columns and autofit their widths to display all data.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,0,0),
    steps: ['selectCol','expandRight', 'expandRight', 'autofitColumns']
  },
  {
    id: 'highlight-header-fill',
    level: 'Ninja',
    name: 'Fill Color',
    description: 'Select a range, bold it, and apply a fill color from the dropdown.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,1,0),
    steps: ['selectRow','extendDown','bold','openFillColor', 'moveColorHighlightRight', 'moveColorHighlightRight', 'confirmFillColor']
  },
  {
    id: 'group-rows-data',
    level: 'Ninja',
    name: 'Group Rows',
    description: 'Group selected rows for collapsible structure, then ungroup them.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,2,0),
    steps: ['selectRow','extendDown', 'groupRows', 'ungroupRows']
  },
  {
    id: 'format-cells-dialog',
    level: 'Ninja',
    name: 'Format Dialog',
    description: 'Clear formatting and open the Format Cells dialog to adjust settings.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['clearFormatting', 'openFormatCells', 'moveDownFormatCategory', 'moveDownFormatCategory', 'confirm']
  },
  {
    id: 'freeze-panes-view',
    level: 'Ninja',
    name: 'Freeze Panes',
    description: 'Select the header row, underline it, and freeze panes to keep headers visible.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['jumpTop','selectRow','underline','freezePanes']
  },
  {
    id: 'jump-clean-view',
    level: 'Ninja',
    name: 'Clean Sheet',
    description: 'Navigate to a sheet, clear all data, and remove gridlines for a clean presentation.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(1),
    steps: ['prevSheet','selectCurrentRegion','deleteContent','removeGridlines']
  }
];

export const DRILL_SET: DrillSet = {
  id: "muscle-memory-drills",
  name: "Muscle Memory Drills",
  drills: drills,
};

    

    


import { MoveRight } from "lucide-react";
import { ChallengeLevel, GridEffect, GridState, DialogEffect, FindReplaceDialogState } from "./types";

export interface DrillStep {
  description: string;
  keys: string[];
  isSequential?: boolean;
  iconName: keyof typeof import("lucide-react");
  gridEffect?: GridEffect;
  dialogEffect?: DialogEffect;
}

// This is the new centralized repository of all possible drill steps.
export const ALL_DRILL_STEPS: Record<string, DrillStep> = {
  // ----- Navigation
  // Arrows
  moveDown: { description: 'Move down', keys: ['ArrowDown'], iconName: 'ArrowDown', gridEffect: { action: 'MOVE_SELECTION', payload: { direction: 'down' } } },
  moveUp: { description: 'Move up', keys: ['ArrowUp'], iconName: 'ArrowUp', gridEffect: { action: 'MOVE_SELECTION', payload: { direction: 'up' } } },
  moveLeft: { description: 'Move left', keys: ['ArrowLeft'], iconName: 'ArrowLeft', gridEffect: { action: 'MOVE_SELECTION', payload: { direction: 'left' } } },
  MoveRight: { description: 'Move right', keys: ['ArrowRight'], iconName: 'ArrowRight', gridEffect: { action: 'MOVE_SELECTION', payload: { direction: 'right' } } },
  // Jumping
  jumpTop: { description: 'Jump Top', keys: ['Control', 'ArrowUp'], iconName: 'ArrowUp', gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'edgeUp' } } },
  jumpRight: { description: 'Jump Right', keys: ['Control', 'ArrowRight'], iconName: 'ArrowRight', gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'edgeRight' } } },
  jumpBottom: { description: 'Jump Bottom', keys: ['Control', 'ArrowDown'], iconName: 'ArrowDown', gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'edgeDown' } } },
  jumpLeft: { description: 'Jump Left', keys: ['Control', 'ArrowLeft'], iconName: 'ArrowLeft', gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'edgeLeft' } } },
  // Home & End
  jumpStart: { description: 'Go to Start', keys: ['Control', 'Home'], iconName: 'ArrowUpLeft', gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'topLeft' } } },
  jumpEnd: { description: 'Go to End', keys: ['Control', 'End'], iconName: 'ArrowDownRight', gridEffect: { action: 'MOVE_SELECTION_ADVANCED', payload: { to: 'end' } } },
  // Jumping sheets/pages
  nextSheet: { description: 'Next worksheet', keys: ['Control', 'PageDown'], iconName: 'ArrowRightToLine', gridEffect: { action: 'SWITCH_SHEET', payload: { direction: 'next' } } },
  prevSheet: { description: 'Previous worksheet', keys: ['Control', 'PageUp'], iconName: 'ArrowLeftToLine', gridEffect: { action: 'SWITCH_SHEET', payload: { direction: 'previous' } } },
  pageDown: { description: 'Page down', keys: ['PageDown'], iconName: 'ArrowDownToLine' },
  pageUp: { description: 'Page up', keys: ['PageUp'], iconName: 'ArrowUpToLine' },
  // other
  openGoTo: { description: 'Open Go To', keys: ['F5'], iconName: 'Navigation' },
  

  // ------ Selection
  selectRow: { description: 'Select row', keys: ['Shift', ' '], iconName: 'Rows', gridEffect: { action: 'SELECT_ROW' } },
  selectCol: { description: 'Select column', keys: ['Control', ' '], iconName: 'Columns', gridEffect: { action: 'SELECT_COLUMN' } },
 
  selectCurrentRegion:  { description: 'Select All', keys: ['Control', 'a'], iconName: 'Frame', gridEffect: { action: 'SELECT_ALL' } },
  selectCurrentRegion8: { description: 'Select current region', keys: ['Control', 'Shift', '8'], iconName: 'Scan', gridEffect: { action: 'SELECT_ALL' } },

  expandRight: { description: 'Expand right', keys: ['Shift', 'ArrowRight'], iconName: 'ArrowRight', gridEffect: { action: 'EXTEND_SELECTION', payload: { direction: 'right' } } },
  extendDown:  { description: 'Extend down', keys: ['Shift', 'ArrowDown'], iconName: 'ArrowDown', gridEffect: { action: 'EXTEND_SELECTION', payload: { direction: 'down' } } },
  expandLeft:  { description: 'Expand left', keys: ['Shift', 'ArrowLeft'], iconName: 'ArrowLeft', gridEffect: { action: 'EXTEND_SELECTION', payload: { direction: 'left' } } },
  expandUp:    { description: 'Expand up', keys: ['Shift', 'ArrowUp'], iconName: 'ArrowUp', gridEffect: { action: 'EXTEND_SELECTION', payload: { direction: 'up' } } },

  selectRightToEdge: { description: 'Select all to the right', keys: ['Control', 'Shift', 'ArrowRight'], iconName: 'ArrowRight', gridEffect: { action: 'SELECT_TO_EDGE', payload: { direction: 'right' } } },
  selectDownToEdge:  { description:  'Select all to the bottom', keys: ['Control', 'Shift', 'ArrowDown'], iconName: 'ArrowDown', gridEffect: { action: 'SELECT_TO_EDGE', payload: { direction: 'down' } } },
  selectLeftToEdge:  { description:  'Select all to the left', keys: ['Control', 'Shift', 'ArrowLeft'], iconName: 'ArrowLeft', gridEffect: { action: 'SELECT_TO_EDGE', payload: { direction: 'left' } } },
  selectUpToEdge:    { description:  'Select all to the top', keys: ['Control', 'Shift', 'ArrowUp'], iconName: 'ArrowUp', gridEffect: { action: 'SELECT_TO_EDGE', payload: { direction: 'up' } } },
  selectToEnd:       { description: 'Extend to end', keys: ['Control', 'Shift', 'End'], iconName: 'ArrowDownRight', gridEffect: { action: 'SELECT_TO_END' } },
  selectVisible:     { description: 'Select visible cells', keys: ['Alt', ';'], iconName: 'Eye' },

  // Actions (Copy, Paste, Undo, etc.)
  copySelection: { description: 'Copy selection', keys: ['Control', 'c'], iconName: 'Copy', gridEffect: { action: 'COPY' } },
  pasteData: { description: 'Paste', keys: ['Control', 'v'], iconName: 'ClipboardPaste', gridEffect: { action: 'PASTE' } },
  
  pasteValuesOnly: { description: 'Paste values', keys: ['Control', 'Alt', 'v'], iconName: 'ClipboardSignature' },
  cut: { description: 'Cut value', keys: ['Control', 'x'], iconName: 'Scissors', gridEffect: { action: 'CUT' } },
  deleteContent: { description: 'Delete content', keys: ['Delete'], iconName: 'Trash2', gridEffect: { action: 'DELETE_CONTENT' } },

  undo: { description: 'Undo deletion', keys: ['Control', 'z'], iconName: 'Undo2', gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value: 'Value to Delete' } } },
  undoAction: { description: 'Undo action', keys: ['Control', 'z'], iconName: 'Undo2' },
  undoInsert: { description: 'Undo insert', keys: ['Control', 'z'], iconName: 'Undo2' },

  redo: { description: 'Redo deletion', keys: ['Control', 'y'], iconName: 'Redo2', gridEffect: { action: 'DELETE_CONTENT' } },
  redoStrike: { description: 'Redo deletion', keys: ['Control', 'y'], iconName: 'Redo2', gridEffect: { action: 'APPLY_STYLE_STRIKETHROUGH' } },
  save: { description: 'Save workbook', keys: ['Control', 's'], iconName: 'Save' },

  // Formatting
  bold:          { description: 'Apply Bold', keys: ['Control', 'b'], iconName: 'Bold', gridEffect: { action: 'APPLY_STYLE_BOLD' } },
  italic:        { description: 'Apply italic', keys: ['Control', 'i'], iconName: 'Italic', gridEffect: { action: 'APPLY_STYLE_ITALIC' } },
  underline:     { description: 'Underline', keys: ['Control', 'u'], iconName: 'Underline', gridEffect: { action: 'APPLY_STYLE_UNDERLINE' } },
  strikethrough: { description: 'Strikethrough', keys: ['Control', '5'], iconName: 'Strikethrough', gridEffect: { action: 'APPLY_STYLE_STRIKETHROUGH' } },
  
  applyCurrency: { description: 'Apply currency', keys: ['Control', 'Shift', '$'], iconName: 'DollarSign', gridEffect: { action: 'APPLY_STYLE_CURRENCY' } },
  applyPercentage: { description: 'Apply percentage', keys: ['Control', 'Shift', '%'], iconName: 'Percent', gridEffect: { action: 'APPLY_STYLE_PERCENTAGE' } },
  applyGeneralFormat: { description: 'Apply General format', keys: ['Control', 'Shift', '~'], iconName: 'Hash' },
  applyDateFormat: { description: 'Apply Date', keys: ['Control', 'Shift', '#'], iconName: 'Calendar' },
  decreaseDecimals: { description: 'Decrease decimals', keys: ['Alt', 'h', '9'], iconName: 'MinusCircle' },
  increaseDecimals: { description: 'Increase decimals', keys: ['Alt', 'h', '0'], iconName: 'PlusCircle' },
  centerAlign: { description: 'Center align', keys: ['Alt', 'h', 'a', 'c'], iconName: 'AlignCenter' },
  mergeCenter: { description: 'Merge & center', keys: ['Alt', 'h', 'm', 'c'], iconName: 'Merge' },
  wrapText: { description: 'Wrap text', keys: ['Alt', 'h', 'w'], iconName: 'WrapText' },
  applyAllBorders: { description: 'Apply all borders', keys: ['Alt', 'h', 'b', 'a'], iconName: 'Grid' },
  applyThickBorder: { description: 'Apply thick border', keys: ['Alt', 'h', 'b', 't'], iconName: 'RectangleHorizontal' },
  clearFormatting: { description: 'Clear formatting', keys: ['Alt', 'h', 'e', 'f'], iconName: 'RemoveFormatting' },
  autofitColumns: { description: 'Auto-fit width', keys: ['Alt', 'h', 'o', 'i'], iconName: 'Frame' },
  openFillColor: { description: 'Open Fill Color', keys: ['Alt', 'h', 'h'], iconName: 'PaintBucket' },
  openFormatCells: { description: 'Open Format Cells', keys: ['Control', '1'], iconName: 'Settings2' },
  
  // Data & Formulas
  editFormula: { description: 'Edit formula', keys: ['F2'], iconName: 'Edit3' },
  toggleAbsRef: { description: 'Toggle absolute reference', keys: ['F4'], iconName: 'Lock' },
  confirmFormula: { description: 'Confirm formula', keys: ['Enter'], iconName: 'CornerDownLeft' },
  autoSum: { description: 'Insert AutoSum', keys: ['Alt', '='], iconName: 'Sigma' },
  toggleFormulas: { description: 'Show formulas', keys: ['Control', '`'], iconName: 'Code' },
  hideFormulas: { description: 'Hide formulas', keys: ['Control', '`'], iconName: 'EyeOff' },
  createTable: { description: 'Create table', keys: ['Control', 't'], iconName: 'Table' },
  confirmTable: { description: 'Confirm table', keys: ['Enter'], iconName: 'CornerDownLeft' },
  flashFill: { description: 'Apply Flash Fill', keys: ['Control', 'e'], iconName: 'Zap', gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value: 'Flash Filled' } } },
  repeatFormatting: { description: 'Repeat formatting', keys: ['F4'], iconName: 'RotateCw', gridEffect: { action: 'APPLY_STYLE_UNDERLINE' } },
  insertDate: { description: 'Insert date', keys: ['Control', ';'], iconName: 'Calendar', gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value: '2026-01-24' } } },
  insertTime: { description: 'Insert time', keys: ['Control', 'Shift', ';'], iconName: 'Clock', gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value: '14:00' } } },
  confirmEntry: { description: 'Enter', keys: ['Enter'], iconName: 'CornerDownLeft' },
  confirm: { description: 'Confirm', keys: ['Enter'], iconName: 'CornerDownLeft' },
  fillAll: { description: 'Fill all', keys: ['Control', 'Enter'], iconName: 'CheckCheck', gridEffect: { action: 'PASTE_STATIC_VALUE', payload: { value: '9' } } },
  openFilterDropdown: { description: 'Open dropdown', keys: ['Alt', 'ArrowDown'], iconName: 'Filter' },
  moveToFilterItem: { description: 'Move to item', keys: ['ArrowDown'], iconName: 'ArrowDown' },
  applyFilterSelection: { description: 'Apply selection', keys: ['Enter'], iconName: 'CornerDownLeft' },
  
  // Structure & Dialogs
  insertRow: { description: 'Insert row', keys: ['Control', 'Shift', '='], iconName: 'Sheet', gridEffect: { action: 'INSERT_ROW' } },
  deleteRow: { description: 'Delete row', keys: ['Control', '-'], iconName: 'Trash2', gridEffect: { action: 'DELETE_ROW' } },
  hideRow: { description: 'Hide row', keys: ['Control', '9'], iconName: 'EyeOff' },
  unhideRows: { description: 'Unhide all rows', keys: ['Control', 'a'], iconName: 'Eye' },
  groupRows: { description: 'Group selected', keys: ['Shift', 'Alt', 'ArrowRight'], iconName: 'FolderPlus' },
  openFind: { description: 'Open Find', keys: ['Control', 'f'], iconName: 'Search', dialogEffect: { action: 'SHOW', payload: { activeTab: 'find' } } },
  findNext: { description: 'Find next match', keys: ['Enter'], iconName: 'ArrowDownToLine', dialogEffect: { action: 'HIGHLIGHT_BUTTON', payload: 'findNext' } },
  confirmFind: { description: 'Confirm Find', keys: ['Enter'], iconName: 'CornerDownLeft', dialogEffect: { action: 'HIGHLIGHT_BUTTON', payload: 'findNext' } },
  findNextResult: { description: 'Find next result', keys: ['Return'], iconName: 'ArrowDown', dialogEffect: { action: 'HIGHLIGHT_BUTTON', payload: 'findNext' } },
  closeDialog: { description: 'Close Find dialog', keys: ['Esc'], iconName: 'X', dialogEffect: { action: 'HIGHLIGHT_BUTTON', payload: 'close' } },
  openReplace: { description: 'Open Replace dialog', keys: ['Control', 'h'], iconName: 'Replace', dialogEffect: { action: 'SHOW', payload: { activeTab: 'replace' } } },
  confirmReplace: { description: 'Confirm replacement', keys: ['Enter'], iconName: 'Check', dialogEffect: { action: 'HIGHLIGHT_BUTTON', payload: 'replace' } },
  replaceAll: { description: 'Replace All', keys: ['Alt','A'], isSequential: true, iconName: 'CheckCheck', dialogEffect: { action: 'HIGHLIGHT_BUTTON', payload: 'replaceAll' } },
  tabToNext: { description: 'Tab to next field', keys: ['Tab'], iconName: 'ArrowRight', dialogEffect: { action: 'SET_TAB', payload: 'replace' } },
  typeComma: { description: 'Type comma for "Find what"', keys: [','], iconName: 'Type', dialogEffect: { action: 'SET_FIND_VALUE', payload: ',' } },
  typePeriod: { description: 'Type period for "Replace with"', keys: ['.'], iconName: 'Type', dialogEffect: { action: 'SET_REPLACE_VALUE', payload: '.' } },
  type9: { description: 'Type "9"', keys: ['9'], iconName: 'Type' },
  openSortDialog: { description: 'Sort menu', keys: ['s'], iconName: 'ArrowUpDown' },
  openAltMenu: { description: 'Alt menu', keys: ['Alt'], iconName: 'Menu' },
  openDataTab: { description: 'Data tab', keys: ['d'], iconName: 'Database' },
  freezePanes: { description: 'Freeze Panes', keys: ['Alt', 'w', 'f', 'f'], iconName: 'Lock' },
  removeGridlines: { description: 'Remove gridlines', keys: ['Alt', 'w', 'v', 'g'], iconName: 'Grid3X3' },
  tabToTabs: { description: 'Tab to tabs', keys: ['Control', 'Tab'], iconName: 'ArrowRightLeft' },
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

const createGridState = (data: string[][] , activeSheetIndex: number = 0,Row: number=0, Col: number=0): GridState => ({
  sheets: [{
    name: 'Sheet1',
    data,
    selection: { activeCell: { row: Row, col: Col }, anchorCell: { row: Row, col: Col } }
  }],
  activeSheetIndex: activeSheetIndex,
  clipboard: null,
});

const createMultiSheetGridState = (activeSheetIndex: number = 0): GridState => ({
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
      selection: { activeCell: { row: 1, col: 1 }, anchorCell: { row: 1, col: 1 } },
    },
    {
      name: 'Sheet2',
      data: [
        ['Sheet #', '2','','',''],
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
        ['Sheet #', '3','','',''],
        ['', '','','',''],
        ['', '','','',''],
        ['', '','','',''],
        ['', '','','',''],
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
    steps: ['strikethrough', 'undoAction', 'redoStrike']
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
      ['Copy Me', 'Text', 'Text', 'Paste Here'],
      ['Number', 'Text', 'Text', 'Number'],
      ['Number', 'Text', 'Text', 'Number'],
      ['','','','']
     ],0,0,2),
    steps: ['jumpLeft', 'copySelection', 'jumpRight', 'pasteData']
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
    initialGridState: createGridState(bigTable, 0, 0, 0),
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
    initialGridState: createGridState(bigTable,0,0,2),
    steps: ['selectRow', 'selectDownToEdge', 'bold']
  },

  {
    id: 'scan-large-data',
    level: 'Beginner',
    name: 'Scan Large Dataset',
    description: 'Review big tables quickly using Page keys.',
    repetitions: 10, mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['pageDown', 'pageDown', 'pageUp']
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
    initialGridState: createGridState(bigTable,0,2,0),
    steps: ['selectToEnd', 'underline']
  },
  {
    id: 'find-and-cycle',
    level: 'Beginner',
    name: 'Find and Cycle Results',
    description: 'Practice finding a term and cycling through the results.',
    repetitions: 12,mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['openFind', 'findNextResult', 'findNextResult', 'closeDialog']
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
    id: 'search-cycle-results',
    level: 'Intermediate',
    name: 'Search and Cycle Results',
    description: 'Find repeated values quickly using the Find dialog.',
    repetitions: 15,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['openFind', 'findNext', 'findNext', 'closeDialog']
  },
  {
    id: 'replace-decimal',
    level: 'Intermediate',
    name: 'Find and Replace Decimal',
    description: 'Batch replace formatting characters.',
    repetitions: 12,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['openReplace', 'confirmReplace', 'closeDialog']
  },
  {
    id: 'find-replace-sequence',
    level: 'Intermediate',
    name: 'Tab Navigation in Dialogs',
    description: 'Use tab navigation to replace values without the mouse.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['openReplace', 'typeComma', 'tabToNext', 'typePeriod', 'closeDialog']
  },
  {
    id: 'find-emphasize-cell',
    level: 'Intermediate',
    name: 'Find and Emphasize',
    description: 'Locate a value, exit search, and apply bolding.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,2,0),
    steps: ['openFind', 'confirmFind', 'findNext', 'closeDialog', 'bold']
  },
  {
    id: 'find-next-sheet',
    level: 'Intermediate',
    name: 'Cross-Sheet Search',
    description: 'Switch sheets and immediately trigger a search.',
    repetitions: 12,
    mistakeLimit: 2,
    initialGridState: createMultiSheetGridState(0),
    steps: ['nextSheet', 'openFind', 'type9', 'confirmFind']
  },
  {
    id: 'replace-rollback-sequence',
    level: 'Intermediate',
    name: 'Replace Then Roll Back',
    description: 'Experiment with bulk changes and undo.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['openReplace', 'undoAction']
  },
  {
    id: 'format-entire-column',
    level: 'Intermediate',
    name: 'Format Entire Column',
    description: 'Apply formatting to a structural column.',
    repetitions: 12,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['selectCol', 'bold', 'underline']
  },
  {
    id: 'format-entire-row',
    level: 'Intermediate',
    name: 'Format Entire Row',
    description: 'Apply emphasis to a complete row.',
    repetitions: 12,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['selectRow', 'italic']
  },
  {
    id: 'convert-region-to-table',
    level: 'Intermediate',
    name: 'Convert Region to Table',
    description: 'Turn a raw data block into a functional table.',
    repetitions: 14,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['selectCurrentRegion8', 'createTable', 'confirmTable']
  },
  {
    id: 'copy-visible-rows',
    level: 'Intermediate',
    name: 'Copy Visible Rows',
    description: 'Copy filtered data while ignoring hidden rows.',
    repetitions: 14,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['selectVisible', 'copySelection', 'nextSheet', 'pasteValuesOnly']
  },
  {
    id: 'lock-formula-reference',
    level: 'Intermediate',
    name: 'Lock Formula Reference',
    description: 'Lock a cell reference while editing a formula.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['editFormula', 'toggleAbsRef', 'confirmFormula']
  },
  {
    id: 'toggle-formula-view',
    level: 'Intermediate',
    name: 'Toggle Formula View',
    description: 'Audit back-end formulas and return to values.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['toggleFormulas', 'hideFormulas']
  },
  {
    id: 'autosum-column',
    level: 'Intermediate',
    name: 'AutoSum Column',
    description: 'Trigger a quick calculation total.',
    repetitions: 14,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['selectCol', 'autoSum', 'confirmFormula']
  },
  {
    id: 'flash-fill-values',
    level: 'Intermediate',
    name: 'Flash Fill Values',
    description: 'Automatically fill detected patterns instantly.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['flashFill']
  },
  {
    id: 'repeat-formatting-f4',
    level: 'Intermediate',
    name: 'Repeat Formatting (F4)',
    description: 'Use F4 to quickly apply the same style elsewhere.',
    repetitions: 12,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,2,0),
    steps: ['underline', 'moveDown', 'repeatFormatting']
  },
  {
    id: 'insert-date-stamp',
    level: 'Intermediate',
    name: 'Today’s Date Stamp',
    description: 'Stamp the current date and apply bold.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['insertDate', 'confirmEntry', 'bold']
  },
  {
    id: 'fill-current-region',
    level: 'Intermediate',
    name: 'Fill Current Region',
    description: 'Select a block and fill every cell with a single value.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,2,0),
    steps: ['selectCurrentRegion8', 'type9', 'fillAll']
  },
  {
    id: 'open-filter-dropdown',
    level: 'Intermediate',
    name: 'Filter Navigation',
    description: 'Access the filter menu without a mouse.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,2,0),
    steps: ['openFilterDropdown', 'moveToFilterItem', 'applyFilterSelection']
  },
  {
    id: 'insert-current-time',
    level: 'Intermediate',
    name: 'Insert Current Time',
    description: 'Stamp time and underline it.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['insertTime', 'confirm', 'underline']
  },
  {
    id: 'navigate-to-cell-f5',
    level: 'Intermediate',
    name: 'The "Go To" Jump',
    description: 'Use the "Go To" dialog for precision movement.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['openGoTo', 'confirm']
  },
  {
    id: 'format-header-last-row',
    level: 'Intermediate',
    name: 'Table Boundary Styling',
    description: 'Apply distinct styles to table boundaries.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,2,0),
    steps: ['selectRightToEdge', 'bold', 'jumpBottom', 'selectLeftToEdge', 'italic']
  },
  {
    id: 'insert-row-undo',
    level: 'Intermediate',
    name: 'Structural Recovery',
    description: 'Quickly recover from an accidental row insertion.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['selectCol', 'insertRow', 'undoInsert']
  },
  {
    id: 'delete-full-row',
    level: 'Intermediate',
    name: 'Delete Full Row',
    description: 'Remove unnecessary data rows structurally.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['selectRow', 'deleteRow']
  },
  {
    id: 'reset-general-format',
    level: 'Intermediate',
    name: 'Reset Number Format',
    description: 'Normalize numeric formatting across a whole sheet.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['selectCurrentRegion', 'applyGeneralFormat']
  },
  {
    id: 'hide-unhide-rows',
    level: 'Intermediate',
    name: 'Hide and Unhide Rows',
    description: 'Temporarily collapse detail rows without deleting them.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['selectRow', 'hideRow', 'unhideRows']
  },
  {
    id: 'format-date-time-cols',
    level: 'Intermediate',
    name: 'Format Date & Time Columns',
    description: 'Format adjacent columns with distinct data types.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,2,0),
    steps: ['selectDownToEdge', 'applyDateFormat']
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
    initialGridState: defaultDrillGridState,
    steps: ['selectCol', 'centerAlign']
  },
  {
    id: 'merge-center-header',
    level: 'Advanced',
    name: 'Merged Headers',
    description: 'Create a professional centered header across a range.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['selectRow', 'mergeCenter']
  },
  {
    id: 'apply-borders-sheet',
    level: 'Advanced',
    name: 'Global Borders',
    description: 'Add structure to a full dataset using the Home border menu.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['selectCurrentRegion', 'applyAllBorders']
  },
  {
    id: 'thick-border-block',
    level: 'Advanced',
    name: 'Block Emphasis Border',
    description: 'Emphasize a horizontal data block with thick borders.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['selectRightToEdge', 'selectRightToEdge', 'applyThickBorder']
  },
  {
    id: 'wrap-and-center-header',
    level: 'Advanced',
    name: 'Readable Headers',
    description: 'Improve header readability with Wrap Text and Alignment.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['centerAlign', 'wrapText']
  },
  {
    id: 'clear-formatting-selection',
    level: 'Advanced',
    name: 'Nuke Formatting',
    description: 'Remove messy imported styles completely.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['jumpStart', 'clearFormatting']
  },
  {
    id: 'currency-decimal-cleanup',
    level: 'Advanced',
    name: 'Currency Precision',
    description: 'Adjust decimal precision for financial presentation.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['applyCurrency', 'decreaseDecimals', 'increaseDecimals']
  },
  {
    id: 'paste-values-only',
    level: 'Advanced',
    name: 'The Paste Values Master',
    description: 'Convert formulas into static values safely.',
    repetitions: 12,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['copySelection', 'pasteValuesOnly']
  },
  {
    id: 'underline-centered-numbers',
    level: 'Advanced',
    name: 'Polished Presentation',
    description: 'Polish numeric presentation with nested formatting.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['centerAlign', 'underline']
  },
  {
    id: 'cleanup-percentages',
    level: 'Advanced',
    name: 'Reformat Percentages',
    description: 'Fix broken percentage formatting using Clear and Re-apply.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: defaultDrillGridState,
    steps: ['clearFormatting', 'applyPercentage']
  },
  {
    id: 'sort-dialog-full',
    level: 'Advanced',
    name: 'Sort Dialog Legacy',
    description: 'Access deep sorting options via legacy Alt shortcuts.',
    repetitions: 8,
    mistakeLimit: 2,
    steps: ['openAltMenu', 'openDataTab', 'openSortDialog']
  },

  {
    id: 'autofit-columns',
    level: 'Advanced',
    name: 'The Data Cleanup',
    description: 'Instantly fix column widths so no data is cut off.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,2,0),
    steps: ['selectCurrentRegion', 'autofitColumns']
  },
  {
    id: 'highlight-header-fill',
    level: 'Advanced',
    name: 'Header Highlight',
    description: 'Open the fill color menu to highlight a selection.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,2,0),
    steps: ['selectRow', 'openFillColor']
  },
  {
    id: 'group-rows-data',
    level: 'Advanced',
    name: 'Structural Grouping',
    description: 'Create collapsible row groups for large datasets.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable,0,2,0),
    steps: ['extendDown', 'groupRows']
  },
  {
    id: 'format-cells-dialog',
    level: 'Advanced',
    name: 'The Master Dialog',
    description: 'Access deep formatting options via the Format Cells window.',
    repetitions: 10,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['openFormatCells', 'tabToTabs', 'confirm']
  },
  {
    id: 'freeze-panes-view',
    level: 'Advanced',
    name: 'Lock Headers (Freeze)',
    description: 'Keep headers visible while scrolling down.',
    repetitions: 8,
    mistakeLimit: 2,
    initialGridState: createGridState(bigTable, 0, 2, 0),
    steps: ['freezePanes']
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

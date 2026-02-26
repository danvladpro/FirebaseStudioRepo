
import { GridState, ChallengeStep, Sheet } from './types';

const deepCloneSelection = (selection: Sheet['selection']): Sheet['selection'] => ({
    activeCell: { ...selection.activeCell },
    anchorCell: { ...selection.anchorCell },
});

export const deepCloneGridState = (state: GridState): GridState => {
  return {
    sheets: state.sheets.map(sheet => ({
      name: sheet.name,
      data: sheet.data.map(row => [...row]),
      selection: deepCloneSelection(sheet.selection),
    })),
    activeSheetIndex: state.activeSheetIndex,
    clipboard: state.clipboard ? {
        data: state.clipboard.data.map(row => [...row]),
        isCut: state.clipboard.isCut,
        sourceSheetIndex: state.clipboard.sourceSheetIndex,
        sourceSelection: deepCloneSelection(state.clipboard.sourceSelection),
    } : null,
  };
};

const getCellsToApply = (selection: Sheet['selection']): Set<string> => {
    const { activeCell, anchorCell } = selection;
    const cells = new Set<string>();

    const minRow = Math.min(anchorCell.row, activeCell.row);
    const maxRow = Math.max(anchorCell.row, activeCell.row);
    const minCol = Math.min(anchorCell.col, activeCell.col);
    const maxCol = Math.max(anchorCell.col, activeCell.col);

    for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
            cells.add(`${r}-${c}`);
        }
    }
    return cells;
};


function findEdgeCell(
    gridData: string[][],
    startRow: number,
    startCol: number,
    direction: 'up' | 'down' | 'left' | 'right'
): { row: number; col: number } {
    const numRows = gridData.length;
    if (numRows === 0) return { row: startRow, col: startCol };
    const numCols = gridData[0]?.length || 0;
    if (numCols === 0) return { row: startRow, col: startCol };

    const isCellEmpty = (r: number, c: number) => !gridData[r]?.[c] || gridData[r][c].trim() === '';

    let r = startRow;
    let c = startCol;
    const isStartCellEmpty = isCellEmpty(r, c);

    switch (direction) {
        case 'down':
            if (isStartCellEmpty) {
                while (r < numRows - 1 && isCellEmpty(r + 1, c)) r++;
                if (r < numRows - 1) r++; // Land on the non-empty cell
            } else {
                while (r < numRows - 1 && !isCellEmpty(r + 1, c)) r++;
            }
            return { row: r, col: c };

        case 'up':
            if (isStartCellEmpty) {
                while (r > 0 && isCellEmpty(r - 1, c)) r--;
                if (r > 0) r--;
            } else {
                while (r > 0 && !isCellEmpty(r - 1, c)) r--;
            }
            return { row: r, col: c };

        case 'right':
            if (isStartCellEmpty) {
                while (c < numCols - 1 && isCellEmpty(r, c + 1)) c++;
                if (c < numCols - 1) c++;
            } else {
                while (c < numCols - 1 && !isCellEmpty(r, c + 1)) c++;
            }
            return { row: r, col: c };

        case 'left':
            if (isStartCellEmpty) {
                while (c > 0 && isCellEmpty(r, c - 1)) c--;
                if (c > 0) c--;
            } else {
                while (c > 0 && !isCellEmpty(r, c - 1)) c--;
            }
            return { row: r, col: c };
    }
    return { row: r, col: c }; // Should not be reached
}


export const applyGridEffect = (gridState: GridState, step: ChallengeStep, cellStyles: Record<string, React.CSSProperties>): { newGridState: GridState, newCellStyles: Record<string, React.CSSProperties> } => {
    if (!step.gridEffect) return { newGridState: gridState, newCellStyles: cellStyles };

    const { action, payload } = step.gridEffect;
    let newGridState = deepCloneGridState(gridState);
    let newCellStyles = { ...cellStyles };

    // Handle sheet-level actions first
    if (action === 'SWITCH_SHEET') {
        if (payload?.direction === 'next') {
            newGridState.activeSheetIndex = Math.min(newGridState.sheets.length - 1, newGridState.activeSheetIndex + 1);
        } else if (payload?.direction === 'previous') {
            newGridState.activeSheetIndex = Math.max(0, newGridState.activeSheetIndex - 1);
        }
        // Clear styles when switching sheets, which removes the copy/cut border
        newCellStyles = {};
        return { newGridState, newCellStyles };
    }
    
    const activeSheet = newGridState.sheets[newGridState.activeSheetIndex];
    if (!activeSheet) {
        return { newGridState, newCellStyles };
    }

    let { data: newGridData, selection: newSelection } = activeSheet;

    switch (action) {
        case 'SELECT_ROW':
            if (newGridData.length > 0 && newGridData[0]) {
                const row = newSelection.activeCell.row;
                newSelection.anchorCell = { row, col: 0 };
                newSelection.activeCell = { row, col: newGridData[0].length - 1 };
            }
            break;
        case 'SELECT_COLUMN':
             if (newGridData.length > 0) {
                const col = newSelection.activeCell.col;
                newSelection.anchorCell = { row: 0, col };
                newSelection.activeCell = { row: newGridData.length - 1, col };
            }
            break;
        case 'SELECT_ALL':
            if (newGridData.length > 0 && newGridData[0]) {
                newSelection.anchorCell = { row: 0, col: 0 };
                newSelection.activeCell = { row: newGridData.length - 1, col: newGridData[0].length - 1 };
            }
            break;
        case 'MOVE_SELECTION':
            if (payload?.direction) {
                const { direction, amount = 1 } = payload;
                
                // A move action originates from the active cell.
                const startCell = newSelection.activeCell;

                let { row, col } = startCell;
                
                switch (direction) {
                    case 'down': row = Math.min(newGridData.length - 1, row + amount); break;
                    case 'up': row = Math.max(0, row - amount); break;
                    case 'right': if (newGridData[0]) col = Math.min(newGridData[0].length - 1, col + amount); break;
                    case 'left': col = Math.max(0, col - amount); break;
                }
                // A move without Shift collapses the selection to the new cell.
                newSelection.activeCell = { row, col };
                newSelection.anchorCell = { row, col };
            }
            break;
            
        case 'MOVE_SELECTION_ADVANCED':
            if (payload?.to) {
                const isRangeSelection = newSelection.activeCell.row !== newSelection.anchorCell.row || newSelection.activeCell.col !== newSelection.anchorCell.col;
                
                // For range selections, jumps should originate from the anchor cell to be intuitive.
                let { row, col } = isRangeSelection ? newSelection.anchorCell : newSelection.activeCell;
                
                const directions: { [key: string]: 'up' | 'down' | 'left' | 'right' | undefined } = {
                    edgeUp: 'up',
                    edgeDown: 'down',
                    edgeLeft: 'left',
                    edgeRight: 'right',
                };
                const direction = directions[payload.to];

                if (direction) {
                    const newPos = findEdgeCell(newGridData, row, col, direction);
                    row = newPos.row;
                    col = newPos.col;
                } else {
                    switch(payload.to) {
                        case 'home': col = 0; break;
                        case 'topLeft': row = 0; col = 0; break;
                        case 'end': if (newGridData.length > 0 && newGridData[0]) { row = newGridData.length - 1; col = newGridData[0].length - 1; } break;
                    }
                }
                newSelection.activeCell = { row, col };
                newSelection.anchorCell = { row, col };
            }
            break;
        
        case 'EXTEND_SELECTION':
            if (payload?.direction) {
                let { row, col } = newSelection.activeCell;
                switch (payload.direction) {
                    case 'right': if (newGridData[0]) col = Math.min(newGridData[0].length - 1, col + 1); break;
                    case 'left':  col = Math.max(0, col - 1); break;
                    case 'down':  row = Math.min(newGridData.length - 1, row + 1); break;
                    case 'up':    row = Math.max(0, row - 1); break;
                }
                newSelection.activeCell = { row, col };
            }
            break;
            
        case 'SELECT_TO_EDGE':
            if (payload?.direction) {
                let { row, col } = newSelection.activeCell;
                const { anchorCell } = newSelection;

                const isFullRowSelected = newGridData[0] && anchorCell.col === 0 && newSelection.activeCell.col === newGridData[0].length - 1;
                const isFullColSelected = anchorCell.row === 0 && newSelection.activeCell.row === newGridData.length - 1;

                if (isFullRowSelected && (payload.direction === 'down' || payload.direction === 'up')) {
                    row = payload.direction === 'down' ? newGridData.length - 1 : 0;
                    newSelection.activeCell = { row, col: newSelection.activeCell.col };
                } else if (isFullColSelected && (payload.direction === 'left' || payload.direction === 'right')) {
                    col = payload.direction === 'right' ? (newGridData[0]?.length - 1 || 0) : 0;
                    newSelection.activeCell = { row: newSelection.activeCell.row, col };
                }
                else {
                    const newPos = findEdgeCell(newGridData, row, col, payload.direction);
                    newSelection.activeCell = newPos;
                }
            }
            break;

        case 'SELECT_TO_END':
             if (newGridData.length > 0 && newGridData[0]) {
                newSelection.activeCell = { row: newGridData.length - 1, col: newGridData[0].length - 1 };
            }
            break;

        // ---Destructive/Formatting Actions---
        case 'INSERT_ROW':
             const rowsToInsertAt = new Set<number>();
             getCellsToApply(newSelection).forEach(cell => rowsToInsertAt.add(parseInt(cell.split('-')[0])));
             const sortedInsertRows = Array.from(rowsToInsertAt).sort((a,b) => b - a);
             sortedInsertRows.forEach(rowIndex => {
                const newRow = new Array(newGridData[0]?.length || 0).fill('');
                newGridData.splice(rowIndex, 0, newRow);
             });
             break;
        case 'DELETE_ROW': {
            const rowsToDelete = new Set<number>();
            getCellsToApply(newSelection).forEach(cell => rowsToDelete.add(parseInt(cell.split('-')[0])));
            const sortedRowsToDelete = Array.from(rowsToDelete).sort((a, b) => a - b);
            
            if (sortedRowsToDelete.length > 0) {
                const numCols = newGridData[0]?.length || 0;
        
                // Count how many deleted rows were above each selection corner
                const rowsDeletedAboveActive = sortedRowsToDelete.filter(r => r < newSelection.activeCell.row).length;
                const rowsDeletedAboveAnchor = sortedRowsToDelete.filter(r => r < newSelection.anchorCell.row).length;
        
                // Delete from bottom-up to preserve indices during loop
                for (let i = sortedRowsToDelete.length - 1; i >= 0; i--) {
                    const rowIndex = sortedRowsToDelete[i];
                    if (rowIndex >= 0 && rowIndex < newGridData.length) {
                        newGridData.splice(rowIndex, 1);
                    }
                }
        
                // Add new empty rows at the bottom to maintain grid size
                const numDeleted = sortedRowsToDelete.length;
                for (let i = 0; i < numDeleted; i++) {
                    newGridData.push(new Array(numCols).fill(''));
                }
        
                // Update selection position by shifting it up
                newSelection.activeCell.row = Math.max(0, newSelection.activeCell.row - rowsDeletedAboveActive);
                newSelection.anchorCell.row = Math.max(0, newSelection.anchorCell.row - rowsDeletedAboveAnchor);
            }
            break;
        }
        case 'DELETE_COLUMN': {
            const colsToDelete = new Set<number>();
            getCellsToApply(newSelection).forEach(cell => colsToDelete.add(parseInt(cell.split('-')[1])));
            const sortedColsToDelete = Array.from(colsToDelete).sort((a, b) => a - b);
            
            if (sortedColsToDelete.length > 0) {
                // Count how many deleted cols were to the left of each selection corner
                const colsDeletedBeforeActive = sortedColsToDelete.filter(c => c < newSelection.activeCell.col).length;
                const colsDeletedBeforeAnchor = sortedColsToDelete.filter(c => c < newSelection.anchorCell.col).length;
        
                // Delete from each row from right-to-left
                newGridData.forEach(row => {
                    for (let i = sortedColsToDelete.length - 1; i >= 0; i--) {
                        const colIndex = sortedColsToDelete[i];
                        if (colIndex >= 0 && colIndex < row.length) {
                            row.splice(colIndex, 1);
                        }
                    }
                });
        
                // Add new empty cells at the end of each row to maintain grid size
                const numDeleted = sortedColsToDelete.length;
                newGridData.forEach(row => {
                    for (let i = 0; i < numDeleted; i++) {
                        row.push('');
                    }
                });
        
                // Update selection position by shifting it left
                newSelection.activeCell.col = Math.max(0, newSelection.activeCell.col - colsDeletedBeforeActive);
                newSelection.anchorCell.col = Math.max(0, newSelection.anchorCell.col - colsDeletedBeforeAnchor);
            }
            break;
        }
        case 'DELETE_CONTENT':
            getCellsToApply(newSelection).forEach(cellId => {
                const [r, c] = cellId.split('-').map(Number);
                if (newGridData[r]?.[c] !== undefined) newGridData[r][c] = '';
            });
            break;
        case 'COPY': {
            const { anchorCell, activeCell } = newSelection;
            const minRow = Math.min(anchorCell.row, activeCell.row);
            const maxRow = Math.max(anchorCell.row, activeCell.row);
            const minCol = Math.min(anchorCell.col, activeCell.col);
            const maxCol = Math.max(anchorCell.col, activeCell.col);

            const copiedData: string[][] = [];
            for (let r = minRow; r <= maxRow; r++) {
                const rowData = newGridData[r].slice(minCol, maxCol + 1);
                copiedData.push(rowData);
            }
            
            newGridState.clipboard = {
                data: copiedData,
                isCut: false,
                sourceSheetIndex: newGridState.activeSheetIndex,
                sourceSelection: deepCloneSelection(newSelection),
            };

            getCellsToApply(newSelection).forEach(cellId => {
                newCellStyles[cellId] = { ...newCellStyles[cellId], border: '2px dashed hsl(var(--primary))' };
            });
            break;
        }
        case 'CUT': {
            const { anchorCell, activeCell } = newSelection;
            const minRow = Math.min(anchorCell.row, activeCell.row);
            const maxRow = Math.max(anchorCell.row, activeCell.row);
            const minCol = Math.min(anchorCell.col, activeCell.col);
            const maxCol = Math.max(anchorCell.col, activeCell.col);

            const copiedData: string[][] = [];
            for (let r = minRow; r <= maxRow; r++) {
                const rowData = newGridData[r].slice(minCol, maxCol + 1);
                copiedData.push(rowData);
            }

            newGridState.clipboard = {
                data: copiedData,
                isCut: true,
                sourceSheetIndex: newGridState.activeSheetIndex,
                sourceSelection: deepCloneSelection(newSelection),
            };

            getCellsToApply(newSelection).forEach(cellId => {
                newCellStyles[cellId] = { ...newCellStyles[cellId], opacity: 0.8, border: '2px dashed hsl(var(--primary))' };
            });
            break;
        }
        case 'PASTE': {
            if (!newGridState.clipboard) break;

            const { data: clipboardData, isCut, sourceSheetIndex, sourceSelection } = newGridState.clipboard;
            const { row: startRow, col: startCol } = newSelection.activeCell;

            // Paste data
            clipboardData.forEach((row, rowIndex) => {
                row.forEach((cellValue, colIndex) => {
                    const targetRow = startRow + rowIndex;
                    const targetCol = startCol + colIndex;
                    if (newGridData[targetRow]?.[targetCol] !== undefined) {
                        newGridData[targetRow][colIndex + startCol] = cellValue;
                    }
                });
            });

            // If it was a CUT operation, clear the source
            if (isCut) {
                const sourceSheet = newGridState.sheets[sourceSheetIndex];
                const minRow = Math.min(sourceSelection.anchorCell.row, sourceSelection.activeCell.row);
                const maxRow = Math.max(sourceSelection.anchorCell.row, sourceSelection.activeCell.row);
                const minCol = Math.min(sourceSelection.anchorCell.col, sourceSelection.activeCell.col);
                const maxCol = Math.max(sourceSelection.anchorCell.col, sourceSelection.activeCell.col);

                for (let r = minRow; r <= maxRow; r++) {
                    for (let c = minCol; c <= maxCol; c++) {
                        if (sourceSheet.data[r]?.[c] !== undefined) {
                            sourceSheet.data[r][c] = '';
                        }
                    }
                }
            }
            
            // Clear clipboard and styles
            newGridState.clipboard = null;
            newCellStyles = {};
            break;
        }
        case 'PASTE_STATIC_VALUE':
            if (payload?.value) {
                const valueToFill = newGridData[newSelection.activeCell.row][newSelection.activeCell.col] || payload.value;
                getCellsToApply(newSelection).forEach(cellId => {
                    const [r, c] = cellId.split('-').map(Number);
                    if (newGridData[r]?.[c] !== undefined) {
                        newGridData[r][c] = valueToFill;
                    }
                });
            }
            newCellStyles = {}; 
            break;
        case 'START_EDITING':
            if (payload?.formula) {
                const {row, col} = newSelection.activeCell;
                if (newGridData[row]?.[col] !== undefined) newGridData[row][col] = payload.formula;
            }
            break;
        case 'TOGGLE_ABS_REF': {
            const {row, col} = newSelection.activeCell;
            const cellContent = newGridData[row]?.[col];
            if (cellContent && cellContent.startsWith('=')) {
                // Super simplified cycle for demo purposes: A1 -> $A$1 -> A1
                if (cellContent.includes('$')) {
                    newGridData[row][col] = cellContent.replace(/\$/g, '');
                } else {
                    newGridData[row][col] = cellContent.replace(/([A-Z]+)(\d+)/g, '$$$1$$$2');
                }
            }
            break;
        }
        case 'SHOW_FILTER_DROPDOWN': {
            const {row, col} = newSelection.activeCell;
            const cellContent = newGridData[row]?.[col];
            if (cellContent && !cellContent.includes('▾')) {
                newGridData[row][col] = `${cellContent} ▾`;
            }
            break;
        }
        case 'APPLY_STYLE_BOLD':
            getCellsToApply(newSelection).forEach(cellId => {
                newCellStyles[cellId] = { ...newCellStyles[cellId], fontWeight: 'bold' };
            });
            break;
        case 'APPLY_STYLE_ITALIC':
            getCellsToApply(newSelection).forEach(cellId => {
                newCellStyles[cellId] = { ...newCellStyles[cellId], fontStyle: 'italic' };
            });
            break;
        case 'APPLY_STYLE_UNDERLINE':
            getCellsToApply(newSelection).forEach(cellId => {
                newCellStyles[cellId] = { ...newCellStyles[cellId], textDecoration: 'underline' };
            });
            break;
        case 'APPLY_STYLE_STRIKETHROUGH':
            getCellsToApply(newSelection).forEach(cellId => {
                newCellStyles[cellId] = { ...newCellStyles[cellId], textDecoration: 'line-through' };
            });
            break;
        case 'APPLY_STYLE_CURRENCY':
            getCellsToApply(newSelection).forEach(cellId => {
                const [r, c] = cellId.split('-').map(Number);
                if (newGridData[r]?.[c] !== undefined) {
                    const numericValue = parseFloat(newGridData[r][c].replace(/[^0-9.-]+/g, ""));
                    if (!isNaN(numericValue)) newGridData[r][c] = `$${numericValue.toFixed(2)}`;
                }
            });
            break;
        case 'APPLY_STYLE_PERCENTAGE':
            getCellsToApply(newSelection).forEach(cellId => {
                const [r, c] = cellId.split('-').map(Number);
                if (newGridData[r]?.[c] !== undefined) {
                    const numericValue = parseFloat(newGridData[r][c].replace(/[^0-9.-]+/g, ""));
                    if (!isNaN(numericValue)) newGridData[r][c] = `${numericValue}%`;
                }
            });
            break;
    }

    newGridState.sheets[newGridState.activeSheetIndex] = activeSheet;

    return {
        newGridState,
        newCellStyles
    };
};

export const calculateGridStateForStep = (steps: ChallengeStep[], initialGridState: GridState, targetStepIndex: number): { gridState: GridState | null, cellStyles: Record<string, React.CSSProperties> } => {
    if (!initialGridState) return { gridState: null, cellStyles: {} };

    let runningGridState: GridState = deepCloneGridState(initialGridState);
    let runningCellStyles: Record<string, React.CSSProperties> = {};
    
    if (targetStepIndex < 0) {
        return { gridState: runningGridState, cellStyles: runningCellStyles };
    }
    
    for (let i = 0; i <= targetStepIndex; i++) {
        const step = steps[i];
        if (step) {
            const { newGridState, newCellStyles } = applyGridEffect(runningGridState, step, runningCellStyles);
            runningGridState = newGridState;
            runningCellStyles = newCellStyles;
        }
    }
    return { gridState: runningGridState, cellStyles: runningCellStyles };
};



    

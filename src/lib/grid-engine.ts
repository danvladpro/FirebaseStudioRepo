
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
      hiddenRows: sheet.hiddenRows ? new Set(sheet.hiddenRows) : undefined,
      hiddenColumns: sheet.hiddenColumns ? new Set(sheet.hiddenColumns) : undefined,
      viewport: sheet.viewport ? { ...sheet.viewport } : undefined,
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
    const isAtEdgeOfData = 
        (direction === 'up' && (r === 0 || isCellEmpty(r-1, c) !== isStartCellEmpty)) ||
        (direction === 'down' && (r === numRows - 1 || isCellEmpty(r+1, c) !== isStartCellEmpty)) ||
        (direction === 'left' && (c === 0 || isCellEmpty(r, c-1) !== isStartCellEmpty)) ||
        (direction === 'right' && (c === numCols - 1 || isCellEmpty(r, c+1) !== isStartCellEmpty));


    if (isStartCellEmpty || isAtEdgeOfData) {
        // If starting from an empty cell OR at the edge of a data block, jump over empty space to the next data block.
        switch (direction) {
            case 'down':
                while (r < numRows - 1 && isCellEmpty(r + 1, c)) r++;
                if (r < numRows - 1 && isStartCellEmpty) r++; // if we started empty, land on the data cell
                else if (r < numRows - 1 && !isStartCellEmpty) r++; // if we started on data edge, land on next data cell
                break;
            case 'up':
                while (r > 0 && isCellEmpty(r - 1, c)) r--;
                if (r > 0 && isStartCellEmpty) r--;
                else if (r > 0 && !isStartCellEmpty) r--;
                break;
            case 'right':
                while (c < numCols - 1 && isCellEmpty(r, c + 1)) c++;
                if (c < numCols - 1 && isStartCellEmpty) c++;
                else if (c < numCols - 1 && !isStartCellEmpty) c++;
                break;
            case 'left':
                while (c > 0 && isCellEmpty(r, c - 1)) c--;
                if (c > 0 && isStartCellEmpty) c--;
                else if (c > 0 && !isStartCellEmpty) c--;
                break;
        }
    } else {
        // If starting from within a filled cell block, jump to the edge of that block.
        switch (direction) {
            case 'down':
                while (r < numRows - 1 && !isCellEmpty(r + 1, c)) r++;
                break;
            case 'up':
                while (r > 0 && !isCellEmpty(r - 1, c)) r--;
                break;
            case 'right':
                while (c < numCols - 1 && !isCellEmpty(r, c + 1)) c++;
                break;
            case 'left':
                while (c > 0 && !isCellEmpty(r, c - 1)) c--;
                break;
        }
    }
    return { row: r, col: c };
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
    const isRangeSelection = newSelection.activeCell.row !== newSelection.anchorCell.row || newSelection.activeCell.col !== newSelection.anchorCell.col;

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
                const startCell = isRangeSelection ? newSelection.anchorCell : newSelection.activeCell;

                const { direction, amount = 1 } = payload;
                
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
                const startCell = isRangeSelection ? newSelection.anchorCell : newSelection.activeCell;
                
                let { row, col } = startCell;
                
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
                        case 'end': {
                            let lastUsedRow = -1;
                            let lastUsedCol = -1;
                            newGridData.forEach((rowData, r) => {
                                let rowHasData = false;
                                rowData.forEach((cell, c) => {
                                    if (cell && cell.trim() !== '') {
                                        rowHasData = true;
                                        if (c > lastUsedCol) lastUsedCol = c;
                                    }
                                });
                                if (rowHasData) lastUsedRow = r;
                            });
                            if (lastUsedRow !== -1) row = lastUsedRow;
                            if (lastUsedCol !== -1) col = lastUsedCol;
                            break;
                        }
                    }
                }
                // A jump collapses the selection to the new cell.
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
            
        case 'SELECT_TO_EDGE': {
            if (payload?.direction) {
                const { anchorCell, activeCell } = newSelection;
                const direction = payload.direction;
        
                if (direction === 'down' || direction === 'up') {
                    const minCol = Math.min(anchorCell.col, activeCell.col);
                    const maxCol = Math.max(anchorCell.col, activeCell.col);
                    let finalRow = activeCell.row;

                    for (let c = minCol; c <= maxCol; c++) {
                        const startRow = activeCell.row;
                        // Only consider columns that have data in the starting row of the selection for determining the boundary
                        if (newGridData[startRow]?.[c]?.trim()) {
                            const edgePos = findEdgeCell(newGridData, startRow, c, direction);
                            if (direction === 'down') {
                                finalRow = Math.max(finalRow, edgePos.row);
                            } else {
                                finalRow = Math.min(finalRow, edgePos.row);
                            }
                        }
                    }
                    newSelection.activeCell.row = finalRow;

                } else if (direction === 'right' || direction === 'left') {
                    const minRow = Math.min(anchorCell.row, activeCell.row);
                    const maxRow = Math.max(anchorCell.row, activeCell.row);
                    let finalCol = activeCell.col;

                    for (let r = minRow; r <= maxRow; r++) {
                         if (newGridData[r]?.[activeCell.col]?.trim()) {
                            const edgePos = findEdgeCell(newGridData, r, activeCell.col, direction);
                            if (direction === 'right') {
                                finalCol = Math.max(finalCol, edgePos.col);
                            } else {
                                finalCol = Math.min(finalCol, edgePos.col);
                            }
                         }
                    }
                    newSelection.activeCell.col = finalCol;

                } else {
                    // Fallback to simple logic if direction is unexpected
                    const { row, col } = newSelection.activeCell;
                    const newPos = findEdgeCell(newGridData, row, col, direction);
                    newSelection.activeCell = newPos;
                }
            }
            break;
        }

        case 'SELECT_TO_END': {
            let lastUsedRow = -1;
            let lastUsedCol = -1;

            newGridData.forEach((row, r) => {
                let rowHasData = false;
                row.forEach((cell, c) => {
                    if (cell && cell.trim() !== '') {
                        rowHasData = true;
                        if (c > lastUsedCol) {
                            lastUsedCol = c;
                        }
                    }
                });
                if (rowHasData) {
                    lastUsedRow = r;
                }
            });

            if (lastUsedRow !== -1 && lastUsedCol !== -1) {
                newSelection.activeCell = { row: lastUsedRow, col: lastUsedCol };
            }
            break;
        }

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

            const numPastedRows = clipboardData.length;
            const numPastedCols = clipboardData[0]?.length || 0;

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
                if (sourceSheet) {
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
            }
            
            // Update the selection to cover the pasted area
            const endRow = startRow + numPastedRows - 1;
            const endCol = startCol + numPastedCols - 1;

            if (newGridData[0]) {
              newSelection.anchorCell = { row: startRow, col: startCol };
              newSelection.activeCell = { 
                  row: Math.min(newGridData.length - 1, endRow), 
                  col: Math.min(newGridData[0].length - 1, endCol) 
              };
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
        case 'HIDE_ROW': {
            if (!activeSheet.hiddenRows) {
                activeSheet.hiddenRows = new Set();
            }
            getCellsToApply(newSelection).forEach(cellId => {
                const [r] = cellId.split('-').map(Number);
                activeSheet.hiddenRows!.add(r);
            });
            break;
        }
        case 'HIDE_COLUMN': {
            if (!activeSheet.hiddenColumns) {
                activeSheet.hiddenColumns = new Set();
            }
            getCellsToApply(newSelection).forEach(cellId => {
                const [, c] = cellId.split('-').map(Number);
                activeSheet.hiddenColumns!.add(c);
            });
            break;
        }
        case 'UNHIDE_ROWS': {
            if (activeSheet.hiddenRows) {
                activeSheet.hiddenRows.clear();
            }
            break;
        }
        case 'SCROLL_PAGE_DOWN': {
            if (!activeSheet.viewport) {
                activeSheet.viewport = { startRow: 0, rowCount: 15 };
            }
            const { startRow, rowCount } = activeSheet.viewport;
            const newStartRow = Math.min(newGridData.length - rowCount, startRow + rowCount);
            activeSheet.viewport.startRow = newStartRow;
            break;
        }
        case 'SCROLL_PAGE_UP': {
            if (!activeSheet.viewport) {
                activeSheet.viewport = { startRow: 0, rowCount: 15 };
            }
            const { startRow, rowCount } = activeSheet.viewport;
            const newStartRow = Math.max(0, startRow - rowCount);
            activeSheet.viewport.startRow = newStartRow;
            break;
        }
        case 'AUTOSUM': {
            const { row, col } = newSelection.activeCell;
            
            let endRangeRow = row - 1;
            while(endRangeRow >= 0 && newGridData[endRangeRow][col] && !isNaN(parseFloat(newGridData[endRangeRow][col]))) {
                endRangeRow--;
            }
            endRangeRow++; // Move back to the first valid number row

            if (endRangeRow < row) {
                 const startRangeColChar = String.fromCharCode(65 + col);
                 const formula = `=SUM(${startRangeColChar}${endRangeRow + 1}:${startRangeColChar}${row})`;
                 if (newGridData[row] && newGridData[row][col] !== undefined) {
                    newGridData[row][col] = formula;
                 }
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



    

    



import { FindReplaceDialogState, GridState, ChallengeStep, Sheet } from './types';
import { calculateDialogStateForStep } from './dialog-engine';

const deepCloneSelection = (selection: Sheet['selection']): Sheet['selection'] => ({
    activeCell: { ...selection.activeCell },
    anchorCell: { ...selection.anchorCell },
    visibleOnly: selection.visibleOnly,
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
      frozenAt: sheet.frozenAt ? { ...sheet.frozenAt } : null,
      showGridlines: sheet.showGridlines,
      groupedRowRanges: sheet.groupedRowRanges ? [...sheet.groupedRowRanges] : undefined,
      colWidths: sheet.colWidths ? [...sheet.colWidths] : undefined,
      mergedRanges: sheet.mergedRanges ? sheet.mergedRanges.map(r => ({ start: { ...r.start }, end: { ...r.end } })) : undefined,
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
    direction: 'up' | 'down' | 'left' | 'right',
    mergedRanges: Sheet['mergedRanges'] = []
): { row: number; col: number } {
    const numRows = gridData.length;
    if (numRows === 0) return { row: startRow, col: startCol };
    const numCols = gridData[0]?.length || 0;
    if (numCols === 0) return { row: startRow, col: startCol };

    const isEffectivelyEmpty = (r: number, c: number) => {
        // A cell is NOT empty if it has content.
        if (gridData[r]?.[c] && gridData[r][c].trim() !== '') {
            return false;
        }
        // A cell is also NOT empty if it is part of a merged range.
        const isPartOfMerge = mergedRanges.some(range =>
            r >= range.start.row && r <= range.end.row &&
            c >= range.start.col && c <= range.end.col
        );
        return !isPartOfMerge;
    };

    let r = startRow;
    let c = startCol;

    // If starting within a merged cell, treat the jump as if it's from the edge of that merge.
    const startingMerge = mergedRanges.find(range => 
        r >= range.start.row && r <= range.end.row && 
        c >= range.start.col && c <= range.end.col
    );

    if (startingMerge) {
         switch (direction) {
            case 'down': r = startingMerge.end.row; break;
            case 'up': r = startingMerge.start.row; break;
            case 'right': c = startingMerge.end.col; break;
            case 'left': c = startingMerge.start.col; break;
        }
    }
    
    const isStartCellEffectivelyEmpty = isEffectivelyEmpty(r, c);
    
    const isAtEdgeOfData = 
        (direction === 'up' && (r === 0 || isEffectivelyEmpty(r - 1, c) !== isStartCellEffectivelyEmpty)) ||
        (direction === 'down' && (r === numRows - 1 || isEffectivelyEmpty(r + 1, c) !== isStartCellEffectivelyEmpty)) ||
        (direction === 'left' && (c === 0 || isEffectivelyEmpty(r, c - 1) !== isStartCellEffectivelyEmpty)) ||
        (direction === 'right' && (c === numCols - 1 || isEffectivelyEmpty(r, c + 1) !== isStartCellEffectivelyEmpty));


    if (isStartCellEffectivelyEmpty || isAtEdgeOfData) {
        // If starting from an empty cell OR at the edge of a data block, jump over empty space to the next data block.
        switch (direction) {
            case 'down':
                while (r < numRows - 1 && isEffectivelyEmpty(r + 1, c)) r++;
                if (r < numRows - 1 && (isStartCellEffectivelyEmpty || isAtEdgeOfData)) r++; 
                break;
            case 'up':
                while (r > 0 && isEffectivelyEmpty(r - 1, c)) r--;
                 if (r > 0 && (isStartCellEffectivelyEmpty || isAtEdgeOfData)) r--;
                break;
            case 'right':
                while (c < numCols - 1 && isEffectivelyEmpty(r, c + 1)) c++;
                if (c < numCols - 1 && (isStartCellEffectivelyEmpty || isAtEdgeOfData)) c++;
                break;
            case 'left':
                while (c > 0 && isEffectivelyEmpty(r, c - 1)) c--;
                if (c > 0 && (isStartCellEffectivelyEmpty || isAtEdgeOfData)) c--;
                break;
        }
    } else {
        // If starting from within a filled cell block, jump to the edge of that block.
        switch (direction) {
            case 'down':
                while (r < numRows - 1 && !isEffectivelyEmpty(r + 1, c)) r++;
                break;
            case 'up':
                while (r > 0 && !isEffectivelyEmpty(r - 1, c)) r--;
                break;
            case 'right':
                while (c < numCols - 1 && !isEffectivelyEmpty(r, c + 1)) c++;
                break;
            case 'left':
                while (c > 0 && !isEffectivelyEmpty(r, c - 1)) c--;
                break;
        }
    }
    
    // After moving, if we landed inside a different merged cell, jump to its boundary.
    const finalMergeRange = mergedRanges.find(range => 
        r >= range.start.row && r <= range.end.row && 
        c >= range.start.col && c <= range.end.col
    );

    if (finalMergeRange && finalMergeRange !== startingMerge) {
         switch (direction) {
            case 'down': r = finalMergeRange.end.row; break;
            case 'up': r = finalMergeRange.start.row; break;
            case 'right': c = finalMergeRange.end.col; break;
            case 'left': c = finalMergeRange.start.col; break;
        }
    }

    return { row: r, col: c };
}


export const applyGridEffect = (gridState: GridState, dialogState: FindReplaceDialogState, step: ChallengeStep, cellStyles: Record<string, React.CSSProperties>): { newGridState: GridState, newCellStyles: Record<string, React.CSSProperties> } => {
    if (!step.gridEffect) return { newGridState: gridState, newCellStyles: cellStyles };

    const { action, payload } = step.gridEffect;
    let newGridState = deepCloneGridState(gridState);
    let newCellStyles = { ...cellStyles };

    const getFullSelectionInfo = (selection: Sheet['selection']) => {
        const { activeCell, anchorCell } = selection;
        const minRow = Math.min(anchorCell.row, activeCell.row);
        const maxRow = Math.max(anchorCell.row, activeCell.row);
        const minCol = Math.min(anchorCell.col, activeCell.col);
        const maxCol = Math.max(anchorCell.col, activeCell.col);
        const isRangeSelection = activeCell.row !== anchorCell.row || activeCell.col !== anchorCell.col;
        return { minRow, maxRow, minCol, maxCol, isRangeSelection };
    };

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
                newSelection.visibleOnly = false;
            }
            break;
        case 'SELECT_COLUMN':
             if (newGridData.length > 0) {
                const col = newSelection.activeCell.col;
                newSelection.anchorCell = { row: 0, col };
                newSelection.activeCell = { row: newGridData.length - 1, col };
                newSelection.visibleOnly = false;
            }
            break;
        case 'SELECT_ALL': {
            const { activeCell } = newSelection;
            const { data } = activeSheet;
            const numRows = data.length;
            if (numRows === 0) break;
            const numCols = data[0]?.length || 0;
            if (numCols === 0) break;

            // Helper functions
            const isRowEmpty = (r: number) => {
                if (r < 0 || r >= numRows) return true;
                return data[r].every(cell => !cell || cell.trim() === '');
            };
            const isColEmpty = (c: number) => {
                if (c < 0 || c >= numCols) return true;
                for (let r = 0; r < numRows; r++) {
                    if (data[r]?.[c] && data[r][c].trim() !== '') return false;
                }
                return true;
            };

            // Find top boundary
            let minRow = activeCell.row;
            while(minRow > 0 && !isRowEmpty(minRow - 1)) {
                minRow--;
            }
            
            // find bottom boundary
            let maxRow = activeCell.row;
            while(maxRow < numRows - 1 && !isRowEmpty(maxRow + 1)) {
                maxRow++;
            }

            // find left boundary
            let minCol = activeCell.col;
            while(minCol > 0 && !isColEmpty(minCol - 1)) {
                minCol--;
            }

            // find right boundary
            let maxCol = activeCell.col;
            while(maxCol < numCols - 1 && !isColEmpty(maxCol + 1)) {
                maxCol++;
            }

            newSelection.anchorCell = { row: minRow, col: minCol };
            newSelection.activeCell = { row: maxRow, col: maxCol };
            newSelection.visibleOnly = false;
            break;
        }
        case 'MOVE_SELECTION': {
            const { isRangeSelection } = getFullSelectionInfo(newSelection);
            const { direction, amount = 1 } = payload;
            
            let { row, col } = newSelection.activeCell;
            
            if (isRangeSelection) {
                // In Excel, pressing an arrow key on a selection moves the active cell to a corner
                switch (direction) {
                    case 'down': row = Math.max(newSelection.activeCell.row, newSelection.anchorCell.row); break;
                    case 'up': row = Math.min(newSelection.activeCell.row, newSelection.anchorCell.row); break;
                    case 'right': col = Math.max(newSelection.activeCell.col, newSelection.anchorCell.col); break;
                    case 'left': col = Math.min(newSelection.activeCell.col, newSelection.anchorCell.col); break;
                }
                newSelection.activeCell = { row, col };
                newSelection.anchorCell = { row, col };

            } else {
                switch (direction) {
                    case 'down': row = Math.min(newGridData.length - 1, row + amount); break;
                    case 'up': row = Math.max(0, row - amount); break;
                    case 'right': if (newGridData[0]) col = Math.min(newGridData[0].length - 1, col + amount); break;
                    case 'left': col = Math.max(0, col - amount); break;
                }
                newSelection.activeCell = { row, col };
                newSelection.anchorCell = { row, col };
            }
            newSelection.visibleOnly = false;
            break;
        }
            
        case 'MOVE_SELECTION_ADVANCED': {
            const { isRangeSelection } = getFullSelectionInfo(newSelection);
            const startCell = newSelection.activeCell;
            
            let { row, col } = startCell;
            
            const directions: { [key: string]: 'up' | 'down' | 'left' | 'right' | undefined } = {
                edgeUp: 'up',
                edgeDown: 'down',
                edgeLeft: 'left',
                edgeRight: 'right',
            };
            const direction = directions[payload.to];

            if (direction) {
                const newPos = findEdgeCell(newGridData, row, col, direction, activeSheet.mergedRanges);
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
            
             if (isRangeSelection) {
                newSelection.activeCell = { row: newSelection.anchorCell.row, col: newSelection.anchorCell.col };
            } else {
                newSelection.activeCell = { row, col };
                newSelection.anchorCell = { row, col };
            }
            newSelection.visibleOnly = false;
            break;
        }
        
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
                newSelection.visibleOnly = false;
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
                            const edgePos = findEdgeCell(newGridData, startRow, c, direction, activeSheet.mergedRanges);
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
                            const edgePos = findEdgeCell(newGridData, r, activeCell.col, direction, activeSheet.mergedRanges);
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
                    const newPos = findEdgeCell(newGridData, row, col, direction, activeSheet.mergedRanges);
                    newSelection.activeCell = newPos;
                }
                newSelection.visibleOnly = false;
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
            newSelection.visibleOnly = false;
            break;
        }
        
        case 'SET_SELECTION_MODE':
            if (payload === 'visibleOnly') {
                newSelection.visibleOnly = true;
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
            const { anchorCell, activeCell, visibleOnly } = newSelection;
            const minRow = Math.min(anchorCell.row, activeCell.row);
            const maxRow = Math.max(anchorCell.row, activeCell.row);
            const minCol = Math.min(anchorCell.col, activeCell.col);
            const maxCol = Math.max(anchorCell.col, activeCell.col);
            const { hiddenRows = new Set<number>() } = activeSheet;

            const copiedData: string[][] = [];
            for (let r = minRow; r <= maxRow; r++) {
                if (visibleOnly && hiddenRows.has(r)) {
                    continue;
                }
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
            const { anchorCell, activeCell, visibleOnly } = newSelection;
            const minRow = Math.min(anchorCell.row, activeCell.row);
            const maxRow = Math.max(anchorCell.row, activeCell.row);
            const minCol = Math.min(anchorCell.col, activeCell.col);
            const maxCol = Math.max(anchorCell.col, activeCell.col);
            const { hiddenRows = new Set<number>() } = activeSheet;

            const copiedData: string[][] = [];
            for (let r = minRow; r <= maxRow; r++) {
                if (visibleOnly && hiddenRows.has(r)) {
                    continue;
                }
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
            
            const { minRow: startRow, minCol: startCol } = getFullSelectionInfo(newSelection);

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
                    const { visibleOnly } = sourceSelection;
                    const { hiddenRows = new Set<number>() } = sourceSheet;
                    
                    const minRow = Math.min(sourceSelection.anchorCell.row, sourceSelection.activeCell.row);
                    const maxRow = Math.max(sourceSelection.anchorCell.row, sourceSelection.activeCell.row);
                    const minCol = Math.min(sourceSelection.anchorCell.col, sourceSelection.activeCell.col);
                    const maxCol = Math.max(sourceSelection.anchorCell.col, sourceSelection.activeCell.col);

                    for (let r = minRow; r <= maxRow; r++) {
                        if (visibleOnly && hiddenRows.has(r)) {
                            continue;
                        }
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
        case 'PASTE_MULTIPLE_VALUES': {
            if (!payload?.values) break;

            const valuesToPaste = payload.values as string[][];
            const { row: startRow, col: startCol } = newSelection.activeCell;

            valuesToPaste.forEach((row, rowIndex) => {
                row.forEach((cellValue, colIndex) => {
                    const targetRow = startRow + rowIndex;
                    const targetCol = startCol + colIndex;
                    if (newGridData[targetRow]?.[targetCol] !== undefined) {
                        newGridData[targetRow][targetCol] = cellValue;
                    }
                });
            });

            newCellStyles = {};
            break;
        }
        case 'PASTE_STATIC_VALUE':
            if (payload?.value !== undefined) {
                const valueToFill = payload.value;
                getCellsToApply(newSelection).forEach(cellId => {
                    const [r, c] = cellId.split('-').map(Number);
                    if (newGridData[r]?.[c] !== undefined) {
                        newGridData[r][c] = valueToFill;
                    }
                });
            }
            newCellStyles = {}; 
            break;
        case 'UPDATE_ACTIVE_CELL_CONTENT': {
            if (payload?.value !== undefined) {
                const { row, col } = newSelection.anchorCell;
                if (newGridData[row]?.[col] !== undefined) {
                    newGridData[row][col] = payload.value;
                }
            }
            break;
        }
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
                activeSheet.viewport = { startRow: 0, rowCount: 6 };
            }
            const { startRow, rowCount } = activeSheet.viewport;
            const newStartRow = Math.min(Math.max(0, newGridData.length - rowCount), startRow + rowCount);
            activeSheet.viewport.startRow = newStartRow;
            break;
        }
        case 'SCROLL_PAGE_UP': {
            if (!activeSheet.viewport) {
                activeSheet.viewport = { startRow: 0, rowCount: 6 };
            }
            const { startRow, rowCount } = activeSheet.viewport;
            const newStartRow = Math.max(0, startRow - rowCount);
            activeSheet.viewport.startRow = newStartRow;
            break;
        }
        case 'AUTOSUM': {
            const { anchorCell, activeCell } = newSelection;
            const minRow = Math.min(anchorCell.row, activeCell.row);
            const maxRow = Math.max(anchorCell.row, activeCell.row);
            const minCol = Math.min(anchorCell.col, activeCell.col);
            const maxCol = Math.max(anchorCell.col, activeCell.col);
    
            const isColumnSelection = minCol === maxCol && minRow < maxRow;
            const isRowSelection = minRow === maxRow && minCol < maxCol;
            
            if (isColumnSelection) {
                const targetRow = maxRow + 1;
                const targetCol = minCol;
    
                if (targetRow < newGridData.length && (newGridData[targetRow]?.[targetCol] === '' || newGridData[targetRow]?.[targetCol] === undefined)) {
                    const colChar = String.fromCharCode(65 + targetCol);
                    const formula = `=SUM(${colChar}${minRow + 1}:${colChar}${maxRow + 1})`;
                    newGridData[targetRow][targetCol] = formula;
    
                    // Highlight the summed range
                    for (let r = minRow; r <= maxRow; r++) {
                        const cellId = `${r}-${targetCol}`;
                        newCellStyles[cellId] = { ...newCellStyles[cellId], border: '1.5px solid hsl(var(--primary))' };
                    }
                    
                    // Move selection to the cell with the formula
                    newSelection.activeCell = { row: targetRow, col: targetCol };
                    newSelection.anchorCell = { row: targetRow, col: targetCol };
                }
            } else if (isRowSelection) {
                const targetRow = minRow;
                const targetCol = maxCol + 1;
    
                if (targetCol < (newGridData[0]?.length || 0) && (newGridData[targetRow]?.[targetCol] === '' || newGridData[targetRow]?.[targetCol] === undefined)) {
                    const startColChar = String.fromCharCode(65 + minCol);
                    const endColChar = String.fromCharCode(65 + maxCol);
                    const formula = `=SUM(${startColChar}${targetRow + 1}:${endColChar}${targetRow + 1})`;
                    newGridData[targetRow][targetCol] = formula;
    
                    // Highlight the summed range
                    for (let c = minCol; c <= maxCol; c++) {
                        const cellId = `${targetRow}-${c}`;
                        newCellStyles[cellId] = { ...newCellStyles[cellId], border: '1.5px solid hsl(var(--primary))' };
                    }
    
                    // Move selection to the cell with the formula
                    newSelection.activeCell = { row: targetRow, col: targetCol };
                    newSelection.anchorCell = { row: targetRow, col: targetCol };
                }
            } else { // Fallback for single cell or other selections - default to summing above
                const { row: activeRow, col: activeCol } = activeCell;
    
                let startRangeRow = activeRow - 1;
                let rangeFound = false;
                if(startRangeRow >= 0) {
                    while (startRangeRow >= 0 && newGridData[startRangeRow]?.[activeCol]?.trim() && !isNaN(parseFloat(newGridData[startRangeRow][activeCol]))) {
                        startRangeRow--;
                    }
                    startRangeRow++; // move back to first number
    
                    if (startRangeRow < activeRow) {
                        const colChar = String.fromCharCode(65 + activeCol);
                        const formula = `=SUM(${colChar}${startRangeRow + 1}:${colChar}${activeRow})`;
                        
                        if (newGridData[activeRow]?.[activeCol] !== undefined) {
                            newGridData[activeRow][activeCol] = formula;
    
                            for (let r = startRangeRow; r < activeRow; r++) {
                                const cellId = `${r}-${activeCol}`;
                                newCellStyles[cellId] = { ...newCellStyles[cellId], border: '1.5px solid hsl(var(--primary))' };
                            }
                        }
                        rangeFound = true;
                    }
                }
    
                // If no range above, try summing to the left
                if (!rangeFound) {
                    let startRangeCol = activeCol - 1;
                    if(startRangeCol >= 0) {
                        while (startRangeCol >= 0 && newGridData[activeRow]?.[startRangeCol]?.trim() && !isNaN(parseFloat(newGridData[activeRow][startRangeCol]))) {
                            startRangeCol--;
                        }
                        startRangeCol++; // move back to first number
                        
                        if (startRangeCol < activeCol) {
                            const startColChar = String.fromCharCode(65 + startRangeCol);
                            const endColChar = String.fromCharCode(65 + activeCol - 1);
                            const formula = `=SUM(${startColChar}${activeRow + 1}:${endColChar}${activeRow + 1})`;
                            if (newGridData[activeRow]?.[activeCol] !== undefined) {
                                newGridData[activeRow][activeCol] = formula;
                                for (let c = startRangeCol; c < activeCol; c++) {
                                    const cellId = `${activeRow}-${c}`;
                                    newCellStyles[cellId] = { ...newCellStyles[cellId], border: '1.5px solid hsl(var(--primary))' };
                                }
                            }
                        }
                    }
                }
            }
            break;
        }
        case 'GROUP_ROWS': {
            const { minRow, maxRow } = getFullSelectionInfo(newSelection);
            if (!activeSheet.groupedRowRanges) {
                activeSheet.groupedRowRanges = [];
            }
            activeSheet.groupedRowRanges.push({ start: minRow, end: maxRow });
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
                    const numericValue = parseFloat(newGridData[r][c].replace(/[^0-9.%]+/g, ""));
                    if (!isNaN(numericValue)) {
                         const displayValue = newGridData[r][c].includes('%') ? numericValue : numericValue * 100;
                         newGridData[r][c] = `${displayValue.toFixed(0)}%`;
                    }
                }
            });
            break;
        case 'APPLY_STYLE_CENTER_ALIGN':
            getCellsToApply(newSelection).forEach(cellId => {
                newCellStyles[cellId] = { ...newCellStyles[cellId], textAlign: 'center' };
            });
            break;
        case 'APPLY_STYLE_MERGE_CENTER': {
            const { minRow, maxRow, minCol, maxCol } = getFullSelectionInfo(newSelection);
            
            if (!activeSheet.mergedRanges) {
                activeSheet.mergedRanges = [];
            }
            
            activeSheet.mergedRanges.push({
                start: { row: minRow, col: minCol },
                end: { row: maxRow, col: maxCol }
            });

            const content = newGridData[minRow]?.[minCol] || '';

            for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                    if (r !== minRow || c !== minCol) {
                        newGridData[r][c] = '';
                    }
                }
            }
            newGridData[minRow][minCol] = content;

            // Collapse selection to the top-left of the merge
            newSelection.activeCell = { row: minRow, col: minCol };
            newSelection.anchorCell = { row: minRow, col: minCol };
            break;
        }
        case 'APPLY_STYLE_ALL_BORDERS':
            getCellsToApply(newSelection).forEach(cellId => {
                newCellStyles[cellId] = { ...newCellStyles[cellId], border: '1px solid hsl(var(--muted-foreground))' };
            });
            break;
        case 'APPLY_STYLE_THICK_BORDER': {
            const { minRow, maxRow, minCol, maxCol } = getFullSelectionInfo(newSelection);
            for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                    const cellId = `${r}-${c}`;
                    const style = { ...newCellStyles[cellId] };
                    const thickBorder = '2px solid hsl(var(--foreground))';
                    if (r === minRow) style.borderTop = thickBorder;
                    if (r === maxRow) style.borderBottom = thickBorder;
                    if (c === minCol) style.borderLeft = thickBorder;
                    if (c === maxCol) style.borderRight = thickBorder;
                    newCellStyles[cellId] = style;
                }
            }
            break;
        }
        case 'APPLY_STYLE_WRAP_TEXT':
            getCellsToApply(newSelection).forEach(cellId => {
                newCellStyles[cellId] = { ...newCellStyles[cellId], whiteSpace: 'pre-wrap' };
            });
            break;
        case 'FREEZE_PANES': {
            const { minRow, maxRow, minCol, maxCol } = getFullSelectionInfo(newSelection);
            
            const isFullRowSelection = minCol === 0 && maxCol === (newGridData[0]?.length || 1) - 1;
            const isFullColSelection = minRow === 0 && maxRow === newGridData.length - 1;

            if (isFullRowSelection) {
                activeSheet.frozenAt = { row: minRow, col: -1 }; 
            } else if (isFullColSelection) {
                activeSheet.frozenAt = { row: -1, col: minCol }; 
            } else {
                activeSheet.frozenAt = { row: minRow, col: minCol };
            }
            break;
        }
        case 'TOGGLE_GRIDLINES':
            activeSheet.showGridlines = !(activeSheet.showGridlines ?? true);
            break;
        case 'APPLY_TABLE_FORMATTING': {
            const { anchorCell, activeCell } = newSelection;
            const minRow = Math.min(anchorCell.row, activeCell.row);
            const maxRow = Math.max(anchorCell.row, activeCell.row);
            const minCol = Math.min(anchorCell.col, activeCell.col);
            const maxCol = Math.max(anchorCell.col, activeCell.col);
            
            for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                    const cellId = `${r}-${c}`;
                    let style: React.CSSProperties = { ...newCellStyles[cellId] };

                    // Header row
                    if (r === minRow) {
                        style.fontWeight = 'bold';
                        style.color = 'hsl(var(--primary-foreground))';
                        style.backgroundColor = 'hsl(var(--primary))';
                        style.borderTop = '2px solid hsl(var(--primary))';
                        style.borderBottom = '1.5px solid hsl(var(--primary))';
                    } else {
                        // Alternating row colors (banding)
                        if ((r - minRow) % 2 === 1) {
                            style.backgroundColor = 'hsl(var(--secondary))';
                        } else {
                             style.backgroundColor = 'hsl(var(--card))';
                        }
                    }
                    
                    // Side borders
                    if (c === minCol) style.borderLeft = '2px solid hsl(var(--primary))';
                    if (c === maxCol) style.borderRight = '2px solid hsl(var(--primary))';

                    // Bottom border for the whole table
                    if (r === maxRow) {
                         style.borderBottom = '2px solid hsl(var(--primary))';
                    }
                    
                    newCellStyles[cellId] = style;
                }
            }
            break;
        }
        case 'AUTOFIT_COLUMNS': {
            const { minCol, maxCol } = getFullSelectionInfo(newSelection);
            if (!activeSheet.colWidths) {
                activeSheet.colWidths = new Array(newGridData[0]?.length || 0).fill(undefined);
            }
            
            for (let c = minCol; c <= maxCol; c++) {
                let maxWidth = 0;
                
                // Also consider header width
                const headerContent = String.fromCharCode(65 + c);
                if (headerContent.length > maxWidth) {
                    maxWidth = headerContent.length;
                }
        
                for (let r = 0; r < newGridData.length; r++) {
                    const cellContent = newGridData[r]?.[c] || '';
                    const contentLength = cellContent.length; // Simple character length approximation
                    if (contentLength > maxWidth) {
                        maxWidth = contentLength;
                    }
                }
                // Approximate width: 8 pixels per character + padding
                activeSheet.colWidths![c] = maxWidth * 8 + 24; 
            }
            break;
        }
        case 'APPLY_FILL_COLOR': {
            const colorToApply = dialogState.fillColorDropdownHighlightedColor;
            if (colorToApply) {
                getCellsToApply(newSelection).forEach(cellId => {
                    newCellStyles[cellId] = { ...newCellStyles[cellId], backgroundColor: colorToApply === 'transparent' ? undefined : colorToApply };
                });
            }
            break;
        }
        case 'INCREASE_DECIMAL': {
            getCellsToApply(newSelection).forEach(cellId => {
                const [r, c] = cellId.split('-').map(Number);
                const cell = newGridData[r]?.[c];
                if (cell !== undefined) {
                    const prefix = cell.match(/^[^0-9-.]*/)?.[0] || '';
                    const suffix = cell.match(/[^0-9.-]*$/)?.[0] || '';
                    const numberString = cell.substring(prefix.length, cell.length - suffix.length);
                    const numericValue = parseFloat(numberString);
                    
                    if (!isNaN(numericValue)) {
                        const parts = numberString.split('.');
                        const decimalCount = parts[1]?.length || 0;
                        
                        newGridData[r][c] = `${prefix}${numericValue.toFixed(decimalCount + 1)}${suffix}`;
                    }
                }
            });
            break;
        }
        case 'DECREASE_DECIMAL': {
            getCellsToApply(newSelection).forEach(cellId => {
                const [r, c] = cellId.split('-').map(Number);
                const cell = newGridData[r]?.[c];
                if (cell !== undefined) {
                    const prefix = cell.match(/^[^0-9-.]*/)?.[0] || '';
                    const suffix = cell.match(/[^0-9.-]*$/)?.[0] || '';
                    const numberString = cell.substring(prefix.length, cell.length - suffix.length);
                    const numericValue = parseFloat(numberString);
                    
                    if (!isNaN(numericValue)) {
                        const parts = numberString.split('.');
                        const decimalCount = parts[1]?.length || 0;
                        
                        if (decimalCount > 0) {
                             newGridData[r][c] = `${prefix}${numericValue.toFixed(decimalCount - 1)}${suffix}`;
                        } else {
                            newGridData[r][c] = `${prefix}${Math.round(numericValue)}${suffix}`;
                        }
                    }
                }
            });
            break;
        }
    }

    newGridState.sheets[newGridState.activeSheetIndex] = activeSheet;

    return {
        newGridState,
        newCellStyles
    };
};

const getSelectionInfo = (selection: Sheet['selection']) => {
    const { activeCell, anchorCell } = selection;
    const isRangeSelection = activeCell.row !== anchorCell.row || activeCell.col !== anchorCell.col;
    return { isRangeSelection };
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
            const dialogStateForThisStep = calculateDialogStateForStep(steps, i - 1);
            const { newGridState, newCellStyles } = applyGridEffect(runningGridState, dialogStateForThisStep, step, runningCellStyles);
            runningGridState = newGridState;
            runningCellStyles = newCellStyles;
        }
    }
    return { gridState: runningGridState, cellStyles: runningCellStyles };
};



    

    








    













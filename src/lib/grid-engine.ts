
import { GridState, ChallengeStep, Sheet } from './types';

export const deepCloneGridState = (state: GridState): GridState => {
  return {
    sheets: state.sheets.map(sheet => ({
      name: sheet.name,
      data: sheet.data.map(row => [...row]),
      selection: {
        activeCell: { ...sheet.selection.activeCell },
        selectedCells: new Set(sheet.selection.selectedCells),
      }
    })),
    activeSheetIndex: state.activeSheetIndex,
  };
};

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
        return { newGridState, newCellStyles };
    }
    
    const activeSheet = newGridState.sheets[newGridState.activeSheetIndex];
    if (!activeSheet) {
        return { newGridState, newCellStyles };
    }

    let { data: newGridData, selection: newSelection } = activeSheet;
    
    const getCellsToApply = () => newSelection.selectedCells.size > 0 ? newSelection.selectedCells : new Set([`${newSelection.activeCell.row}-${newSelection.activeCell.col}`]);

    switch (action) {
        case 'SELECT_ROW':
            newSelection.selectedCells.clear();
            if (newGridData.length > 0 && newGridData[0]) {
                for (let c = 0; c < newGridData[0].length; c++) {
                    newSelection.selectedCells.add(`${newSelection.activeCell.row}-${c}`);
                }
            }
            break;
        case 'SELECT_COLUMN':
            newSelection.selectedCells.clear();
            for (let r = 0; r < newGridData.length; r++) {
                newSelection.selectedCells.add(`${r}-${newSelection.activeCell.col}`);
            }
            break;
        case 'SELECT_ALL':
            newSelection.selectedCells.clear();
            for (let r = 0; r < newGridData.length; r++) {
                for (let c = 0; c < newGridData[r].length; c++) {
                    newSelection.selectedCells.add(`${r}-${c}`);
                }
            }
            break;
        case 'INSERT_ROW':
             const rowsToInsertAt = new Set<number>();
            if (newSelection.selectedCells.size > 0) {
                newSelection.selectedCells.forEach(cell => rowsToInsertAt.add(parseInt(cell.split('-')[0])));
            } else {
                rowsToInsertAt.add(newSelection.activeCell.row);
            }
            const sortedInsertRows = Array.from(rowsToInsertAt).sort((a,b) => b - a);
            sortedInsertRows.forEach(rowIndex => {
                const newRow = new Array(newGridData[0]?.length || 0).fill('');
                newGridData.splice(rowIndex, 0, newRow);
            });
            break;
        case 'DELETE_ROW':
            const rowsToDelete = new Set<number>();
            if (newSelection.selectedCells.size > 0) {
                newSelection.selectedCells.forEach(cell => rowsToDelete.add(parseInt(cell.split('-')[0])));
            } else {
                rowsToDelete.add(newSelection.activeCell.row);
            }
            
            const sortedRowsToDelete = Array.from(rowsToDelete).sort((a, b) => b - a);
            sortedRowsToDelete.forEach(rowIndex => {
                if (rowIndex >= 0 && rowIndex < newGridData.length) {
                    newGridData.splice(rowIndex, 1);
                }
            });

            newSelection.selectedCells.clear();
            newSelection.activeCell.row = Math.max(0, Math.min(newSelection.activeCell.row, newGridData.length - 1));
            break;
        case 'DELETE_CONTENT':
            getCellsToApply().forEach(cellId => {
                const [r, c] = cellId.split('-').map(Number);
                if (newGridData[r]?.[c] !== undefined) {
                    newGridData[r][c] = '';
                }
            });
            break;
        case 'COPY':
            getCellsToApply().forEach(cellId => {
                newCellStyles[cellId] = { ...newCellStyles[cellId], border: '2px dashed hsl(var(--primary))' };
            });
            break;
        case 'CUT':
            getCellsToApply().forEach(cellId => {
                newCellStyles[cellId] = { ...newCellStyles[cellId], opacity: 0.8, border: '2px dashed hsl(var(--primary))' };
            });
            break;
        case 'PASTE_STATIC_VALUE':
            if (payload?.value) {
                const [r, c] = `${newSelection.activeCell.row}-${newSelection.activeCell.col}`.split('-').map(Number);
                if (newGridData[r] !== undefined && newGridData[r][c] !== undefined) {
                  newGridData[r][c] = payload.value;
                }
            }
            newCellStyles = {}; 
            break;
        case 'MOVE_SELECTION':
            if (payload?.direction) {
                newSelection.selectedCells.clear();
                const { direction, amount = 1 } = payload;
                switch (direction) {
                    case 'down':
                        newSelection.activeCell.row = Math.min(newGridData.length - 1, newSelection.activeCell.row + amount);
                        break;
                    case 'up':
                        newSelection.activeCell.row = Math.max(0, newSelection.activeCell.row - amount);
                        break;
                    case 'right':
                        if (newGridData[0]) {
                            newSelection.activeCell.col = Math.min(newGridData[0].length - 1, newSelection.activeCell.col + amount);
                        }
                        break;
                    case 'left':
                        newSelection.activeCell.col = Math.max(0, newSelection.activeCell.col - amount);
                        break;
                }
            }
            break;
        case 'MOVE_SELECTION_ADVANCED':
            if (payload?.to) {
                newSelection.selectedCells.clear();
                const hasData = newGridData.length > 0 && newGridData[0]?.length > 0;
                switch (payload.to) {
                    case 'edgeRight': newSelection.activeCell.col = hasData ? newGridData[0].length - 1 : 0; break;
                    case 'edgeLeft': newSelection.activeCell.col = 0; break;
                    case 'edgeUp': newSelection.activeCell.row = 0; break;
                    case 'edgeDown': newSelection.activeCell.row = hasData ? newGridData.length - 1 : 0; break;
                    case 'home': newSelection.activeCell.col = 0; break;
                    case 'topLeft': newSelection.activeCell = { row: 0, col: 0 }; break;
                    case 'end': newSelection.activeCell = { row: hasData ? newGridData.length - 1 : 0, col: hasData ? newGridData[0].length - 1 : 0 }; break;
                }
            }
            break;
        case 'EXTEND_SELECTION':
            if (payload?.direction) {
                if(newSelection.selectedCells.size === 0) {
                    newSelection.selectedCells.add(`${newSelection.activeCell.row}-${newSelection.activeCell.col}`);
                }
                const { row, col } = newSelection.activeCell;
                let nextRow = row, nextCol = col;
                switch (payload.direction) {
                    case 'right': nextCol = Math.min(newGridData[0].length - 1, col + 1); break;
                    case 'left': nextCol = Math.max(0, col - 1); break;
                    case 'down': nextRow = Math.min(newGridData.length - 1, row + 1); break;
                    case 'up': nextRow = Math.max(0, row - 1); break;
                }
                newSelection.activeCell = { row: nextRow, col: nextCol };
                newSelection.selectedCells.add(`${nextRow}-${nextCol}`);
            }
            break;
        case 'SELECT_TO_EDGE':
            if (payload?.direction) {
                const { row, col } = newSelection.activeCell;
                if(newSelection.selectedCells.size === 0) {
                    newSelection.selectedCells.add(`${row}-${col}`);
                }
                switch (payload.direction) {
                    case 'right':
                        if (newGridData[0]) {
                            for (let c = col; c < newGridData[0].length; c++) { newSelection.selectedCells.add(`${row}-${c}`); }
                            newSelection.activeCell.col = newGridData[0].length - 1;
                        }
                        break;
                    case 'left':
                        for (let c = 0; c <= col; c++) { newSelection.selectedCells.add(`${row}-${c}`); }
                        newSelection.activeCell.col = 0;
                        break;
                    case 'down':
                        for (let r = row; r < newGridData.length; r++) { newSelection.selectedCells.add(`${r}-${col}`); }
                        newSelection.activeCell.row = newGridData.length - 1;
                        break;
                    case 'up':
                        for (let r = 0; r <= row; r++) { newSelection.selectedCells.add(`${r}-${col}`); }
                        newSelection.activeCell.row = 0;
                        break;
                }
            }
            break;
        case 'SELECT_TO_END':
            {
                const { row, col } = newSelection.activeCell;
                if (newGridData.length > 0 && newGridData[0]) {
                    const endRow = newGridData.length - 1;
                    const endCol = newGridData[0].length - 1;
                    for (let r = row; r <= endRow; r++) {
                        for (let c = col; c <= endCol; c++) {
                            newSelection.selectedCells.add(`${r}-${c}`);
                        }
                    }
                    newSelection.activeCell = { row: endRow, col: endCol };
                }
            }
            break;
        case 'APPLY_STYLE_BOLD':
            getCellsToApply().forEach(cellId => {
                newCellStyles[cellId] = { ...newCellStyles[cellId], fontWeight: 'bold' };
            });
            break;
        case 'APPLY_STYLE_ITALIC':
            getCellsToApply().forEach(cellId => {
                newCellStyles[cellId] = { ...newCellStyles[cellId], fontStyle: 'italic' };
            });
            break;
        case 'APPLY_STYLE_UNDERLINE':
            getCellsToApply().forEach(cellId => {
                newCellStyles[cellId] = { ...newCellStyles[cellId], textDecoration: 'underline' };
            });
            break;
        case 'APPLY_STYLE_STRIKETHROUGH':
            getCellsToApply().forEach(cellId => {
                newCellStyles[cellId] = { ...newCellStyles[cellId], textDecoration: 'line-through' };
            });
            break;
        case 'APPLY_STYLE_CURRENCY':
            getCellsToApply().forEach(cellId => {
                const [r, c] = cellId.split('-').map(Number);
                if (r < newGridData.length && c < newGridData[r].length) {
                    const numericValue = parseFloat(newGridData[r][c].replace(/[^0-9.-]+/g, ""));
                    if (!isNaN(numericValue)) {
                        newGridData[r][c] = `$${numericValue.toFixed(2)}`;
                    }
                }
            });
            break;
        case 'APPLY_STYLE_PERCENTAGE':
            getCellsToApply().forEach(cellId => {
                const [r, c] = cellId.split('-').map(Number);
                if (r < newGridData.length && c < newGridData[r].length) {
                    const numericValue = parseFloat(newGridData[r][c].replace(/[^0-9.-]+/g, ""));
                    if (!isNaN(numericValue)) {
                        newGridData[r][c] = `${numericValue}%`;
                    }
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

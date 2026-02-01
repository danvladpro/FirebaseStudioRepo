import { GridState, ChallengeStep, Sheet } from './types';

export const deepCloneGridState = (state: GridState): GridState => {
  return {
    sheets: state.sheets.map(sheet => ({
      name: sheet.name,
      data: sheet.data.map(row => [...row]),
      selection: {
        activeCell: { ...sheet.selection.activeCell },
        anchorCell: { ...sheet.selection.anchorCell },
      }
    })),
    activeSheetIndex: state.activeSheetIndex,
  };
};

const getCellsInRange = (selection: Sheet['selection']): Set<string> => {
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
    
    const getCellsToApply = () => getCellsInRange(newSelection);

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
                let { row, col } = newSelection.activeCell;
                switch (direction) {
                    case 'down': row = Math.min(newGridData.length - 1, row + amount); break;
                    case 'up': row = Math.max(0, row - amount); break;
                    case 'right': if (newGridData[0]) col = Math.min(newGridData[0].length - 1, col + amount); break;
                    case 'left': col = Math.max(0, col - amount); break;
                }
                newSelection.activeCell = { row, col };
                newSelection.anchorCell = { row, col };
            }
            break;
            
        case 'MOVE_SELECTION_ADVANCED':
             if (payload?.to) {
                let { row, col } = newSelection.activeCell;
                switch(payload.to) {
                    case 'edgeRight': if (newGridData[0]) col = newGridData[0].length - 1; break;
                    case 'home': col = 0; break;
                    case 'topLeft': row = 0; col = 0; break;
                    case 'end': if (newGridData.length > 0 && newGridData[0]) { row = newGridData.length - 1; col = newGridData[0].length - 1; } break;
                    case 'edgeUp': row = 0; break;
                    case 'edgeDown': row = newGridData.length - 1; break;
                    case 'edgeLeft': col = 0; break;
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
                const isFullRowSelected = newSelection.anchorCell.col === 0 && newSelection.activeCell.col === (newGridData[0]?.length - 1 || 0);

                switch (payload.direction) {
                    case 'right': if (newGridData[0]) col = newGridData[0].length - 1; break;
                    case 'left': col = 0; break;
                    case 'down': row = newGridData.length - 1; break;
                    case 'up': row = 0; break;
                }
                
                if (isFullRowSelected && (payload.direction === 'down' || payload.direction === 'up')) {
                    newSelection.activeCell = { row, col: newSelection.activeCell.col };
                } else {
                    newSelection.activeCell = { row, col };
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
             getCellsToApply().forEach(cell => rowsToInsertAt.add(parseInt(cell.split('-')[0])));
             const sortedInsertRows = Array.from(rowsToInsertAt).sort((a,b) => b - a);
             sortedInsertRows.forEach(rowIndex => {
                const newRow = new Array(newGridData[0]?.length || 0).fill('');
                newGridData.splice(rowIndex, 0, newRow);
             });
             break;
        case 'DELETE_ROW':
            const rowsToDelete = new Set<number>();
            getCellsToApply().forEach(cell => rowsToDelete.add(parseInt(cell.split('-')[0])));
            const sortedRowsToDelete = Array.from(rowsToDelete).sort((a, b) => b - a);
            sortedRowsToDelete.forEach(rowIndex => {
                if (rowIndex >= 0 && rowIndex < newGridData.length) {
                    newGridData.splice(rowIndex, 1);
                }
            });
            newSelection.activeCell.row = Math.max(0, Math.min(newSelection.activeCell.row, newGridData.length - 1));
            newSelection.anchorCell = { ...newSelection.activeCell };
            break;
        case 'DELETE_CONTENT':
            getCellsToApply().forEach(cellId => {
                const [r, c] = cellId.split('-').map(Number);
                if (newGridData[r]?.[c] !== undefined) newGridData[r][c] = '';
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
                const {row, col} = newSelection.activeCell;
                if (newGridData[row]?.[col] !== undefined) newGridData[row][col] = payload.value;
            }
            newCellStyles = {}; 
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
                if (newGridData[r]?.[c] !== undefined) {
                    const numericValue = parseFloat(newGridData[r][c].replace(/[^0-9.-]+/g, ""));
                    if (!isNaN(numericValue)) newGridData[r][c] = `$${numericValue.toFixed(2)}`;
                }
            });
            break;
        case 'APPLY_STYLE_PERCENTAGE':
            getCellsToApply().forEach(cellId => {
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

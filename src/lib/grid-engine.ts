import { GridState, ChallengeStep } from './types';

export const deepCloneGridState = (state: GridState): GridState => {
  return {
    data: state.data.map(row => [...row]),
    selection: {
      activeCell: { ...state.selection.activeCell },
      selectedCells: new Set(state.selection.selectedCells),
    }
  };
};

export const applyGridEffect = (gridState: GridState, step: ChallengeStep, cellStyles: Record<string, React.CSSProperties>): { newGridState: GridState, newCellStyles: Record<string, React.CSSProperties> } => {
    if (!step.gridEffect) return { newGridState: gridState, newCellStyles: cellStyles };

    const { action } = step.gridEffect;
    let newGridData = gridState.data.map(row => [...row]);
    let newSelection: GridState['selection'] = { 
        activeCell: { ...gridState.selection.activeCell },
        selectedCells: new Set(gridState.selection.selectedCells)
    };
    let newCellStyles = { ...cellStyles };

    const { activeCell, selectedCells } = newSelection;

    const getCellsToApply = () => selectedCells.size > 0 ? selectedCells : new Set([`${activeCell.row}-${activeCell.col}`]);

    switch (action) {
        case 'SELECT_ROW':
            newSelection.selectedCells.clear();
            for (let c = 0; c < newGridData[0].length; c++) {
                newSelection.selectedCells.add(`${activeCell.row}-${c}`);
            }
            break;
        case 'SELECT_COLUMN':
            newSelection.selectedCells.clear();
            for (let r = 0; r < newGridData.length; r++) {
                newSelection.selectedCells.add(`${r}-${activeCell.col}`);
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
            if (selectedCells.size > 0) {
                selectedCells.forEach(cell => rowsToInsertAt.add(parseInt(cell.split('-')[0])));
            } else {
                rowsToInsertAt.add(activeCell.row);
            }
            const sortedInsertRows = Array.from(rowsToInsertAt).sort((a,b) => b - a);
            sortedInsertRows.forEach(rowIndex => {
                const newRow = new Array(newGridData[0].length).fill('');
                newGridData.splice(rowIndex, 0, newRow);
            });
            break;
        case 'DELETE_ROW':
            const rowsToDelete = new Set<number>();
            if (selectedCells.size > 0) {
                selectedCells.forEach(cell => rowsToDelete.add(parseInt(cell.split('-')[0])));
            } else {
                rowsToDelete.add(activeCell.row);
            }
            
            const sortedRowsToDelete = Array.from(rowsToDelete).sort((a, b) => b - a);
            sortedRowsToDelete.forEach(rowIndex => {
                if (rowIndex >= 0 && rowIndex < newGridData.length) {
                    newGridData.splice(rowIndex, 1);
                }
            });

            newSelection.selectedCells.clear();
            newSelection.activeCell.row = Math.min(activeCell.row, newGridData.length - 1);
            break;
        case 'CUT':
            getCellsToApply().forEach(cellId => {
                newCellStyles[cellId] = { ...newCellStyles[cellId], opacity: 0.3, border: '2px dashed gray' };
            });
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

    return {
        newGridState: { data: newGridData, selection: newSelection },
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

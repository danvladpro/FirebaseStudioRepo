
"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { GridState, Sheet } from "@/lib/types";

interface VisualGridProps {
    gridState: GridState | null;
    cellStyles?: Record<string, React.CSSProperties>;
    previewState?: {
        gridState: GridState;
        cellStyles: Record<string, React.CSSProperties>;
    } | null;
    isAccentuating?: boolean;
}

export function VisualGrid({
    gridState,
    cellStyles = {},
    previewState = null,
    isAccentuating = false,
}: VisualGridProps) {
    if (!gridState) return null;

    const initialSheet = gridState.sheets[gridState.activeSheetIndex];
    if (!initialSheet) return null;

    const previewSheet = previewState
        ? previewState.gridState.sheets[previewState.gridState.activeSheetIndex]
        : null;

    const finalSheet = (isAccentuating && previewSheet) ? previewSheet : initialSheet;    
    const finalSelection = isAccentuating ? (previewSheet?.selection || initialSheet.selection) : initialSheet.selection;
    const gridDataToRender = finalSheet.data;

    const finalCellStyles = isAccentuating ? (previewState ? {...previewState.cellStyles} : {...cellStyles}) : {...cellStyles};

    const mergedCellsToSkip = new Set<string>();
    finalSheet.mergedRanges?.forEach(range => {
        for (let r = range.start.row; r <= range.end.row; r++) {
            for (let c = range.start.col; c <= range.end.col; c++) {
                if (r > range.start.row || c > range.start.col) {
                    mergedCellsToSkip.add(`${r}-${c}`);
                }
            }
        }
    });

    const { activeCell, anchorCell } = finalSelection;
    const minRow = Math.min(anchorCell.row, activeCell.row);
    const maxRow = Math.max(anchorCell.row, activeCell.row);
    const minCol = Math.min(anchorCell.col, activeCell.col);
    const maxCol = Math.max(anchorCell.col, activeCell.col);
    const isRangeSelection = (minRow !== maxRow || minCol !== maxCol);

    const isSheetSwitch = previewState && gridState.activeSheetIndex !== previewState.gridState.activeSheetIndex;
    const finalActiveSheetIndex = (isAccentuating && isSheetSwitch && previewState)
        ? previewState.gridState.activeSheetIndex
        : gridState.activeSheetIndex;

    const { hiddenRows = new Set<number>(), hiddenColumns = new Set<number>(), frozenAt, showGridlines, groupedRowRanges, colWidths } = finalSheet;
    const viewport = finalSheet.viewport || { startRow: 0, rowCount: gridDataToRender.length };

    const visibleColumns: number[] = [];
    if (gridDataToRender.length > 0 && gridDataToRender[0]) {
        for (let i = 0; i < gridDataToRender[0].length; i++) {
            if (!hiddenColumns.has(i)) {
                visibleColumns.push(i);
            }
        }
    }
    
    return (
        <div className="p-2 bg-muted/50 rounded-lg border">
            <div className="overflow-auto">
                <table className="border-collapse w-full min-w-max">
                    <thead>
                        <tr>
                            <th className="p-0.5 w-7 sm:w-9"></th>
                            {visibleColumns.map((colIndex) => (
                                <th
                                    key={colIndex}
                                    className="p-0.5 text-[10px] sm:p-1 sm:text-xs font-bold text-center text-muted-foreground bg-muted rounded-t-sm"
                                    style={colWidths?.[colIndex] ? { width: `${colWidths[colIndex]}px` } : {}}
                                >
                                    {String.fromCharCode(65 + colIndex)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: Math.min(viewport.rowCount, gridDataToRender.length - viewport.startRow) }).map((_, i) => {
                            const rowIndex = viewport.startRow + i;
                            if (hiddenRows.has(rowIndex) || !gridDataToRender[rowIndex]) return null;
                            const isGrouped = groupedRowRanges?.some(range => rowIndex >= range.start && rowIndex <= range.end);


                            return (
                                <tr key={rowIndex}>
                                    <td className={cn(
                                        "p-0.5 text-[10px] sm:p-1 sm:text-xs font-bold text-center text-muted-foreground bg-muted rounded-l-sm",
                                        isGrouped && "border-l-4 border-muted-foreground/50"
                                    )}>
                                        {rowIndex + 1}
                                    </td>
                                    {visibleColumns.map((colIndex) => {
                                        const cellId = `${rowIndex}-${colIndex}`;

                                        if (mergedCellsToSkip.has(cellId)) {
                                            return null;
                                        }

                                        let colSpan = 1;
                                        let rowSpan = 1;

                                        const mergeInfo = finalSheet.mergedRanges?.find(
                                            range => range.start.row === rowIndex && range.start.col === colIndex
                                        );

                                        const cell = gridDataToRender[rowIndex][colIndex];
                                        const hasLineBreak = cell?.includes('\n');
                                        const isActive = activeCell.row === rowIndex && activeCell.col === colIndex;
                                        const hasComment = !!finalSheet.comments?.[cellId];

                                        const getCellClasses = () => {
                                            const classes: string[] = [];
                                            const isSelected = rowIndex >= minRow && rowIndex <= maxRow && colIndex >= minCol && colIndex <= maxCol;
                                            const borderColor = isAccentuating ? 'border-emerald-600' : 'border-primary';

                                            if (isRangeSelection && isSelected) {
                                                if (isAccentuating) classes.push('bg-emerald-500/20');
                                                else classes.push('bg-blue-500/15');
                                                
                                                if (isActive) classes.push('bg-background');

                                                classes.push(borderColor);
                                                if (rowIndex === minRow) classes.push('border-t-2');
                                                if (rowIndex === maxRow) classes.push('border-b-2');
                                                if (colIndex === minCol) classes.push('border-l-2');
                                                if (colIndex === maxCol) classes.push('border-r-2');
                                            } else if (isActive) {
                                                if (isAccentuating) classes.push('ring-2', 'ring-emerald-600', 'ring-inset', 'bg-emerald-500/20');
                                                else classes.push('ring-2', 'ring-primary', 'ring-inset');
                                            }
                                            return classes;
                                        };

                                        const style = { ...finalCellStyles[cellId] };
                                        
                                        if (hasLineBreak) {
                                            style.whiteSpace = 'pre-wrap';
                                        }

                                        if (mergeInfo) {
                                            colSpan = mergeInfo.end.col - mergeInfo.start.col + 1;
                                            rowSpan = mergeInfo.end.row - mergeInfo.start.row + 1;
                                            style.textAlign = 'center';
                                            style.verticalAlign = 'middle';
                                        }

                                        if (frozenAt) {
                                            if (frozenAt.row !== -1 && rowIndex === frozenAt.row) style.borderBottom = '2px solid hsl(var(--foreground))';
                                            if (frozenAt.col !== -1 && colIndex === frozenAt.col) style.borderRight = '2px solid hsl(var(--foreground))';
                                        }

                                        return (
                                            <td
                                                key={colIndex}
                                                colSpan={colSpan}
                                                rowSpan={rowSpan}
                                                className={cn(
                                                    "relative p-0.5 text-[11px] sm:p-1 sm:text-xs transition-colors duration-200",
                                                    showGridlines !== false && "border border-border",
                                                    ...getCellClasses()
                                                )}
                                                style={style}
                                            >
                                                {hasLineBreak
                                                  ? cell.split('\n').map((line, i, arr) => (
                                                      <React.Fragment key={i}>
                                                        {line}
                                                        {i < arr.length - 1 && <br />}
                                                      </React.Fragment>
                                                    ))
                                                  : cell
                                                }
                                                {hasComment && (
                                                    <>
                                                        <div className="absolute top-0 right-0 w-0 h-0 border-solid border-t-red-600 border-l-transparent border-t-[6px] border-l-[6px]" />
                                                        {isActive && (
                                                            <div className="absolute left-full top-0 z-10 ml-2 w-48 rounded border border-gray-400 p-2 shadow-lg text-black" style={{ backgroundColor: '#FFFDE1' }}>
                                                                <p className="text-xs font-bold border-b border-gray-300 pb-1 mb-1">User:</p>
                                                                <p className="text-xs whitespace-pre-wrap">{finalSheet.comments![cellId]}</p>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center border-t border-border mt-1 pt-1 -mx-2 -mb-2 px-1">
                {gridState.sheets.map((sheet, index) => {
                    const isPreviewTarget =
                        !isAccentuating &&
                        isSheetSwitch &&
                        index === previewState?.gridState.activeSheetIndex;
                    const isFinalActive = index === finalActiveSheetIndex;

                    return (
                        <button
                            key={index}
                            className={cn(
                                "px-3 py-1 text-sm border-b-2 rounded-t-sm transition-all duration-300",
                                isPreviewTarget && "font-semibold text-yellow-700 dark:text-yellow-400 border-yellow-500 bg-yellow-500/10",
                                isFinalActive && !isPreviewTarget && "font-semibold text-primary border-primary bg-background",
                                !isFinalActive && !isPreviewTarget && "text-muted-foreground border-transparent hover:bg-accent"
                            )}
                            disabled
                        >
                            {sheet.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}


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

    const finalCellStyles = isAccentuating ? (previewState ? previewState.cellStyles : cellStyles) : cellStyles;

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
    
    return (
        <div className="p-2 bg-muted/50 rounded-lg border">
            <div className="overflow-auto">
                <table className="border-collapse table-fixed w-full min-w-max">
                    <thead>
                        <tr>
                            <th className="p-1 w-10"></th>
                            {gridDataToRender.length > 0 &&
                                gridDataToRender[0].map((_, colIndex) => (
                                    <th
                                        key={colIndex}
                                        className="p-1.5 text-xs font-bold text-center text-muted-foreground bg-muted rounded-t-sm"
                                    >
                                        {String.fromCharCode(65 + colIndex)}
                                    </th>
                                ))}
                        </tr>
                    </thead>
                    <tbody>
                        {gridDataToRender.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                <td className="p-1.5 text-xs font-bold text-center text-muted-foreground bg-muted rounded-l-sm">
                                    {rowIndex + 1}
                                </td>

                                {row.map((cell, colIndex) => {
                                    const cellId = `${rowIndex}-${colIndex}`;
                                    const isActive = activeCell.row === rowIndex && activeCell.col === colIndex;

                                    const isPreviewing = !isAccentuating && previewSheet;
                                    
                                    const getCellClasses = () => {
                                        const classes: string[] = [];
                                        const isSelected = rowIndex >= minRow && rowIndex <= maxRow && colIndex >= minCol && colIndex <= maxCol;

                                        if (isRangeSelection && isSelected) {
                                            // Apply background fill to all cells in the range first.
                                            if (isAccentuating) {
                                                classes.push('bg-emerald-500/20');
                                            } else {
                                                classes.push('bg-blue-500/15');
                                            }
                                            
                                            // The active cell within a range has a transparent background.
                                            if (isActive) {
                                                classes.push('bg-background');
                                            }

                                            // Apply outer borders to the range
                                            const borderColor = isAccentuating ? 'border-emerald-600' : 'border-primary';
                                            if (rowIndex === minRow) classes.push('border-t-2', borderColor);
                                            if (rowIndex === maxRow) classes.push('border-b-2', borderColor);
                                            if (colIndex === minCol) classes.push('border-l-2', borderColor);
                                            if (colIndex === maxCol) classes.push('border-r-2', borderColor);

                                        } else if (isActive) { // Single cell selection
                                            if (isAccentuating) {
                                                classes.push('ring-2', 'ring-emerald-600', 'ring-inset', 'bg-emerald-500/20');
                                            } else {
                                                classes.push('ring-2', 'ring-primary', 'ring-inset');
                                            }
                                        }

                                        // Preview logic
                                        if(isPreviewing && previewSheet) {
                                            const { activeCell: pActive, anchorCell: pAnchor } = previewSheet.selection;
                                            const pMinRow = Math.min(pAnchor.row, pActive.row);
                                            const pMaxRow = Math.max(pAnchor.row, pActive.row);
                                            const pMinCol = Math.min(pAnchor.col, pActive.col);
                                            const pMaxCol = Math.max(pAnchor.col, pActive.col);
                                            const isPreviewSelected = rowIndex >= pMinRow && rowIndex <= pMaxRow && colIndex >= pMinCol && colIndex <= pMaxCol;
                                            const isPreviewRange = pMinRow !== pMaxRow || pMinCol !== pMaxCol;

                                            if (isPreviewRange && isPreviewSelected) {
                                                classes.push('bg-blue-500/15');
                                            } else if (!isPreviewRange && rowIndex === pActive.row && colIndex === pActive.col) {
                                                classes.push('bg-emerald-500/20');
                                            }
                                        }

                                        return classes;
                                    };

                                    return (
                                        <td
                                            key={colIndex}
                                            className={cn(
                                                "border border-border/50 p-1.5 text-sm truncate transition-colors duration-200",
                                                ...getCellClasses()
                                            )}
                                            style={finalCellStyles[cellId] || {}}
                                        >
                                            {cell}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
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

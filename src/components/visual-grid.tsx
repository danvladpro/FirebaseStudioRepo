
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
    const gridDataToRender = finalSheet.data;
    
    // Determine which selection object to use based on accentuation
    const finalSelection = isAccentuating ? (previewSheet?.selection || initialSheet.selection) : initialSheet.selection;
    const finalCellStyles = isAccentuating ? (previewState ? previewState.cellStyles : cellStyles) : cellStyles;

    // Calculate bounds for the main selection being displayed
    const isRangeSelection = finalSelection.selectedCells.size > 1;
    let selectionBounds = { minRow: Infinity, maxRow: -1, minCol: Infinity, maxCol: -1 };
    if (isRangeSelection) {
        finalSelection.selectedCells.forEach(cellId => {
            const [r, c] = cellId.split('-').map(Number);
            selectionBounds.minRow = Math.min(selectionBounds.minRow, r);
            selectionBounds.maxRow = Math.max(selectionBounds.maxRow, r);
            selectionBounds.minCol = Math.min(selectionBounds.minCol, c);
            selectionBounds.maxCol = Math.max(selectionBounds.maxCol, c);
        });
    }

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
                                    
                                    // Preview Logic (only when not accentuating)
                                    const isPreviewing = !isAccentuating && previewSheet;
                                    const previewSelection = isPreviewing ? previewSheet.selection : null;
                                    const isPreviewActive = isPreviewing && previewSelection?.activeCell.row === rowIndex && previewSelection?.activeCell.col === colIndex;
                                    const isPreviewRange = isPreviewing && (previewSelection?.selectedCells.size ?? 0) > 1;

                                    return (
                                        <td
                                            key={colIndex}
                                            className={cn(
                                                "border border-border/50 p-1.5 text-sm truncate transition-colors duration-200",
                                                // Preview styling (if applicable)
                                                isPreviewing && !isPreviewRange && isPreviewActive && "bg-emerald-500/20",
                                                isPreviewing && isPreviewRange && previewSelection?.selectedCells.has(cellId) && "bg-blue-500/15",
                                                
                                                // Main selection styling
                                                (() => {
                                                    const { activeCell, selectedCells } = finalSelection;
                                                    const isSelected = selectedCells.has(cellId);
                                                    const isActive = activeCell.row === rowIndex && activeCell.col === colIndex;

                                                    if (isRangeSelection) {
                                                        if (isSelected) {
                                                            const borderColor = isAccentuating ? 'emerald-600' : 'primary';
                                                            const bgColor = isAccentuating ? 'bg-emerald-500/20' : 'bg-blue-500/15';
                                                            const classes = [isActive ? 'bg-background' : bgColor];

                                                            if (rowIndex === selectionBounds.minRow) classes.push(`border-t-2 border-t-${borderColor}`);
                                                            if (rowIndex === selectionBounds.maxRow) classes.push(`border-b-2 border-b-${borderColor}`);
                                                            if (colIndex === selectionBounds.minCol) classes.push(`border-l-2 border-l-${borderColor}`);
                                                            if (colIndex === selectionBounds.maxCol) classes.push(`border-r-2 border-r-${borderColor}`);
                                                            return classes;
                                                        }
                                                    } else { // Single cell selection
                                                        if (isActive) {
                                                            if (isAccentuating) {
                                                                return 'ring-2 ring-emerald-600 ring-inset bg-emerald-500/20';
                                                            } else {
                                                                return 'ring-2 ring-primary ring-inset';
                                                            }
                                                        }
                                                    }
                                                })()
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

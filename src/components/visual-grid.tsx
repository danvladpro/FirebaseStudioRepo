
"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { GridState } from "@/lib/types";

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

    const getFinalCellStyles = (baseStyles: Record<string, React.CSSProperties>) => {
        if (isAccentuating && previewState) {
            const combined = { ...baseStyles };
            for (const cellId in previewState.cellStyles) {
                combined[cellId] = {
                    ...combined[cellId],
                    ...previewState.cellStyles[cellId],
                    transition: "all 0.3s ease-in-out",
                };
            }
            return combined;
        }
        return baseStyles;
    };

    const finalCellStyles = getFinalCellStyles(cellStyles);
    
    const isSheetSwitch = previewState && gridState.activeSheetIndex !== previewState.gridState.activeSheetIndex;
    const finalActiveSheetIndex = (isAccentuating && isSheetSwitch && previewState)
        ? previewState.gridState.activeSheetIndex
        : gridState.activeSheetIndex;

    const selectionToUse = isAccentuating ? (previewSheet?.selection || initialSheet.selection) : initialSheet.selection;
    const { activeCell, selectedCells } = selectionToUse;

    const isRangeSelection = isAccentuating && selectedCells.size > 1;

    let selectionBounds = { minRow: Infinity, maxRow: -1, minCol: Infinity, maxCol: -1 };
    if (isRangeSelection) {
        selectedCells.forEach(cellId => {
            const [r, c] = cellId.split('-').map(Number);
            selectionBounds.minRow = Math.min(selectionBounds.minRow, r);
            selectionBounds.maxRow = Math.max(selectionBounds.maxRow, r);
            selectionBounds.minCol = Math.min(selectionBounds.minCol, c);
            selectionBounds.maxCol = Math.max(selectionBounds.maxCol, c);
        });
    }

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
                                    
                                    const isInitialActive = !isAccentuating && initialSheet.selection.activeCell.row === rowIndex && initialSheet.selection.activeCell.col === colIndex;

                                    const isPreviewing = !isAccentuating && previewSheet;
                                    const previewSelection = isPreviewing ? previewSheet.selection : null;
                                    const isPreviewActive = isPreviewing && previewSelection?.activeCell.row === rowIndex && previewSelection?.activeCell.col === colIndex;
                                    const isPreviewRange = isPreviewing && (previewSelection?.selectedCells.size ?? 0) > 1;

                                    const isFinalActive = isAccentuating && activeCell.row === rowIndex && activeCell.col === colIndex;
                                    const isFinalSelected = isAccentuating && selectedCells.has(cellId);
                                    
                                    return (
                                        <td
                                            key={colIndex}
                                            className={cn(
                                                "border border-border/50 p-1.5 text-sm truncate transition-colors duration-200",
                                                
                                                // --- PREVIEW STATE ---
                                                isInitialActive && "ring-2 ring-emerald-600 ring-inset", // Starting cell
                                                isPreviewing && !isPreviewRange && isPreviewActive && "bg-emerald-500/20", // Single cell destination preview
                                                isPreviewing && isPreviewRange && previewSelection?.selectedCells.has(cellId) && "bg-blue-500/15", // Range destination preview
                                                
                                                // --- FINAL STATE ---
                                                isAccentuating && (() => {
                                                    if (isRangeSelection) {
                                                        if (isFinalSelected) {
                                                            const classes = [isFinalActive ? 'bg-background' : 'bg-emerald-500/20'];
                                                            if (rowIndex === selectionBounds.minRow) classes.push('border-t-2 border-t-emerald-600');
                                                            if (rowIndex === selectionBounds.maxRow) classes.push('border-b-2 border-b-emerald-600');
                                                            if (colIndex === selectionBounds.minCol) classes.push('border-l-2 border-l-emerald-600');
                                                            if (colIndex === selectionBounds.maxCol) classes.push('border-r-2 border-r-emerald-600');
                                                            return classes;
                                                        }
                                                    } else if (isFinalActive) {
                                                        return 'ring-2 ring-emerald-600 ring-inset bg-emerald-500/20';
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

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

    const activeSheet = gridState.sheets[gridState.activeSheetIndex];
    if (!activeSheet) return null;

    const { data, selection } = activeSheet;

    const previewSheet = previewState
        ? previewState.gridState.sheets[previewState.gridState.activeSheetIndex]
        : null;

    const isSheetSwitch =
        previewState &&
        gridState.activeSheetIndex !== previewState.gridState.activeSheetIndex;

    // Use preview data if accentuating (except sheet switch)
    const gridData =
        isAccentuating && previewSheet && !isSheetSwitch
            ? previewSheet.data
            : data;

    const getFinalCellStyles = (
        baseStyles: Record<string, React.CSSProperties>
    ) => {
        if (isAccentuating && previewState && !isSheetSwitch) {
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

    // Determine the final active sheet for tab styling
    const finalActiveSheetIndex =
        isAccentuating && isSheetSwitch && previewState
            ? previewState.gridState.activeSheetIndex
            : gridState.activeSheetIndex;

    return (
        <div className="p-2 bg-muted/50 rounded-lg border">
            <div className="overflow-auto">
                <table className="border-collapse table-fixed w-full min-w-max">
                    <thead>
                        <tr>
                            <th className="p-1 w-10"></th>
                            {gridData.length > 0 &&
                                gridData[0].map((_, colIndex) => (
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
                        {gridData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                <td className="p-1.5 text-xs font-bold text-center text-muted-foreground bg-muted rounded-l-sm">
                                    {rowIndex + 1}
                                </td>

                                {row.map((cell, colIndex) => {
                                    const cellId = `${rowIndex}-${colIndex}`;

                                    // Final selection (green)
                                    const finalActiveCell =
                                        isAccentuating && previewSheet && !isSheetSwitch
                                            ? previewSheet.selection.activeCell
                                            : selection.activeCell;
                                    const finalSelectedCells =
                                        isAccentuating && previewSheet && !isSheetSwitch
                                            ? previewSheet.selection.selectedCells
                                            : selection.selectedCells;

                                    const isSelected = finalSelectedCells?.has(cellId);
                                    const isActive =
                                        finalActiveCell?.row === rowIndex &&
                                        finalActiveCell?.col === colIndex;

                                    // Preview hint (blue, only before accentuation)
                                    const isPreviewSelected =
                                        !isAccentuating &&
                                        previewSheet &&
                                        previewSheet.selection.selectedCells.has(cellId);
                                    const isPreviewActive =
                                        !isAccentuating &&
                                        previewSheet &&
                                        previewSheet.selection.activeCell.row === rowIndex &&
                                        previewSheet.selection.activeCell.col === colIndex;

                                    const cellStyle = finalCellStyles[cellId] || {};

                                    if ("backgroundColor" in cellStyle) {
                                        delete cellStyle.backgroundColor;
                                    }

                                    return (
                                        <td
                                            key={colIndex}
                                            className={cn(
                                                "border border-border/50 p-1.5 text-sm truncate transition-colors duration-200",

                                                // Preview (blue)
                                                isPreviewSelected && "bg-blue-500/15",
                                                isPreviewActive &&
                                                    "ring-2 ring-blue-500 ring-inset",

                                                // Final selection (green)
                                                isSelected && "bg-emerald-500/20",
                                                isActive &&
                                                    "bg-emerald-500/30 ring-2 ring-emerald-600 ring-inset"
                                            )}
                                            style={cellStyle}
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

            {/* Sheet Tabs */}
            <div className="flex items-center border-t border-border mt-1 pt-1 -mx-2 -mb-2 px-1">
                {gridState.sheets.map((sheet, index) => {
                    const isCurrentlyActive = index === gridState.activeSheetIndex;
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

                                // Preview style (yellow)
                                isPreviewTarget &&
                                    "ring-2 ring-yellow-500 font-semibold text-yellow-700 dark:text-yellow-400 border-yellow-500 bg-yellow-500/10",

                                // Active sheet
                                (isAccentuating ? isFinalActive : isCurrentlyActive) &&
                                    !isPreviewTarget &&
                                    "font-semibold text-primary border-primary bg-background",

                                // Inactive
                                !(isAccentuating ? isFinalActive : isCurrentlyActive) &&
                                    !isPreviewTarget &&
                                    "text-muted-foreground border-transparent hover:bg-accent"
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

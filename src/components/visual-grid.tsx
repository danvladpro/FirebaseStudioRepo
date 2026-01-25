
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

export function VisualGrid({ gridState, cellStyles = {}, previewState = null, isAccentuating = false }: VisualGridProps) {
    if (!gridState) {
        return null;
    }
    
    const activeSheet = gridState.sheets[gridState.activeSheetIndex];
    if (!activeSheet) return null;

    const { data, selection } = activeSheet;

    const previewSheet = (previewState) ? previewState.gridState.sheets[previewState.gridState.activeSheetIndex] : null;
    const isSheetSwitch = isAccentuating && previewState && gridState.activeSheetIndex !== previewState.gridState.activeSheetIndex;

    // Use preview data if accentuating, UNLESS it's a sheet switch action.
    const gridData = (isAccentuating && previewSheet && !isSheetSwitch) ? previewSheet.data : data;

    // During a sheet switch, the selection shouldn't change either.
    const finalSelection = (isAccentuating && previewSheet && !isSheetSwitch) ? previewSheet.selection : selection;

    const getFinalCellStyles = (baseStyles: Record<string, React.CSSProperties>) => {
        if (isAccentuating && previewState && !isSheetSwitch) {
            let combinedStyles = { ...baseStyles };
            for (const cellId in previewState.cellStyles) {
                combinedStyles[cellId] = { ...combinedStyles[cellId], ...previewState.cellStyles[cellId], transition: 'all 0.3s ease-in-out' };
            }
            return combinedStyles;
        }
        return baseStyles;
    }

    const finalCellStyles = getFinalCellStyles(cellStyles);

    return (
        <div className="p-2 bg-muted/50 rounded-lg border">
            <div className="overflow-auto">
                <table className="border-collapse table-fixed w-full min-w-max">
                    <thead>
                        <tr>
                            <th className="p-1 w-10"></th>
                            {gridData.length > 0 && gridData[0].map((_, colIndex) => (
                                <th key={colIndex} className="p-1.5 text-xs font-bold text-center text-muted-foreground bg-muted rounded-t-sm">
                                    {String.fromCharCode(65 + colIndex)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {gridData.map((row, rowIndex) => {
                            return (
                            <tr key={rowIndex}>
                                <td className="p-1.5 text-xs font-bold text-center text-muted-foreground bg-muted rounded-l-sm">
                                    {rowIndex + 1}
                                </td>
                                {row.map((cell, colIndex) => {
                                    const cellId = `${rowIndex}-${colIndex}`;

                                    const isSelected = finalSelection.selectedCells.has(cellId);
                                    const isActive = finalSelection.activeCell.row === rowIndex && finalSelection.activeCell.col === colIndex;
                                    const cellStyle = finalCellStyles[cellId] || {};

                                    return (
                                        <td
                                            key={colIndex}
                                            className={cn(
                                                "border border-border/50 p-1.5 text-sm truncate transition-colors duration-200",
                                                isSelected && "bg-primary/20",
                                                isActive && "ring-2 ring-primary ring-inset",
                                            )}
                                            style={cellStyle}
                                        >
                                            {cell}
                                        </td>
                                    );
                                })}
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
             {/* Sheet Tabs */}
            <div className="flex items-center border-t border-border mt-1 pt-1 -mx-2 -mb-2 px-1">
                {gridState.sheets.map((sheet, index) => {
                    const isTargetSheet = isSheetSwitch && previewState && index === previewState.gridState.activeSheetIndex;
                    const isNormalActive = !isSheetSwitch && index === gridState.activeSheetIndex;

                    return (
                    <button
                        key={index}
                        className={cn(
                            "px-3 py-1 text-sm border-b-2 rounded-t-sm transition-all duration-300",
                            isTargetSheet && "ring-2 ring-yellow-500 font-semibold text-yellow-700 dark:text-yellow-400 border-yellow-500 bg-yellow-500/10",
                            isNormalActive && "font-semibold text-primary border-primary bg-background",
                            !isTargetSheet && !isNormalActive && "text-muted-foreground border-transparent hover:bg-accent"
                        )}
                        disabled
                    >
                        {sheet.name}
                    </button>
                    )
                })}
            </div>
        </div>
    );
}

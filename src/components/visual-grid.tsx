
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
    const { activeCell, selectedCells } = selection;

    const previewSheet = (previewState) ? previewState.gridState.sheets[previewState.gridState.activeSheetIndex] : null;

    // Use preview data if accentuating, otherwise current data
    const gridData = isAccentuating && previewSheet ? previewSheet.data : data;

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
                            const isRowDeletedInPreview = previewState && !previewState.gridState.sheets[previewState.gridState.activeSheetIndex].data.some(previewRow => JSON.stringify(previewRow) === JSON.stringify(row));

                            return (
                            <tr key={rowIndex} className={cn(isRowDeletedInPreview && !isAccentuating && 'opacity-30 line-through transition-opacity')}>
                                <td className="p-1.5 text-xs font-bold text-center text-muted-foreground bg-muted rounded-l-sm">
                                    {rowIndex + 1}
                                </td>
                                {row.map((cell, colIndex) => {
                                    const cellId = `${rowIndex}-${colIndex}`;

                                    const finalSelection = isAccentuating && previewSheet ? previewSheet.selection : selection;
                                    const isSelected = finalSelection.selectedCells.has(cellId);
                                    const isActive = finalSelection.activeCell.row === rowIndex && finalSelection.activeCell.col === colIndex;

                                    let finalStyle = cellStyles[cellId] || {};
                                    if (isAccentuating && previewState?.cellStyles) {
                                         finalStyle = { ...finalStyle, ...previewState.cellStyles[cellId], transition: 'all 0.3s ease-in-out' };
                                    }

                                    return (
                                        <td
                                            key={colIndex}
                                            className={cn(
                                                "border border-border/50 p-1.5 text-sm truncate transition-colors duration-200",
                                                isSelected && "bg-primary/20",
                                                isActive && "ring-2 ring-primary ring-inset",
                                            )}
                                            style={finalStyle}
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
                {gridState.sheets.map((sheet, index) => (
                    <button
                        key={index}
                        className={cn(
                            "px-3 py-1 text-sm border-b-2 rounded-t-sm",
                            index === gridState.activeSheetIndex
                                ? "font-semibold text-primary border-primary bg-background"
                                : "text-muted-foreground border-transparent hover:bg-accent"
                        )}
                        disabled
                    >
                        {sheet.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

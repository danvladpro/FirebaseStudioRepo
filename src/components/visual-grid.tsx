
"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { GridState } from "@/lib/types";

export interface GridSelection {
    activeCell: { row: number; col: number };
    selectedCells: Set<string>; // "row-col"
}

interface PreviewState {
    gridState: GridState;
    cellStyles: Record<string, React.CSSProperties>;
}

interface VisualGridProps {
    data: string[][];
    selection: GridSelection;
    cellStyles?: Record<string, React.CSSProperties>;
    previewState?: PreviewState | null;
    isAccentuating?: boolean;
}

export function VisualGrid({ data, selection, cellStyles = {}, previewState = null, isAccentuating = false }: VisualGridProps) {
    const { activeCell, selectedCells } = selection;

    const gridData = (isAccentuating && previewState) ? previewState.gridState.data : (previewState ? previewState.gridState.data : data);
    const gridStyles = (isAccentuating && previewState) ? previewState.cellStyles : (previewState ? previewState.cellStyles : cellStyles);
    
    const currentSelection = (isAccentuating && previewState) ? previewState.gridState.selection : (previewState ? previewState.gridState.selection : selection);

    return (
        <div className="p-2 bg-muted/50 rounded-lg border overflow-auto">
            <table className="border-collapse table-fixed w-full">
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
                         const isRowDeletedInPreview = previewState && !previewState.gridState.data.some((previewRow, pRowIndex) => pRowIndex === rowIndex);

                        return (
                        <tr key={rowIndex} className={cn(isRowDeletedInPreview && 'opacity-50 transition-opacity')}>
                            <td className="p-1.5 text-xs font-bold text-center text-muted-foreground bg-muted rounded-l-sm">
                                {rowIndex + 1}
                            </td>
                            {row.map((cell, colIndex) => {
                                const cellId = `${rowIndex}-${colIndex}`;
                                const isSelected = selectedCells.has(cellId);
                                const isActive = activeCell.row === rowIndex && activeCell.col === colIndex;

                                const isPreviewSelected = currentSelection.selectedCells.has(cellId);
                                const isPreviewActive = currentSelection.activeCell.row === rowIndex && currentSelection.activeCell.col === colIndex;

                                const finalStyle = gridStyles[cellId] || {};
                                if (previewState) {
                                    finalStyle.transition = 'all 0.3s ease-in-out';
                                }

                                return (
                                    <td
                                        key={colIndex}
                                        className={cn(
                                            "border border-border/50 p-1.5 text-sm truncate transition-colors duration-200",
                                            rowIndex === 0 && !previewState && "font-semibold bg-muted/80",
                                            // Handle base state (no preview)
                                            !previewState && {
                                                'bg-primary/20': isSelected,
                                                'ring-2 ring-primary ring-inset': isActive,
                                            },
                                            // Handle preview state
                                            previewState && !isAccentuating && {
                                                'bg-blue-500/10 shadow-inner shadow-blue-500/10': isPreviewSelected || isPreviewActive
                                            },
                                            // Handle accentuation state
                                            isAccentuating && {
                                                'bg-primary/20': isPreviewSelected,
                                                'ring-2 ring-primary ring-inset': isPreviewActive,
                                            }
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
    );
}

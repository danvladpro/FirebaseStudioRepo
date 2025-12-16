
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

    const gridData = (previewState && isAccentuating) ? previewState.gridState.data : data;
    
    return (
        <div className="p-2 bg-muted/50 rounded-lg border overflow-auto">
            <table className="border-collapse table-fixed w-full">
                <thead>
                    <tr>
                        <th className="p-1 w-10"></th>
                        {data.length > 0 && data[0].map((_, colIndex) => (
                            <th key={colIndex} className="p-1.5 text-xs font-bold text-center text-muted-foreground bg-muted rounded-t-sm">
                                {String.fromCharCode(65 + colIndex)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => {
                         const isRowDeletedInPreview = previewState && !previewState.gridState.data.some(previewRow => JSON.stringify(previewRow) === JSON.stringify(row));

                        return (
                        <tr key={rowIndex} className={cn(isRowDeletedInPreview && !isAccentuating && 'opacity-30 line-through transition-opacity')}>
                            <td className="p-1.5 text-xs font-bold text-center text-muted-foreground bg-muted rounded-l-sm">
                                {rowIndex + 1}
                            </td>
                            {row.map((cell, colIndex) => {
                                const cellId = `${rowIndex}-${colIndex}`;
                                const isSelected = selectedCells.has(cellId);
                                const isActive = activeCell.row === rowIndex && activeCell.col === colIndex;

                                let finalStyle = cellStyles[cellId] || {};
                                
                                const isPreviewSelected = previewState ? previewState.gridState.selection.selectedCells.has(cellId) : false;
                                const isPreviewActive = previewState ? (previewState.gridState.selection.activeCell.row === rowIndex && previewState.gridState.selection.activeCell.col === colIndex) : false;
                                
                                let cellValue = cell;
                                if (isAccentuating && previewState && previewState.gridState.data[rowIndex] && previewState.gridState.data[rowIndex][colIndex] !== undefined) {
                                    cellValue = previewState.gridState.data[rowIndex][colIndex];
                                }
                                
                                if (previewState) {
                                    const previewStyle = previewState.cellStyles[cellId] || {};
                                    if (isAccentuating) {
                                        finalStyle = {...finalStyle, ...previewStyle, transition: 'all 0.3s ease-in-out'};
                                    } else {
                                        finalStyle = {...finalStyle, ...previewStyle };
                                    }
                                }


                                return (
                                    <td
                                        key={colIndex}
                                        className={cn(
                                            "border border-border/50 p-1.5 text-sm truncate transition-colors duration-200",
                                            rowIndex === 0 && !previewState && "font-semibold bg-muted/80",
                                            
                                            // Base state
                                            { 'bg-primary/20': isSelected, 'ring-2 ring-primary ring-inset': isActive, },

                                            // Preview state
                                            !isAccentuating && previewState && {
                                                'bg-blue-500/10 shadow-inner shadow-blue-500/10': isPreviewSelected,
                                                'ring-2 ring-blue-500 ring-inset': isPreviewActive,
                                            },

                                            // Accentuation state
                                            isAccentuating && previewState && {
                                                'bg-primary/20': isPreviewSelected,
                                                'ring-2 ring-primary ring-inset': isPreviewActive,
                                            }
                                        )}
                                        style={finalStyle}
                                    >
                                        {cellValue}
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


"use client";

import { cn } from "@/lib/utils";

export interface GridSelection {
    activeCell: { row: number; col: number };
    selectedCells: Set<string>; // "row-col"
}

interface VisualGridProps {
    data: string[][];
    selection: GridSelection;
}

export function VisualGrid({ data, selection }: VisualGridProps) {
    const { activeCell, selectedCells } = selection;

    return (
        <div className="p-2 bg-muted/50 rounded-lg border overflow-auto">
            <table className="border-collapse table-fixed w-full">
                <thead>
                    <tr>
                        <th className="p-1 w-10"></th>
                        {data[0].map((_, colIndex) => (
                            <th key={colIndex} className="p-1.5 text-xs font-bold text-center text-muted-foreground bg-muted rounded-t-sm">
                                {String.fromCharCode(65 + colIndex)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td className="p-1.5 text-xs font-bold text-center text-muted-foreground bg-muted rounded-l-sm">
                                {rowIndex + 1}
                            </td>
                            {row.map((cell, colIndex) => {
                                const isSelected = selectedCells.has(`${rowIndex}-${colIndex}`);
                                const isActive = activeCell.row === rowIndex && activeCell.col === colIndex;

                                return (
                                    <td
                                        key={colIndex}
                                        className={cn(
                                            "border border-border/50 p-1.5 text-sm truncate",
                                            rowIndex === 0 && "font-semibold bg-muted/80",
                                            isSelected && "bg-primary/20",
                                            isActive && "ring-2 ring-primary ring-inset"
                                        )}
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
    );
}

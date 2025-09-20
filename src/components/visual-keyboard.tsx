
"use client";

import { cn } from "@/lib/utils";

interface VisualKeyboardProps {
  highlightedKeys?: string[];
}

const keyboardLayout: (string[])[] = [
    ['esc', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12'],
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace'],
    ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['capslock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'enter'],
    ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
    ['control', 'meta', 'alt', ' ', 'alt', 'meta', 'control']
];


const keyDisplayMap: Record<string, string> = {
    'esc': 'Esc',
    'backspace': 'Backspace',
    'tab': 'Tab',
    'capslock': 'Caps Lock',
    'enter': 'Enter',
    'shift': 'Shift',
    'control': 'Ctrl',
    'meta': 'Win',
    'alt': 'Alt',
    ' ': 'Space'
};

const keyWidths: Record<string, string> = {
    'backspace': '4.5rem',
    'tab': '3.5rem',
    'capslock': '4rem',
    'enter': '5rem',
    'shift': '5.5rem',
    'control': '2.5rem',
    'meta': '2.5rem',
    'alt': '2.5rem',
    ' ': '12rem'
};

const normalizeKey = (key: string) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'control' || lowerKey === 'ctrl') return 'control';
    if (lowerKey === 'meta' || lowerKey === 'command' || lowerKey === 'win') return 'meta';
    if (lowerKey === 'escape') return 'esc';
    return lowerKey;
};


export function VisualKeyboard({ highlightedKeys = [] }: VisualKeyboardProps) {
    const normalizedHighlights = new Set(highlightedKeys.map(normalizeKey));

    return (
        <div className="p-4 bg-muted/50 rounded-lg border overflow-x-auto">
            <div className="flex flex-col gap-2 min-w-max">
                {keyboardLayout.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-2">
                        {row.map((key, keyIndex) => {
                            const isHighlighted = normalizedHighlights.has(key);
                            const width = keyWidths[key];

                            return (
                                <div
                                    key={`${rowIndex}-${keyIndex}-${key}`}
                                    className={cn(
                                        "h-12 rounded-md flex items-center justify-center text-sm font-sans border-b-4",
                                        "transition-colors duration-200",
                                        isHighlighted
                                            ? "bg-primary text-primary-foreground border-primary/80"
                                            : "bg-background/50 text-foreground border-border",
                                    )}
                                    style={{ 
                                        width: width || '2.25rem',
                                        flexGrow: key === ' ' ? 1 : 0 
                                    }}
                                >
                                    <span className="truncate px-2">{keyDisplayMap[key] || key.toUpperCase()}</span>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

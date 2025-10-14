
"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface VisualKeyboardProps {
  highlightedKeys?: string[];
}

const windowsLayout: (string[])[] = [
    ['esc', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12'],
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace'],
    ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['capslock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'enter'],
    ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
    ['control', 'meta', 'alt', ' ', 'alt', 'control']
];

const macLayout: (string[])[] = [
    ['esc', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12'],
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'delete'],
    ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['capslock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'return'],
    ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
    ['fn', 'control', 'alt', 'meta', ' ', 'meta', 'alt']
];

const keyDisplayMap: Record<string, string> = {
    'esc': 'Esc',
    'backspace': 'Backspace',
    'delete': 'Delete',
    'tab': 'Tab',
    'capslock': 'Caps Lock',
    'enter': 'Enter',
    'return': 'Return',
    'shift': 'Shift',
    'control': '⌃',
    'meta': '⌘',
    'alt': '⌥',
    ' ': 'Space',
    'fn': 'fn'
};

const windowsKeyDisplayMap: Record<string, string> = {
    ...keyDisplayMap,
    'control': 'Ctrl',
    'meta': 'Win',
    'alt': 'Alt'
};

const keyWidths: Record<string, string> = {
    'backspace': '4.5rem',
    'delete': '3.5rem',
    'tab': '3.5rem',
    'capslock': '4rem',
    'enter': '5rem',
    'return': '4rem',
    'shift': '5.5rem',
    'control': '2.5rem',
    'meta': '3rem',
    'alt': '2.5rem',
    ' ': '9.5rem',
    'fn': '2.5rem'
};

const normalizeKey = (key: string) => {
    const lowerKey = key.toLowerCase();
    if (['control', 'ctrl'].includes(lowerKey)) return 'control';
    if (['meta', 'command', 'cmd', 'win'].includes(lowerKey)) return 'meta';
    if (['alt', 'option'].includes(lowerKey)) return 'alt';
    if (lowerKey === 'escape') return 'esc';
    if (lowerKey === 'enter') return 'enter';
    if (lowerKey === 'backspace') return 'backspace';
    return lowerKey;
};

export function VisualKeyboard({ highlightedKeys = [] }: VisualKeyboardProps) {
    const [isMac, setIsMac] = useState(false);

    useEffect(() => {
        setIsMac(navigator.userAgent.toLowerCase().includes('mac'));
    }, []);

    const layout = isMac ? macLayout : windowsLayout;
    const displayMap = isMac ? keyDisplayMap : windowsKeyDisplayMap;
    const normalizedHighlights = new Set(highlightedKeys.map(key => {
        const lower = key.toLowerCase();
        // On Mac, Control in challenges often means Command (Meta)
        if (isMac && lower === 'control') return 'meta';
        return normalizeKey(key);
    }));

    // Special handling for Mac where Excel shortcuts use 'Control' but the key is displayed as '⌃'
    if (isMac) {
      const macControlEquivalent = 'control';
      if (highlightedKeys.map(k => k.toLowerCase()).includes(macControlEquivalent)) {
          normalizedHighlights.add('control');
      }
    }


    return (
        <div className="p-4 bg-muted/50 rounded-lg border overflow-x-auto">
            <div className="flex flex-col gap-2 min-w-max">
                {layout.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-2">
                        {row.map((key, keyIndex) => {
                            const isHighlighted = normalizedHighlights.has(key) || (isMac && key === 'return' && normalizedHighlights.has('enter'));
                            const width = keyWidths[key];
                            const display = displayMap[key] || key.toUpperCase();

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
                                    <span className="px-1">{display}</span>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

    
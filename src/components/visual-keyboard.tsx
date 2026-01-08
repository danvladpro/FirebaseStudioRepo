
"use client";

import { cn } from "@/lib/utils";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
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

const specialKeysLayout: (string[])[] = [
    ['insert', 'home', 'pageup'],
    ['delete', 'end', 'pagedown'],
];

const keyDisplayMap: Record<string, string | JSX.Element> = {
    'esc': 'Esc',
    'backspace': 'Backspace',
    'delete': 'Del',
    'tab': 'Tab',
    'capslock': 'Caps Lock',
    'enter': 'Enter',
    'return': 'Return',
    'shift': 'Shift',
    'control': '⌃',
    'meta': '⌘',
    'alt': '⌥',
    ' ': 'Space',
    'fn': 'fn',
    'insert': 'Ins',
    'home': 'Home',
    'pageup': 'PgUp',
    'end': 'End',
    'pagedown': 'PgDn',
    'arrowup': <ArrowUp size={14} />,
    'arrowdown': <ArrowDown size={14} />,
    'arrowleft': <ArrowLeft size={14} />,
    'arrowright': <ArrowRight size={14} />,
};

const windowsKeyDisplayMap: Record<string, string | JSX.Element> = {
    ...keyDisplayMap,
    'control': 'Ctrl',
    'meta': 'Win',
    'alt': 'Alt',
    'delete': 'Del'
};

const keyWidths: Record<string, string> = {
    'backspace': '4.5rem',
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

let isMac = false;
if (typeof window !== 'undefined') {
  isMac = navigator.userAgent.toLowerCase().includes('mac');
}

const normalizeKey = (key: string) => {
    const lowerKey = key.toLowerCase();
    if (['control', 'ctrl'].includes(lowerKey)) return 'control';
    if (['meta', 'command', 'cmd', 'win'].includes(lowerKey)) return 'meta';
    if (['alt', 'option'].includes(lowerKey)) return 'alt';
    if (lowerKey === 'escape') return 'esc';
    if (lowerKey === 'enter' || lowerKey === 'return') return isMac ? 'return' : 'enter';
    if (lowerKey === 'backspace') return 'backspace';
    if (lowerKey === 'delete') return 'delete';
    if (lowerKey === 'pageup') return 'pageup';
    if (lowerKey === 'pagedown') return 'pagedown';
    if (lowerKey === 'home') return 'home';
    if (lowerKey === 'end') return 'end';
    if (lowerKey === 'insert') return 'insert';
    if (lowerKey.startsWith('arrow')) return lowerKey;
    return lowerKey;
};


export function VisualKeyboard({ highlightedKeys = [] }: VisualKeyboardProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        isMac = navigator.userAgent.toLowerCase().includes('mac');
    }, []);

    const layout = isMac ? macLayout : windowsLayout;
    const displayMap = isMac ? keyDisplayMap : windowsKeyDisplayMap;

    const normalizedHighlights = new Set(highlightedKeys.map(key => {
      const lower = key.toLowerCase();
      // This maps the key from the challenge definition to the key on the virtual keyboard layout
      if (isMac) {
        if (lower === 'control') return 'control'; // Keep Control for strikethrough etc.
        if (lower === 'meta') return 'meta';
        if (lower === 'enter') return 'return';
        if (lower === 'delete') return 'delete';
      } else {
        if (lower === 'meta') return 'meta'; // Win key
        if (lower === 'control') return 'control';
        if (lower === 'enter') return 'enter';
        if (lower === 'backspace') return 'backspace';
      }
      return normalizeKey(key);
    }));

    const renderKey = (key: string, isSpecialLayout = false) => {
        const isHighlighted = normalizedHighlights.has(key);
        const width = keyWidths[key];
        const display = displayMap[key] || key.toUpperCase();

        return (
            <div
            key={key}
            className={cn(
                "h-9 rounded-md flex items-center justify-center text-xs font-medium border-b-2",
                "transition-colors duration-200",
                isHighlighted
                ? "bg-primary text-primary-foreground border-primary/70"
                : "bg-background/60 text-foreground border-border/70",
            )}
            style={{ 
                width: isSpecialLayout ? '2.5rem' : (key === ' ' ? '20rem' : width || '2rem'),
            }}
            >
            <span className="px-0.5">{display}</span>
            </div>
        );
    };

    return (
        <div className="p-3 bg-muted/50 rounded-lg border overflow-x-auto scale-[0.9]">
        <div className="flex justify-center gap-4 min-w-max">
            {isClient && (
                <>
                <div className="flex flex-col gap-1.5">
                    {layout.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-1.5">
                        {row.map((key) => renderKey(key))}
                    </div>
                    ))}
                </div>
                
                <div className="flex flex-col justify-between">
                    <div className="flex flex-col gap-1.5">
                        {specialKeysLayout.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex justify-center gap-1.5">
                                {row.map((key) => renderKey(key, true))}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 grid-rows-2 gap-1.5 w-[7.7rem]">
                        <div />
                        {renderKey('arrowup', true)}
                        <div />
                        {renderKey('arrowleft', true)}
                        {renderKey('arrowdown', true)}
                        {renderKey('arrowright', true)}
                    </div>
                </div>
                </>
            )}
        </div>
        </div>
    );
};

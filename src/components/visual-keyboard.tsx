
"use client";

import { cn } from "@/lib/utils";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

interface VisualKeyboardProps {
  highlightedKeys?: string[];
  onKeyClick?: (key: string) => void;
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
    'backspace': 'flex-[2.2]',
    'tab': 'flex-[1.7]',
    'capslock': 'flex-[1.9]',
    'enter': 'flex-[2.4]',
    'return': 'flex-[1.9]',
    'shift': 'flex-[2.7]',
    'control': 'flex-[1.2]',
    'meta': 'flex-[1.4]',
    'alt': 'flex-[1.2]',
    ' ': 'flex-[4.5]',
    'fn': 'flex-[1.2]'
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


export function VisualKeyboard({ highlightedKeys = [], onKeyClick }: VisualKeyboardProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        isMac = navigator.userAgent.toLowerCase().includes('mac');
    }, []);

    const layout = isMac ? macLayout : windowsLayout;
    const displayMap = isMac ? keyDisplayMap : windowsKeyDisplayMap;

    const normalizedHighlights = new Set(highlightedKeys.map(normalizeKey));

    const renderKey = (key: string, isSpecialLayout = false) => {
        const isHighlighted = normalizedHighlights.has(key);
        const flexClass = keyWidths[key] || 'flex-1';
        const display = displayMap[key] || key.toUpperCase();
        const isClickable = !!onKeyClick;

        return (
            <div
                key={key}
                onClick={isClickable ? () => onKeyClick(key) : undefined}
                className={cn(
                    "h-full rounded-md flex items-center justify-center text-xs font-medium border-b-2",
                    "transition-colors duration-200",
                    isHighlighted
                        ? "bg-primary text-primary-foreground border-primary/70"
                        : "bg-background/60 text-foreground border-border/70",
                    isClickable && "cursor-pointer hover:bg-primary/80 hover:border-primary/60 active:translate-y-px",
                    flexClass
                )}
            >
                <span className="px-0.5 whitespace-nowrap">{display}</span>
            </div>
        );
    };

    return (
        <div className="p-1 sm:p-2 bg-muted/50 rounded-lg border w-full h-full flex flex-col">
            <div className="flex gap-2 sm:gap-4 w-full flex-grow min-h-0">
                {isClient && (
                    <>
                        {/* Main keyboard */}
                        <div className="flex flex-col gap-1 sm:gap-1.5 flex-grow h-full">
                            {layout.map((row, rowIndex) => (
                                <div key={rowIndex} className="flex gap-1 sm:gap-1.5 w-full flex-1">
                                    {row.map((key) => renderKey(key))}
                                </div>
                            ))}
                        </div>
    
                        {/* Right side (fixed width area) */}
                        <div className="flex flex-col justify-end">
                            <div className="flex flex-col justify-between h-full gap-1 sm:gap-1.5">
                                
                                {/* Special keys */}
                                <div className="flex flex-col gap-1 sm:gap-1.5">
                                    {specialKeysLayout.map((row, rowIndex) => (
                                        <div key={rowIndex} className="flex gap-1 sm:gap-1.5 flex-1">
                                            {row.map((key) => (
                                                 <div key={key} className={cn("w-8 sm:w-10 flex-1", key.length > 4 && "min-w-[40px]")}>{renderKey(key, true)}</div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
    
                                {/* Arrow keys */}
                                <div className="grid grid-cols-3 grid-rows-2 gap-1 sm:gap-1.5 w-full max-w-[120px]">
                                    <div />
                                    <div className="w-8 sm:w-10">{renderKey('arrowup', true)}</div>
                                    <div />
                                    <div className="w-8 sm:w-10">{renderKey('arrowleft', true)}</div>
                                    <div className="w-8 sm:w-10">{renderKey('arrowdown', true)}</div>
                                    <div className="w-8 sm:w-10">{renderKey('arrowright', true)}</div>
                                </div>
    
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );};

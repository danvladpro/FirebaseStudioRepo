"use client";

import type { ReactNode } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Canonical key → display label maps. Keys are the normalized lowercase form
 * produced by normalizeKey() in use-shortcut-engine.ts / visual-keyboard.tsx.
 * macOS uses the symbol glyphs (⌃ ⌘ ⌥); Windows overrides the modifiers.
 */
export const keyDisplayMap: Record<string, ReactNode> = {
    'esc': 'Esc', 'backspace': 'Backspace', 'delete': 'Del', 'tab': 'Tab',
    'capslock': 'Caps Lock', 'enter': 'Enter', 'return': 'Return', 'shift': 'Shift',
    'control': '⌃', 'meta': '⌘', 'alt': '⌥', ' ': 'Space', 'fn': 'fn',
    'insert': 'Ins', 'home': 'Home', 'pageup': 'PgUp', 'end': 'End', 'pagedown': 'PgDn',
    'arrowup': <ArrowUp size={14} />, 'arrowdown': <ArrowDown size={14} />,
    'arrowleft': <ArrowLeft size={14} />, 'arrowright': <ArrowRight size={14} />,
};

export const windowsKeyDisplayMap: Record<string, ReactNode> = {
    ...keyDisplayMap,
    'control': 'Ctrl', 'meta': 'Win', 'alt': 'Alt', 'delete': 'Del',
};

/**
 * A single key-cap. `value` must be a normalized lowercase key name.
 * One unified style across the app (drills, challenges, flashcards, results).
 */
export const KeyDisplay = ({ value, isMac }: { value: string; isMac: boolean }) => {
    const isModifier = ["control", "shift", "alt", "meta"].includes(value);
    const isLetter = value.length === 1 && /[a-z]/i.test(value);

    const map = isMac ? keyDisplayMap : windowsKeyDisplayMap;
    const displayValue = map[value] ?? value.toUpperCase();

    return (
        <kbd className={cn(
            "px-2 py-1.5 text-xs font-semibold rounded-md border-b-2 text-muted-foreground bg-muted",
            isModifier ? "min-w-[3rem] text-center" : "",
            isLetter ? "uppercase" : ""
        )}>
            {displayValue}
        </kbd>
    );
};

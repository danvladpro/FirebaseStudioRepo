'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const normalizeKey = (code: string, isMac: boolean): string => {
    const lower = code.toLowerCase();

    // From event.code
    if (lower.startsWith('key')) return lower.substring(3);
    if (lower.startsWith('digit')) return lower.substring(5);
    if (lower.startsWith('numpad')) return lower.substring(6);
    if (lower.startsWith('arrow')) return lower;
    if (lower.startsWith('control')) return 'control';
    if (lower.startsWith('shift')) return 'shift';
    if (lower.startsWith('alt')) return 'alt';
    if (lower.startsWith('meta')) return 'meta';

    switch (lower) {
        case 'escape': return 'esc';
        case 'space': return ' ';
        case 'enter':
        case 'numpadenter':
          return isMac ? 'return' : 'enter';
        case 'backspace': return 'backspace';
        case 'delete': return 'delete';
        case 'pageup': return 'pageup';
        case 'pagedown': return 'pagedown';
        case 'home': return 'home';
        case 'end': return 'end';
        case 'insert': return 'insert';
        case 'tab': return 'tab';
        case 'backquote': return '`';
        case 'minus': return '-';
        case 'equal': return '=';
        case 'bracketleft': return '[';
        case 'bracketright': return ']';
        case 'backslash': return '\\';
        case 'semicolon': return ';';
        case 'quote': return "'";
        case 'comma': return ',';
        case 'period': return '.';
        case 'slash': return '/';
        // Handle e.key values for modifiers as fallback
        case 'alt': return 'alt';
        case 'control': return 'control';
        case 'meta': return 'meta';
        case 'shift': return 'shift';
    }
    
    if (lower.startsWith('f') && lower.length > 1 && !isNaN(parseInt(lower.substring(1)))) {
        return lower;
    }
    return lower;
};


const isKnownKey = (normalizedKey: string): boolean => {
    if (normalizedKey.length === 0) return false;
    if (normalizedKey.length === 1 && normalizedKey.charCodeAt(0) < 128) return true;
    const knownMultiChar = new Set([
        'esc', 'backspace', 'delete', 'tab', 'enter', 'return', 'shift',
        'control', 'meta', 'alt', 'pageup', 'pagedown', 'home', 'end',
        'insert', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
    ]);
    if (knownMultiChar.has(normalizedKey)) return true;
    if (normalizedKey.startsWith('f') && normalizedKey.length > 1 && !isNaN(parseInt(normalizedKey.substring(1)))) return true;
    return false;
};


interface ShortcutEngineProps {
    // Acceptable key combinations — pressing ANY one counts as correct.
    // A single combo is passed as a one-element list, e.g. [['control','c']].
    requiredKeySets: string[][];
    isSequential: boolean;
    onSuccess: () => void;
    onIncorrect: () => void;
    isMac: boolean;
    isDisabled?: boolean;
}

export const useShortcutEngine = ({
    requiredKeySets,
    isSequential,
    onSuccess,
    onIncorrect,
    isMac,
    isDisabled = false,
}: ShortcutEngineProps) => {
    const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
    const [sequence, setSequence] = useState<string[]>([]);
    const incorrectLockRef = useRef(false);
    // Tracks which raw e.code values are currently physically held.
    // Used to detect macOS ghost keydown events for Option+key combos.
    const pressedCodesRef = useRef(new Set<string>());

    // Reset state when the required keys or mode changes
    useEffect(() => {
        setPressedKeys(new Set());
        setSequence([]);
        incorrectLockRef.current = false;
        pressedCodesRef.current.clear();
    }, [requiredKeySets, isSequential]);

    // Clear pressed keys when disabled (e.g. after correct answer) to prevent
    // stuck modifier keys on macOS — Option/Alt keyup can fire while the
    // keydown listener is torn down, leaving the key permanently "held" in the
    // set and causing the next challenge's combo check to misfire.
    useEffect(() => {
        if (isDisabled) {
            setPressedKeys(new Set());
            setSequence([]);
            pressedCodesRef.current.clear();
        }
    }, [isDisabled]);
    
    const handleIncorrect = useCallback(() => {
        if (incorrectLockRef.current) return;
        incorrectLockRef.current = true;
        onIncorrect();
        setTimeout(() => {
            incorrectLockRef.current = false;
        }, 500);
    }, [onIncorrect]);

    // Physical keyboard listener
    useEffect(() => {
        if (isDisabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent browser/OS shortcuts (zoom, find, etc.) on every keydown,
            // including repeats — repeat events must still be suppressed so held
            // keys don't keep triggering zoom/other actions.
            e.preventDefault();
            e.stopPropagation();
            if (e.repeat || incorrectLockRef.current) return;

            const key = normalizeKey(e.code, isMac);

            // Skip unknown keys (e.g. 'Unidentified')
            if (!isKnownKey(key)) return;

            // On macOS, Option+key fires an extra ghost keydown with the same e.code
            // immediately after the real one (e.g. Option+= fires a ghost for 'Equal').
            // Both real and ghost events are identical — detect the ghost by checking
            // whether this e.code is already tracked as physically held.
            if (isMac && e.altKey && pressedCodesRef.current.has(e.code)) return;
            pressedCodesRef.current.add(e.code);

            setPressedKeys(prev => new Set(prev).add(key));

            if (isSequential) {
                setSequence(prevSeq => [...prevSeq, key]);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            e.preventDefault();
            e.stopPropagation();
            pressedCodesRef.current.delete(e.code);
            const key = normalizeKey(e.code, isMac);

            // On macOS, keyup events for non-modifier keys are suppressed by the OS
            // while Meta (Cmd) is held, so those keys never fire their own keyup.
            // When Cmd is released, clear everything to prevent stuck visuals.
            if (isMac && key === 'meta') {
                pressedCodesRef.current.clear();
                setPressedKeys(new Set());
                return;
            }

            setPressedKeys(prev => {
                const newKeys = new Set(prev);
                newKeys.delete(key);
                return newKeys;
            });
        };

        const handleBlur = () => {
            pressedCodesRef.current.clear();
            setPressedKeys(new Set());
            setSequence([]);
        };

        window.addEventListener("keydown", handleKeyDown, { capture: true });
        window.addEventListener("keyup", handleKeyUp, { capture: true });
        window.addEventListener('blur', handleBlur);

        return () => {
            window.removeEventListener("keydown", handleKeyDown, { capture: true });
            window.removeEventListener("keyup", handleKeyUp, { capture: true });
            window.removeEventListener('blur', handleBlur);
        };
    }, [isDisabled, isSequential, isMac, requiredKeySets]);

    // Logic to check for success
    useEffect(() => {
        if (isDisabled || incorrectLockRef.current) return;

        if (isSequential) {
            if (sequence.length === 0) return;

            // The sequence is valid so far only if it's a prefix of SOME alternative.
            const isPrefixOfSome = requiredKeySets.some(set =>
                sequence.every((k, i) => k === set[i]));
            if (!isPrefixOfSome) {
                handleIncorrect();
                setSequence([]);
                return;
            }

            // Success when the sequence fully equals ANY alternative.
            const isCompleteMatch = requiredKeySets.some(set =>
                set.length === sequence.length && set.every((k, i) => k === sequence[i]));
            if (isCompleteMatch) {
                onSuccess();
            }
        } else { // Combo logic
            if (pressedKeys.size === 0) return;

            // Success when pressed keys exactly match ANY alternative.
            const matchesSome = requiredKeySets.some(set =>
                set.length === pressedKeys.size && set.every(k => pressedKeys.has(k)));
            if (matchesSome) {
                onSuccess();
                return;
            }

            // Still building only if the pressed keys are a subset of some
            // alternative (handles mixed-size alternatives like Ctrl+G / F5 —
            // pressing Control mustn't fail just because a 1-key alternative
            // exists). Otherwise it's a wrong combination.
            const isSubsetOfSome = requiredKeySets.some(set =>
                [...pressedKeys].every(k => set.includes(k)));
            if (!isSubsetOfSome) {
                handleIncorrect();
            }
        }
    }, [pressedKeys, sequence, isSequential, requiredKeySets, isDisabled, onSuccess, handleIncorrect]);

    // Virtual keyboard handler
    const handleVirtualKeyClick = (key: string) => {
        if (isDisabled || incorrectLockRef.current) return;
        const normalizedKey = normalizeKey(key, isMac);

        if (isSequential) {
            setSequence(prev => [...prev, normalizedKey]);
        } else {
            // For combos, toggle the key in the pressed set
            setPressedKeys(prev => {
                const newKeys = new Set(prev);
                if (newKeys.has(normalizedKey)) {
                    newKeys.delete(normalizedKey);
                } else {
                    newKeys.add(normalizedKey);
                }
                return newKeys;
            });
        }
    };
    
    const keysForDisplay = isSequential ? sequence : Array.from(pressedKeys);
    
    return {
        pressedKeys: keysForDisplay,
        handleVirtualKeyClick
    };
};
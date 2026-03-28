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

// On macOS, pressing Option+key fires an EXTRA keydown for the composed Unicode
// character (e.g. Option+= fires '≠', Option+p fires 'π', Option+2 fires '™').
// These come through with e.code = 'Equal' / 'KeyP' etc. but e.key = '≠' / 'π'.
// After normalizeKey runs on e.code they look like '=' or 'p' — indistinguishable
// from the real key — BUT the browser fires them as a second separate keydown event
// immediately after the real one, so pressedKeys ends up with size 3 instead of 2
// and the strict size===size check fails.
//
// The fix: track via e.code only (already done), and also check e.altKey on the
// event. If altKey is held and the resulting normalized key is a single printable
// ASCII char that isn't a modifier, it's the composed-character ghost event — skip it.
// We detect this in handleKeyDown by passing the original event.
const isComposedMacOptionKey = (e: KeyboardEvent, normalizedKey: string): boolean => {
    if (!e.altKey) return false;
    // The ghost event for Option+= has e.code='Equal' but e.key='≠' (non-ASCII).
    // The real event for Option+= also has e.code='Equal' and e.key='≠'.
    // The difference: the FIRST event is the modifier key itself (AltLeft) which
    // normalizes to 'alt'. The composed char event has e.key.length === 1 and
    // e.key.charCodeAt(0) > 127 (non-ASCII Unicode).
    if (e.key.length === 1 && e.key.charCodeAt(0) > 127) return true;
    return false;
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
    requiredKeys: string[];
    isSequential: boolean;
    onSuccess: () => void;
    onIncorrect: () => void;
    isMac: boolean;
    isDisabled?: boolean;
}

export const useShortcutEngine = ({
    requiredKeys,
    isSequential,
    onSuccess,
    onIncorrect,
    isMac,
    isDisabled = false,
}: ShortcutEngineProps) => {
    const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
    const [sequence, setSequence] = useState<string[]>([]);
    const incorrectLockRef = useRef(false);

    // Reset state when the required keys or mode changes
    useEffect(() => {
        setPressedKeys(new Set());
        setSequence([]);
        incorrectLockRef.current = false;
    }, [requiredKeys, isSequential]);

    // Clear pressed keys when disabled (e.g. after correct answer) to prevent
    // stuck modifier keys on macOS — Option/Alt keyup can fire while the
    // keydown listener is torn down, leaving the key permanently "held" in the
    // set and causing the next challenge's combo check to misfire.
    useEffect(() => {
        if (isDisabled) {
            setPressedKeys(new Set());
            setSequence([]);
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
        if (isDisabled || incorrectLockRef.current) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat || incorrectLockRef.current) return;
            e.preventDefault();
            e.stopPropagation();

            const key = normalizeKey(e.code, isMac);

            // Skip unknown keys (e.g. 'Unidentified')
            if (!isKnownKey(key)) return;

            // Skip the ghost composed-character keydown macOS fires for Option combos
            // (e.g. Option+= fires a second keydown where e.key='≠', a non-ASCII char)
            if (isMac && isComposedMacOptionKey(e, key)) return;

            setPressedKeys(prev => new Set(prev).add(key));

            if (isSequential) {
                setSequence(prevSeq => [...prevSeq, key]);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            e.preventDefault();
            e.stopPropagation();
            
            const key = normalizeKey(e.code, isMac);
            setPressedKeys(prev => {
                const newKeys = new Set(prev);
                newKeys.delete(key);
                return newKeys;
            });
        };

        const handleBlur = () => {
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
    }, [isDisabled, isSequential, isMac, requiredKeys]);

    // Logic to check for success
    useEffect(() => {
        if (isDisabled || incorrectLockRef.current) return;

        if (isSequential) {
            if (sequence.length === 0) return;

            // Check if the current sequence matches the beginning of the required sequence
            for (let i = 0; i < sequence.length; i++) {
                if (sequence[i] !== requiredKeys[i]) {
                    handleIncorrect();
                    setSequence([]);
                    return;
                }
            }

            // If the sequence is a complete match
            if (sequence.length === requiredKeys.length) {
                onSuccess();
            }
        } else { // Combo logic
            if (pressedKeys.size === 0) return;
            
            const requiredSet = new Set(requiredKeys);
            if (pressedKeys.size === requiredSet.size && [...requiredSet].every(k => pressedKeys.has(k))) {
                onSuccess();
            }
        }
    }, [pressedKeys, sequence, isSequential, requiredKeys, isDisabled, onSuccess, handleIncorrect]);

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
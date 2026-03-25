
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
    }
    
    if (lower.startsWith('f') && lower.length > 1 && !isNaN(parseInt(lower.substring(1)))) {
        return lower;
    }
    return lower;
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
            if (e.repeat) return;
            e.preventDefault();
            e.stopPropagation();

            const key = normalizeKey(e.code, isMac);
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
    }, [isDisabled, isSequential, isMac, requiredKeys]); // Added requiredKeys to re-bind if it changes

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

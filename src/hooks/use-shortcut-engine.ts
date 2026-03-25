
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

const normalizeKey = (code: string, isMac: boolean) => {
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
    
    // For F-keys
    if (lower.startsWith('f') && lower.length > 1 && !isNaN(parseInt(lower.substring(1)))) {
        return lower;
    }

    // Fallback for any unmapped codes or if event.key was passed
    return code.toLowerCase();
  };

interface ShortcutEngineProps {
  requiredKeys: string[];
  isSequential: boolean;
  onSuccess: () => void;
  onIncorrect: () => void;
  enabled?: boolean;
}

export const useShortcutEngine = ({
  requiredKeys,
  isSequential,
  onSuccess,
  onIncorrect,
  enabled = true,
}: ShortcutEngineProps) => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [sequence, setSequence] = useState<string[]>([]);
  const [isMac, setIsMac] = useState(false);
  const incorrectLockRef = useRef(false);

  useEffect(() => {
    // This check is necessary to avoid SSR errors.
    if (typeof window !== 'undefined') {
        setIsMac(navigator.userAgent.toLowerCase().includes('mac'));
    }
  }, []);
  
  // Reset internal state when the target shortcut changes
  useEffect(() => {
      setPressedKeys(new Set());
      setSequence([]);
      incorrectLockRef.current = false;
  }, [requiredKeys, isSequential]);

  const handleIncorrectCallback = useCallback(() => {
    if (incorrectLockRef.current) return;
    incorrectLockRef.current = true;
    onIncorrect();
    setPressedKeys(new Set());
    setSequence([]);
    setTimeout(() => {
        incorrectLockRef.current = false;
    }, 500); // Match incorrect feedback duration
  }, [onIncorrect]);

  const handleSuccessCallback = useCallback(() => {
      if (incorrectLockRef.current) return;
      onSuccess();
      setPressedKeys(new Set());
      setSequence([]);
  }, [onSuccess]);
  
  // Setup event listeners
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || incorrectLockRef.current) return;
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
      setPressedKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(normalizeKey(e.code, isMac));
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
  }, [enabled, isSequential, isMac]);

  // Check for success/failure
  useEffect(() => {
    if (!enabled || incorrectLockRef.current) return;

    if (isSequential) {
      if (sequence.length === 0) return;

      // Check if the current sequence is a valid prefix of the required sequence
      for (let i = 0; i < sequence.length; i++) {
        if (sequence[i] !== requiredKeys[i]) {
          handleIncorrectCallback();
          return;
        }
      }

      // If the sequence is a complete match
      if (sequence.length === requiredKeys.length) {
        handleSuccessCallback();
      }
    } else { // Combo logic
      if (pressedKeys.size === 0) return;

      const requiredKeysSet = new Set(requiredKeys);
      // Check for a perfect match
      if (pressedKeys.size === requiredKeysSet.size && [...requiredKeysSet].every(k => pressedKeys.has(k))) {
        handleSuccessCallback();
      }
    }
  }, [enabled, pressedKeys, sequence, isSequential, requiredKeys, handleSuccessCallback, handleIncorrectCallback]);
  
  return { pressedKeys, sequence };
};

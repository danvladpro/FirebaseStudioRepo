
import { FindReplaceDialogState, DialogEffect } from './types';
import { DrillStep } from './drills';
import type { ChallengeStep } from './types';

export const initialDialogState: FindReplaceDialogState = {
    isVisible: false,
    activeTab: 'find',
    findValue: '',
    replaceValue: '',
    highlightedButton: null,
    highlightedInput: null,
};

export const applyDialogEffect = (
    currentState: FindReplaceDialogState,
    effect: DialogEffect
): FindReplaceDialogState => {
    const newState = { ...currentState };
    // Every effect should clear the previous highlight unless it's setting a new one.
    if (effect.action !== 'HIGHLIGHT_BUTTON') {
        newState.highlightedButton = null;
    }
    if (effect.action !== 'HIGHLIGHT_INPUT') {
        newState.highlightedInput = null;
    }

    switch (effect.action) {
        case 'SHOW':
            newState.isVisible = true;
            if (effect.payload?.activeTab) {
                newState.activeTab = effect.payload.activeTab;
            }
            break;
        case 'HIDE':
            newState.isVisible = false;
            // Reset fields when hiding
            newState.findValue = '';
            newState.replaceValue = '';
            break;
        case 'SET_TAB':
            newState.activeTab = effect.payload;
            break;
        case 'SET_FIND_VALUE':
            newState.findValue = effect.payload;
            break;
        case 'SET_REPLACE_VALUE':
            newState.replaceValue = effect.payload;
            break;
        case 'HIGHLIGHT_BUTTON':
            newState.highlightedButton = effect.payload;
            break;
        case 'HIGHLIGHT_INPUT':
            newState.highlightedInput = effect.payload;
            break;
        case 'CLEAR_HIGHLIGHT':
            newState.highlightedButton = null;
            newState.highlightedInput = null;
            break;
    }
    return newState;
};

export const calculateDialogStateForStep = (
    steps: (ChallengeStep | DrillStep)[],
    targetStepIndex: number
): FindReplaceDialogState => {
    let runningState = { ...initialDialogState };

    if (targetStepIndex < 0) {
        return runningState;
    }

    for (let i = 0; i <= targetStepIndex; i++) {
        const step = steps[i];
        if (step?.dialogEffect) {
            runningState = applyDialogEffect(runningState, step.dialogEffect);
        } else if (step) {
            // If a step has no dialog effect, clear highlights.
            runningState = applyDialogEffect(runningState, { action: 'CLEAR_HIGHLIGHT' });
        }
    }
    
    return runningState;
};

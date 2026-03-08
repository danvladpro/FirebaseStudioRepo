

import { FindReplaceDialogState, DialogEffect, Sheet } from './types';
import { DrillStep } from './drills';
import type { ChallengeStep } from './types';

export const initialDialogState: FindReplaceDialogState = {
    isVisible: false,
    activeTab: 'find',
    findValue: '',
    replaceValue: '',
    highlightedButton: null,
    highlightedInput: null,
    createTableDialogVisible: false,
    createTableDialogHighlightedButton: null,
    goToDialogVisible: false,
    goToDialogReference: '',
    goToDialogHighlightedButton: null,
    goToDialogHighlightedInput: false,
    filterDropdownVisible: false,
    filterDropdownHighlightedIndex: -1,
    filterDropdownCheckedState: [true, true, true, true, true],
    sortDialogVisible: false,
    formatCellsDialogVisible: false,
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
    if (effect.action !== 'HIGHLIGHT_CREATE_TABLE_OK') {
        newState.createTableDialogHighlightedButton = null;
    }
    if (effect.action !== 'HIGHLIGHT_GO_TO_OK') {
        newState.goToDialogHighlightedButton = null;
    }
    if (effect.action !== 'HIGHLIGHT_GO_TO_INPUT') {
        newState.goToDialogHighlightedInput = false;
    }
    if (effect.action !== 'HIGHLIGHT_NEXT_FILTER_ITEM' && effect.action !== 'SHOW_FILTER_DROPDOWN' && effect.action !== 'TOGGLE_FILTER_ITEM') {
        newState.filterDropdownHighlightedIndex = -1;
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
            newState.createTableDialogHighlightedButton = null;
            newState.goToDialogHighlightedButton = null;
            newState.goToDialogHighlightedInput = false;
            newState.filterDropdownHighlightedIndex = -1;
            break;
        case 'SHOW_CREATE_TABLE':
            newState.createTableDialogVisible = true;
            break;
        case 'HIDE_CREATE_TABLE':
            newState.createTableDialogVisible = false;
            break;
        case 'HIGHLIGHT_CREATE_TABLE_OK':
            newState.createTableDialogHighlightedButton = 'ok';
            break;
        case 'SHOW_GO_TO':
            newState.goToDialogVisible = true;
            break;
        case 'HIDE_GO_TO':
            newState.goToDialogVisible = false;
            newState.goToDialogReference = '';
            break;
        case 'SET_GO_TO_REF':
            newState.goToDialogReference = effect.payload;
            break;
        case 'HIGHLIGHT_GO_TO_OK':
            newState.goToDialogHighlightedButton = 'ok';
            break;
        case 'HIGHLIGHT_GO_TO_INPUT':
            newState.goToDialogHighlightedInput = true;
            break;
        case 'SHOW_FILTER_DROPDOWN':
            newState.filterDropdownVisible = true;
            newState.filterDropdownHighlightedIndex = 0;
            break;
        case 'HIDE_FILTER_DROPDOWN':
            newState.filterDropdownVisible = false;
            newState.filterDropdownHighlightedIndex = -1;
            newState.filterDropdownCheckedState = [true, true, true, true, true]; // Reset on hide
            break;
        case 'HIGHLIGHT_NEXT_FILTER_ITEM': {
            const current = newState.filterDropdownHighlightedIndex ?? -1;
            // Assuming 5 hardcoded options in the dropdown
            newState.filterDropdownHighlightedIndex = (current + 1) % 5; 
            break;
        }
        case 'TOGGLE_FILTER_ITEM': {
            const newCheckedState = [...(newState.filterDropdownCheckedState || [true, true, true, true, true])];
            const indexToToggle = newState.filterDropdownHighlightedIndex ?? 0;

            if (indexToToggle < 0 || indexToToggle >= newCheckedState.length) break;

            if (indexToToggle === 0) { // Toggling "(Select All)"
                const shouldCheckAll = !newCheckedState[0];
                for (let i = 0; i < newCheckedState.length; i++) {
                    newCheckedState[i] = shouldCheckAll;
                }
            } else { // Toggling a regular item
                newCheckedState[indexToToggle] = !newCheckedState[indexToToggle];
                
                // If an item is unchecked, uncheck "(Select All)"
                if (!newCheckedState[indexToToggle]) {
                    newCheckedState[0] = false;
                } else {
                    // If all other items are checked, check "(Select All)"
                    const allOthersChecked = newCheckedState.slice(1).every(Boolean);
                    if (allOthersChecked) {
                        newCheckedState[0] = true;
                    }
                }
            }
            newState.filterDropdownCheckedState = newCheckedState;
            break;
        }
        case 'SHOW_SORT_DIALOG':
            newState.sortDialogVisible = true;
            break;
        case 'HIDE_SORT_DIALOG':
            newState.sortDialogVisible = false;
            break;
        case 'SHOW_FORMAT_CELLS_DIALOG':
            newState.formatCellsDialogVisible = true;
            break;
        case 'HIDE_FORMAT_CELLS_DIALOG':
            newState.formatCellsDialogVisible = false;
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

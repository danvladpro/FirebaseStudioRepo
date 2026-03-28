

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
    formatCellsDialogActiveCategory: 'General',
    formatCellsDialogHighlightedCategoryIndex: 0,
    fillColorDropdownVisible: false,
    fillColorDropdownHighlightedColor: null,
    pasteSpecialDialogVisible: false,
    pasteSpecialDialogHighlightedOption: null,
};

export const applyDialogEffect = (
    currentState: FindReplaceDialogState,
    effect: DialogEffect
): FindReplaceDialogState => {
    const newState = { ...currentState };

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
            newState.fillColorDropdownHighlightedColor = null;
            newState.pasteSpecialDialogHighlightedOption = null;
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
            newState.formatCellsDialogHighlightedCategoryIndex = 0;
            newState.formatCellsDialogActiveCategory = 'General';
            break;
        case 'HIDE_FORMAT_CELLS_DIALOG':
            newState.formatCellsDialogVisible = false;
            break;
        case 'MOVE_FORMAT_CELLS_HIGHLIGHT': {
            const categories = ["General", "Number", "Currency", "Accounting", "Date"];
            const current = newState.formatCellsDialogHighlightedCategoryIndex ?? 0;
            let newIndex = current;
            if (effect.payload === 'down') {
                newIndex = (current + 1) % categories.length;
            } else if (effect.payload === 'up') {
                newIndex = (current - 1 + categories.length) % categories.length;
            }
            newState.formatCellsDialogHighlightedCategoryIndex = newIndex;
            newState.formatCellsDialogActiveCategory = categories[newIndex];
            break;
        }
        case 'SHOW_FILL_COLOR_DROPDOWN':
            newState.fillColorDropdownVisible = true;
            newState.fillColorDropdownHighlightedColor = '#ffff00'; // Default to yellow
            break;
        case 'HIDE_FILL_COLOR_DROPDOWN':
            newState.fillColorDropdownVisible = false;
            newState.fillColorDropdownHighlightedColor = null;
            break;
        case 'MOVE_FILL_COLOR_HIGHLIGHT': {
            if (!newState.fillColorDropdownVisible) break;
            const allColors = [
                '#c00000', '#ff0000', '#ffc000', '#ffff00', '#92d050',
                '#00b050', '#00b0f0', '#0070c0', '#002060', '#7030a0',
                'transparent'
            ];
            const currentIndex = allColors.indexOf(newState.fillColorDropdownHighlightedColor || '');
            let newIndex = currentIndex;
            if (effect.payload === 'right') {
                newIndex = (currentIndex + 1) % allColors.length;
            } else if (effect.payload === 'left') {
                newIndex = (currentIndex - 1 + allColors.length) % allColors.length;
            }
            newState.fillColorDropdownHighlightedColor = allColors[newIndex];
            break;
        }
        case 'SHOW_PASTE_SPECIAL_DIALOG':
            newState.pasteSpecialDialogVisible = true;
            newState.pasteSpecialDialogHighlightedOption = 'All';
            break;
        case 'HIDE_PASTE_SPECIAL_DIALOG':
            newState.pasteSpecialDialogVisible = false;
            newState.pasteSpecialDialogHighlightedOption = null;
            break;
        case 'MOVE_PASTE_SPECIAL_HIGHLIGHT':
            newState.pasteSpecialDialogHighlightedOption = effect.payload;
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
        // At the beginning of processing each step, we clear previous highlights.
        // This ensures highlights from step N-1 don't leak into step N.
        runningState = applyDialogEffect(runningState, { action: 'CLEAR_HIGHLIGHT' });
        
        const step = steps[i];
        if (step?.dialogEffect) {
            runningState = applyDialogEffect(runningState, step.dialogEffect);
        }
    }
    
    return runningState;
};

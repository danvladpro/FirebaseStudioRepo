# Dialog Clipping Fix + Compact Treatment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix vertical clipping on all simulated Excel dialogs by lifting them above the scroll container, add compact padding/sizing to all 6 dialog components, and fix the Paste Special missing-from-preview bug.

**Architecture:** Two independent changes: (1) each dialog component gets tightened padding/sizing/z-index in its own file — no JSX structural changes; (2) `drill-ui.tsx` and `challenge-ui.tsx` each get their dialog JSX lifted from inside `overflow-y-auto` to be direct children of `CardContent`, making `CardContent` the new `relative` containing block.

**Tech Stack:** Next.js 15, React, Tailwind CSS, shadcn/ui. No test framework — verification is `npm run typecheck` per file + dev server visual check.

---

## File Map

| File | Change |
|------|--------|
| `src/components/find-replace-dialog.tsx` | Compact: width, padding, input height, tab sizing, z-30 |
| `src/components/sort-dialog.tsx` | Compact: width, padding, z-30 |
| `src/components/format-cells-dialog.tsx` | Compact: width, padding, category items, z-30 |
| `src/components/go-to-dialog.tsx` | Compact: width, padding, input height, z-30 |
| `src/components/create-table-dialog.tsx` | Compact: width, padding, input height, z-30 |
| `src/components/paste-special-dialog.tsx` | Compact: width, section labels, z-30 |
| `src/components/drill-ui.tsx` | Lift: CardContent gets `relative`, loses `overflow-hidden`; dialog JSX moves above scroll div; grid wrapper loses `relative` |
| `src/components/challenge-ui.tsx` | Same lift pattern as drill-ui |
| `src/app/drills/[id]/page.tsx` | Bug fix: add missing `PasteSpecialDialog` to preview |

---

## Task 1: Compact `find-replace-dialog.tsx`

**Files:**
- Modify: `src/components/find-replace-dialog.tsx`

- [ ] **Step 1: Apply all compact changes**

Replace the entire `return (...)` block. The logic functions above it are unchanged.

```tsx
  return (
    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] bg-background shadow-2xl z-30 border">
      <CardHeader className="flex flex-row items-center justify-between p-2 pl-4 bg-muted/50 rounded-t-lg border-b cursor-move">
        <CardTitle className="text-sm font-medium">Find and Replace</CardTitle>
        <Button variant="ghost" size="icon" className={cn('h-6 w-6', getButtonClass('close'))}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={state.activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none bg-transparent p-1 border-b">
            <TabsTrigger value="find" className="text-xs data-[state=active]:bg-muted/80 data-[state=active]:shadow-none">Find</TabsTrigger>
            <TabsTrigger value="replace" className="text-xs data-[state=active]:bg-muted/80 data-[state=active]:shadow-none">Replace</TabsTrigger>
          </TabsList>
          <TabsContent value="find" className="p-2.5 space-y-2 mt-0">
            <div className="grid w-full items-center gap-1">
              <Label htmlFor="find-what-find" className="text-xs">Find what:</Label>
              <Input type="text" id="find-what-find" value={state.findValue || ''} readOnly className={cn('h-7 text-xs', getInputClass('find'))} />
            </div>
          </TabsContent>
          <TabsContent value="replace" className="p-2.5 space-y-2 mt-0">
            <div className="grid w-full items-center gap-1">
              <Label htmlFor="find-what-replace" className="text-xs">Find what:</Label>
              <Input type="text" id="find-what-replace" value={state.findValue || ''} readOnly className={cn('h-7 text-xs', getInputClass('find'))} />
            </div>
            <div className="grid w-full items-center gap-1">
              <Label htmlFor="replace-with" className="text-xs">Replace with:</Label>
              <Input type="text" id="replace-with" value={state.replaceValue || ''} readOnly className={cn('h-7 text-xs', getInputClass('replace'))} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="py-1.5 px-2.5 flex justify-end gap-2 border-t bg-muted/50 rounded-b-lg">
        {state.activeTab === 'find' ? (
          <>
            <Button variant="outline" size="sm" className={cn(getButtonClass('findNext'))}>Find Next</Button>
            <Button variant="outline" size="sm" className={cn(getButtonClass('close'))}>Close</Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" className={cn(getButtonClass('findNext'))}>Find Next</Button>
            <Button variant="outline" size="sm" className={cn(getButtonClass('replace'))}>Replace</Button>
            <Button variant="outline" size="sm" className={cn(getButtonClass('replaceAll'))}>Replace All</Button>
            <Button variant="outline" size="sm" className={cn(getButtonClass('close'))}>Close</Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/vladi/github/ExcelNinja/FirebaseStudioRepo && npm run typecheck 2>&1 | grep "find-replace-dialog"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/find-replace-dialog.tsx
git commit -m "ui: compact find-replace dialog (w-300, tighter padding, h-7 inputs, z-30)"
```

---

## Task 2: Compact `sort-dialog.tsx`

**Files:**
- Modify: `src/components/sort-dialog.tsx`

- [ ] **Step 1: Apply all compact changes**

Replace the entire file content:

```tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from './ui/checkbox';

interface SortDialogProps {
  isVisible: boolean;
}

export function SortDialog({ isVisible }: SortDialogProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] bg-background shadow-2xl z-30 border">
      <CardHeader className="p-1.5 pl-2.5 border-b">
        <CardTitle className="text-sm font-medium">Sort</CardTitle>
      </CardHeader>
      <CardContent className="p-2.5 space-y-2">
        <div className="flex items-center justify-end space-x-2">
            <Checkbox id="has-headers" defaultChecked />
            <Label htmlFor="has-headers" className='font-normal text-xs'>My data has headers</Label>
        </div>
        <div className="border p-1.5 rounded-md space-y-1.5">
            <div className="grid grid-cols-[auto_1fr_1fr_1fr] items-center gap-1.5">
                <Label className="text-xs text-right">Sort by</Label>
                <Select>
                    <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Column A" /></SelectTrigger>
                    <SelectContent><SelectItem value="A">Column A</SelectItem></SelectContent>
                </Select>
                <Select>
                    <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Cell Values" /></SelectTrigger>
                    <SelectContent><SelectItem value="values">Cell Values</SelectItem></SelectContent>
                </Select>
                <Select>
                    <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="A to Z" /></SelectTrigger>
                    <SelectContent><SelectItem value="az">A to Z</SelectItem></SelectContent>
                </Select>
            </div>
        </div>
        <div className="flex gap-1.5">
            <Button variant="outline" size="sm">Add Level</Button>
            <Button variant="outline" size="sm">Delete Level</Button>
            <Button variant="outline" size="sm">Copy Level</Button>
        </div>
      </CardContent>
      <CardFooter className="py-1.5 px-2.5 flex justify-end gap-2 border-t bg-muted/50 rounded-b-lg">
        <Button variant="outline" size="sm">Options...</Button>
        <div className="flex-grow" />
        <Button variant="default" size="sm">OK</Button>
        <Button variant="outline" size="sm">Cancel</Button>
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/vladi/github/ExcelNinja/FirebaseStudioRepo && npm run typecheck 2>&1 | grep "sort-dialog"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/sort-dialog.tsx
git commit -m "ui: compact sort dialog (w-380, tighter padding, h-7 selects, z-30)"
```

---

## Task 3: Compact `format-cells-dialog.tsx`

**Files:**
- Modify: `src/components/format-cells-dialog.tsx`

- [ ] **Step 1: Apply all compact changes**

Replace the entire file content:

```tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { FindReplaceDialogState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Input } from './ui/input';

interface FormatCellsDialogProps {
  state: Partial<FindReplaceDialogState>;
}

const categories = [
  "General",
  "Number",
  "Currency",
  "Accounting",
  "Date",
];

export function FormatCellsDialog({ state }: FormatCellsDialogProps) {
  if (!state.formatCellsDialogVisible) {
    return null;
  }

  const activeCategory = state.formatCellsDialogActiveCategory || "General";
  const highlightedCategoryIndex = state.formatCellsDialogHighlightedCategoryIndex ?? 0;

  return (
    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-background shadow-2xl z-30 border">
      <CardHeader className="flex flex-row items-center justify-between p-2 pl-4 bg-muted/50 rounded-t-lg border-b">
        <CardTitle className="text-sm font-medium">Format Cells</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-2.5">
        <div className="flex gap-3">
            <div className="w-1/3 border rounded-md p-1">
                <Label className="px-1.5 text-xs text-muted-foreground">Category:</Label>
                <div className="flex flex-col gap-0.5 mt-0.5">
                    {categories.map((category, index) => (
                        <div key={category} className={cn(
                            "px-1.5 py-0.5 text-xs rounded-sm cursor-default",
                            highlightedCategoryIndex === index && "bg-primary text-primary-foreground",
                            activeCategory === category && highlightedCategoryIndex !== index && "bg-muted"
                        )}>
                            {category}
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-2/3">
                {activeCategory === 'General' && (
                    <div>
                        <p className="text-xs">General format cells have no specific number format.</p>
                    </div>
                )}
                {activeCategory === 'Number' && (
                    <div className="space-y-2">
                        <div className="grid w-full max-w-sm items-center gap-1">
                            <Label htmlFor="decimal-places" className="text-xs">Decimal places:</Label>
                            <Input type="number" id="decimal-places" defaultValue="2" className="h-7 text-xs" />
                        </div>
                        <p className="text-xs text-muted-foreground">Number is used for general display of numbers. Currency and Accounting offer specialized formatting for monetary values.</p>
                    </div>
                )}
                {activeCategory === 'Currency' && (
                    <div className="space-y-2">
                        <div className="grid w-full max-w-sm items-center gap-1">
                            <Label htmlFor="decimal-places-curr" className="text-xs">Decimal places:</Label>
                            <Input type="number" id="decimal-places-curr" defaultValue="2" className="h-7 text-xs" />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1">
                            <Label htmlFor="symbol" className="text-xs">Symbol:</Label>
                            <Input type="text" id="symbol" defaultValue="$" className="h-7 text-xs" />
                        </div>
                    </div>
                )}
                {activeCategory === 'Accounting' && (
                    <div className="space-y-2">
                        <div className="grid w-full max-w-sm items-center gap-1">
                            <Label htmlFor="decimal-places-acc" className="text-xs">Decimal places:</Label>
                            <Input type="number" id="decimal-places-acc" defaultValue="2" className="h-7 text-xs" />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1">
                            <Label htmlFor="symbol-acc" className="text-xs">Symbol:</Label>
                            <Input type="text" id="symbol-acc" defaultValue="$" className="h-7 text-xs" />
                        </div>
                    </div>
                )}
                {activeCategory === 'Date' && (
                    <div className="space-y-1.5">
                        <Label className="text-xs">Type:</Label>
                        <div className="border rounded-md p-1 h-28 overflow-y-auto">
                            <div className="p-1.5 bg-muted rounded-sm text-xs">*3/14/2012</div>
                            <div className="p-1.5 text-xs">*Wednesday, March 14, 2012</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
      <CardFooter className="py-1.5 px-2.5 flex justify-end gap-2 border-t bg-muted/50 rounded-b-lg">
        <Button variant="outline" size="sm">Cancel</Button>
        <Button variant="default" size="sm">OK</Button>
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/vladi/github/ExcelNinja/FirebaseStudioRepo && npm run typecheck 2>&1 | grep "format-cells-dialog"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/format-cells-dialog.tsx
git commit -m "ui: compact format-cells dialog (w-400, text-xs categories, h-7 inputs, z-30)"
```

---

## Task 4: Compact `go-to-dialog.tsx`

**Files:**
- Modify: `src/components/go-to-dialog.tsx`

- [ ] **Step 1: Apply all compact changes**

Replace the entire file content:

```tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface GoToDialogProps {
  isVisible: boolean;
  reference: string;
  isOkHighlighted: boolean;
  isInputHighlighted: boolean;
}

export function GoToDialog({ isVisible, reference, isOkHighlighted, isInputHighlighted }: GoToDialogProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] bg-background shadow-2xl z-30 border">
      <CardHeader className="flex flex-row items-center justify-between p-1.5 pl-2.5 border-b">
        <CardTitle className="text-sm font-medium">Go To</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6">
            <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-2.5 space-y-2">
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="goto-reference" className="text-xs">Reference:</Label>
          <Input
            type="text"
            id="goto-reference"
            value={reference}
            readOnly
            className={cn('h-7 text-xs', isInputHighlighted && 'ring-2 ring-accent', 'bg-muted/30')}
          />
        </div>
      </CardContent>
      <CardFooter className="py-1.5 px-2.5 flex justify-between items-center border-t bg-muted/50 rounded-b-lg">
        <Button variant="outline" size="sm">Special...</Button>
        <div className="flex gap-2">
            <Button variant="default" size="sm" className={cn(isOkHighlighted && 'ring-2 ring-accent')}>
                OK
            </Button>
            <Button variant="outline" size="sm">Cancel</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/vladi/github/ExcelNinja/FirebaseStudioRepo && npm run typecheck 2>&1 | grep "go-to-dialog"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/go-to-dialog.tsx
git commit -m "ui: compact go-to dialog (w-300, tighter padding, h-7 input, z-30)"
```

---

## Task 5: Compact `create-table-dialog.tsx`

**Files:**
- Modify: `src/components/create-table-dialog.tsx`

- [ ] **Step 1: Apply all compact changes**

Replace the entire file content:

```tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface CreateTableDialogProps {
  isVisible: boolean;
  range: string;
  isHighlighted: boolean;
}

export function CreateTableDialog({ isVisible, range, isHighlighted }: CreateTableDialogProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] bg-background shadow-2xl z-30 border">
      <CardHeader className="p-1.5 pl-2.5 border-b">
        <CardTitle className="text-sm font-medium">Create Table</CardTitle>
      </CardHeader>
      <CardContent className="p-2.5 space-y-2">
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="table-range" className="text-xs">Where is the data for your table?</Label>
          <Input type="text" id="table-range" value={range} readOnly className="h-7 text-xs bg-muted/30" />
        </div>
        <div className="flex items-center space-x-2">
            <Checkbox id="has-headers" defaultChecked />
            <Label htmlFor="has-headers" className='font-normal text-xs'>My table has headers</Label>
        </div>
      </CardContent>
      <CardFooter className="py-1.5 px-2.5 flex justify-end gap-2 border-t bg-muted/50 rounded-b-lg">
        <Button variant="outline" size="sm">Cancel</Button>
        <Button variant="default" size="sm" className={cn(isHighlighted && 'ring-2 ring-accent')}>
            OK
        </Button>
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/vladi/github/ExcelNinja/FirebaseStudioRepo && npm run typecheck 2>&1 | grep "create-table-dialog"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/create-table-dialog.tsx
git commit -m "ui: compact create-table dialog (w-300, tighter padding, h-7 input, z-30)"
```

---

## Task 6: Compact `paste-special-dialog.tsx`

**Files:**
- Modify: `src/components/paste-special-dialog.tsx`

- [ ] **Step 1: Apply all compact changes**

Replace the entire file content:

```tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { FindReplaceDialogState } from '@/lib/types';
import { X } from 'lucide-react';

interface PasteSpecialDialogProps {
  state: Partial<FindReplaceDialogState>;
}

const pasteOptions = ['All', 'Formulas', 'Values', 'Formats', 'Comments', 'Validation'];
const operationOptions = ['None', 'Add', 'Subtract', 'Multiply', 'Divide'];

export function PasteSpecialDialog({ state }: PasteSpecialDialogProps) {
  if (!state.pasteSpecialDialogVisible) {
    return null;
  }

  const activeOption = state.pasteSpecialDialogHighlightedOption || 'All';

  return (
    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] bg-background shadow-2xl z-30 border">
      <CardHeader className="flex flex-row items-center justify-between p-2 pl-4 border-b">
        <CardTitle className="text-sm font-medium">Paste Special</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6">
            <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-2.5 flex gap-2">
        <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Paste</h4>
            <RadioGroup value={activeOption} className="space-y-0">
            {pasteOptions.map(option => (
                <div key={option} className={cn("flex items-center space-x-1.5 py-0.5 rounded-sm", activeOption === option && "bg-accent text-accent-foreground")}>
                    <RadioGroupItem value={option} id={`paste-${option}`} className="h-3 w-3" />
                    <Label htmlFor={`paste-${option}`} className="font-normal flex-1 cursor-pointer text-xs">
                        <span className="underline">{option.charAt(0)}</span>{option.substring(1)}
                    </Label>
                </div>
            ))}
            </RadioGroup>
        </div>
        <Separator orientation="vertical" className="h-auto" />
        <div className="flex-1 space-y-1">
            <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Operation</h4>
                <RadioGroup defaultValue="None" className="space-y-0">
                    {operationOptions.map(option => (
                        <div key={option} className="flex items-center space-x-1.5 py-0.5">
                            <RadioGroupItem value={option} id={`op-${option}`} className="h-3 w-3" />
                            <Label htmlFor={`op-${option}`} className="font-normal flex-1 cursor-pointer text-xs">
                                <span className="underline">{option.charAt(0)}</span>{option.substring(1)}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
            <div className="space-y-0.5 pt-1">
                <div className="flex items-center space-x-1.5">
                    <Checkbox id="skip-blanks" className="h-3 w-3" />
                    <Label htmlFor="skip-blanks" className="font-normal text-xs">Skip <span className="underline">b</span>lanks</Label>
                </div>
                <div className="flex items-center space-x-1.5">
                    <Checkbox id="transpose" className="h-3 w-3" />
                    <Label htmlFor="transpose" className="font-normal text-xs">Transpos<span className="underline">e</span></Label>
                </div>
            </div>
        </div>
      </CardContent>
      <CardFooter className="py-1.5 px-2.5 flex justify-end gap-2 border-t bg-muted/50 rounded-b-lg">
        <Button variant="default" size="sm">OK</Button>
        <Button variant="outline" size="sm">Cancel</Button>
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/vladi/github/ExcelNinja/FirebaseStudioRepo && npm run typecheck 2>&1 | grep "paste-special-dialog"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/paste-special-dialog.tsx
git commit -m "ui: compact paste-special dialog (w-300, uppercase section labels, z-30)"
```

---

## Task 7: Lift dialogs above overflow chain in `drill-ui.tsx`

**Files:**
- Modify: `src/components/drill-ui.tsx:359-391`

The goal: move all 8 dialog components from inside `overflow-y-auto` to be direct children of `CardContent`. Make `CardContent` the `relative` anchor. Remove `overflow-hidden` from `CardContent` (the inner scroll div already clips its own content). Remove `relative` from the grid wrapper div.

- [ ] **Step 1: Replace the CardContent opening tag and inner dialog block**

Find this exact block (lines 359–391):

```tsx
      <CardContent className="flex-1 overflow-hidden flex flex-col border-t pt-0">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
               {displayedGridState && (
                  <div className="max-w-md mx-auto relative">
                      <FindReplaceDialog state={finalDialogState} isSuccess={stepFeedback === 'correct'} />
                      <CreateTableDialog
                          isVisible={!!finalDialogState.createTableDialogVisible}
                          isHighlighted={finalDialogState.createTableDialogHighlightedButton === 'ok'}
                          range={getSelectionRangeString(displayedGridState?.sheets[displayedGridState.activeSheetIndex].selection!)}
                      />
                      <GoToDialog
                          isVisible={!!finalDialogState.goToDialogVisible}
                          reference={finalDialogState.goToDialogReference || ''}
                          isOkHighlighted={finalDialogState.goToDialogHighlightedButton === 'ok'}
                          isInputHighlighted={!!finalDialogState.goToDialogHighlightedInput}
                      />
                      <SortDialog isVisible={!!finalDialogState.sortDialogVisible} />
                      <FormatCellsDialog state={finalDialogState} />
                      <FilterDropdown state={finalDialogState} />
                      <FillColorDropdown state={finalDialogState} />
                      <PasteSpecialDialog state={finalDialogState} />
                      <VisualGrid
```

Replace with:

```tsx
      <CardContent className="flex-1 relative flex flex-col border-t pt-0">
        <FindReplaceDialog state={finalDialogState} isSuccess={stepFeedback === 'correct'} />
        {displayedGridState && (
            <CreateTableDialog
                isVisible={!!finalDialogState.createTableDialogVisible}
                isHighlighted={finalDialogState.createTableDialogHighlightedButton === 'ok'}
                range={getSelectionRangeString(displayedGridState.sheets[displayedGridState.activeSheetIndex].selection!)}
            />
        )}
        <GoToDialog
            isVisible={!!finalDialogState.goToDialogVisible}
            reference={finalDialogState.goToDialogReference || ''}
            isOkHighlighted={finalDialogState.goToDialogHighlightedButton === 'ok'}
            isInputHighlighted={!!finalDialogState.goToDialogHighlightedInput}
        />
        <SortDialog isVisible={!!finalDialogState.sortDialogVisible} />
        <FormatCellsDialog state={finalDialogState} />
        <FilterDropdown state={finalDialogState} />
        <FillColorDropdown state={finalDialogState} />
        <PasteSpecialDialog state={finalDialogState} />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
               {displayedGridState && (
                  <div className="max-w-md mx-auto">
                      <VisualGrid
```

- [ ] **Step 2: Close the removed `<div className="max-w-md mx-auto relative">` properly**

Find the closing `</div>` that previously closed `max-w-md mx-auto relative` (line ~390) followed by the steps column. It should now just close `max-w-md mx-auto`. The structure around `</div>` after `</VisualGrid>` is unchanged — only the opening tag changed above.

- [ ] **Step 3: Typecheck**

```bash
cd /Users/vladi/github/ExcelNinja/FirebaseStudioRepo && npm run typecheck 2>&1 | grep "drill-ui"
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/components/drill-ui.tsx
git commit -m "fix: lift dialogs above overflow-y-auto in drill-ui to prevent vertical clipping"
```

---

## Task 8: Lift dialogs above overflow chain in `challenge-ui.tsx`

**Files:**
- Modify: `src/components/challenge-ui.tsx:366-400`

Same pattern as Task 7 but for `challenge-ui.tsx`. The grid wrapper here is `<div className="relative">` (no width constraint) inside a `flex flex-col gap-4` column.

- [ ] **Step 1: Replace the CardContent opening tag and inner dialog block**

Find this exact block (lines 366–399):

```tsx
    <CardContent className="flex-1 overflow-hidden flex flex-col border-t pt-0">
      <div className="flex-1 overflow-y-auto p-2 sm:p-3">
        <div className="grid md:grid-cols-2 gap-4 items-start">
          <div className="flex flex-col gap-4 min-w-0">
               {displayedGridState && (
                  <div className="relative">
                      <FindReplaceDialog state={finalDialogState} isSuccess={feedback === 'correct'} />
                      <CreateTableDialog
                          isVisible={!!finalDialogState.createTableDialogVisible}
                          isHighlighted={finalDialogState.createTableDialogHighlightedButton === 'ok'}
                          range={getSelectionRangeString(displayedGridState?.sheets[displayedGridState.activeSheetIndex].selection!)}
                      />
                      <GoToDialog
                          isVisible={!!finalDialogState.goToDialogVisible}
                          reference={finalDialogState.goToDialogReference || ''}
                          isOkHighlighted={finalDialogState.goToDialogHighlightedButton === 'ok'}
                          isInputHighlighted={!!finalDialogState.goToDialogHighlightedInput}
                      />
                      <SortDialog isVisible={!!finalDialogState.sortDialogVisible} />
                      <FormatCellsDialog state={finalDialogState} />
                      <FilterDropdown state={finalDialogState} />
                      <FillColorDropdown state={finalDialogState} />
                      <PasteSpecialDialog state={finalDialogState} />
                      <VisualGrid
```

Replace with:

```tsx
    <CardContent className="flex-1 relative flex flex-col border-t pt-0">
      <FindReplaceDialog state={finalDialogState} isSuccess={feedback === 'correct'} />
      {displayedGridState && (
          <CreateTableDialog
              isVisible={!!finalDialogState.createTableDialogVisible}
              isHighlighted={finalDialogState.createTableDialogHighlightedButton === 'ok'}
              range={getSelectionRangeString(displayedGridState.sheets[displayedGridState.activeSheetIndex].selection!)}
          />
      )}
      <GoToDialog
          isVisible={!!finalDialogState.goToDialogVisible}
          reference={finalDialogState.goToDialogReference || ''}
          isOkHighlighted={finalDialogState.goToDialogHighlightedButton === 'ok'}
          isInputHighlighted={!!finalDialogState.goToDialogHighlightedInput}
      />
      <SortDialog isVisible={!!finalDialogState.sortDialogVisible} />
      <FormatCellsDialog state={finalDialogState} />
      <FilterDropdown state={finalDialogState} />
      <FillColorDropdown state={finalDialogState} />
      <PasteSpecialDialog state={finalDialogState} />
      <div className="flex-1 overflow-y-auto p-2 sm:p-3">
        <div className="grid md:grid-cols-2 gap-4 items-start">
          <div className="flex flex-col gap-4 min-w-0">
               {displayedGridState && (
                  <div>
                      <VisualGrid
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/vladi/github/ExcelNinja/FirebaseStudioRepo && npm run typecheck 2>&1 | grep "challenge-ui"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/challenge-ui.tsx
git commit -m "fix: lift dialogs above overflow-y-auto in challenge-ui to prevent vertical clipping"
```

---

## Task 9: Fix Paste Special missing from drill preview

**Files:**
- Modify: `src/app/drills/[id]/page.tsx`

The drill preview page renders all dialogs except `PasteSpecialDialog`. It also lacks the import.

- [ ] **Step 1: Add the import**

Find the last import in the dialog import block (line 27):

```tsx
import { FillColorDropdown } from "@/components/fill-color-dropdown";
```

Replace with:

```tsx
import { FillColorDropdown } from "@/components/fill-color-dropdown";
import { PasteSpecialDialog } from "@/components/paste-special-dialog";
```

- [ ] **Step 2: Add the JSX in the preview dialog block**

Find this block (lines 141–142):

```tsx
                                  <FillColorDropdown state={displayDialogState} />
                                  <VisualGrid
```

Replace with:

```tsx
                                  <FillColorDropdown state={displayDialogState} />
                                  <PasteSpecialDialog state={displayDialogState} />
                                  <VisualGrid
```

- [ ] **Step 3: Typecheck**

```bash
cd /Users/vladi/github/ExcelNinja/FirebaseStudioRepo && npm run typecheck 2>&1 | grep "drills/\[id\]"
```

Expected: no output (pre-existing errors in this file are unrelated to this change — confirm the error count hasn't increased).

- [ ] **Step 4: Commit**

```bash
git add src/app/drills/[id]/page.tsx
git commit -m "fix: add missing PasteSpecialDialog to drill preview"
```

---

## Verification Checklist (run after all tasks complete)

- [ ] `npm run typecheck` — no new errors across all changed files
- [ ] Dev server: open a drill with a **Find/Replace** step — "Find and Replace" title fully visible, not clipped at top; dialog is visually compact
- [ ] Dev server: open a drill with a **Sort** step — "Sort" title fully visible; select dropdowns fit neatly
- [ ] Dev server: open a **Paste Special** drill preview page — dialog renders in preview panel
- [ ] Dev server: open a Paste Special challenge — dialog appears centered, unclipped
- [ ] Dev server: complete a drill step — steps list on the right still scrolls independently
- [ ] Dev server: no dialogs appear unless their corresponding shortcut is actively being demonstrated

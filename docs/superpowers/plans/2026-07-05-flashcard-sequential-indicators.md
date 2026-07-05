# Flashcard Sequential Shortcut Indicators Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On a flipped flashcard, make sequential (ribbon) shortcuts unmistakable with arrow separators in the text row, ordinal number badges on the virtual keyboard, and a short "press one key after another" note.

**Architecture:** Two display-only files change. `visual-keyboard.tsx` gains one optional `sequenceKeys` prop that draws position badges on caps. `flashcard-client-page.tsx` computes `stepIsSequential`, renders `→` between caps, wires `sequenceKeys`, and adds the note. No shortcut-engine or matching logic changes.

**Tech Stack:** Next.js 15, React, TypeScript, Tailwind CSS. No test framework in this repo — verification is `npm run typecheck` + dev-server visual check on `http://localhost:9002`.

## Global Constraints

- No test framework: verify with `npm run typecheck` (grep output for the two changed files — the suite has known pre-existing errors in `challenges/page.tsx`, `drill-ui.tsx`, `scroll-animation.tsx`) plus a dev-server visual check.
- No `any` in new code; use existing types.
- Indicators render only when `isAnswerShown` is `true`.
- Sequential detection is `resolveIsSequential(step, isMac)` from `@/lib/utils` — do not re-derive from `step.isSequential` directly (that ignores the Mac-combo rule).
- On-palette colors only: never `bg-blue-*`/`text-blue-*`. Emerald is primary; the existing Windows-only note stays amber.
- Reuse the shared `KeyDisplay` from `@/components/key-display`; do not redefine key-cap rendering.

---

### Task 1: Add `sequenceKeys` number badges to `VisualKeyboard`

**Files:**
- Modify: `src/components/visual-keyboard.tsx` (prop interface ~L8-17; component body ~L82-137)

**Interfaces:**
- Consumes: local `normalizeKey(key, isMac)` (already defined at L63), `cn` from `@/lib/utils`.
- Produces: `VisualKeyboard` now accepts an optional prop `sequenceKeys?: string[]` (ordered, may contain repeats). When present and non-empty, each rendered key whose normalized name is in the sequence shows a top-right badge with its comma-joined 1-based position(s). Existing highlight behaviour is unchanged when the prop is omitted.

- [ ] **Step 1: Add the prop to the interface**

In the `VisualKeyboardProps` interface (`src/components/visual-keyboard.tsx` ~L8-17), add after the `highlightedKeySets` field:

```ts
  // Ordered keys of a sequential (ribbon) shortcut, e.g. ['alt','h','b'] or
  // ['alt','w','f','f']. When set, caps show a 1-based position badge. Display
  // only — does not affect highlighting (pass highlightedKeySets for colour).
  sequenceKeys?: string[];
```

- [ ] **Step 2: Destructure the prop**

Change the component signature (`~L82`) from:

```ts
export function VisualKeyboard({ highlightedKeys = [], highlightedKeySets, onKeyClick, isMac: isMacProp }: VisualKeyboardProps) {
```

to:

```ts
export function VisualKeyboard({ highlightedKeys = [], highlightedKeySets, sequenceKeys, onKeyClick, isMac: isMacProp }: VisualKeyboardProps) {
```

- [ ] **Step 3: Build the normalized position map**

Immediately after the `normalizedHighlights` line (`~L100`), add:

```ts
    // Normalised key -> 1-based positions in the sequence (repeats accumulate,
    // e.g. ['alt','w','f','f'] gives 'f' => [3, 4]).
    const sequencePositions = new Map<string, number[]>();
    (sequenceKeys ?? []).forEach((k, i) => {
        const nk = normalizeKey(k, isMac);
        const arr = sequencePositions.get(nk) ?? [];
        arr.push(i + 1);
        sequencePositions.set(nk, arr);
    });
```

- [ ] **Step 4: Render the badge inside `renderKey`**

In `renderKey` (`~L112-137`), the returned `<div>` needs `relative` positioning and a badge overlay. Replace the returned JSX with:

```tsx
        const badgePositions = sequencePositions.get(key);

        return (
            <div
                key={key}
                onClick={isClickable ? () => onKeyClick(key) : undefined}
                className={cn(
                    "relative h-full rounded-md flex items-center justify-center text-xs font-medium border-b-2",
                    "transition-colors duration-200",
                    isHighlighted
                        ? highlightClass
                        : "bg-background/60 text-foreground border-border/70",
                    isClickable && "cursor-pointer hover:bg-primary/80 hover:border-primary/60 active:translate-y-px",
                    flexClass
                )}
            >
                <span className="px-0.5 whitespace-nowrap">{display}</span>
                {badgePositions && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-emerald-700 text-white text-[9px] font-bold leading-[14px] text-center shadow-sm">
                        {badgePositions.join(',')}
                    </span>
                )}
            </div>
        );
```

(Only two things changed vs. the original: `relative` added to the className, and the badge `<span>` added after the display span.)

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck 2>&1 | grep visual-keyboard`
Expected: no output (file is clean; ignore unrelated pre-existing errors elsewhere).

- [ ] **Step 6: Commit**

```bash
git add src/components/visual-keyboard.tsx
git commit -m "feat(flashcards): sequenceKeys position badges on VisualKeyboard"
```

---

### Task 2: Wire sequential indicators into the flashcard card

**Files:**
- Modify: `src/components/flashcard-client-page.tsx` (import ~L15; compute ~L116; text row ~L213-222; note ~L224-228; keyboard ~L248)

**Interfaces:**
- Consumes: `resolveIsSequential(step, isMac)` from `@/lib/utils`; `VisualKeyboard`'s new `sequenceKeys` prop from Task 1; existing `displayAlternatives: string[][]` and `stepIsWindowsOnly: boolean`.
- Produces: sequential answered cards render `→` between caps, an emerald "Ribbon shortcut" note, and numbered keyboard badges. Combo cards are visually unchanged.

- [ ] **Step 1: Import `resolveIsSequential`**

In the import from `@/lib/utils` (`~L15`), add `resolveIsSequential`:

```ts
import { getPlatformKeySets, isStepWindowsOnly, getSelectionRangeString, resolveIsSequential } from "@/lib/utils";
```

- [ ] **Step 2: Compute `stepIsSequential`**

Directly after the `stepIsWindowsOnly` line (`~L116`), add:

```ts
    const stepIsSequential = resolveIsSequential(currentFlashcard.step, isMac);
```

- [ ] **Step 3: Render `→` between caps in the text row**

Replace the inner `alt.map(...)` block (`~L218-220`) with a version that inserts a muted arrow between consecutive caps when the step is sequential:

```tsx
                                            {alt.map((key, keyIndex) => (
                                                <div key={`${key}-${keyIndex}`} className="flex items-center gap-1">
                                                    {stepIsSequential && keyIndex > 0 && (
                                                        <span className="text-muted-foreground text-xs mx-0.5">→</span>
                                                    )}
                                                    <KeyDisplay value={key} isMac={isMac} />
                                                </div>
                                            ))}
```

- [ ] **Step 4: Add the sequential note**

Directly after the closing of the `stepIsWindowsOnly` note block (`~L228`, after its `)}`), add a sibling:

```tsx
                                {stepIsSequential && (
                                    <p className="text-xs font-medium text-emerald-700">
                                        Ribbon shortcut — press one key after another
                                    </p>
                                )}
```

- [ ] **Step 5: Pass `sequenceKeys` to the keyboard**

Change the `VisualKeyboard` usage (`~L248`) from:

```tsx
                                 <VisualKeyboard highlightedKeySets={isAnswerShown ? displayAlternatives : []} isMac={isMac} />
```

to:

```tsx
                                 <VisualKeyboard
                                    highlightedKeySets={isAnswerShown ? displayAlternatives : []}
                                    sequenceKeys={isAnswerShown && stepIsSequential ? displayAlternatives[0] : undefined}
                                    isMac={isMac}
                                 />
```

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck 2>&1 | grep flashcard-client-page`
Expected: no output (file is clean).

- [ ] **Step 7: Visual check on the dev server**

Run `npm run dev` (port 9002) if not already running, open a flashcard set, flip cards, and confirm:
- Windows ribbon card (e.g. `Alt → H → B`): arrows between caps in the text row, `1`/`2`/`3` badges on the keyboard, emerald "Ribbon shortcut" note visible.
- Combo card (e.g. `Ctrl+B`): unchanged — no arrows, no badges, no note.
- Repeated-key ribbon step (e.g. `Alt,W,F,F`): the `F` cap badge reads `3,4`.
- A Windows-only ribbon step shows both the amber Windows-only note and the emerald sequential note stacked.
- (If on Mac) a step with `macKeys` shows combo treatment — no sequential indicators.

- [ ] **Step 8: Commit**

```bash
git add src/components/flashcard-client-page.tsx
git commit -m "feat(flashcards): arrows, badges, and note for sequential shortcuts"
```

---

## Self-Review Notes

- **Spec coverage:** trigger rule → Task 2 Step 2; text-row arrows → Task 2 Step 3; keyboard badges → Task 1 + Task 2 Step 5; note → Task 2 Step 4; repeated keys → Task 1 Step 3 (position map) + Task 2 Step 7 verification; edge cases (Mac macKeys, Windows-only on Mac, Fn-expansion) all flow from `resolveIsSequential` + reusing `displayAlternatives[0]`, verified in Task 2 Step 7.
- **Type consistency:** prop named `sequenceKeys: string[]` everywhere; `stepIsSequential: boolean`; `sequencePositions: Map<string, number[]>`. `KeyDisplay` uses its existing `{ value, isMac }` signature.
- **No placeholders:** every code step shows full replacement JSX.

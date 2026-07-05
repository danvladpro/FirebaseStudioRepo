# Flashcard Sequential Shortcut Indicators — Design

**Date:** 2026-07-05
**Scope:** Display-only changes to `src/components/flashcard-client-page.tsx` and
`src/components/visual-keyboard.tsx`. No shortcut-engine or matching changes.

## Problem

In Flashcards, sequential (ribbon) shortcuts — e.g. `Alt → H → B` — render
identically to simultaneous combos. The flipped card shows the required keys
flush and highlights them on the virtual keyboard with no indication that they
must be pressed *one after another* rather than held together. A user cannot
tell a ribbon sequence from a combo.

## Goal

On a flipped flashcard, make sequential shortcuts unmistakable via:

1. Arrow separators between key-caps in the text row.
2. Ordinal number badges on the virtual keyboard keys.
3. A short explanatory note ("Ribbon shortcut — press one key after another").

## When it triggers

A card is sequential when `resolveIsSequential(currentFlashcard.step, isMac)`
returns `true` (from `src/lib/utils.ts`). This helper already encodes the
platform rule: Windows ribbon shortcuts are sequential, but a Mac user viewing
a step that has `macKeys` sees a combo (its Mac equivalent), so no sequential
treatment is applied there. Windows-only steps stay sequential on Mac and fall
back to the Windows sequence.

All indicators render only when `isAnswerShown` is `true`.

Compute once in the component:

```ts
const stepIsSequential = resolveIsSequential(currentFlashcard.step, isMac);
```

`resolveIsSequential` must be added to the existing import from `@/lib/utils`.

## 1. Text row (arrows between keys)

Location: the `displayAlternatives.map(...)` block at
`flashcard-client-page.tsx` ~L213–222.

For sequential steps, interleave a muted `→` separator between the `KeyDisplay`
caps within each alternative. Combos render flush exactly as today. The `"or"`
separator between alternatives is unchanged.

Rendering rule for the inner `alt.map`:
- Sequential: render `KeyDisplay`, and between consecutive caps insert
  `<span className="text-muted-foreground text-xs mx-0.5">→</span>`.
- Combo: unchanged (caps flush with the existing `gap-1`).

The arrow must appear *between* caps only, not before the first or after the
last.

## 2. Virtual keyboard number badges

Add one optional prop to `VisualKeyboard`:

```ts
sequenceKeys?: string[]; // ordered key list, may contain repeats
```

Behaviour:
- When `sequenceKeys` is present and non-empty, each rendered key that appears
  in it gets a small number badge in the top-right corner of the cap showing its
  1-based position(s) in the sequence.
- Repeated keys show comma-joined positions, e.g. `Alt,W,F,F` → the `F` cap
  badge reads `3,4`.
- The existing green highlight (driven by `highlightedKeySets`) is untouched;
  badges layer on top of highlighted keys.
- When `sequenceKeys` is omitted/empty (all combo cards), nothing changes.

Implementation notes:
- Normalise `sequenceKeys` with `normalizeKey(k, isMac)` the same way
  `highlightedKeySets` are normalised, then build a `Map<string, number[]>` of
  normalised key → list of 1-based positions.
- In `renderKey`, look up the (already-normalised) `key` in that map. If found,
  render a badge. The key cap container needs `relative` positioning; the badge
  is absolutely positioned top-right, small (`text-[9px]`/`text-[10px]`),
  readable against the green highlight (e.g. white text on a subtle dark/emerald
  chip, or emerald text on white — pick whatever stays legible on both
  highlighted and unhighlighted caps; badges only appear on highlighted caps in
  practice since sequence keys are always highlighted).
- Badge must not break key-cap layout at the small keyboard sizes — keep it
  compact and absolutely positioned so it doesn't affect flex sizing.

### Wiring from the flashcard page

Pass `sequenceKeys` to `VisualKeyboard` only for sequential answered cards:

```tsx
<VisualKeyboard
  highlightedKeySets={isAnswerShown ? displayAlternatives : []}
  sequenceKeys={isAnswerShown && stepIsSequential ? displayAlternatives[0] : undefined}
  isMac={isMac}
/>
```

`displayAlternatives[0]` is the first (and, for sequential steps, effectively
only) ordered alternative, already run through `expandForDisplay`. Using it
keeps keyboard numbering aligned with the text row and respects the
`MAC_NAV_DISPLAY` Fn-expansion skip that already applies to Windows-only steps.

## 3. Explanatory note

Below the key row, as a sibling to the existing amber Windows-only note
(`flashcard-client-page.tsx` ~L224–228), add for sequential steps:

```tsx
{stepIsSequential && (
  <p className="text-xs font-medium text-emerald-700">
    Ribbon shortcut — press one key after another
  </p>
)}
```

A Windows-only ribbon step (common) shows **both** notes stacked. They convey
different things — platform vs. timing — so this is intended, not redundant.
The sequential note uses emerald (on-palette per project rules); the Windows-only
note keeps its existing amber.

## Edge cases

- **Mac + step with `macKeys`** → combo; no arrows, badges, or note.
- **Mac viewing a Windows-only ribbon step** → sequential treatment on the
  macLayout keyboard; keys still highlight and number.
- **Fn-expansion** (`MAC_NAV_DISPLAY`) is already skipped for Windows-only
  steps, so numbering aligns with the displayed caps.
- **Repeated keys** in a sequence render one badge with comma-joined positions.

## Non-goals

- No change to the shortcut engine, matching logic, or challenge/drill runners.
- No change to combo card rendering.
- No new sequential indicators on Drills/Challenges pages (Flashcards only).

## Verification

- `npm run typecheck` — confirm `flashcard-client-page.tsx` and
  `visual-keyboard.tsx` are clean (grep for these files; the suite has known
  pre-existing errors elsewhere).
- Dev server visual check on `http://localhost:9002`:
  - A Windows ribbon flashcard (`Alt → H → B`) flipped: arrows in text row,
    `1/2/3` badges on keyboard, emerald note present.
  - A combo flashcard (`Ctrl+B`): unchanged — no arrows, no badges, no note.
  - A repeated-key ribbon step (e.g. `Alt,W,F,F`): `F` cap badge reads `3,4`.
  - On Mac, a step with `macKeys`: combo treatment, no sequential indicators.

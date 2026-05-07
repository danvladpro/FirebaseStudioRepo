# Design: Fix Dialog Vertical Clipping + Paste Special Preview Bug

## Problem

### 1. Dialog clipping (Find/Replace, Sort, Paste Special)
All simulated Excel dialogs use `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)` to center over the VisualGrid. They are rendered inside a `relative` wrapper that also wraps `VisualGrid`. This wrapper sits three levels deep inside overflow-clipping ancestors:

```
Card                  overflow-hidden max-h-[90vh]
  CardContent         overflow-hidden              ← clips dialog vertically
    div               overflow-y-auto              ← clips dialog vertically
      grid-cols-2
        div.relative  ← current dialog anchor (grid wrapper)
          [dialogs]
          VisualGrid
```

When a dialog is taller than the VisualGrid panel (Find/Replace: 380px wide, Sort: 480px wide), it overflows above and below the grid wrapper and gets clipped. The result: dialog headers are cut off at the top in screenshots.

### 2. Paste Special missing from drill preview
`src/app/drills/[id]/page.tsx` renders all dialogs in its preview panel EXCEPT `PasteSpecialDialog`. Every other dialog is listed (lines 127–142) but `PasteSpecialDialog` is absent, so Paste Special challenges show nothing in the preview.

---

## Solution

### Fix 1: Lift dialog anchor above the overflow chain

**Move all dialog components out of the `overflow-y-auto` scroll div and make `CardContent` the new `relative` anchor.**

The new structure:

```
Card                  overflow-hidden max-h-[90vh]
  CardContent         relative  (overflow-hidden removed)
    [dialogs here]    absolute top-1/2 left-1/2 -translate ... z-30
    div               overflow-y-auto  (unchanged — still scrolls steps)
      grid-cols-2
        div           (relative removed — no longer dialog anchor)
          VisualGrid
```

Key changes:
- `CardContent` gains `relative`, loses `overflow-hidden`
- The grid wrapper div loses `relative`
- All dialog JSX moves from inside the scroll div to be direct children of `CardContent`, placed before the scroll div
- Dialog components themselves are unchanged — they keep `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20`; bump z-index to `z-30` to ensure they appear above the scroll content

**Trade-off:** Dialog is now centered over the full `CardContent` width (both columns) rather than strictly the grid column. Since the dialogs are already 380–480px wide — as wide as or wider than the grid panel — the visual center barely shifts. The dialog will still appear squarely over the grid area.

**Safety:** The Card's `overflow-hidden max-h-[90vh]` still contains everything. Removing `overflow-hidden` from `CardContent` is safe because the `overflow-y-auto` scroll container inside it already clips its own content independently.

### Fix 2: Add missing PasteSpecialDialog to drill preview

Add `<PasteSpecialDialog state={displayDialogState} />` to `src/app/drills/[id]/page.tsx` in the same dialog block as the other dialogs (after `FillColorDropdown`). Add the import.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/drill-ui.tsx` | `CardContent`: add `relative`, remove `overflow-hidden`. Move all 8 dialog components out of scroll div. Remove `relative` from grid wrapper div. Bump dialog z-index to `z-30`. |
| `src/components/challenge-ui.tsx` | Same pattern as drill-ui. |
| `src/app/drills/[id]/page.tsx` | Add `PasteSpecialDialog` import + JSX in preview panel. |

Dialog component files (`find-replace-dialog.tsx`, `sort-dialog.tsx`, etc.) — **no changes**.

---

## Dialogs Affected

All 8 dialogs rendered in both `drill-ui.tsx` and `challenge-ui.tsx`:
- `FindReplaceDialog`
- `CreateTableDialog`
- `GoToDialog`
- `SortDialog`
- `FormatCellsDialog`
- `FilterDropdown`
- `FillColorDropdown`
- `PasteSpecialDialog`

---

## Verification

- `npm run typecheck` — check `drill-ui.tsx`, `challenge-ui.tsx`, `drills/[id]/page.tsx` for no new errors
- Visual: open a drill with a Find/Replace step — dialog header fully visible, not clipped at top
- Visual: open a drill with a Sort step — "Sort" title fully visible
- Visual: open a Paste Special drill preview — dialog renders in preview panel
- Regression: steps list in drill-ui still scrolls independently (the `overflow-y-auto max-h-80` on the steps list is a separate element and unaffected)

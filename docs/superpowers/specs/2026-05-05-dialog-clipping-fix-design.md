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

Dialog component files — **compact treatment applied to all 6**:

| Dialog | Width: current → compact | Padding changes |
|--------|--------------------------|-----------------|
| `find-replace-dialog.tsx` | 380px → 300px | header `p-2 pl-4` → `p-1.5 pl-2.5`; tab triggers smaller; body `p-4` → `p-2.5`; footer `p-4` → `py-1.5 px-2.5`; inputs `h-10` → `h-7 text-xs` |
| `sort-dialog.tsx` | 480px → 380px | header `p-4` → `p-1.5 pl-2.5`; body `p-4 space-y-4` → `p-2.5 space-y-2`; footer `p-4` → `py-1.5 px-2.5`; select triggers smaller; level buttons `size="sm"` kept |
| `format-cells-dialog.tsx` | 520px → 400px | header `p-2 pl-4` → `p-1.5 pl-2.5`; body `p-4` → `p-2.5`; footer `p-4` → `py-1.5 px-2.5`; category items `py-1 px-2 text-sm` → `py-0.5 px-1.5 text-xs`; inputs `h-7 text-xs` |
| `go-to-dialog.tsx` | 380px → 300px | header `p-4` → `p-1.5 pl-2.5`; body `p-4 space-y-4` → `p-2.5 space-y-2`; footer `p-4` → `py-1.5 px-2.5`; input `h-7 text-xs` |
| `create-table-dialog.tsx` | 380px → 300px | header `p-4` → `p-1.5 pl-2.5`; body `p-4 space-y-4` → `p-2.5 space-y-2`; footer `p-4` → `py-1.5 px-2.5`; input `h-7 text-xs` |
| `paste-special-dialog.tsx` | 420px → 300px | header already compact; body `p-2` → `p-2.5`; section labels (`Paste`, `Operation`) → `text-xs uppercase font-bold tracking-wide text-muted-foreground`; radio items `py-0.5` gap `space-y-0` → tighter; footer `p-2` → `py-1.5 px-2.5` |

**Compact rules applied consistently across all dialogs:**
- Title font: `text-sm font-medium` (unchanged, already small on most)
- Header padding: `p-1.5 pl-2.5` (or `p-1.5 px-2.5` where no left-align needed)
- Body padding: `p-2.5`
- Body spacing: `space-y-2` (was `space-y-4`)
- Footer padding: `py-1.5 px-2.5`
- All `Input` components: add `h-7 text-xs`
- All `Button` components: keep `size="sm"` (already set)
- z-index: bump from `z-20` → `z-30` on the outer Card of each dialog

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

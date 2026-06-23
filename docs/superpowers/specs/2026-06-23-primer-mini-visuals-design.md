# Before-You-Start Primer — Mini-Visuals Design

**Date:** 2026-06-23
**Component:** `src/components/before-you-start.tsx`
**Goal:** Make the keyboard primer *show* what each shortcut does, not just light up the keys. Each section card's example gains a small, looping, key-synced visual: a tiny Excel grid, a tiny dialog, or a tiny ribbon that reacts when the keys "press".

## Motivation

Today each section card shows an `AnimExRow`: the key caps flash (`e.g. [Ctrl] + [→] → Jump to data edge`) but nothing demonstrates the *effect*. Sarah (the QA persona, a finance analyst) learns shortcuts by seeing them act on a grid. The primer should mirror that: selection visibly jumping cells, a dialog's focus hopping fields, the Excel ribbon's Alt KeyTips activating.

## Reusable Primitives

Three small, self-contained, inline-styled components (no dependency on the heavy `visual-grid.tsx`; they match the file's existing bespoke-primitive style and emerald palette `C.primary`). Each is a pure function of an animation `stage` plus an `effect` discriminator. Excel-blue is off-palette — selection/active states use emerald.

### `MiniGrid`
A compact 3–4 col × 2 row grid with column letters (A B C…) + row numbers and a selection highlight. ≈ 150×64px.
`effect`:
- `jump-right` — selection leaps from first cell to the data-edge cell (Ctrl+→ / arrow nav).
- `step-right` — selection moves exactly one cell right (Tab confirm in sheet).
- `cell-bold` — active cell's text turns bold (Ctrl+B).
- `cell-format` — active cell text morphs `0.5` → `50%` (Ctrl+Shift+5).
- `autosum` — a Σ total appears below a column of numbers (Alt+=).

### `MiniDialog`
A tiny dialog frame (title bar + 2–3 fields/options) with a focus ring. ≈ 150×70px.
`effect`:
- `option-down` — highlight moves down a short option list (arrow key in a menu/filter).
- `tab-fields` — focus hops field → field (Tab inside a dialog).

(Note: the earlier `open` effect for Ctrl+1 is dropped — Formatting now uses Ctrl+B on the grid instead.)

### `MiniRibbon`
A compact Excel ribbon: tab strip (Home / Insert) + a few buttons, with Alt **KeyTip** badges (the little letter boxes Excel overlays) animating Alt → H (Home tab) → B (border button lights). Pairs with a small grid cell that receives the border at the final step. Spans the full detail-pane width (≈ full × 90px) since a ribbon needs horizontal room.

## Sync Mechanism

Extend the existing `useExAnimation` into a shared timeline hook that returns:
- `keyPhase` — unchanged semantics, so the key caps flash exactly as today (combo: `0` during a 320ms window each 2300ms cycle; sequence: steps `0,1,2,…` then `-1`).
- `stage` — a semantic state the visuals read: `idle → pressed → result → hold → reset`.

Both the key row and the mini-visual read the same `requestAnimationFrame` clock, so they're frame-synced. For **combos**, the visual `result` *persists* ~1.5s after the 320ms key flash so the outcome is actually visible before the loop resets. For **sequences** (Alt H B), each key step advances the ribbon (KeyTips → Home tab → border button), and the border lands on the grid cell at the final step.

## Data Model

Add an optional field to the `Example` interface:

```ts
type VisualSpec =
  | { kind: "grid"; effect: "jump-right" | "step-right" | "cell-bold" | "cell-format" | "autosum" }
  | { kind: "dialog"; effect: "option-down" | "tab-fields" }
  | { kind: "ribbon" };

interface Example {
  keys: string[];
  mode: AnimMode;
  action: string;
  visual?: VisualSpec; // NEW
}
```

`AnimExRow` renders the key caps as today, and if `visual` is present, renders the matching primitive. Layout: the visual sits **to the right of the key/action row on one line** when it fits the ~240px card (grid + dialog). The **Alt ribbon** card spans the full detail-pane width and renders its visual **below** the key row.

## Section → Visual Mapping

Effects that can't read at small size are intentionally left key-row-only (no forced/confusing visual).

| Section | Card | Example keys / action | Visual |
|---|---|---|---|
| **Ctrl** | Navigation | `Ctrl + →` → Jump to data edge | `grid jump-right` |
| | Formatting | **changed:** `Ctrl + B` → Bold | `grid cell-bold` |
| | Everything else | `Ctrl + Z` → Undo | *(skip)* |
| **Alt** | Ribbon mode | `Alt → H → B` → Add cell border | `ribbon` (full-width card) |
| | Direct combos | `Alt + =` → AutoSum | `grid autosum` |
| **Arrows** | Move worksheet | `Ctrl + →` → Jump to last cell | `grid jump-right` |
| | Move in menus | `↓` → Move down an option | `dialog option-down` |
| **Numbers** | Formatting | `Ctrl + ⇧ + 5` → Apply % format | `grid cell-format` |
| **Fn** | Standalone | `F4` | *(skip — abstract small)* |
| | Combo | `⇧ + F11` | *(skip — abstract small)* |
| **Esc·Enter·Tab** | In dialogs | `Tab` → Move to next field | `dialog tab-fields` |
| | In spreadsheet | `Tab` → Confirm, move 1 cell right | `grid step-right` |
| **Mac** | — | *(unchanged — no visuals)* |

Fn visuals are tentatively skipped; if `step-right`/`open` reads acceptably while building, one may be added, but the safe fallback is key-row-only.

## Layout / Sizing Rules

- Grid & dialog visuals: inline to the right of the example row (one line). The `SectionCards` example block flexes to fit both.
- Ribbon: its section card becomes full-width (single column) within the `SectionCards` auto-fit grid; visual renders below the key row.
- All sizing kept tight per the "mindful of space" requirement; the modal stays `maxHeight: 90vh` with the detail pane scrolling as today.
- Styling reuses `C.primary` / `C.primarySoft` and the existing `Kbd`/`AKbd` look. No `bg-blue-*` / Excel-blue.

## Scope / Non-Goals

- No change to read-tracking, Firestore `primerCompleted`, nav, footer, or launcher card.
- No new dependencies; pure inline-styled SVG/DOM primitives.
- Mac and the two skipped cards (Undo, Fn) remain key-row-only.
- Reduced-motion: primitives should respect `prefers-reduced-motion` by holding the result state (no looping) — to confirm during implementation.

## Verification

No test framework. Verify via `npm run typecheck` (confirm `before-you-start.tsx` is clean — it is not in the known pre-existing-error list) and visual check on the dashboard at `localhost:9002` → open the primer, step through every section, confirm each visual loops in sync with its keys and reads clearly at card size.

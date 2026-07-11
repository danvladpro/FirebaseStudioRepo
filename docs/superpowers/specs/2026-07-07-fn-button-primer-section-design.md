# Fn Button — "Before you start" primer section

**Date:** 2026-07-07
**Component:** `src/components/before-you-start.tsx` (plus two small edits elsewhere)
**Status:** Approved design, ready for implementation plan

## Goal

Add a new primer section that explains the **Fn modifier button** — the key that
lets compact / laptop keyboards fire navigation keys (Home, Page Up, Page Down)
they have no dedicated cap for. Separately, remove the unused **Insert** option
from the "missing keys" lists, since no challenge or drill uses Insert.

This is distinct from the existing `fn` item ("Function keys", F1–F12) and from
the Mac section's "Fn for navigation" subsection (which stays as-is — it is
Mac-specific; the new section is general to any compact keyboard).

## Part 1 — New primer section

### Data item

Add a new `ItemData` to `BYS_DATA`, inserted **immediately after** the existing
`fn` (Function keys) item.

- `id: "fnmod"` — new; add to the `ItemId` union. (`"fn"` is already taken by
  Function keys.)
- `label: "Fn button"`
- `hint: "Reaching Home & Page keys"`
- `title: "The Fn button"`
- `sub:` one line — many compact / laptop keyboards have no dedicated
  Home / Page Up / Page Down keys, but almost all can still fire them via **Fn**.
- Rendered via a custom `body: <FnModBody variant={FNMOD_VARIANT} />` (mirrors
  `HowToUseBody` / `HowToLearnBody`), because subsection 3 is non-standard.

`TOTAL`, the left nav list, the footer progress dots, and the launcher-card ring
all derive from `BYS_DATA` and update automatically. `TOTAL` becomes 11.

### `FnModBody` layout (top → bottom)

1. **"Check your keyboard" intro card.** A small physical-key illustration: a
   bottom-row keycap cluster (`Ctrl` `Fn` `Alt`) where the **Fn cap is rendered
   smaller and in the amber "special key" tint** (`C.amberSoft` / `C.amberFg`,
   the same accent `KeyTip` uses). Caption: "usually smaller, often a different
   colour." This is the one genuinely new visual primitive
   (`PhysicalFnKeyIllustration`).

2. **Three mini-subsection cards** styled like `OrientCard` / `SectionCards`,
   each with a label + one-line description:
   - **Standard keyboard** → `Ctrl + Page Up`, shown with the reused
     `AnimExRow` combo blink (`mode: "combo"`) — identical blink to every other
     section.
   - **Via Fn button** → `Ctrl + Fn + Page Up`, same combo blink; the Fn cap
     carries the amber tint to tie back to the illustration.
   - **Doesn't exist at all** → see variants below.

### "Doesn't exist at all" — two build variants

Controlled by a module-level `const FNMOD_VARIANT: "full" | "text" = ...` (same
pattern as `NEW_PAGE_VARIANT`). The user flips this const to choose; both are
built. **Nothing is clickable in either variant — animation only.**

- **`"full"`**: a settings chip reading **"Settings → Missing Keys"** + an
  **animated, non-interactive** mini on-screen keyboard (`MiniVirtualKeyboard`)
  that cycles a highlight / tap-pulse on the `Page Up` cap while `Ctrl` shows as
  held — illustrating the hybrid (Ctrl held on the physical keyboard, Page Up
  "clicked" on-screen). No `onClick` handlers anywhere.
- **`"text"`**: the same three points (indicate the missing key in settings →
  the virtual keyboard appears → you can hold a physical key and tap the rest
  on-screen) in prose with `Kbd` keycaps, no keyboard illustration.

### Copy accuracy anchors (verified against code)

- Settings label is exactly **"Missing Keys"**, reached via the avatar menu →
  **Settings** (`edit-profile-modal.tsx`).
- The live on-screen keyboard's real header is **"Virtual Keyboard — Click to
  press"** (`challenge-ui.tsx`) — primer copy echoes that phrasing so it is
  recognisable when the user hits it for real.
- **Insert must not appear** in any primer copy.

### Reuse / non-functional

Reuses `useExAnimation`, `usePhaseLoop`, `AKbd`, `Kbd`, and the `C` palette, so
reduced-motion handling and visual consistency come for free. Emerald/amber
palette only — no blue (`bg-blue-*` is off-palette per project rules).

## Part 2 — Remove the unused "Insert" option

`Insert` is offered as a "missing key" but is never required by any challenge or
drill, so selecting it does nothing. Remove it from both option lists:

- `src/components/edit-profile-modal.tsx:21` — `availableKeys` array.
- `src/app/survey/page.tsx:58` — the `missingKeys` question `options` array.

No migration needed: `missingKeys` is a free-form `string[]` on the user
profile; a stale stored `"Insert"` is simply ignored (nothing reads it). No
other code branches on the `Insert` value.

## Out of scope

- The existing `fn` (Function keys) and Mac "Fn for navigation" sections are
  unchanged.
- No change to the shortcut engine, the real virtual-keyboard behaviour, or the
  `missingKeys` data model.

## Verification

- `npm run typecheck` — confirm `before-you-start.tsx`, `edit-profile-modal.tsx`,
  and `survey/page.tsx` are clean (file has known pre-existing errors elsewhere).
- Dev server visual check at `/` → open the primer → new "Fn button" section
  renders after "Function keys"; both `FNMOD_VARIANT` values render correctly;
  Insert no longer listed in survey or Settings.

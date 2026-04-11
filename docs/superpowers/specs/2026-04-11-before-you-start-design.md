# Before You Start — Design Spec

**Date:** 2026-04-11  
**Feature:** General Knowledge / "Before You Start" section on the Dashboard  
**Status:** Approved by user

---

## Overview

Add a new "Before You Start" section to the dashboard, placed immediately **before** the Apprentice/Master/Ninja challenge level cards. The section teaches users the five conceptual pillars they need to understand before practising shortcuts — specifically addressing the browser-vs-Excel confusion and key modifier semantics.

---

## Placement

- Inside `src/components/home-page-client.tsx`
- Rendered in the `lg:col-span-3` main content `<section>` column
- Positioned **above** the `levelOrder.map(...)` loop that renders challenge cards
- Always visible — no premium gate, no lock state

---

## Section Header

```
🚀  Before You Start          [5 key concepts] badge (emerald green)
```

Uses the same `<Card>` + `<CardHeader>` + `<CardContent>` structure as the existing level cards for visual consistency.

---

## Tile Grid

5 icon tiles in a single row (`grid-cols-5`), each clickable:

| # | Icon | Label | Theme |
|---|------|-------|-------|
| 1 | ⌃ | Ctrl / Cmd | Default (emerald hover) |
| 2 | ⌥ | Alt Key | Default (emerald hover) |
| 3 | ↕↔ | Arrow Keys | Default (emerald hover) |
| 4 | 🔢 | Number Keys | Default (emerald hover) |
| 5 | 🚫 | No-Go Shortcuts | Warning (amber border/bg, orange hover) |

Active tile gets an emerald ring (`border-primary`, `bg-primary/10`). The No-Go tile uses amber/orange accent colours at rest and on active state.

---

## Expand-in-Place Panel

Clicking a tile toggles an **animated expand panel** that appears directly below the full 5-tile grid row (not a modal dialog, not below the individual tile). Only one panel is open at a time. Clicking the active tile (or the ✕ button) closes it.

Animation: inline `style={{ maxHeight, opacity }}` toggled via React state — Tailwind cannot generate dynamic `max-h` values at runtime. No JS animation library needed.

### Panel 1 — Ctrl / Cmd

**Header:** "Ctrl (Windows) / Cmd ⌘ (Mac)" — The workhorse modifier

Three example groups, each with labelled chips (`kbd` + action text):

- **Ctrl + Arrows — Navigation**
  - Ctrl+→ → Jump to last filled cell in row
  - Ctrl+↓ → Jump to bottom of data column
  - Ctrl+Home → Go to cell A1
  - Ctrl+End → Go to last used cell

- **Ctrl + Numbers — Formatting**
  - Ctrl+1 → Open Format Cells dialog
  - Ctrl+5 → Strikethrough

- **Ctrl + Letters — Everything else**
  - Ctrl+B → Bold
  - Ctrl+C → Copy
  - Ctrl+Z → Undo
  - Ctrl+Shift+L → Toggle AutoFilter

**Tip box:** On Mac, swap Ctrl for Cmd ⌘ in almost every shortcut.

---

### Panel 2 — Alt Key

**Header:** "Alt Key — Two Modes, One Key"

Two example groups:

- **Mode 1 — Sequential Ribbon Navigation** (press one at a time)
  - Alt then H then B → Add cell border
  - Alt then H then H → Highlight color
  - Alt then N then V → Insert PivotTable

- **Mode 2 — Direct Combos** (hold Alt + press)
  - Alt+= → AutoSum selected range
  - Alt+Enter → New line inside cell
  - Alt+F1 → Insert chart

**Tip box:** Press Alt alone first — key tips appear on the ribbon. Then press the letters shown one by one.

---

### Panel 3 — Arrow Keys

**Header:** "Arrow Keys — Navigation Powerhouse"

Three example groups:

- **Alone — Basic movement**
  - → → Move one cell right
  - ↓ → Move one cell down

- **Ctrl + Arrow — Jump to data edge**
  - Ctrl+→ → Jump to last filled cell in row
  - Ctrl+↓ → Jump to bottom of filled column

- **Shift + Arrow — Extend selection**
  - Shift+→ → Extend selection right by 1 cell
  - Ctrl+Shift+↓ → Extend selection to data edge

**Tip box:** Ctrl+Shift+Arrow is essential for selecting entire columns of financial data without a mouse.

---

### Panel 4 — Number Keys

**Header:** "Number Keys — Mostly Formatting"

Two example groups:

- **Ctrl + Number — Format shortcuts**
  - Ctrl+1 → Open Format Cells dialog
  - Ctrl+Shift+1 → Number format (2 decimals)
  - Ctrl+Shift+4 → Currency format ($)
  - Ctrl+Shift+5 → Percentage format (%)
  - Ctrl+5 → Strikethrough text

- **Numpad — Usually just entering values**
  - Numpad numbers behave the same as top-row for data entry

**Tip box:** If a challenge uses a number key, it's almost certainly formatting.

---

### Panel 5 — No-Go Shortcuts ⚠️

**Header (red):** "No-Go Shortcuts — These Affect Your Browser!"  
**Sub:** "Excel Ninja is a website. Some shortcuts don't simulate Excel — they act on Chrome/Firefox/Edge."

Four warning cards (red border/bg):

| Shortcut | What it does in browser | What Excel users expect |
|----------|-------------------------|------------------------|
| Ctrl+W | Closes the browser tab (loses progress) | Close current workbook |
| Ctrl+T | Opens a new browser tab | Create a table |
| Ctrl+N | Opens a new browser window | Create a new workbook |
| F5 / Ctrl+R | Reloads the page (loses challenge progress) | F5 = Go To dialog |

**Warning box (amber):** "Excel Ninja simulates Excel inside a browser tab. The tab system you see is part of the app — it's not real Excel. Shortcuts that interact with browser tabs or windows bypass the simulation entirely."

---

## Component Architecture

New file: `src/components/before-you-start.tsx`

- Self-contained client component (`"use client"`)
- Manages `activePanel: string | null` state locally
- No props needed (no data dependencies, no auth gate)
- Exports a single `<BeforeYouStart />` component

`home-page-client.tsx` imports and renders `<BeforeYouStart />` above the `levelOrder.map(...)` block.

---

## Styling Rules

- Follows existing Tailwind + shadcn/ui patterns — uses `<Card>`, `<CardHeader>`, `<CardContent>` from `@/components/ui/card`
- Primary colour (emerald): active tile border and ring, tip boxes
- Warning colour (amber/orange): No-Go tile at rest and active
- Danger (red): No-Go panel warning cards
- `kbd` elements styled with dark background + monospace font to show keyboard keys clearly
- Panel expand animation via Tailwind `transition-all` on `max-h` (or inline style toggle)
- No new dependencies required

---

## Out of Scope

- No user progress tracking for this section (it's informational only)
- No premium gate
- No mobile-specific layout changes (app is desktop-first per CLAUDE.md)
- No i18n / localisation

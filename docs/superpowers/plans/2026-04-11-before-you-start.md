# Before You Start — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Before You Start" section to the dashboard with 5 clickable tiles that expand inline panels explaining key modifier concepts and browser-trap shortcuts.

**Architecture:** A new self-contained client component `BeforeYouStart` manages its own `activePanel` state and renders inside `HomePageClient` above the existing challenge level cards. No data dependencies, no auth gate, no new packages.

**Tech Stack:** Next.js 15, TypeScript 5, Tailwind CSS 3, shadcn/ui (Card, Badge, CardHeader, CardContent from `@/components/ui/card`), Lucide React (X icon for close button).

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| **Create** | `src/components/before-you-start.tsx` | All tile + panel UI, local state, content data |
| **Modify** | `src/components/home-page-client.tsx` | Import + render `<BeforeYouStart />` above level cards |

---

## Task 1: Create the `BeforeYouStart` component skeleton

**Files:**
- Create: `src/components/before-you-start.tsx`

- [ ] **Step 1.1 — Create the file with the tile grid (no panels yet)**

Create `src/components/before-you-start.tsx` with this exact content:

```tsx
"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PanelId = "ctrl" | "alt" | "arrows" | "numbers" | "nogo";

interface Tile {
  id: PanelId;
  icon: string;
  label: string;
  warn?: boolean;
}

const TILES: Tile[] = [
  { id: "ctrl",    icon: "⌃",   label: "Ctrl / Cmd" },
  { id: "alt",     icon: "⌥",   label: "Alt Key" },
  { id: "arrows",  icon: "↕↔",  label: "Arrow Keys" },
  { id: "numbers", icon: "🔢",  label: "Number Keys" },
  { id: "nogo",    icon: "🚫",  label: "No-Go Shortcuts", warn: true },
];

export function BeforeYouStart() {
  const [activePanel, setActivePanel] = React.useState<PanelId | null>(null);

  function toggle(id: PanelId) {
    setActivePanel(prev => (prev === id ? null : id));
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold flex items-center gap-2">
          🚀 Before You Start
        </h2>
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 font-semibold text-xs">
          5 key concepts
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-4">
        {/* Tile grid */}
        <div className="grid grid-cols-5 gap-3">
          {TILES.map((tile) => (
            <button
              key={tile.id}
              onClick={() => toggle(tile.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 text-center transition-all duration-150 select-none cursor-pointer",
                tile.warn
                  ? activePanel === tile.id
                    ? "border-orange-500 bg-orange-50 shadow-[0_0_0_3px_rgba(249,115,22,0.2)]"
                    : "border-amber-300 bg-amber-50 hover:border-orange-400 hover:shadow-md hover:-translate-y-0.5"
                  : activePanel === tile.id
                    ? "border-primary bg-primary/10 shadow-[0_0_0_3px_rgba(22,163,74,0.15)]"
                    : "border-border bg-muted/40 hover:border-primary hover:bg-primary/5 hover:shadow-md hover:-translate-y-0.5"
              )}
            >
              <span className="text-2xl leading-none">{tile.icon}</span>
              <span className={cn(
                "text-xs font-bold leading-tight",
                tile.warn ? "text-orange-700" : "text-foreground"
              )}>
                {tile.label}
              </span>
            </button>
          ))}
        </div>

        {/* Expand panel — rendered below tile grid */}
        <div
          style={{
            maxHeight: activePanel ? "600px" : "0px",
            opacity: activePanel ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 0.3s ease, opacity 0.25s ease",
            marginTop: activePanel ? "16px" : "0px",
          }}
        >
          {activePanel && <PanelContent id={activePanel} onClose={() => setActivePanel(null)} />}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Placeholder — panels added in Task 2 ──
function PanelContent({ id, onClose }: { id: PanelId; onClose: () => void }) {
  return (
    <div className="rounded-lg border p-4 bg-muted/30">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">Panel: {id}</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-sm text-muted-foreground">Content coming in Task 2.</p>
    </div>
  );
}
```

- [ ] **Step 1.2 — Wire it into the dashboard**

Open `src/components/home-page-client.tsx`.

Add the import after the existing import block (around line 24):
```tsx
import { BeforeYouStart } from "./before-you-start";
```

Inside the `<section className="lg:col-span-3 space-y-8">` (line 354), add `<BeforeYouStart />` as the **first child**, before the `{(levelOrder as ChallengeLevel[]).map(...)}` call:

```tsx
<section className="lg:col-span-3 space-y-8">
    <BeforeYouStart />
    {(levelOrder as ChallengeLevel[]).map(level => {
```

- [ ] **Step 1.3 — Type-check**

```bash
npm run typecheck
```

Expected: no errors related to `before-you-start.tsx` or `home-page-client.tsx`.

- [ ] **Step 1.4 — Visual check**

```bash
npm run dev
```

Open http://localhost:9002/dashboard. Confirm:
- "🚀 Before You Start" card appears above the Apprentice level card
- 5 tiles render in a row
- Clicking a tile shows the placeholder panel with the panel ID
- Clicking again (or the ✕) collapses it
- Only one panel is open at a time

- [ ] **Step 1.5 — Commit**

```bash
git add src/components/before-you-start.tsx src/components/home-page-client.tsx
git commit -m "feat: add BeforeYouStart component skeleton with tile grid"
```

---

## Task 2: Build the five panel content components

**Files:**
- Modify: `src/components/before-you-start.tsx`

Replace the placeholder `PanelContent` function and add the shared sub-components. All changes are within `before-you-start.tsx`.

- [ ] **Step 2.1 — Add shared sub-components above `BeforeYouStart`**

Add these helper components to `src/components/before-you-start.tsx`, **above** the `BeforeYouStart` function and **below** the `TILES` constant:

```tsx
// ── Shared panel sub-components ──

function PanelShell({
  icon,
  title,
  subtitle,
  warn,
  onClose,
  children,
}: {
  icon: string;
  title: string;
  subtitle: string;
  warn?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(
      "rounded-lg border overflow-hidden",
      warn ? "border-amber-300 bg-amber-50/50" : "border-border bg-muted/20"
    )}>
      <div className={cn(
        "flex items-start gap-3 p-3 border-b",
        warn ? "border-amber-300 bg-amber-50" : "border-border bg-card"
      )}>
        <span className="text-xl leading-none mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className={cn("font-bold text-sm", warn && "text-orange-800")}>{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground flex-shrink-0 mt-0.5"
          aria-label="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

function ExampleGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
        {label}
        <span className="flex-1 h-px bg-border" />
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ keys, action }: { keys: string[]; action: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-card text-xs font-medium text-foreground">
      {keys.map((k, i) => (
        <kbd
          key={i}
          className="font-mono font-bold text-[11px] bg-slate-800 text-slate-50 px-1.5 py-0.5 rounded"
        >
          {k}
        </kbd>
      ))}
      <span className="text-muted-foreground">→</span>
      <span>{action}</span>
    </span>
  );
}

function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 items-start p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 leading-relaxed">
      <span className="flex-shrink-0 mt-0.5">💡</span>
      <span>{children}</span>
    </div>
  );
}

function NoGoCard({ shortcut, browserEffect, excelMeaning }: {
  shortcut: string;
  browserEffect: string;
  excelMeaning: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border-2 border-red-200 bg-red-50">
      <span className="text-base flex-shrink-0 mt-0.5">❌</span>
      <div>
        <p className="text-sm font-bold text-red-800">{shortcut}</p>
        <p className="text-xs text-red-700 mt-0.5">
          <strong>Browser:</strong> {browserEffect}
        </p>
        <p className="text-xs text-red-600">
          <strong>Excel:</strong> {excelMeaning}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2.2 — Replace the placeholder `PanelContent` with the real one**

Delete the old `PanelContent` placeholder and replace it with:

```tsx
function PanelContent({ id, onClose }: { id: PanelId; onClose: () => void }) {
  switch (id) {
    case "ctrl":
      return (
        <PanelShell
          icon="⌃"
          title="Ctrl (Windows) / Cmd ⌘ (Mac)"
          subtitle="The workhorse modifier — nearly every shortcut starts here"
          onClose={onClose}
        >
          <ExampleGroup label="Ctrl + Arrows — Navigation">
            <Chip keys={["Ctrl", "→"]} action="Jump to last filled cell in row" />
            <Chip keys={["Ctrl", "↓"]} action="Jump to bottom of data column" />
            <Chip keys={["Ctrl", "Home"]} action="Go to cell A1" />
            <Chip keys={["Ctrl", "End"]} action="Go to last used cell" />
          </ExampleGroup>
          <ExampleGroup label="Ctrl + Numbers — Formatting">
            <Chip keys={["Ctrl", "1"]} action="Open Format Cells dialog" />
            <Chip keys={["Ctrl", "5"]} action="Strikethrough" />
          </ExampleGroup>
          <ExampleGroup label="Ctrl + Letters — Everything else">
            <Chip keys={["Ctrl", "B"]} action="Bold" />
            <Chip keys={["Ctrl", "C"]} action="Copy" />
            <Chip keys={["Ctrl", "Z"]} action="Undo" />
            <Chip keys={["Ctrl", "Shift", "L"]} action="Toggle AutoFilter" />
          </ExampleGroup>
          <TipBox>
            On Mac, swap <strong>Ctrl</strong> for <strong>Cmd ⌘</strong> in almost every shortcut. Option ⌥ replaces Alt.
          </TipBox>
        </PanelShell>
      );

    case "alt":
      return (
        <PanelShell
          icon="⌥"
          title="Alt Key — Two Modes, One Key"
          subtitle="Alt can start a ribbon walkthrough OR fire a direct shortcut"
          onClose={onClose}
        >
          <ExampleGroup label="Mode 1 — Sequential Ribbon Navigation (press one at a time)">
            <Chip keys={["Alt", "H", "B"]} action="Add cell border" />
            <Chip keys={["Alt", "H", "H"]} action="Highlight color" />
            <Chip keys={["Alt", "N", "V"]} action="Insert PivotTable" />
          </ExampleGroup>
          <ExampleGroup label="Mode 2 — Direct Combos (hold Alt + press)">
            <Chip keys={["Alt", "="]} action="AutoSum selected range" />
            <Chip keys={["Alt", "Enter"]} action="New line inside cell" />
            <Chip keys={["Alt", "F1"]} action="Insert chart" />
          </ExampleGroup>
          <TipBox>
            Press <strong>Alt alone</strong> first — key tips appear on the ribbon. Then press the letters shown one by one. Sequential shortcuts are the most powerful shortcut system in Excel.
          </TipBox>
        </PanelShell>
      );

    case "arrows":
      return (
        <PanelShell
          icon="↕↔"
          title="Arrow Keys — Navigation Powerhouse"
          subtitle="Alone, with Shift, or with Ctrl — each combination does something different"
          onClose={onClose}
        >
          <ExampleGroup label="Alone — Basic movement">
            <Chip keys={["→"]} action="Move one cell right" />
            <Chip keys={["↓"]} action="Move one cell down" />
          </ExampleGroup>
          <ExampleGroup label="Ctrl + Arrow — Jump to data edge">
            <Chip keys={["Ctrl", "→"]} action="Jump to last filled cell in row" />
            <Chip keys={["Ctrl", "↓"]} action="Jump to bottom of filled column" />
          </ExampleGroup>
          <ExampleGroup label="Shift + Arrow — Extend selection">
            <Chip keys={["Shift", "→"]} action="Extend selection right by 1 cell" />
            <Chip keys={["Ctrl", "Shift", "↓"]} action="Extend selection to data edge" />
          </ExampleGroup>
          <TipBox>
            <strong>Ctrl+Shift+Arrow</strong> is essential for selecting entire columns of financial data instantly — no mouse needed.
          </TipBox>
        </PanelShell>
      );

    case "numbers":
      return (
        <PanelShell
          icon="🔢"
          title="Number Keys — Mostly Formatting"
          subtitle="In shortcut combos, numbers almost always apply cell formatting"
          onClose={onClose}
        >
          <ExampleGroup label="Ctrl + Number — Format shortcuts">
            <Chip keys={["Ctrl", "1"]} action="Open Format Cells dialog" />
            <Chip keys={["Ctrl", "Shift", "1"]} action="Number format (2 decimals)" />
            <Chip keys={["Ctrl", "Shift", "4"]} action="Currency format ($)" />
            <Chip keys={["Ctrl", "Shift", "5"]} action="Percentage format (%)" />
            <Chip keys={["Ctrl", "5"]} action="Strikethrough text" />
          </ExampleGroup>
          <ExampleGroup label="Numpad — Usually just entering values">
            <Chip keys={["Numpad 0–9"]} action="Same as top-row numbers for data entry" />
          </ExampleGroup>
          <TipBox>
            If a shortcut challenge uses a number key, it's almost certainly formatting — think currency, percentage, or opening the Format Cells dialog.
          </TipBox>
        </PanelShell>
      );

    case "nogo":
      return (
        <PanelShell
          icon="🚫"
          title="No-Go Shortcuts — These Affect Your Browser!"
          subtitle="Excel Ninja is a website. Some shortcuts don't simulate Excel — they act on Chrome/Firefox/Edge."
          warn
          onClose={onClose}
        >
          <div className="space-y-2">
            <NoGoCard
              shortcut="Ctrl + W"
              browserEffect="Closes your browser tab — and your progress"
              excelMeaning="Close current workbook"
            />
            <NoGoCard
              shortcut="Ctrl + T"
              browserEffect="Opens a new browser tab"
              excelMeaning="Create a table"
            />
            <NoGoCard
              shortcut="Ctrl + N"
              browserEffect="Opens a new browser window"
              excelMeaning="Create a new workbook"
            />
            <NoGoCard
              shortcut="F5 / Ctrl + R"
              browserEffect="Reloads the page — you lose challenge progress"
              excelMeaning="F5 = Go To dialog"
            />
          </div>
          <div className="flex gap-2 items-start p-3 bg-amber-50 border-2 border-amber-300 rounded-lg text-xs text-amber-900 leading-relaxed">
            <span className="flex-shrink-0 mt-0.5">⚠️</span>
            <span>
              <strong>Remember:</strong> Excel Ninja simulates Excel inside a browser tab. The tab system you see is part of the app — it&apos;s not real Excel. Shortcuts that interact with browser tabs or windows bypass the simulation entirely.
            </span>
          </div>
        </PanelShell>
      );
  }
}
```

- [ ] **Step 2.3 — Type-check**

```bash
npm run typecheck
```

Expected: zero errors.

- [ ] **Step 2.4 — Visual check in browser**

Open http://localhost:9002/dashboard (dev server should still be running from Task 1 — if not, run `npm run dev`).

Check each tile:
- **⌃ Ctrl/Cmd**: 3 example groups visible, tip box visible, Mac note present
- **⌥ Alt**: Mode 1 sequential (3 examples), Mode 2 direct (3 examples), tip box
- **↕↔ Arrows**: 3 groups (alone, Ctrl+Arrow, Shift+Arrow), tip box
- **🔢 Numbers**: formatting chips including Ctrl+Shift+4 for $, tip box
- **🚫 No-Go**: 4 red warning cards (W, T, N, F5/R), amber warning box at bottom

Also verify:
- Clicking an open tile closes the panel (toggle behaviour)
- Clicking ✕ closes the panel
- Opening tile 2 while tile 1 is open: tile 1 panel closes, tile 2 opens
- No-Go tile is amber at rest, orange when active (not the green theme)
- Panel expand/collapse animation is smooth (no layout jump)

- [ ] **Step 2.5 — Commit**

```bash
git add src/components/before-you-start.tsx
git commit -m "feat: add full panel content for all 5 Before You Start tiles"
```

---

## Task 3: Polish & edge-case hardening

**Files:**
- Modify: `src/components/before-you-start.tsx`

- [ ] **Step 3.1 — Keyboard accessibility: close panel on Escape**

Add a `useEffect` inside `BeforeYouStart` (after the `useState` line) that listens for Escape and closes the active panel:

```tsx
React.useEffect(() => {
  if (!activePanel) return;
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") setActivePanel(null);
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [activePanel]);
```

- [ ] **Step 3.2 — Verify Escape closes panel**

In the browser, open any tile panel and press Escape. The panel should collapse.

- [ ] **Step 3.3 — Type-check one final time**

```bash
npm run typecheck
```

Expected: zero errors.

- [ ] **Step 3.4 — Lint check**

```bash
npm run lint
```

Expected: no new lint errors from the two files touched.

- [ ] **Step 3.5 — Final visual QA (Sarah persona)**

As Sarah (finance analyst, daily Excel user, zero tolerance for broken UX):

1. Load http://localhost:9002/dashboard — confirm the "Before You Start" card sits cleanly above the Apprentice card, same visual weight as other level cards.
2. Click No-Go tile first — it's the highest-stakes content. Confirm red cards render, amber warning box is readable, and the orange active state is visually distinct from the green tiles.
3. Click Ctrl/Cmd — confirm `kbd` chips are dark + legible. Confirm the "Mac swap" tip is visible.
4. Click Alt — confirm the "two modes" distinction is clear. Sequential vs direct combos should feel distinct.
5. Click Arrows — confirm Ctrl+Shift+↓ chip shows all 3 keys.
6. Click Numbers — confirm $ and % format chips are present.
7. Rapidly click between tiles — no ghost panels, no layout thrash.
8. Scroll down past the section — challenge cards below are unaffected.

- [ ] **Step 3.6 — Commit**

```bash
git add src/components/before-you-start.tsx
git commit -m "feat: add Escape key handler to close Before You Start panel"
```

---

## Self-Review

### Spec coverage check

| Spec requirement | Covered by |
|-----------------|------------|
| Placed before challenge level cards | Task 1.2 — wired above `levelOrder.map` |
| Same Card structure as level cards | Task 1.1 — uses `<Card>` + `<CardHeader>` + `<CardContent>` |
| 5 icon tiles in grid-cols-5 | Task 1.1 |
| No-Go tile amber/orange theme at rest | Task 1.1 — `border-amber-300 bg-amber-50` |
| Active tile emerald ring | Task 1.1 — `border-primary bg-primary/10 shadow` |
| No-Go active tile orange ring | Task 1.1 — `border-orange-500 shadow-orange` |
| Expand panel below full tile row | Task 1.1 — single `<div>` below the grid |
| One panel open at a time | Task 1.1 — `toggle` replaces old state |
| ✕ close button | Task 2.1 — `PanelShell` header |
| Ctrl panel: 3 groups + Mac tip | Task 2.2 `case "ctrl"` |
| Alt panel: Mode 1 sequential + Mode 2 direct | Task 2.2 `case "alt"` |
| Arrows panel: alone / Ctrl+Arrow / Shift+Arrow | Task 2.2 `case "arrows"` |
| Numbers panel: Ctrl+Shift+4 ($), Ctrl+Shift+5 (%) | Task 2.2 `case "numbers"` |
| No-Go: 4 red cards + amber warning box | Task 2.2 `case "nogo"` |
| Escape key closes panel | Task 3.1 |
| No new dependencies | confirmed — only Lucide X (already in project) |
| Always visible, no premium gate | confirmed — `<BeforeYouStart />` renders unconditionally |

All spec requirements covered. ✓

"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PanelId = "ctrl" | "alt" | "arrows" | "numbers" | "fn" | "special" | "nogo";

interface Tile {
  id: PanelId;
  label: string;
  warn?: boolean;
  icon: React.ReactNode;
}

function FourWayArrow() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 12px)",
        gridTemplateRows: "repeat(3, 12px)",
        fontSize: "13px",
        lineHeight: 1,
        textAlign: "center",
        color: "currentColor",
      }}
    >
      <span />
      <span>↑</span>
      <span />
      <span>←</span>
      <span style={{ fontSize: "7px", color: "#cbd5e1" }}>·</span>
      <span>→</span>
      <span />
      <span>↓</span>
      <span />
    </div>
  );
}

const TILES: Tile[] = [
  { id: "ctrl",    icon: <span className="text-xl">⌃</span>,        label: "Ctrl / Cmd" },
  { id: "alt",     icon: <span className="text-xl">⌥</span>,        label: "Alt Key" },
  { id: "arrows",  icon: <FourWayArrow />,                           label: "Arrow Keys" },
  { id: "numbers", icon: <span className="text-xl">🔢</span>,       label: "Number Keys" },
  { id: "fn",      icon: <span className="font-mono font-black text-[13px] tracking-tight">F1-12</span>, label: "Function Keys" },
  { id: "special", icon: <span className="text-xl">✓</span>,        label: "Esc · Enter · Tab" },
  { id: "nogo",    icon: <span className="text-xl">🚫</span>,       label: "No-Go Shortcuts", warn: true },
];

// ── Shared sub-components ──

function PanelShell({
  icon,
  title,
  subtitle,
  warn,
  onClose,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  warn?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-lg border overflow-hidden", warn ? "border-amber-300 bg-amber-50/50" : "border-border bg-muted/20")}>
      <div className={cn("flex items-start gap-3 p-3 border-b", warn ? "border-amber-300 bg-amber-50" : "border-border bg-card")}>
        <span className="text-lg leading-none mt-0.5 flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className={cn("font-bold text-sm", warn && "text-orange-800")}>{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground flex-shrink-0 mt-0.5" aria-label="Close panel">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="bg-emerald-100 border border-emerald-300 text-emerald-800 font-black text-[10px] uppercase tracking-widest px-2 py-0.5 rounded whitespace-nowrap">
        {children}
      </span>
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}

function ExampleGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <GroupLabel>{label}</GroupLabel>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ keys, action }: { keys: (string | React.ReactNode)[]; action: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-card text-xs font-medium text-foreground">
      {keys.map((k, i) => (
        <kbd key={i} className="font-mono font-black text-[10px] bg-slate-800 text-slate-50 px-1.5 py-0.5 rounded">
          {k}
        </kbd>
      ))}
      <span className="text-muted-foreground text-[10px]">→</span>
      <span className="text-foreground">{action}</span>
    </span>
  );
}

function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 items-start p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 leading-relaxed mt-1">
      <span className="flex-shrink-0 mt-0.5">💡</span>
      <span>{children}</span>
    </div>
  );
}

function NoGoCard({ shortcut, browserEffect, excelMeaning }: { shortcut: string; browserEffect: React.ReactNode; excelMeaning: string }) {
  return (
    <div className="flex rounded-lg border-[1.5px] border-red-200 bg-red-50 overflow-hidden">
      <div className="w-1.5 bg-red-500 flex-shrink-0" />
      <div className="p-2.5 flex-1">
        <p className="text-sm font-black text-red-800 mb-1">
          <kbd className="font-mono font-bold text-[11px] bg-red-600 text-white px-1.5 py-0.5 rounded mr-1">{shortcut}</kbd>
        </p>
        <div className="flex items-baseline gap-1.5 text-xs mt-1">
          <span className="font-black text-[9px] uppercase tracking-wider bg-red-100 text-red-700 px-1.5 py-0.5 rounded flex-shrink-0">Browser</span>
          <span className="text-foreground">{browserEffect}</span>
        </div>
        <div className="flex items-baseline gap-1.5 text-xs mt-1">
          <span className="font-black text-[9px] uppercase tracking-wider bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded flex-shrink-0">In Excel</span>
          <span className="text-muted-foreground">{excelMeaning}</span>
        </div>
      </div>
    </div>
  );
}

// ── Panel content per tile ──

function PanelContent({ id, onClose }: { id: PanelId; onClose: () => void }) {
  switch (id) {
    case "ctrl":
      return (
        <PanelShell icon="⌃" title="Ctrl (Windows) / Cmd ⌘ (Mac)" subtitle="The workhorse modifier — nearly every shortcut starts here" onClose={onClose}>
          <ExampleGroup label="Navigation">
            <Chip keys={["Ctrl", "→"]} action="Jump to data edge in any direction" />
            <Chip keys={["Ctrl", "Home"]} action="Jump to cell A1" />
            <Chip keys={["Ctrl", "End"]} action="Jump to last used cell" />
          </ExampleGroup>
          <ExampleGroup label="Formatting">
            <Chip keys={["Ctrl", "1"]} action="Open Format Cells dialog" />
            <Chip keys={["Ctrl", "B"]} action="Bold" />
          </ExampleGroup>
          <ExampleGroup label="Everything Else">
            <Chip keys={["Ctrl", "C"]} action="Copy" />
            <Chip keys={["Ctrl", "Z"]} action="Undo" />
            <Chip keys={["Ctrl", "Shift", "L"]} action="Toggle AutoFilter" />
          </ExampleGroup>
          <TipBox>On Mac, swap <strong>Ctrl</strong> for <strong>Cmd ⌘</strong> in almost every shortcut. Option ⌥ replaces Alt.</TipBox>
        </PanelShell>
      );

    case "alt":
      return (
        <PanelShell icon="⌥" title="Alt Key — Two Modes, One Key" subtitle="Alt can walk through the ribbon step-by-step OR fire a direct shortcut" onClose={onClose}>
          <ExampleGroup label="Ribbon Shortcuts — press one key at a time (Sequential)">
            <Chip keys={["Alt", "then H", "then B"]} action="Add cell border" />
            <Chip keys={["Alt", "then H", "then H"]} action="Highlight color" />
            <Chip keys={["Alt", "then N", "then V"]} action="Insert PivotTable" />
          </ExampleGroup>
          <ExampleGroup label="Regular Shortcut Combos — hold Alt + press">
            <Chip keys={["Alt", "="]} action="AutoSum" />
            <Chip keys={["Alt", "Enter"]} action="New line inside cell" />
            <Chip keys={["Alt", "F1"]} action="Insert chart" />
          </ExampleGroup>
          <ExampleGroup label="Opening Dropdowns">
            <Chip keys={["Alt", "↓"]} action="Open dropdown / AutoFilter list in selected cell" />
          </ExampleGroup>
          <TipBox>
            For ribbon shortcuts: press <strong>Alt alone first</strong> (release it), then tap letters one by one — do <em>not</em> hold them together. Key tips appear on the ribbon. Only works when you&apos;re <strong>not editing a cell</strong> — press Escape first if needed.
          </TipBox>
        </PanelShell>
      );

    case "arrows":
      return (
        <PanelShell icon={<FourWayArrow />} title="Arrow Keys — Navigation Powerhouse" subtitle="Alone, with Shift, or with Ctrl — each combination does something different" onClose={onClose}>
          <ExampleGroup label="Basic Movement">
            <Chip keys={["↑↓←→"]} action="Move one cell in any direction" />
          </ExampleGroup>
          <ExampleGroup label="Jump to Data Edge">
            <Chip keys={["Ctrl", "→"]} action="Jump to last filled cell in that direction" />
          </ExampleGroup>
          <ExampleGroup label="Extend Selection">
            <Chip keys={["Shift", "↑↓←→"]} action="Grow selection one cell at a time" />
            <Chip keys={["Ctrl", "Shift", "↓"]} action="Extend selection to data edge" />
          </ExampleGroup>
          <ExampleGroup label="Navigate Menus & Dialogs">
            <Chip keys={["↑↓"]} action="Move through dropdown options or list items" />
            <Chip keys={["←→"]} action="Switch between tabs or expand/collapse options" />
          </ExampleGroup>
          <TipBox><strong>Ctrl+Shift+Arrow</strong> is essential for selecting entire columns of financial data instantly — no mouse needed.</TipBox>
        </PanelShell>
      );

    case "numbers":
      return (
        <PanelShell icon="🔢" title="Number Keys — Mostly Formatting" subtitle="In shortcut combos, numbers almost always apply cell formatting" onClose={onClose}>
          <ExampleGroup label="Formatting Shortcuts">
            <Chip keys={["Ctrl", "1"]} action="Open Format Cells dialog" />
            <Chip keys={["Ctrl", "Shift", "4"]} action="Currency format ($)" />
            <Chip keys={["Ctrl", "Shift", "5"]} action="Percentage format (%)" />
          </ExampleGroup>
          <TipBox>If a shortcut challenge uses a number key, it&apos;s almost certainly formatting — think currency, percentage, or opening the Format Cells dialog.</TipBox>
        </PanelShell>
      );

    case "fn":
      return (
        <PanelShell
          icon={<span className="font-mono font-black text-[13px] tracking-tight">F1-12</span>}
          title="Function Keys — Alone or in Combination"
          subtitle="F1–F12 have specific Excel roles, and they multiply when paired with Shift, Ctrl, or Alt"
          onClose={onClose}
        >
          <ExampleGroup label="Standalone">
            <Chip keys={["F2"]} action="Edit active cell" />
            <Chip keys={["F4"]} action="Repeat last action / toggle $A$1 reference" />
            <Chip keys={["F9"]} action="Recalculate all formulas" />
            <Chip keys={["F11"]} action="Create chart on new sheet" />
          </ExampleGroup>
          <ExampleGroup label="In Combination">
            <Chip keys={["Shift", "F9"]} action="Recalculate active sheet only" />
            <Chip keys={["Ctrl", "F2"]} action="Print Preview" />
            <Chip keys={["Alt", "F1"]} action="Insert embedded chart" />
            <Chip keys={["Shift", "F11"]} action="Insert new worksheet" />
          </ExampleGroup>
          <TipBox>On laptops, you may need to press <strong>Fn</strong> first to activate F-keys — check if your laptop uses F-keys or media keys by default.</TipBox>
        </PanelShell>
      );

    case "special":
      return (
        <PanelShell icon="✓" title="Esc · Enter · Tab — Confirm, Exit & Navigate" subtitle="These keys control dialog windows, cell editing, and movement after data entry" onClose={onClose}>
          <ExampleGroup label="Within Dialog Windows">
            <Chip keys={["Tab"]} action="Move to the next field" />
            <Chip keys={["Shift", "Tab"]} action="Move to the previous field" />
            <Chip keys={["Enter"]} action="Confirm and apply dialog settings" />
            <Chip keys={["Esc"]} action="Cancel and close without saving" />
          </ExampleGroup>
          <ExampleGroup label="Within Spreadsheet">
            <Chip keys={["Enter"]} action="Confirm cell entry and move one row down" />
            <Chip keys={["Tab"]} action="Confirm entry and move one cell right" />
            <Chip keys={["Esc"]} action="Cancel cell edit and discard changes" />
            <Chip keys={["Alt", "Enter"]} action="Add a new line within the same cell" />
          </ExampleGroup>
          <TipBox>Inside any dialog: use <strong>Tab / Shift+Tab</strong> to move between fields, <strong>Enter</strong> to confirm, and <strong>Esc</strong> to cancel without saving.</TipBox>
        </PanelShell>
      );

    case "nogo":
      return (
        <PanelShell icon="🚫" title="No-Go Shortcuts — These Affect Your Browser!" subtitle="You're using Excel Ninja in a browser. These shortcuts trigger browser actions — not Excel." warn onClose={onClose}>
          <div className="space-y-2">
            <NoGoCard shortcut="Ctrl + W" browserEffect={<>Closes your tab — <strong>you lose all progress</strong></>} excelMeaning="Closes the current workbook" />
            <NoGoCard shortcut="Ctrl + T" browserEffect="Opens a new browser tab" excelMeaning="Creates a table from your selected range" />
            <NoGoCard shortcut="Ctrl + N" browserEffect="Opens a new browser window" excelMeaning="Creates a new workbook" />
            <NoGoCard shortcut="F5" browserEffect={<>Reloads the page — <strong>you lose all progress</strong></>} excelMeaning="Opens the Go To dialog" />
            <NoGoCard shortcut="Ctrl + R" browserEffect={<>Reloads the page — <strong>you lose all progress</strong></>} excelMeaning="Fill Right — copies the leftmost cell rightward" />
          </div>
          <div className="flex gap-2 items-start p-3 mt-2 bg-red-50 border-2 border-red-300 rounded-lg text-xs text-red-900 leading-relaxed">
            <span className="flex-shrink-0 mt-0.5">⚠️</span>
            <span>
              You&apos;re using Excel Ninja in a browser. Shortcuts like Ctrl+W will trigger browser actions, not Excel ones — and you could{" "}
              <strong className="text-red-600 uppercase tracking-wide">lose your progress</strong>. The tab system you see is part of the app — it&apos;s not a real Excel window.
            </span>
          </div>
        </PanelShell>
      );
  }
}

// ── Main component ──

export function BeforeYouStart() {
  const [activePanel, setActivePanel] = React.useState<PanelId | null>(null);

  function toggle(id: PanelId) {
    setActivePanel(prev => (prev === id ? null : id));
  }

  React.useEffect(() => {
    if (!activePanel) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActivePanel(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePanel]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold flex items-center gap-2">🚀 Before You Start</h2>
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 font-semibold text-xs">
          7 key concepts
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-4">
        {/* Tile grid */}
        <div className="grid grid-cols-7 gap-2">
          {TILES.map((tile) => (
            <button
              key={tile.id}
              onClick={() => toggle(tile.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border-2 text-center transition-all duration-150 select-none cursor-pointer",
                tile.warn
                  ? activePanel === tile.id
                    ? "border-orange-500 bg-orange-50 shadow-[0_0_0_3px_rgba(249,115,22,0.2)]"
                    : "border-amber-300 bg-amber-50 hover:border-orange-400 hover:shadow-md hover:-translate-y-0.5"
                  : activePanel === tile.id
                    ? "border-primary bg-primary/10 shadow-[0_0_0_3px_rgba(22,163,74,0.15)]"
                    : "border-border bg-muted/40 hover:border-primary hover:bg-primary/5 hover:shadow-md hover:-translate-y-0.5"
              )}
            >
              <span className={cn(tile.warn ? "text-orange-700" : "text-foreground")}>
                {tile.icon}
              </span>
              <span className={cn("text-[10px] font-bold leading-tight", tile.warn ? "text-orange-700" : "text-foreground")}>
                {tile.label}
              </span>
            </button>
          ))}
        </div>

        {/* Expand panel */}
        <div
          style={{
            maxHeight: activePanel ? "700px" : "0px",
            opacity: activePanel ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 0.3s ease, opacity 0.25s ease",
            marginTop: activePanel ? "14px" : "0px",
          }}
        >
          {activePanel && <PanelContent id={activePanel} onClose={() => setActivePanel(null)} />}
        </div>
      </CardContent>
    </Card>
  );
}

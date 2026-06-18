"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-provider";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { BookOpen, Check, ArrowRight, Zap, X } from "lucide-react";

type ItemId = "ctrl" | "alt" | "arrows" | "numbers" | "fn" | "special" | "mac" | "nogo";
type AnimMode = "combo" | "sequence";

interface Example {
  keys: string[];
  mode: AnimMode;
  action: string;
}

interface Section {
  label: string;
  use: React.ReactNode;
  examples: Example[];
}

interface NogoRow {
  keys: string[];
  browser: string;
  excel: string;
}

interface MacSwap {
  win: string[];
  mac: string[];
  note: string;
}

interface ItemData {
  id: ItemId;
  glyph: string;
  label: string;
  hint: string;
  title: string;
  sub: React.ReactNode;
  warn?: boolean;
  sections?: Section[];
  nogo?: NogoRow[];
  mac?: { swaps: MacSwap[]; examples: Example[] };
}

// ── Palette (matches the app's emerald theme) ──
const C = {
  primary: "hsl(142 76% 36%)",
  primarySoft: "hsl(142 76% 95%)",
  primaryFg: "hsl(142 76% 25%)",
  amberBg: "#fffbeb",
  amberSoft: "#fef3c7",
  amberBorder: "#fde68a",
  amberFg: "#92400e",
};

// ── Sub-components ──

function Kbd({ children, size = "sm" }: { children: React.ReactNode; size?: "sm" | "md" }) {
  const d = size === "sm" ? { px: 6, h: 20, fs: 10.5 } : { px: 7, h: 24, fs: 11.5 };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: d.h, height: d.h, padding: `0 ${d.px}px`,
      borderRadius: 5, fontFamily: "ui-monospace, monospace",
      fontSize: d.fs, fontWeight: 600,
      border: "1px solid hsl(var(--border))", background: "white",
      color: "hsl(var(--foreground))", boxShadow: "0 1px 0 hsl(var(--border))",
      lineHeight: 1, whiteSpace: "nowrap" as const,
    }}>{children}</span>
  );
}

function KbdCombo({ keys }: { keys: string[] }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
      {keys.map((k, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ color: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "ui-monospace, monospace", fontWeight: 500 }}>+</span>}
          <Kbd size="sm">{k}</Kbd>
        </React.Fragment>
      ))}
    </span>
  );
}

function AKbd({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 20, height: 20, padding: "0 6px",
      borderRadius: 5, fontFamily: "ui-monospace, monospace",
      fontSize: 10.5, fontWeight: 600,
      border: `1px solid ${active ? C.primary : "hsl(var(--border))"}`,
      background: active ? C.primary : "white",
      color: active ? "white" : "hsl(var(--foreground))",
      boxShadow: active ? "0 0 0 3px rgba(22,163,74,0.2)" : "0 1px 0 hsl(var(--border))",
      transform: active ? "scale(1.07) translateY(-1px)" : "scale(1) translateY(0px)",
      lineHeight: 1, whiteSpace: "nowrap" as const,
      transition: "background 150ms ease, color 150ms ease, border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease",
    }}>{children}</span>
  );
}

function useExAnimation(mode: AnimMode, keyCount: number) {
  const [phase, setPhase] = React.useState(-1);
  React.useEffect(() => {
    let raf: number;
    let last = -2;
    const tick = () => {
      const now = performance.now();
      let p: number;
      if (mode === "sequence") {
        const KEY = 520, PAUSE = 1100;
        const cycle = KEY * keyCount + PAUSE;
        const t = now % cycle;
        p = t < KEY * keyCount ? Math.floor(t / KEY) : -1;
      } else {
        const t = now % 2300;
        p = t < 320 ? 0 : -1;
      }
      if (p !== last) { last = p; setPhase(p); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, keyCount]);
  return phase;
}

function AnimExRow({ ex }: { ex: Example }) {
  const isSeq = ex.mode === "sequence";
  const phase = useExAnimation(ex.mode, ex.keys.length);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
      <span style={{
        fontFamily: "ui-monospace, monospace", fontSize: 9, fontWeight: 700,
        letterSpacing: "0.1em", textTransform: "uppercase" as const,
        color: "hsl(var(--muted-foreground))", flexShrink: 0,
      }}>e.g.</span>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: isSeq ? 4 : 3,
        ...(isSeq ? {
          padding: "2px 6px", borderRadius: 6,
          background: "rgba(22,163,74,0.08)",
          border: "1px dashed rgba(22,163,74,0.30)",
        } : {}),
      }}>
        {ex.keys.map((k, i) => (
          <React.Fragment key={i}>
            {i > 0 && (isSeq
              ? (
                <svg width={10} height={10} viewBox="0 0 10 10" aria-hidden
                     style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0, opacity: phase >= i ? 1 : 0.3, transition: "opacity 150ms" }}>
                  <path d="M2 5h5M5 3l2 2-2 2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )
              : <span style={{ color: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "ui-monospace, monospace", fontWeight: 500 }}>+</span>
            )}
            <AKbd active={isSeq ? phase === i : phase === 0}>{k}</AKbd>
          </React.Fragment>
        ))}
      </span>
      <span style={{ color: "hsl(var(--muted-foreground))", fontFamily: "ui-monospace, monospace", fontSize: 11, flexShrink: 0 }}>→</span>
      <span style={{ color: "hsl(var(--muted-foreground))", fontSize: 12.5 }}>{ex.action}</span>
    </div>
  );
}

function NoGoKeys({ keys }: { keys: string[] }) {
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
        {keys.map((k, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <span style={{ color: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "ui-monospace, monospace", fontWeight: 500 }}>+</span>
            )}
            <Kbd size="sm">{k}</Kbd>
          </React.Fragment>
        ))}
      </span>
      <span style={{ position: "absolute", left: -2, right: -2, top: "50%", height: 1.5, background: "hsl(10 60% 50%)", opacity: 0.45, pointerEvents: "none" as const }} />
    </span>
  );
}

// Progress ring (ported from the design's primitives.jsx)
function Ring({ value, size = 56, thickness = 6, children }: { value: number; size?: number; thickness?: number; children?: React.ReactNode }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(142 40% 90%)" strokeWidth={thickness} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={C.primary} strokeWidth={thickness} fill="none"
          strokeDasharray={c} strokeDashoffset={c - c * Math.min(1, Math.max(0, value / 100))}
          strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 600ms ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

// Glyph chip used in nav + detail header
function GlyphChip({ g, warn, size = 34 }: { g: string; warn?: boolean; size?: number }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0,
      fontFamily: "ui-monospace, monospace", fontWeight: 700, fontSize: Math.round(size * 0.44), lineHeight: 1,
      background: warn ? C.amberSoft : C.primarySoft,
      color: warn ? C.amberFg : C.primaryFg,
      border: warn ? `1px solid ${C.amberBorder}` : "none",
    }}>{g}</span>
  );
}

// Mac platform-swap rows: Windows keys → Mac keys + what it does.
function MacSwaps({ rows }: { rows: MacSwap[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((r, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
          border: "1px solid hsl(var(--border))", borderRadius: 10, background: "hsl(var(--card))", flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "ui-monospace, monospace", letterSpacing: "0.08em", color: "hsl(var(--muted-foreground))", width: 42 }}>WIN</span>
          <KbdCombo keys={r.win} />
          <span style={{ color: "hsl(var(--muted-foreground))", fontFamily: "ui-monospace, monospace" }}>→</span>
          <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "ui-monospace, monospace", letterSpacing: "0.08em", color: C.primaryFg, width: 34 }}>MAC</span>
          <KbdCombo keys={r.mac} />
          <span style={{ marginLeft: "auto", fontSize: 12.5, color: "hsl(var(--muted-foreground))" }}>{r.note}</span>
        </div>
      ))}
    </div>
  );
}

// Category cards — reuses the user's existing per-section content.
function SectionCards({ sections }: { sections: Section[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
      {sections.map((g, gi) => (
        <div key={gi} style={{
          position: "relative",
          padding: "18px 18px 16px 22px",
          border: "1px solid hsl(var(--border))",
          borderRadius: 12,
          background: "hsl(var(--card))",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <span style={{
            position: "absolute", left: 0, top: 18, bottom: 18, width: 3,
            background: C.primary, borderRadius: "0 3px 3px 0", opacity: 0.8,
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 22, height: 22, borderRadius: 6,
              background: C.primarySoft, color: C.primaryFg,
              fontFamily: "ui-monospace, monospace", fontSize: 10, fontWeight: 700, flexShrink: 0,
            }}>
              {String(gi + 1).padStart(2, "0")}
            </span>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.015em" }}>{g.label}</span>
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.5, opacity: 0.78 }}>{g.use}</div>
          <div style={{ marginTop: "auto", paddingTop: 10, borderTop: "1px dashed hsl(var(--border))", display: "flex", flexDirection: "column", gap: 7 }}>
            {g.examples.map((ex, ei) => <AnimExRow key={ei} ex={ex} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function NoGoTable({ rows }: { rows: NogoRow[] }) {
  return (
    <div style={{ border: "1px solid hsl(var(--border))", borderRadius: 12, overflow: "hidden", background: "hsl(var(--card))" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, tableLayout: "auto" }}>
        <thead>
          <tr>
            {["Shortcut", "In your browser", "In Excel"].map((h, hi) => (
              <th key={h} style={{
                fontFamily: "ui-monospace, monospace", fontSize: 10.5, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "hsl(var(--muted-foreground))", textAlign: "left",
                padding: `14px ${hi === 2 ? 22 : 18}px 12px ${hi === 0 ? 22 : 18}px`,
                borderBottom: "1px solid hsl(var(--border))",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((n, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? "1px dashed hsl(var(--border))" : "none" }}>
              <td style={{ padding: "14px 18px 14px 22px", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                <NoGoKeys keys={n.keys} />
              </td>
              <td style={{ padding: "14px 18px", lineHeight: 1.45, verticalAlign: "middle", color: "hsl(10 55% 40%)" }}>
                {n.browser}
              </td>
              <td style={{ padding: "14px 22px 14px 18px", lineHeight: 1.45, verticalAlign: "middle", color: "hsl(var(--muted-foreground))" }}>
                {n.excel}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Data ──
// Order = a natural learning progression, ending on the Mac & no-go heads-ups.

const BYS_DATA: ItemData[] = [
  {
    id: "ctrl",
    glyph: "⌃",
    label: "Ctrl / Cmd",
    hint: "The workhorse modifier",
    title: "The workhorse modifier",
    sub: (
      <>
        Nearly every shortcut starts here.  <br></br>
        On Mac, swap <Kbd>Ctrl</Kbd> for{" "}
        <Kbd>Cmd ⌘</Kbd>.
      </>
    ),
    sections: [
      {
        label: "Navigation",
        use: "Move fast through large sheets without ever touching the mouse.",
        examples: [{ keys: ["Ctrl", "→"], mode: "combo", action: "Jump to data edge" }],
      },
      {
        label: "Formatting",
        use: "Open formatting controls and apply common styles instantly.",
        examples: [{ keys: ["Ctrl", "1"], mode: "combo", action: "Format Cells dialog" }],
      },
      {
        label: "Everything else",
        use: "The fundamentals you already know from every other app.",
        examples: [{ keys: ["Ctrl", "Z"], mode: "combo", action: "Undo" }],
      },
    ],
  },
  {
    id: "alt",
    glyph: "⌥",
    label: "Alt key",
    hint: "Two modes, one key",
    title: "Two modes, one key",
    sub: (
      <>
        Two distinct modes live under the <Kbd>Alt</Kbd> key.<br></br>
        - Press <Kbd>Alt</Kbd> alone first for ribbon mode, release, then tap letters one
        by one. <br></br>- Or hold <Kbd>Alt</Kbd> with another key for a direct combo.
      </>
    ),
    sections: [
      {
        label: "Ribbon mode (Windows only)",
        use: (
          <>
            Press <Kbd>Alt</Kbd> and Excel overlays the next letter to press on every
            ribbon button — no memorisation needed, just follow the cues.
          </>
        ),
        examples: [{ keys: ["Alt", "H", "B"], mode: "sequence", action: "Add cell border" }],
      },
      {
        label: "Direct combos",
        use: "A handful of high-value combos worth knowing — held together, not in sequence.",
        examples: [{ keys: ["Alt", "="], mode: "combo", action: "AutoSum" }],
      },
    ],
  },
  {
    id: "arrows",
    glyph: "↓",
    label: "Arrow keys",
    hint: "Navigate & extend",
    title: "Navigation powerhouse",
    sub: (
      <>
        Arrow keys alone, with <Kbd>⇧</Kbd>, or with power keys such <Kbd>Ctrl</Kbd> — each combination
        does something different.
      </>
    ),
    sections: [
      {
        label: "Move around the worksheet",
        use: "Cell-by-cell or jump-to-edge — two speeds for the same direction.",
        examples: [{ keys: ["Ctrl", "→"], mode: "combo", action: "Jump to last cell" }],
      },
      {
        label: "Move in menu's & dialog windows",
        use: "This works everywhere: color picker, filter menu, etc...",
        examples: [{ keys: ["↓"], mode: "combo", action: "Moving down to the next option" }],
      },
    ],
  },
  {
    id: "numbers",
    glyph: "1",
    label: "Number keys",
    hint: "Mostly formatting",
    title: "Mostly formatting",
    sub: "If a shortcut combo includes a number key, it's almost always applying a cell format.",
    sections: [
      {
        label: "Formatting",
        use: "Currency, percentages, dates — formatted with a single combo, no dialog needed.",
        examples: [{ keys: ["Ctrl", "⇧", "5"], mode: "combo", action: "Apply percentage format" }],
      },
    ],
  },
  {
    id: "fn",
    glyph: "F",
    label: "Function keys",
    hint: "F1 – F12",
    title: "F1 – F12",
    sub: (
      <>
        F1–F12 each have specific Excel roles. On laptops, hold <Kbd>Fn</Kbd> first if media
        keys are the default.
      </>
    ),
    sections: [
      {
        label: "Standalone",
        use: "Single-key power moves: edit a cell, repeat the last action, recalculate.",
        examples: [{ keys: ["F4"], mode: "combo", action: "Repeat last action / toggle $A$1" }],
      },
      {
        label: "Combo",
        use: (
          <>
            F-keys paired with <Kbd>⇧</Kbd> or <Kbd>Ctrl</Kbd> — print preview, new sheet,
            partial recalculate.
          </>
        ),
        examples: [{ keys: ["⇧", "F11"], mode: "combo", action: "Insert new worksheet" }],
      },
    ],
  },
  {
    id: "special",
    glyph: "↵",
    label: "Esc · Enter · Tab",
    hint: "Confirm & cancel",
    title: "Confirm, cancel & navigate",
    sub: (
      <>
        <Kbd>Esc</Kbd> cancels, <Kbd>↵</Kbd> confirms, <Kbd>Tab</Kbd> moves — they behave
        slightly differently inside a dialog vs. the spreadsheet.
      </>
    ),
    sections: [
      {
        label: "In dialogs",
        use: "Navigate every field and confirm or cancel — without ever reaching for the mouse.",
        examples: [{ keys: ["Tab"], mode: "combo", action: "Move to next field" }],
      },
      {
        label: "In the spreadsheet",
        use: "The key you press to confirm an entry decides where the cursor goes next.",
        examples: [{ keys: ["Tab"], mode: "combo", action: "Confirm entry, move 1 cell right" }],
      },
    ],
  },
  {
    id: "mac",
    glyph: "⌘",
    label: "Mac shortcuts",
    hint: "Same moves, three swaps",
    title: "Same moves, three swaps",
    sub: "Your muscle memory carries straight over to a Mac — just swap the modifier keys. Only a handful of Excel-for-Mac combos differ outright.",
    mac: {
      swaps: [
        { win: ["Ctrl"], mac: ["⌘"], note: "The everyday modifier — Cmd does Ctrl's job" },
        { win: ["Alt"], mac: ["⌥"], note: "Option replaces Alt in every combo" },
        { win: ["F2"], mac: ["⌃", "U"], note: "Edit the active cell" },
      ],
      examples: [
        { keys: ["⌘", "→"], mode: "combo", action: "Jump to the data edge" },
        { keys: ["⌘", "1"], mode: "combo", action: "Open Format Cells" },
      ],
    },
  },
  {
    id: "nogo",
    glyph: "⚠",
    label: "No-go shortcuts",
    hint: "These hit your browser",
    title: "These hit your browser, not Excel",
    warn: true,
    sub: (
      <>
        You&apos;re using Excel Ninja in a browser. These combos are claimed by the browser before
        Excel sees them — the tabs you see are part of the app, so{" "}
        <Kbd>Ctrl</Kbd>&thinsp;+&thinsp;<Kbd>W</Kbd> will close the whole thing.
      </>
    ),
    nogo: [
      { keys: ["Ctrl", "W"], browser: "Closes the tab — you lose progress", excel: "Closes the workbook" },
      { keys: ["Ctrl", "T"], browser: "Opens a new browser tab", excel: "Creates a table from selection" },
      { keys: ["Ctrl", "N"], browser: "Opens a new browser window", excel: "Creates a new workbook" },
      { keys: ["F5"], browser: "Reloads the page — you lose progress", excel: "Opens the Go To dialog" },
      { keys: ["Ctrl", "R"], browser: "Reloads the page — you lose progress", excel: "Fill Right" },
    ],
  },
];

const TOTAL = BYS_DATA.length;

// ── Primer modal ──

function PrimerModal({
  read, sel, setSel, markRead, onProceed, onClose, saving, error, completed,
}: {
  read: Set<ItemId>;
  sel: ItemId;
  setSel: (id: ItemId) => void;
  markRead: (id: ItemId) => void;
  onProceed: () => void;
  onClose: () => void;
  saving: boolean;
  error: string | null;
  completed: boolean;
}) {
  const item = BYS_DATA.find(d => d.id === sel)!;
  const idx = BYS_DATA.findIndex(d => d.id === sel);
  const allRead = read.size === TOTAL;

  // Escape to close
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const selectItem = (id: ItemId) => { setSel(id); markRead(id); };

  const markNext = () => {
    markRead(sel);
    // Advance to the next still-unread section, else the next in order.
    const nextUnread = BYS_DATA.find(d => !read.has(d.id) && d.id !== sel);
    if (nextUnread) { setSel(nextUnread.id); return; }
    const n = BYS_DATA[idx + 1];
    if (n) setSel(n.id);
  };

  return (
    <div
      style={{
        position: "fixed", top: 64, left: 0, right: 0, bottom: 0, zIndex: 40, background: "rgba(17,24,39,0.45)",
        backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          width: 760, maxWidth: "100%", maxHeight: "90vh",
          background: "hsl(var(--card))", borderRadius: 16, boxShadow: "0 24px 70px rgba(0,0,0,0.3)",
          overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid hsl(var(--border))",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid hsl(var(--border))" }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: C.primary, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <BookOpen size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em" }}>Before you start</div>
            <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>Keyboard primer · {read.size} of {TOTAL} read</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ all: "unset", cursor: "pointer", color: "hsl(var(--muted-foreground))", padding: 4, display: "flex" }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: "flex", minHeight: 0, flex: 1 }}>
          {/* Nav */}
          <div style={{ width: 220, borderRight: "1px solid hsl(var(--border))", padding: 8, background: "hsl(var(--muted)/0.4)", overflowY: "auto", flexShrink: 0 }}>
            {BYS_DATA.map(x => {
              const done = read.has(x.id), active = sel === x.id;
              return (
                <button
                  key={x.id}
                  onClick={() => selectItem(x.id)}
                  style={{
                    all: "unset", boxSizing: "border-box", width: "100%",
                    display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 2,
                    background: active ? "hsl(var(--card))" : "transparent",
                    border: active ? "1px solid hsl(var(--border))" : "1px solid transparent",
                    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center",
                    background: done ? C.primary : x.warn ? C.amberBg : "hsl(var(--muted))",
                    color: done ? "#fff" : x.warn ? C.amberFg : "hsl(var(--muted-foreground))",
                    fontSize: 10, fontWeight: 700, fontFamily: "ui-monospace, monospace",
                    border: done ? "none" : x.warn ? `1px solid ${C.amberBorder}` : "none",
                  }}>
                    {done ? <Check size={12} /> : x.glyph}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: x.warn ? C.amberFg : "hsl(var(--foreground))", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.label}</span>
                </button>
              );
            })}
          </div>

          {/* Detail */}
          <div style={{ flex: 1, padding: 24, overflowY: "auto", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <GlyphChip g={item.glyph} warn={item.warn} size={40} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: item.warn ? C.amberFg : "hsl(var(--foreground))" }}>{item.title}</div>
                <div style={{ fontSize: 12.5, color: "hsl(var(--muted-foreground))" }}>{item.hint}</div>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: item.warn ? C.amberFg : "hsl(var(--foreground))", lineHeight: 1.6, marginBottom: 16, opacity: item.warn ? 1 : 0.85 }}>{item.sub}</p>

            {item.nogo ? <NoGoTable rows={item.nogo} />
              : item.mac ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <MacSwaps rows={item.mac.swaps} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 9, padding: "14px 16px", border: "1px solid hsl(var(--border))", borderRadius: 10, background: C.primarySoft }}>
                    {item.mac.examples.map((ex, i) => <AnimExRow key={i} ex={ex} />)}
                  </div>
                </div>
              )
              : item.sections ? <SectionCards sections={item.sections} />
              : null}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 20px", borderTop: "1px solid hsl(var(--border))", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 5 }}>
              {BYS_DATA.map(x => (
                <span key={x.id} style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: read.has(x.id) ? C.primary : sel === x.id ? "hsl(var(--muted-foreground))" : "hsl(var(--muted))",
                }} />
              ))}
            </div>
            {error && <span style={{ fontSize: 12, color: "hsl(0 72% 45%)" }}>{error}</span>}
            {!allRead && !error && <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>Open every section to continue</span>}
          </div>
          {allRead ? (
            <Button onClick={onProceed} disabled={saving} className="font-bold">
              <Zap className="mr-1.5 h-4 w-4" /> {saving ? "Saving…" : completed ? "Done — close" : "Start training"}
            </Button>
          ) : (
            <Button onClick={markNext} className="font-bold">
              Mark read &amp; continue <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Launcher card + main export ──

export function BeforeYouStart({ primerCompleted = false }: { primerCompleted?: boolean }) {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [sel, setSel] = React.useState<ItemId>(BYS_DATA[0].id);
  const [read, setRead] = React.useState<Set<ItemId>>(
    () => primerCompleted ? new Set(BYS_DATA.map(d => d.id)) : new Set()
  );
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Keep local read state in sync if completion arrives from Firestore.
  React.useEffect(() => {
    if (primerCompleted) setRead(new Set(BYS_DATA.map(d => d.id)));
  }, [primerCompleted]);

  const markRead = React.useCallback((id: ItemId) => {
    setRead(prev => prev.has(id) ? prev : new Set(prev).add(id));
  }, []);

  const handleProceed = async () => {
    setError(null);
    if (!user) { setOpen(false); return; }
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { primerCompleted: true });
      setOpen(false);
    } catch (e) {
      console.error("Failed to save primer completion:", e);
      setError("Couldn't save — please try again.");
    } finally {
      setSaving(false);
    }
  };

  const done = read.size;
  const buttonLabel = primerCompleted ? "Revisit primer" : done > 0 ? "Resume primer" : "Review the basics";

  return (
    <>
      <Card className="p-4 flex items-center gap-4 sm:gap-[18px]">
        <Ring value={(done / TOTAL) * 100} size={56} thickness={6}>
          {primerCompleted
            ? <Check className="text-primary" size={22} />
            : <span style={{ fontSize: 12, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>{done}/{TOTAL}</span>}
        </Ring>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-0.5 flex-wrap">
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.primaryFg, fontFamily: "ui-monospace, monospace" }}>
              Before you start
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.primaryFg, background: C.primarySoft, borderRadius: 999, padding: "3px 9px", fontFamily: "ui-monospace, monospace" }}>
              Step 0
            </span>
            {primerCompleted && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold rounded-full px-2 py-px" style={{ background: C.primarySoft, color: C.primaryFg }}>
                <Check className="w-3 h-3" /> Completed
              </span>
            )}
          </div>
          <div className="text-[15.5px] font-extrabold tracking-tight mb-0.5">The 2-minute keyboard primer</div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            The keys behind every drill, plus Mac &amp; no-go gotchas — skim before your first challenge.
          </div>
        </div>
        <Button onClick={() => setOpen(true)} className="font-bold flex-shrink-0">
          {buttonLabel} <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </Card>

      {open && createPortal(
        <PrimerModal
          read={read}
          sel={sel}
          setSel={setSel}
          markRead={markRead}
          onProceed={handleProceed}
          onClose={() => setOpen(false)}
          saving={saving}
          error={error}
          completed={primerCompleted}
        />,
        document.body
      )}
    </>
  );
}

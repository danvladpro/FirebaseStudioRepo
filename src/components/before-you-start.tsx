"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type TabId = "nogo" | "ctrl" | "alt" | "arrows" | "numbers" | "fn" | "special";
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

interface TabData {
  id: TabId;
  label: string;
  title: string;
  sub: React.ReactNode;
  sections?: Section[];
  nogo?: NogoRow[];
}

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

function AKbd({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 20, height: 20, padding: "0 6px",
      borderRadius: 5, fontFamily: "ui-monospace, monospace",
      fontSize: 10.5, fontWeight: 600,
      border: `1px solid ${active ? "hsl(142 76% 36%)" : "hsl(var(--border))"}`,
      background: active ? "hsl(142 76% 36%)" : "white",
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

// ── Data ──
// No-go is first so it's always the default tab on dashboard load.

const BYS_DATA: TabData[] = [
  {
    id: "nogo",
    label: "No-go shortcuts",
    title: "These hit your browser, not Excel",
    sub: (
      <>
        You&apos;re using Excel Ninja in a browser. These combos are claimed by the browser before
        Excel sees them — the tabs you see are part of the app, so{" "}
        <Kbd size="sm">Ctrl</Kbd>&thinsp;+&thinsp;<Kbd size="sm">W</Kbd> will close the whole thing.
      </>
    ),
    nogo: [
      { keys: ["Ctrl", "W"], browser: "Closes the tab — you lose progress",  excel: "Closes the workbook" },
      { keys: ["Ctrl", "T"], browser: "Opens a new browser tab",              excel: "Creates a table from selection" },
      { keys: ["Ctrl", "N"], browser: "Opens a new browser window",           excel: "Creates a new workbook" },
      { keys: ["F5"],        browser: "Reloads the page — you lose progress", excel: "Opens the Go To dialog" },
      { keys: ["Ctrl", "R"], browser: "Reloads the page — you lose progress", excel: "Fill Right" },
    ],
  },
  {
    id: "ctrl",
    label: "Ctrl / Cmd",
    title: "The workhorse modifier",
    sub: (
      <>
        Nearly every shortcut starts here. On Mac, swap <Kbd size="sm">Ctrl</Kbd> for{" "}
        <Kbd size="sm">Cmd ⌘</Kbd>; <Kbd size="sm">Option ⌥</Kbd> replaces{" "}
        <Kbd size="sm">Alt</Kbd>.
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
    label: "Alt key",
    title: "Two modes, one key",
    sub: (
      <>
        Press <Kbd size="sm">Alt</Kbd> alone first for ribbon mode — release, then tap letters one
        by one. Or hold <Kbd size="sm">Alt</Kbd> with another key for a direct combo.
      </>
    ),
    sections: [
      {
        label: "Ribbon mode",
        use: (
          <>
            Press <Kbd size="sm">Alt</Kbd> and Excel overlays the next letter to press on every
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
    label: "Arrow keys",
    title: "Navigation powerhouse",
    sub: (
      <>
        Arrow keys alone, with <Kbd size="sm">⇧</Kbd>, or with{" "}
        <Kbd size="sm">Ctrl</Kbd> — each combination does something different.
      </>
    ),
    sections: [
      {
        label: "Move",
        use: "Cell-by-cell or jump-to-edge — two speeds for the same direction.",
        examples: [{ keys: ["Ctrl", "→"], mode: "combo", action: "Jump to last filled cell" }],
      },
      {
        label: "Expand selection",
        use: "Build selections without dragging — essential for large data ranges.",
        examples: [{ keys: ["⇧", "↓"], mode: "combo", action: "Extend selection one cell down" }],
      },
    ],
  },
  {
    id: "numbers",
    label: "Number keys",
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
    label: "Function keys",
    title: "F1 – F12",
    sub: (
      <>
        F1–F12 each have specific Excel roles. On laptops, hold{" "}
        <Kbd size="sm">Fn</Kbd> first if media keys are the default.
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
            F-keys paired with <Kbd size="sm">⇧</Kbd> or <Kbd size="sm">Ctrl</Kbd> — print
            preview, new sheet, partial recalculate.
          </>
        ),
        examples: [{ keys: ["⇧", "F11"], mode: "combo", action: "Insert new worksheet" }],
      },
    ],
  },
  {
    id: "special",
    label: "Esc · Enter · Tab",
    title: "Confirm, cancel & navigate",
    sub: (
      <>
        <Kbd size="sm">Esc</Kbd> cancels, <Kbd size="sm">↵</Kbd> confirms,{" "}
        <Kbd size="sm">Tab</Kbd> moves — they behave slightly differently inside a dialog vs. the
        spreadsheet.
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
];

// ── Main component ──

export function BeforeYouStart({ isPremium = false, onUpgradeClick }: { isPremium?: boolean; onUpgradeClick?: () => void }) {
  const [active, setActive] = React.useState<TabId>("nogo");
  const item = BYS_DATA.find(d => d.id === active)!;
  const isNogo = item.id === "nogo";

  return (
    <Card>
      <CardHeader className="p-4 pb-0 border-b-0">
        {/* Title row */}
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold tracking-tight">Before you start</h2>
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            7 keys you&apos;ll see everywhere
          </span>
        </div>

        {/* Tab strip */}
        <div role="tablist" className="flex flex-wrap border-b border-border">
          {BYS_DATA.map((d, i) => {
            const isActive = active === d.id;
            return (
              <button
                key={d.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(d.id)}
                style={{
                  position: "relative",
                  background: "transparent",
                  border: "none",
                  padding: `10px ${i === 0 ? "13px 10px 0" : "13px"}`,
                  paddingLeft: i === 0 ? 0 : undefined,
                  fontFamily: "inherit",
                  color: isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  lineHeight: 1,
                  transition: "color 120ms",
                }}
              >
                {isActive && (
                  <span style={{
                    position: "absolute",
                    left: i === 0 ? 0 : 8,
                    right: 8,
                    bottom: -1,
                    height: 2,
                    background: "hsl(142 76% 36%)",
                    borderRadius: 2,
                    zIndex: 1,
                  }} />
                )}
                <span style={{
                  fontFamily: "ui-monospace, monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  color: isActive ? "hsl(142 76% 36%)" : "hsl(var(--muted-foreground))",
                  marginRight: 6,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {d.label}
                {d.id === "nogo" && (
                  <span style={{
                    display: "inline-block", width: 5, height: 5, borderRadius: "50%",
                    background: "hsl(10 75% 55%)", marginLeft: 6, verticalAlign: "middle",
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </CardHeader>

      <div className="relative">
      <CardContent className={`p-6${!isPremium ? " pointer-events-none select-none" : ""}`} style={!isPremium ? { filter: "blur(3px)", opacity: 0.55 } : undefined}>
        <article>
          <h3 className="text-2xl font-bold tracking-tight mb-2">{item.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground mb-6 max-w-prose">{item.sub}</p>

          {/* Category cards — all tabs except no-go */}
          {!isNogo && item.sections && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {item.sections.map((g, gi) => (
                <div key={gi} style={{
                  position: "relative",
                  padding: "18px 18px 16px 22px",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  background: "hsl(var(--card))",
                  display: "flex", flexDirection: "column", gap: 10,
                }}>
                  {/* left accent bar */}
                  <span style={{
                    position: "absolute", left: 0, top: 18, bottom: 18, width: 3,
                    background: "hsl(142 76% 36%)", borderRadius: "0 3px 3px 0", opacity: 0.8,
                  }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 22, height: 22, borderRadius: 6,
                      background: "hsl(142 76% 95%)", color: "hsl(142 76% 25%)",
                      fontFamily: "ui-monospace, monospace", fontSize: 10, fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {String(gi + 1).padStart(2, "0")}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.015em" }}>{g.label}</span>
                  </div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.5, opacity: 0.78 }}>{g.use}</div>
                  <div style={{ marginTop: "auto", paddingTop: 10, borderTop: "1px dashed hsl(var(--border))", display: "flex", flexDirection: "column", gap: 7 }}>
                    {g.examples.map((ex, ei) => (
                      <AnimExRow key={ei} ex={ex} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No-go table */}
          {isNogo && item.nogo && (
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
                  {item.nogo.map((n, i) => (
                    <tr key={i} style={{ borderBottom: i < item.nogo!.length - 1 ? "1px dashed hsl(var(--border))" : "none" }}>
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
          )}
        </article>
      </CardContent>
      {!isPremium && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-[2px] rounded-b-xl">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <p className="text-sm font-semibold text-foreground">Upgrade to access learning material</p>
          <p className="text-xs text-muted-foreground">Premium members get full access to all guides.</p>
          <Button
            variant="premium"
            className="font-bold shadow-lg mt-1"
            onClick={onUpgradeClick}
          >
            <Sparkles className="mr-2 h-4 w-4" /> Go Premium
          </Button>
        </div>
      )}
      </div>
    </Card>
  );
}

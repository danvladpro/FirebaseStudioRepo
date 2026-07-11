"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-provider";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import {
  BookOpen, Check, ArrowRight, Zap, X,
  Layers, Target, Dumbbell, Timer, Repeat, Trophy, Heart, RotateCcw,
  TrendingUp, Moon, Keyboard, MousePointerClick, SlidersHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ItemId = "howto" | "learn" | "ctrl" | "alt" | "arrows" | "numbers" | "fn" | "fnmod" | "special" | "mac" | "nogo";
type AnimMode = "combo" | "sequence";

interface Example {
  keys: string[];
  mode: AnimMode;
  action: string;
  visual?: VisualSpec;
  outcome?: "fail";
  accentKeys?: string[];
}

interface Section {
  label: string;
  use: React.ReactNode;
  examples: Example[];
}

type Stage = "idle" | "pressed" | "result";
type GridEffect = "jump-right" | "jump-left" | "step-right" | "cell-bold" | "cell-format" | "cell-absref" | "autosum";
type DialogVisualEffect = "option-down" | "tab-fields";
type VisualSpec =
  | { kind: "grid"; effect: GridEffect }
  | { kind: "dialog"; effect: DialogVisualEffect }
  | { kind: "ribbon" };

interface NogoRow {
  keys: string[];
  browser: string;
  excel: string;
}

interface ItemData {
  id: ItemId;
  label: string;
  hint: string;
  title: string;
  sub: React.ReactNode;
  warn?: boolean;
  body?: React.ReactNode;
  sections?: Section[];
  nogo?: NogoRow[];
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

function AKbd({ children, active = false, danger = false, amber = false }: { children: React.ReactNode; active?: boolean; danger?: boolean; amber?: boolean }) {
  const accent = danger ? "hsl(0 72% 50%)" : amber ? C.amberFg : C.primary;
  const glow = danger ? "rgba(220,38,38,0.22)" : amber ? "rgba(245,158,11,0.25)" : "rgba(22,163,74,0.2)";
  const restBorder = amber ? C.amberBorder : "hsl(var(--border))";
  const restBg = amber ? C.amberSoft : "white";
  const restFg = amber ? C.amberFg : "hsl(var(--foreground))";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 20, height: 20, padding: "0 6px",
      borderRadius: 5, fontFamily: "ui-monospace, monospace",
      fontSize: 10.5, fontWeight: 600,
      border: `1px solid ${active ? accent : restBorder}`,
      background: active ? accent : restBg,
      color: active ? "white" : restFg,
      boxShadow: active ? `0 0 0 3px ${glow}` : "0 1px 0 hsl(var(--border))",
      transform: active ? "scale(1.07) translateY(-1px)" : "scale(1) translateY(0px)",
      lineHeight: 1, whiteSpace: "nowrap" as const,
      transition: "background 150ms ease, color 150ms ease, border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease",
    }}>{children}</span>
  );
}

function useExAnimation(mode: AnimMode, keyCount: number): { keyPhase: number; stage: Stage } {
  const [state, setState] = React.useState<{ keyPhase: number; stage: Stage }>({ keyPhase: -1, stage: "idle" });
  React.useEffect(() => {
    // Respect reduced-motion: show the finished outcome, no looping.
    const reduce = typeof window !== "undefined"
      && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setState(mode === "sequence"
        ? { keyPhase: keyCount - 1, stage: "result" }
        : { keyPhase: -1, stage: "result" });
      return;
    }
    let raf = 0;
    let last = "";
    const tick = () => {
      const now = performance.now();
      let keyPhase: number;
      let stage: Stage;
      if (mode === "sequence") {
        const KEY = 520, PAUSE = 1100;
        const cycle = KEY * keyCount + PAUSE;
        const t = now % cycle;
        keyPhase = t < KEY * keyCount ? Math.floor(t / KEY) : -1;
        stage = keyPhase >= 0 ? "pressed" : "result";
      } else {
        const CYCLE = 2300, PRESS = 320, RESULT_END = 1820;
        const t = now % CYCLE;
        keyPhase = t < PRESS ? 0 : -1;
        stage = t < PRESS ? "pressed" : t < RESULT_END ? "result" : "idle";
      }
      const sig = `${keyPhase}/${stage}`;
      if (sig !== last) { last = sig; setState({ keyPhase, stage }); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, keyCount]);
  return state;
}

function MiniVisual({ spec, keyPhase, stage }: { spec: VisualSpec; keyPhase: number; stage: Stage }) {
  if (spec.kind === "grid") return <MiniGrid effect={spec.effect} stage={stage} />;
  if (spec.kind === "dialog") return <MiniDialog effect={spec.effect} stage={stage} />;
  return <MiniRibbon keyPhase={keyPhase} />;
}

function AnimExRow({ ex }: { ex: Example }) {
  const isSeq = ex.mode === "sequence";
  const { keyPhase, stage } = useExAnimation(ex.mode, ex.keys.length);
  const isFail = ex.outcome === "fail";
  const failed = isFail && stage === "result";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
        opacity: failed ? 0.5 : 1, transition: "opacity 200ms",
      }}>
        {ex.keys.map((k, i) => (
          <React.Fragment key={i}>
            {i > 0 && (isSeq
              ? (
                <svg width={10} height={10} viewBox="0 0 10 10" aria-hidden
                     style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0, opacity: keyPhase >= i ? 1 : 0.3, transition: "opacity 150ms" }}>
                  <path d="M2 5h5M5 3l2 2-2 2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )
              : <span style={{ color: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "ui-monospace, monospace", fontWeight: 500 }}>+</span>
            )}
            <AKbd active={isSeq ? keyPhase === i : keyPhase === 0} amber={ex.accentKeys?.includes(k)}>{k}</AKbd>
          </React.Fragment>
        ))}
      </span>
      {isFail ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 15, height: 15, borderRadius: "50%", flexShrink: 0,
            background: "hsl(0 72% 50%)", color: "white",
            display: "grid", placeItems: "center", fontSize: 9.5, fontWeight: 800, lineHeight: 1,
            transform: failed ? "scale(1)" : "scale(0)",
            transition: "transform 220ms cubic-bezier(0.5,1.6,0.5,1)",
          }}>✕</span>
          <span style={{ fontSize: 12.5, color: "hsl(0 55% 42%)" }}>
            {ex.action} <span style={{ opacity: 0.7 }}>· not on Mac</span>
          </span>
        </span>
      ) : (
        <>
          <span style={{ color: "hsl(var(--muted-foreground))", fontFamily: "ui-monospace, monospace", fontSize: 11, flexShrink: 0 }}>→</span>
          <span style={{ color: "hsl(var(--muted-foreground))", fontSize: 12.5 }}>{ex.action}</span>
        </>
      )}
      </div>
      {ex.visual && <MiniVisual spec={ex.visual} keyPhase={keyPhase} stage={stage} />}
    </div>
  );
}

function MiniGrid({ effect, stage }: { effect: GridEffect; stage: Stage }) {
  const result = stage === "result";
  const CW = 36, CH = 20, HH = 16, RHW = 18;
  const cols = (effect === "jump-right" || effect === "jump-left") ? ["A", "B", "C", "D"]
    : effect === "step-right" ? ["A", "B", "C"]
    : ["A", "B"];
  const nRows = effect === "autosum" ? 3 : 2;
  const gridW = RHW + cols.length * CW;
  const gridH = HH + nRows * CH;

  const selCol = effect === "jump-right" ? (result ? cols.length - 1 : 0)
    : effect === "jump-left" ? (result ? 0 : cols.length - 1)
    : effect === "step-right" ? (result ? 1 : 0)
    : 0;
  const selRow = effect === "autosum" ? 2 : 0;

  const cellOf = (c: number, r: number): { t: string; bold?: boolean; accent?: boolean } => {
    if (effect === "cell-bold" && c === 0 && r === 0) return { t: "Q1", bold: result };
    if (effect === "cell-format" && c === 0 && r === 0) return { t: result ? "50%" : "0.5" };
    if (effect === "cell-absref" && c === 0 && r === 0) return { t: result ? "$A$1" : "A1", accent: result };
    if (effect === "autosum" && c === 0) {
      if (r === 0) return { t: "10" };
      if (r === 1) return { t: "20" };
      if (r === 2) return { t: result ? "30" : "", accent: true, bold: true };
    }
    return { t: "" };
  };

  const headerCell = (active: boolean): React.CSSProperties => ({
    display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700,
    color: active ? C.primaryFg : "hsl(var(--muted-foreground))",
    background: active ? C.primarySoft : "hsl(var(--muted))",
    borderRight: "1px solid hsl(var(--border))", borderBottom: "1px solid hsl(var(--border))",
    transition: "background 250ms, color 250ms",
  });

  return (
    <div style={{ position: "relative", width: gridW, height: gridH, borderRadius: 6, overflow: "hidden", border: "1px solid hsl(var(--border))", background: "white", fontFamily: "ui-monospace, monospace" }}>
      <div style={{ position: "absolute", top: 0, left: 0, height: HH, display: "flex" }}>
        <div style={{ ...headerCell(false), width: RHW, height: HH }} />
        {cols.map((c, i) => (
          <div key={c} style={{ ...headerCell(selCol === i), width: CW, height: HH }}>{c}</div>
        ))}
      </div>
      {Array.from({ length: nRows }).map((_, r) => (
        <React.Fragment key={r}>
          <div style={{ ...headerCell(selRow === r), position: "absolute", top: HH + r * CH, left: 0, width: RHW, height: CH }}>{r + 1}</div>
          {cols.map((_, c) => {
            const ct = cellOf(c, r);
            return (
              <div key={c} style={{
                position: "absolute", top: HH + r * CH, left: RHW + c * CW, width: CW, height: CH,
                display: "grid", placeItems: "center", fontSize: 10,
                fontWeight: ct.bold ? 800 : 500,
                color: ct.accent ? C.primaryFg : "hsl(var(--foreground))",
                borderRight: "1px solid hsl(var(--border))", borderBottom: "1px solid hsl(var(--border))",
                transition: "font-weight 200ms",
              }}>{ct.t}</div>
            );
          })}
        </React.Fragment>
      ))}
      <div style={{
        position: "absolute", top: HH + selRow * CH, left: RHW, width: CW, height: CH,
        transform: `translateX(${selCol * CW}px)`,
        border: `2px solid ${C.primary}`, background: "rgba(22,163,74,0.12)",
        boxSizing: "border-box", pointerEvents: "none",
        transition: "transform 350ms cubic-bezier(0.5,0,0.2,1)",
      }} />
    </div>
  );
}

function MiniDialog({ effect, stage }: { effect: DialogVisualEffect; stage: Stage }) {
  const result = stage === "result";
  const W = 156, ROW_H = 18, TITLE_H = 18, PAD = 8, GAP = 4;
  const isOpt = effect === "option-down";
  const rows = isOpt
    ? ["Equals", "Does not equal", "Greater than"]
    : ["Find what", "Replace with", "Within"];
  const focus = result ? 1 : 0;

  return (
    <div style={{ width: W, borderRadius: 6, overflow: "hidden", border: "1px solid hsl(var(--border))", background: "white", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
      <div style={{ height: TITLE_H, display: "flex", alignItems: "center", padding: "0 8px", background: "hsl(var(--muted))", borderBottom: "1px solid hsl(var(--border))", fontSize: 9, fontWeight: 700, color: "hsl(var(--muted-foreground))" }}>
        {isOpt ? "Filter" : "Find & Replace"}
      </div>
      <div style={{ padding: PAD, display: "flex", flexDirection: "column", gap: GAP }}>
        {rows.map((label, i) => {
          const active = focus === i;
          const base: React.CSSProperties = {
            height: ROW_H, display: "flex", alignItems: "center", padding: "0 6px",
            borderRadius: 4, fontSize: 9.5, boxSizing: "border-box",
            transition: "background 250ms, color 250ms, border-color 250ms, box-shadow 250ms",
          };
          const styled: React.CSSProperties = isOpt
            ? { ...base, background: active ? C.primary : "transparent", color: active ? "white" : "hsl(var(--foreground))" }
            : { ...base, border: `1.5px solid ${active ? C.primary : "hsl(var(--border))"}`,
                background: active ? "rgba(22,163,74,0.06)" : "white",
                boxShadow: active ? "0 0 0 2px rgba(22,163,74,0.18)" : "none",
                color: "hsl(var(--foreground))" };
          return (
            <div key={i} style={styled}>
              {isOpt && (
                <span style={{ position: "relative", width: 9, height: 9, borderRadius: "50%", marginRight: 6, flexShrink: 0, border: `1.5px solid ${active ? "white" : "hsl(var(--muted-foreground))"}` }}>
                  {active && <span style={{ position: "absolute", inset: 2, borderRadius: "50%", background: "white" }} />}
                </span>
              )}
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KeyTip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
      minWidth: 13, height: 13, padding: "0 2px", borderRadius: 3,
      background: C.amberSoft, border: `1px solid ${C.amberBorder}`, color: C.amberFg,
      fontSize: 8.5, fontWeight: 800, fontFamily: "ui-monospace, monospace",
      display: "grid", placeItems: "center", lineHeight: 1,
      boxShadow: "0 1px 2px rgba(0,0,0,0.12)", zIndex: 2,
    }}>{children}</span>
  );
}

function BorderGlyph({ color }: { color: string }) {
  return (
    <svg width={12} height={12} viewBox="0 0 16 16" aria-hidden>
      <rect x="2" y="2" width="12" height="12" fill="none" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

function MiniRibbon({ keyPhase }: { keyPhase: number }) {
  const homeActive = keyPhase === 1 || keyPhase === 2 || keyPhase === -1;
  const borderActive = keyPhase === 2 || keyPhase === -1;
  const cellBordered = keyPhase === 2 || keyPhase === -1;
  const tipH = keyPhase === 0;
  const tipB = keyPhase === 1;
  const tabs = ["File", "Home", "Insert", "Data"];

  // Tiny spreadsheet rendered under the ribbon; the border lands on A1.
  const CW = 30, CH = 18, HH = 14, RHW = 16;
  const cols = ["A", "B", "C"];
  const nRows = 2;
  const gridW = RHW + cols.length * CW;
  const gridH = HH + nRows * CH;
  const hc: React.CSSProperties = {
    display: "grid", placeItems: "center", fontSize: 8, fontWeight: 700,
    fontFamily: "ui-monospace, monospace", color: "hsl(var(--muted-foreground))",
    background: "hsl(var(--muted))",
    borderRight: "1px solid hsl(var(--border))", borderBottom: "1px solid hsl(var(--border))",
  };

  return (
    <div style={{ width: "100%", borderRadius: 8, overflow: "hidden", border: "1px solid hsl(var(--border))", background: "white" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, padding: "4px 6px 0", background: "hsl(var(--muted))", borderBottom: `2px solid ${C.primary}` }}>
        {tabs.map(t => {
          const isHome = t === "Home";
          const active = isHome && homeActive;
          return (
            <span key={t} style={{
              position: "relative", padding: "4px 10px", fontSize: 10,
              fontWeight: active ? 700 : 500, borderRadius: "5px 5px 0 0",
              background: active ? "white" : "transparent",
              color: active ? C.primaryFg : "hsl(var(--muted-foreground))",
              border: active ? "1px solid hsl(var(--border))" : "1px solid transparent",
              borderBottom: active ? "1px solid white" : "1px solid transparent",
              marginBottom: -1, transition: "background 200ms, color 200ms",
            }}>
              {t}
              {isHome && tipH && <KeyTip>H</KeyTip>}
            </span>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 8px 6px" }}>
        {["B", "I"].map(b => (
          <span key={b} style={{ width: 22, height: 22, borderRadius: 4, display: "grid", placeItems: "center", border: "1px solid hsl(var(--border))", fontSize: 11, fontWeight: 700, color: "hsl(var(--muted-foreground))", background: "white" }}>{b}</span>
        ))}
        <span style={{
          position: "relative", width: 26, height: 22, borderRadius: 4, display: "grid", placeItems: "center",
          border: `1px solid ${borderActive ? C.primary : "hsl(var(--border))"}`,
          background: borderActive ? C.primary : "white",
          boxShadow: borderActive ? "0 0 0 3px rgba(22,163,74,0.2)" : "none",
          transition: "background 200ms, border-color 200ms, box-shadow 200ms",
        }}>
          <BorderGlyph color={borderActive ? "white" : "hsl(var(--muted-foreground))"} />
          {tipB && <KeyTip>B</KeyTip>}
        </span>
      </div>
      {/* tiny spreadsheet underneath — the border lands here in black (green = selection) */}
      <div style={{ display: "flex", justifyContent: "center", padding: "0 8px 10px" }}>
        <div style={{ position: "relative", width: gridW, height: gridH, border: "1px solid hsl(var(--border))", borderRadius: 4, overflow: "hidden", background: "white" }}>
          <div style={{ position: "absolute", top: 0, left: 0, height: HH, display: "flex" }}>
            <div style={{ ...hc, width: RHW, height: HH }} />
            {cols.map(c => <div key={c} style={{ ...hc, width: CW, height: HH }}>{c}</div>)}
          </div>
          {Array.from({ length: nRows }).map((_, r) => (
            <React.Fragment key={r}>
              <div style={{ ...hc, position: "absolute", top: HH + r * CH, left: 0, width: RHW, height: CH }}>{r + 1}</div>
              {cols.map((_, c) => (
                <div key={c} style={{
                  position: "absolute", top: HH + r * CH, left: RHW + c * CW, width: CW, height: CH,
                  borderRight: "1px solid hsl(var(--border))", borderBottom: "1px solid hsl(var(--border))",
                }} />
              ))}
            </React.Fragment>
          ))}
          <div style={{
            position: "absolute", top: HH, left: RHW, width: CW, height: CH,
            border: "2px solid hsl(var(--foreground))", boxSizing: "border-box", pointerEvents: "none",
            opacity: cellBordered ? 1 : 0, transition: "opacity 200ms",
          }} />
        </div>
      </div>
    </div>
  );
}

function NoGoKeys({ keys }: { keys: string[] }) {
  const { keyPhase } = useExAnimation("combo", keys.length);
  const flash = keyPhase === 0;
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
        {keys.map((k, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <span style={{ color: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "ui-monospace, monospace", fontWeight: 500 }}>+</span>
            )}
            <AKbd active={flash} danger>{k}</AKbd>
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

// Category cards — reuses the user's existing per-section content.
function SectionCards({ sections }: { sections: Section[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
      {sections.map((g, gi) => {
        const hasRibbon = g.examples.some(e => e.visual?.kind === "ribbon");
        return (
        <div key={gi} style={{
          position: "relative",
          gridColumn: hasRibbon ? "1 / -1" : undefined,
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
        );
      })}
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

// ── Orientation pages (How to use / How to learn) ──────────────────────────
// Two visual directions are built side-by-side so the winner can be picked from
// a live demo. Variant "A" loops subtle animations; variant "B" is static with
// only hover / fade-in. Both share the same layout + copy.

type NewPageVariant = "A" | "B";

const NEW_KEYFRAMES = `
@keyframes bysBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
@keyframes bysPulseDot { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.35)} }
@keyframes bysFadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
`;

// Loops 0..count (the extra terminal step is a brief "all done" pause). Honours
// reduced-motion by resting on the finished state.
function usePhaseLoop(count: number, stepMs: number): number {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const reduce = typeof window !== "undefined"
      && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setI(count); return; }
    const id = setInterval(() => setI(p => (p + 1) % (count + 1)), stepMs);
    return () => clearInterval(id);
  }, [count, stepMs]);
  return i;
}

function Keyframes() {
  return <style>{NEW_KEYFRAMES}</style>;
}

function OrientCard({ Icon, title, children, tint = false }: {
  Icon: LucideIcon; title: string; children: React.ReactNode; tint?: boolean;
}) {
  return (
    <div style={{
      position: "relative", padding: "14px 16px 14px 20px",
      border: "1px solid hsl(var(--border))", borderRadius: 12,
      background: tint ? C.primarySoft : "hsl(var(--card))",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <span style={{ position: "absolute", left: 0, top: 14, bottom: 14, width: 3, background: C.primary, borderRadius: "0 3px 3px 0", opacity: 0.85 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ width: 24, height: 24, borderRadius: 7, background: tint ? "white" : C.primarySoft, color: C.primaryFg, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icon size={14} />
        </span>
        <span style={{ fontWeight: 700, fontSize: 14.5, letterSpacing: "-0.015em" }}>{title}</span>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.55, opacity: 0.85 }}>{children}</div>
    </div>
  );
}

// ── Page 1: flow pipeline ──
const FLOW: { Icon: LucideIcon; label: string; sub: string }[] = [
  { Icon: Layers, label: "Flashcards", sub: "Learn" },
  { Icon: Target, label: "Challenges", sub: "Train · Time" },
  { Icon: Repeat, label: "Drills", sub: "No slips" },
  { Icon: Trophy, label: "Next level", sub: "Certified" },
];

function FlowArrow({ lit }: { lit: boolean }) {
  return (
    <span style={{ display: "grid", placeItems: "center", alignSelf: "center", flexShrink: 0, color: lit ? C.primary : "hsl(var(--muted-foreground))", transition: "color 300ms" }}>
      <svg width={14} height={14} viewBox="0 0 10 10" aria-hidden>
        <path d="M2 5h5M5 3l2 2-2 2" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function FlowPipeline({ animated }: { animated: boolean }) {
  const phase = usePhaseLoop(FLOW.length, 850);
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 5, flexWrap: "wrap" }}>
      {FLOW.map((n, i) => {
        const done = animated ? (phase > i || phase === FLOW.length) : true;
        const glow = animated && phase === i;
        const on = done || glow;
        return (
          <React.Fragment key={n.label}>
            {i > 0 && <FlowArrow lit={animated ? phase >= i : true} />}
            <div style={{
              flex: "1 1 0", minWidth: 84, display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              padding: "12px 6px", borderRadius: 10,
              border: `1.5px solid ${on ? C.primary : "hsl(var(--border))"}`,
              background: glow ? C.primarySoft : "hsl(var(--card))",
              boxShadow: glow ? "0 0 0 3px rgba(22,163,74,0.18)" : "none",
              transition: "all 300ms ease",
            }}>
              <span style={{
                width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center",
                background: on ? C.primary : "hsl(var(--muted))",
                color: on ? "#fff" : "hsl(var(--muted-foreground))",
                transition: "all 300ms ease",
              }}>
                <n.Icon size={16} />
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "-0.01em" }}>{n.label}</span>
              <span style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "ui-monospace, monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>{n.sub}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function SubPill({ Icon, label, desc }: { Icon: LucideIcon; label: string; desc: string }) {
  return (
    <div style={{ padding: "9px 10px", borderRadius: 9, background: "hsl(var(--muted)/0.5)", border: "1px solid hsl(var(--border))" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
        <Icon size={12} style={{ color: C.primaryFg }} />
        <span style={{ fontSize: 12, fontWeight: 700 }}>{label}</span>
      </div>
      <div style={{ fontSize: 11.5, lineHeight: 1.4, color: "hsl(var(--muted-foreground))" }}>{desc}</div>
    </div>
  );
}

function DrillMeter({ animated }: { animated: boolean }) {
  const BUDGET = 3;
  const phase = usePhaseLoop(BUDGET + 1, 700);
  const lost = animated ? Math.min(phase, BUDGET) : 0;
  const resetting = animated && phase === BUDGET;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, padding: "9px 12px", borderRadius: 9, background: C.amberBg, border: `1px solid ${C.amberBorder}`, flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 4 }}>
        {Array.from({ length: BUDGET }).map((_, i) => {
          const gone = i < lost;
          return <Heart key={i} size={15} style={{ color: gone ? "hsl(var(--muted-foreground))" : "hsl(0 72% 50%)", fill: gone ? "transparent" : "hsl(0 72% 50%)", opacity: gone ? 0.4 : 1, transition: "all 250ms" }} />;
        })}
      </div>
      <span style={{ fontSize: 11.5, color: C.amberFg, fontWeight: 600 }}>Limited mistakes</span>
      <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, color: C.amberFg, fontWeight: 700 }}>
        <RotateCcw size={13} style={{ transform: resetting ? "rotate(-320deg)" : "rotate(0deg)", transition: "transform 500ms ease" }} />
        resets to start
      </span>
    </div>
  );
}

function HowToUseBody({ variant }: { variant: NewPageVariant }) {
  const animated = variant === "A";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Keyframes />
      <FlowPipeline animated={animated} />
      <OrientCard Icon={Layers} title="Flashcards — start here">
        Before any challenge, flip through the cards and learn each shortcut. Only
        move on once you can recall <em>all</em> of them from memory.
      </OrientCard>
      <OrientCard Icon={Target} title="Challenges — Training, then Timed">
        Two stages, same shortcuts:
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          <SubPill Icon={Dumbbell} label="Training" desc="A no-pressure run to confirm they really stuck." />
          <SubPill Icon={Timer} label="Timed" desc="Solid? Now prove it against the clock." />
        </div>
      </OrientCard>
      <OrientCard Icon={Repeat} title="Drills — precision, no slip-ups">
        Once every challenge is done, drills push you with a strict error budget.
        Go over it and the drill resets to the very start.
        <DrillMeter animated={animated} />
      </OrientCard>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: C.primary, color: "#fff" }}>
        <Trophy size={18} style={{ flexShrink: 0, animation: animated ? "bysBob 2.2s ease-in-out infinite" : undefined }} />
        <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.45 }}>
          Clear all of that and the level is complete — on to the next level.
        </span>
      </div>
    </div>
  );
}

// ── Page 2: how to learn ──
function MuscleMemory({ animated }: { animated: boolean }) {
  const STEPS = 12;
  const phase = usePhaseLoop(STEPS, 230);
  const pct = animated ? 32 + (phase / STEPS) * 68 : 100;
  return (
    <div style={{ padding: "14px 16px", border: "1px solid hsl(var(--border))", borderRadius: 12, background: "hsl(var(--card))" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ width: 24, height: 24, borderRadius: 7, background: C.primarySoft, color: C.primaryFg, display: "grid", placeItems: "center", flexShrink: 0 }}><TrendingUp size={14} /></span>
        <span style={{ fontWeight: 700, fontSize: 14 }}>Muscle memory</span>
        <span style={{ marginLeft: "auto", fontSize: 10.5, color: "hsl(var(--muted-foreground))", fontFamily: "ui-monospace, monospace" }}>built by reps, not by finishing</span>
      </div>
      <div style={{ position: "relative", height: 12, borderRadius: 6, background: "hsl(142 40% 92%)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, width: `${pct}%`, background: C.primary, borderRadius: 6, transition: "width 200ms linear" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
        <span>Each rep strengthens it…</span>
        <span>…stop, and it fades.</span>
      </div>
    </div>
  );
}

const REP_DAYS: { day: string; Icon: LucideIcon; label: string; note: string; rest?: boolean }[] = [
  { day: "Day 1", Icon: BookOpen, label: "Learn it", note: "flashcards on" },
  { day: "Wait", Icon: Moon, label: "A day or two", note: "let it settle", rest: true },
  { day: "Day 3", Icon: Repeat, label: "Repeat it", note: "no flashcards" },
];

function SpacedRepeat({ animated }: { animated: boolean }) {
  const phase = usePhaseLoop(REP_DAYS.length, 950);
  return (
    <div style={{ padding: "14px 16px", border: "1px solid hsl(var(--border))", borderRadius: 12, background: "hsl(var(--card))" }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", fontFamily: "ui-monospace, monospace", marginBottom: 10 }}>
        Space your repetitions
      </div>
      <div style={{ display: "flex", alignItems: "stretch", gap: 5 }}>
        {REP_DAYS.map((d, i) => {
          const active = animated ? phase === i : true;
          return (
            <React.Fragment key={d.day}>
              {i > 0 && <FlowArrow lit={animated ? phase >= i : true} />}
              <div style={{
                flex: "1 1 0", minWidth: 78, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                padding: "11px 6px", borderRadius: 10,
                border: `1.5px solid ${active ? C.primary : "hsl(var(--border))"}`,
                background: active ? C.primarySoft : "hsl(var(--card))",
                boxShadow: animated && phase === i ? "0 0 0 3px rgba(22,163,74,0.16)" : "none",
                transition: "all 300ms ease",
              }}>
                <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "ui-monospace, monospace", letterSpacing: "0.05em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))" }}>{d.day}</span>
                <span style={{ width: 26, height: 26, borderRadius: 7, display: "grid", placeItems: "center", background: d.rest ? "hsl(var(--muted))" : C.primary, color: d.rest ? "hsl(var(--muted-foreground))" : "#fff", transition: "all 300ms" }}>
                  <d.Icon size={14} />
                </span>
                <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "-0.01em", textAlign: "center" }}>{d.label}</span>
                <span style={{ fontSize: 9.5, color: i === REP_DAYS.length - 1 ? C.primaryFg : "hsl(var(--muted-foreground))", fontWeight: i === REP_DAYS.length - 1 ? 700 : 500, fontFamily: "ui-monospace, monospace", textAlign: "center" }}>{d.note}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

const LEARN_CALLOUTS: { Icon: LucideIcon; title: string; text: React.ReactNode }[] = [
  { Icon: Timer, title: "Don't do it in one sitting", text: "Finished a level? Don't jump straight to the next. Wait a day or two, then repeat it — this time without flashcards to jog your memory. Same for drills." },
  { Icon: Dumbbell, title: "A training window, not a race", text: "Your week or month isn't there to rush the challenges — it's time to drill them the way an athlete or a real ninja would, until the moves are automatic." },
  { Icon: Trophy, title: "The certificate isn't the finish line", text: "Earned it after every level? Start over. Ninjas keep training the moves they've already “learned”." },
];

function HowToLearnBody({ variant }: { variant: NewPageVariant }) {
  const animated = variant === "A";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Keyframes />
      <MuscleMemory animated={animated} />
      <SpacedRepeat animated={animated} />
      {LEARN_CALLOUTS.map((c, i) => (
        <div key={i} style={{
          display: "flex", gap: 11, padding: "13px 15px",
          border: "1px solid hsl(var(--border))", borderRadius: 12, background: "hsl(var(--card))",
          animation: animated ? `bysFadeUp 400ms ease both ${i * 90}ms` : undefined,
        }}>
          <span style={{ width: 26, height: 26, borderRadius: 7, background: C.primarySoft, color: C.primaryFg, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <c.Icon size={15} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 2, letterSpacing: "-0.01em" }}>{c.title}</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "hsl(var(--muted-foreground))" }}>{c.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Meta for the two orientation pages, referenced by BYS_DATA below.
const NEW_PAGE_META = {
  howto: {
    label: "How to use the app",
    hint: "Your path from zero to certified",
    title: "How Excel Ninja works",
    sub: "Every level follows the same path: learn the shortcuts cold, prove them under pressure, then drill them until they're automatic.",
  },
  learn: {
    label: "How to learn",
    hint: "Repetition is the whole point",
    title: "How to actually get faster",
    sub: "Speed comes from muscle memory, and muscle memory only comes from repetition. Here's how to train — instead of just passing.",
  },
} as const;

// Visual style for the orientation pages: "A" = subtle looping animation
// (chosen), "B" = static with fade-in only.
const NEW_PAGE_VARIANT: NewPageVariant = "A";

// ── Fn button section ──────────────────────────────────────────────────────
// Explains the Fn *modifier* (distinct from the F1–F12 "Function keys" section).
// The "no key at all" case has two builds selected by FNMOD_VARIANT: "full"
// shows an animated (non-interactive) on-screen keyboard; "text" is prose only.
// Nothing here is clickable — animation only. Flip the const to pick a winner.
const FNMOD_VARIANT: "full" | "text" = "full";

// A chunkier, physical-looking keycap for the "check your keyboard" illustration.
function PhysKey({ children, accent = false, small = false }: { children: React.ReactNode; accent?: boolean; small?: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: small ? 30 : 42, height: small ? 26 : 34, padding: "0 9px",
      borderRadius: 7, fontFamily: "ui-monospace, monospace",
      fontSize: small ? 11 : 12.5, fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" as const,
      border: `1px solid ${accent ? C.amberBorder : "hsl(var(--border))"}`,
      background: accent ? C.amberSoft : "white",
      color: accent ? C.amberFg : "hsl(var(--foreground))",
      boxShadow: `0 2px 0 ${accent ? C.amberBorder : "hsl(var(--border))"}`,
    }}>{children}</span>
  );
}

// A physical keycap with two legends: the main glyph, plus a smaller secondary
// label engraved in the corner (amber = the function Fn unlocks).
function DualKey({ main, corner }: { main: React.ReactNode; corner: string }) {
  return (
    <span style={{
      position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 40, height: 40, borderRadius: 7,
      border: "1px solid hsl(var(--border))", background: "white",
      boxShadow: "0 2px 0 hsl(var(--border))",
      fontFamily: "ui-monospace, monospace", fontSize: 15, fontWeight: 700,
      color: "hsl(var(--foreground))", flexShrink: 0,
    }}>
      {main}
      <span style={{
        position: "absolute", top: 3, right: 4,
        fontSize: 7.5, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em",
        color: C.amberFg,
      }}>{corner}</span>
    </span>
  );
}

function FnKeyIllustration() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 12,
      padding: "14px 16px", border: "1px solid hsl(var(--border))",
      borderRadius: 12, background: "hsl(var(--card))",
    }}>
      <div style={{ fontSize: 13.5, lineHeight: 1.5, opacity: 0.85 }}>
        Look for a second label printed small in the corner of a key — on many keyboards
        Home, Page Up and Page Down live on the arrow keys. Hold <Kbd>Fn</Kbd> and that
        corner label fires instead of the main one.
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" as const }}>
        <PhysKey small accent>Fn</PhysKey>
        <span style={{ color: "hsl(var(--muted-foreground))", fontFamily: "ui-monospace, monospace", fontSize: 13, fontWeight: 600 }}>+</span>
        <DualKey main="←" corner="Home" />
        <DualKey main="↑" corner="PgUp" />
        <DualKey main="↓" corner="PgDn" />
        <DualKey main="→" corner="End" />
      </div>
    </div>
  );
}

// Card wrapper for the three mini-subsections (badge can be an icon or text).
function FnSub({ badge, title, children }: { badge: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{
      position: "relative", padding: "14px 16px 14px 20px",
      border: "1px solid hsl(var(--border))", borderRadius: 12,
      background: "hsl(var(--card))", display: "flex", flexDirection: "column", gap: 9,
    }}>
      <span style={{ position: "absolute", left: 0, top: 14, bottom: 14, width: 3, background: C.primary, borderRadius: "0 3px 3px 0", opacity: 0.85 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{
          minWidth: 24, height: 24, padding: "0 6px", borderRadius: 7,
          background: C.primarySoft, color: C.primaryFg, display: "grid", placeItems: "center",
          flexShrink: 0, fontSize: 11, fontWeight: 800, fontFamily: "ui-monospace, monospace",
        }}>{badge}</span>
        <span style={{ fontWeight: 700, fontSize: 14.5, letterSpacing: "-0.015em" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function SettingsChip() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px",
      borderRadius: 6, background: C.primarySoft, color: C.primaryFg,
      fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap" as const,
    }}>
      <SlidersHorizontal size={11} /> Settings → Missing Keys
    </span>
  );
}

// Non-interactive mock of the real on-screen keyboard. Ctrl reads as "held" on
// the physical keyboard; Page Up gets a looping tap-pulse to show the click.
function MiniVirtualKeyboard() {
  const phase = usePhaseLoop(1, 900);
  const tapped = phase === 1;
  const keys = ["Ctrl", "End", "Home", "Page Up", "Page Down"];
  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid hsl(var(--border))", background: "hsl(var(--muted)/0.4)" }}>
      <div style={{
        padding: "7px 10px", borderBottom: "1px solid hsl(var(--border))",
        fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const,
        fontFamily: "ui-monospace, monospace", color: C.primaryFg,
      }}>
        Virtual Keyboard — click to press
      </div>
      <div style={{ display: "flex", gap: 5, padding: 10, flexWrap: "wrap" as const, alignItems: "center" }}>
        {keys.map(k => {
          const held = k === "Ctrl";
          const target = k === "Page Up";
          const on = held || (target && tapped);
          return (
            <span key={k} style={{ position: "relative", display: "inline-flex" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                height: 28, padding: "0 9px", borderRadius: 6,
                fontFamily: "ui-monospace, monospace", fontSize: 11, fontWeight: 700,
                border: `1px solid ${on ? C.primary : "hsl(var(--border))"}`,
                background: on ? C.primary : "white",
                color: on ? "white" : "hsl(var(--foreground))",
                boxShadow: on ? "0 0 0 3px rgba(22,163,74,0.2)" : "0 1px 0 hsl(var(--border))",
                transform: target && tapped ? "translateY(1px) scale(0.96)" : "none",
                transition: "all 150ms ease",
              }}>{k}</span>
              {held && (
                <span style={{
                  position: "absolute", top: -7, left: "50%", transform: "translateX(-50%)",
                  fontSize: 7.5, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase" as const,
                  color: C.primaryFg, background: C.primarySoft, borderRadius: 3, padding: "1px 4px",
                  whiteSpace: "nowrap" as const, fontFamily: "ui-monospace, monospace",
                }}>held</span>
              )}
              {target && (
                <MousePointerClick size={13} aria-hidden style={{
                  position: "absolute", right: -6, bottom: -6, color: C.primaryFg,
                  opacity: tapped ? 1 : 0.45, transform: tapped ? "scale(1)" : "scale(0.85)",
                  transition: "all 150ms ease",
                }} />
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function FnModBody({ variant }: { variant: "full" | "text" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Keyframes />
      <FnKeyIllustration />
      <FnSub badge={<Keyboard size={14} />} title="Standard keyboard">
        <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.82 }}>
          Has a dedicated Page Up key? Just press the combo.
        </div>
        <AnimExRow ex={{ keys: ["Ctrl", "Page Up"], mode: "combo", action: "Previous worksheet" }} />
      </FnSub>
      <FnSub badge="Fn" title="Via the Fn button">
        <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.82 }}>
          No dedicated key? Hold <Kbd>Fn</Kbd> to reach it — it&apos;s a secondary function
          printed on another key.
        </div>
        <AnimExRow ex={{ keys: ["Ctrl", "Fn", "Page Up"], mode: "combo", action: "Previous worksheet", accentKeys: ["Fn"] }} />
      </FnSub>
      <FnSub badge={<MousePointerClick size={14} />} title="No Fn — and no key at all">
        {variant === "full" ? (
          <>
            <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.82 }}>
              Tick the key under <SettingsChip /> and an on-screen keyboard appears in every
              drill. You don&apos;t have to click everything — hold what your keyboard has and
              tap only what it&apos;s missing:
            </div>
            <MiniVirtualKeyboard />
            <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", lineHeight: 1.45 }}>
              Here: hold <Kbd>Ctrl</Kbd> on your keyboard, click <Kbd>Page Up</Kbd> on-screen.
            </div>
          </>
        ) : (
          <div style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.85, display: "flex", flexDirection: "column", gap: 7 }}>
            <div>1. Tick the key under <SettingsChip /> — this tells us your keyboard is missing it.</div>
            <div>2. An on-screen keyboard then appears in every drill and challenge.</div>
            <div>3. You can mix inputs: hold <Kbd>Ctrl</Kbd> on your real keyboard and click <Kbd>Page Up</Kbd> on-screen.</div>
          </div>
        )}
      </FnSub>
    </div>
  );
}

// ── Data ──
// Order = a natural learning progression, ending on the Mac & no-go heads-ups.

const BYS_DATA: ItemData[] = [
  {
    id: "howto",
    label: NEW_PAGE_META.howto.label,
    hint: NEW_PAGE_META.howto.hint,
    title: NEW_PAGE_META.howto.title,
    sub: NEW_PAGE_META.howto.sub,
    body: <HowToUseBody variant={NEW_PAGE_VARIANT} />,
  },
  {
    id: "learn",
    label: NEW_PAGE_META.learn.label,
    hint: NEW_PAGE_META.learn.hint,
    title: NEW_PAGE_META.learn.title,
    sub: NEW_PAGE_META.learn.sub,
    body: <HowToLearnBody variant={NEW_PAGE_VARIANT} />,
  },
  {
    id: "ctrl",
    label: "Ctrl / Cmd",
    hint: "The workhorse modifier",
    title: "The workhorse modifier",
    sub: (
      <>
        Nearly every shortcut starts here.  <br></br>
        On Mac, <Kbd>Cmd ⌘</Kbd> does the same job — and <Kbd>Ctrl</Kbd> usually
        works too.
      </>
    ),
    sections: [
      {
        label: "Navigation",
        use: "Move fast through large sheets without ever touching the mouse.",
        examples: [{ keys: ["Ctrl", "→"], mode: "combo", action: "Jump to data edge", visual: { kind: "grid", effect: "jump-right" } }],
      },
      {
        label: "Formatting",
        use: "Apply the most common styles instantly, without opening a single menu.",
        examples: [{ keys: ["Ctrl", "B"], mode: "combo", action: "Bold", visual: { kind: "grid", effect: "cell-bold" } }],
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
        examples: [{ keys: ["Alt", "H", "B"], mode: "sequence", action: "Add cell border", visual: { kind: "ribbon" } }],
      },
      {
        label: "Direct combos",
        use: "A handful of high-value combos worth knowing — held together, not in sequence.",
        examples: [{ keys: ["Alt", "="], mode: "combo", action: "AutoSum", visual: { kind: "grid", effect: "autosum" } }],
      },
    ],
  },
  {
    id: "arrows",
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
        examples: [{ keys: ["Ctrl", "→"], mode: "combo", action: "Jump to last cell", visual: { kind: "grid", effect: "jump-right" } }],
      },
      {
        label: "Move in menu's & dialog windows",
        use: "This works everywhere: color picker, filter menu, etc...",
        examples: [{ keys: ["↓"], mode: "combo", action: "Move down to the next option", visual: { kind: "dialog", effect: "option-down" } }],
      },
    ],
  },
  {
    id: "numbers",
    label: "Number keys",
    hint: "Mostly formatting",
    title: "Mostly formatting",
    sub: "If a shortcut combo includes a number key, it's almost always applying a cell format.",
    sections: [
      {
        label: "Formatting",
        use: "Currency, percentages, dates — formatted with a single combo, no dialog needed.",
        examples: [{ keys: ["Ctrl", "⇧", "5"], mode: "combo", action: "Apply percentage format", visual: { kind: "grid", effect: "cell-format" } }],
      },
    ],
  },
  {
    id: "fn",
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
    id: "fnmod",
    label: "Fn button",
    hint: "Reaching Home & Page keys",
    title: "The Fn button",
    sub: (
      <>
        Many laptops and compact keyboards have no dedicated <Kbd>Home</Kbd>,{" "}
        <Kbd>Page Up</Kbd> or <Kbd>Page Down</Kbd> keys — but almost all can still
        fire them through the <Kbd>Fn</Kbd> button.
      </>
    ),
    body: <FnModBody variant={FNMOD_VARIANT} />,
  },
  {
    id: "special",
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
        examples: [{ keys: ["Tab"], mode: "combo", action: "Move to next field", visual: { kind: "dialog", effect: "tab-fields" } }],
      },
      {
        label: "In the spreadsheet",
        use: "The key you press to confirm an entry decides where the cursor goes next.",
        examples: [{ keys: ["Tab"], mode: "combo", action: "Confirm entry, move 1 cell right", visual: { kind: "grid", effect: "step-right" } }],
      },
    ],
  },
  {
    id: "mac",
    label: "Mac shortcuts",
    hint: "Mostly the same — with gaps",
    title: "On a Mac: mostly the same, with gaps",
    sub: "Most of your muscle memory carries straight over. But a few things behave differently on Excel for Mac — these are the ones to watch.",
    sections: [
      {
        label: "Ctrl & Cmd",
        use: (
          <>
            Most <Kbd>Ctrl</Kbd> shortcuts work on Mac with <em>either</em>{" "}
            <Kbd>Ctrl</Kbd> or <Kbd>Cmd ⌘</Kbd> — Excel maps both. A few have no
            Mac equivalent or change outright; drill those in Flashcards.
          </>
        ),
        examples: [{ keys: ["⌘", "→"], mode: "combo", action: "Jump to data edge", visual: { kind: "grid", effect: "jump-right" } }],
      },
      {
        label: "Alt & the Ribbon",
        use: (
          <>
            <Kbd>Alt</Kbd> becomes <Kbd>⌥</Kbd>, but Ribbon mode (<Kbd>Alt</Kbd>{" "}
            then letters) doesn&apos;t exist in Excel for Mac. A few direct combos
            carry over — most don&apos;t.
          </>
        ),
        examples: [
          { keys: ["Alt", "H", "M", "C"], mode: "sequence", action: "Merge & Center (Ribbon)", outcome: "fail" },
          { keys: ["⌥", "→"], mode: "combo", action: "Next worksheet" },
        ],
      },
      {
        label: "Fn for navigation",
        use: (
          <>
            <Kbd>Home</Kbd>, <Kbd>Page Up</Kbd> and <Kbd>Page Down</Kbd> need{" "}
            <Kbd>Fn</Kbd> on a Mac and work fine on their own — but not bundled
            into complex selection combos.
          </>
        ),
        examples: [
          { keys: ["Fn", "←"], mode: "combo", action: "Home — jump to column A", visual: { kind: "grid", effect: "jump-left" } },
          { keys: ["Ctrl", "⇧", "Home"], mode: "combo", action: "Select to A1", outcome: "fail" },
        ],
      },
      {
        label: "Remapped keys",
        use: "A few are simply different keys. The classic: toggling absolute references ($A$1) while editing a formula.",
        examples: [{ keys: ["⌘", "T"], mode: "combo", action: "Toggle $A$1 (F4 on Windows)", visual: { kind: "grid", effect: "cell-absref" } }],
      },
    ],
  },
  {
    id: "nogo",
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
            {BYS_DATA.map((x, i) => {
              const done = read.has(x.id), active = sel === x.id;
              return (
                <React.Fragment key={x.id}>
                {x.id === "ctrl" && (
                  <div style={{
                    padding: "12px 10px 5px", marginTop: 6,
                    borderTop: "1px solid hsl(var(--border))",
                    fontSize: 9.5, fontWeight: 700, letterSpacing: "0.11em",
                    textTransform: "uppercase", fontFamily: "ui-monospace, monospace",
                    color: "hsl(var(--muted-foreground))", opacity: 0.55,
                  }}>
                    Power keys
                  </div>
                )}
                <button
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
                    fontSize: 9.5, fontWeight: 700, fontFamily: "ui-monospace, monospace",
                    border: done ? "none" : x.warn ? `1px solid ${C.amberBorder}` : "none",
                  }}>
                    {done ? <Check size={12} /> : String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: x.warn ? C.amberFg : "hsl(var(--foreground))", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.label}</span>
                </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Detail */}
          <div style={{ flex: 1, padding: 24, overflowY: "auto", minWidth: 0 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: item.warn ? C.amberFg : "hsl(var(--foreground))" }}>{item.title}</div>
              <div style={{ fontSize: 12.5, color: "hsl(var(--muted-foreground))" }}>{item.hint}</div>
            </div>
            <p style={{ fontSize: 13.5, color: item.warn ? C.amberFg : "hsl(var(--foreground))", lineHeight: 1.6, marginBottom: 16, opacity: item.warn ? 1 : 0.85 }}>{item.sub}</p>

            {item.body ? item.body
              : item.nogo ? <NoGoTable rows={item.nogo} />
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
              Next <ArrowRight className="ml-1.5 h-4 w-4" />
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

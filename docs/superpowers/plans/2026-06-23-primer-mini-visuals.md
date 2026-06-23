# Primer Mini-Visuals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add small, key-synced, looping mini-visuals (Excel grid, dialog, ribbon) to each section card of the "Before you start" keyboard primer so it *shows* what each shortcut does.

**Architecture:** Three self-contained inline-styled primitives (`MiniGrid`, `MiniDialog`, `MiniRibbon`) driven by a shared animation timeline hook. The existing `useExAnimation` is extended to return both `keyPhase` (key-cap flashes, unchanged behavior) and a semantic `stage` the visuals read, so keys and visuals are frame-synced. An optional `visual` field on the `Example` data drives which primitive renders per card.

**Tech Stack:** React 18, TypeScript, inline styles + SVG (matching the existing bespoke-primitive style in `before-you-start.tsx`). No new dependencies.

## Global Constraints

- **No test framework.** Verification = `npm run typecheck` (file must be clean — `before-you-start.tsx` is NOT in the known pre-existing-error set) + visual check at `http://localhost:9002`.
- **No `any`** in new code.
- **Palette:** emerald only for selection/active (`C.primary` / `C.primarySoft` / `C.primaryFg`), amber (`C.amberSoft` / `C.amberBorder` / `C.amberFg`) for ribbon KeyTips. **Never** `bg-blue-*` / Excel-blue.
- **Single file:** all changes are in `src/components/before-you-start.tsx` unless noted.
- All primitives are pure functions of their props (no side effects).

---

### Task 1: Extend the timeline hook + add visual types

**Files:**
- Modify: `src/components/before-you-start.tsx` (the `AnimMode`/`Example` types near top; `useExAnimation` ~L111-135; `AnimExRow` ~L137-174)

**Interfaces:**
- Produces:
  - `type Stage = "idle" | "pressed" | "result"`
  - `type GridEffect = "jump-right" | "step-right" | "cell-bold" | "cell-format" | "autosum"`
  - `type DialogVisualEffect = "option-down" | "tab-fields"`
  - `type VisualSpec = { kind: "grid"; effect: GridEffect } | { kind: "dialog"; effect: DialogVisualEffect } | { kind: "ribbon" }`
  - `Example` gains optional `visual?: VisualSpec`
  - `useExAnimation(mode, keyCount): { keyPhase: number; stage: Stage }` (changed return shape; honors `prefers-reduced-motion` by holding the result state with no loop)

- [ ] **Step 1: Add the visual/stage types**

Add directly below the existing `interface Example` block (after ~L19):

```tsx
type Stage = "idle" | "pressed" | "result";
type GridEffect = "jump-right" | "step-right" | "cell-bold" | "cell-format" | "autosum";
type DialogVisualEffect = "option-down" | "tab-fields";
type VisualSpec =
  | { kind: "grid"; effect: GridEffect }
  | { kind: "dialog"; effect: DialogVisualEffect }
  | { kind: "ribbon" };
```

Then add `visual?: VisualSpec;` as the last field of `interface Example`.

- [ ] **Step 2: Replace `useExAnimation` with the dual-output, reduced-motion-aware version**

Replace the whole `useExAnimation` function (~L111-135) with:

```tsx
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
```

- [ ] **Step 3: Update the single call site in `AnimExRow`**

In `AnimExRow`, change the hook call and every `phase` reference to `keyPhase`. Replace the line:

```tsx
  const phase = useExAnimation(ex.mode, ex.keys.length);
```

with:

```tsx
  const { keyPhase } = useExAnimation(ex.mode, ex.keys.length);
```

Then update the three usages inside the JSX: `phase >= i` → `keyPhase >= i`, `phase === i` → `keyPhase === i`, `phase === 0` → `keyPhase === 0`. (The visual render is wired in Task 5 — don't add it yet.)

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck 2>&1 | grep before-you-start`
Expected: no output (file clean).

- [ ] **Step 5: Commit**

```bash
git add src/components/before-you-start.tsx
git commit -m "feat(primer): extend animation hook with stage + visual types"
```

---

### Task 2: `MiniGrid` primitive

**Files:**
- Modify: `src/components/before-you-start.tsx` (add component below `AnimExRow`)

**Interfaces:**
- Consumes: `GridEffect`, `Stage`, `C` palette.
- Produces: `MiniGrid({ effect, stage }: { effect: GridEffect; stage: Stage })` — a small Excel grid with an animated emerald selection box. Selection translates (`jump-right`/`step-right`), or the active cell content changes (`cell-bold` → bold, `cell-format` → `0.5`→`50%`, `autosum` → total fills `30`).

- [ ] **Step 1: Add the component**

Insert after the `AnimExRow` function:

```tsx
function MiniGrid({ effect, stage }: { effect: GridEffect; stage: Stage }) {
  const result = stage === "result";
  const CW = 36, CH = 20, HH = 16, RHW = 18;
  const cols = effect === "jump-right" ? ["A", "B", "C", "D"]
    : effect === "step-right" ? ["A", "B", "C"]
    : ["A", "B"];
  const nRows = effect === "autosum" ? 3 : 2;
  const gridW = RHW + cols.length * CW;
  const gridH = HH + nRows * CH;

  const selCol = effect === "jump-right" ? (result ? cols.length - 1 : 0)
    : effect === "step-right" ? (result ? 1 : 0)
    : 0;
  const selRow = effect === "autosum" ? 2 : 0;

  const cellOf = (c: number, r: number): { t: string; bold?: boolean; accent?: boolean } => {
    if (effect === "cell-bold" && c === 0 && r === 0) return { t: "Q1", bold: result };
    if (effect === "cell-format" && c === 0 && r === 0) return { t: result ? "50%" : "0.5" };
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck 2>&1 | grep before-you-start`
Expected: no output. (`MiniGrid` is unused until Task 5 — `tsc` does not error on unused functions.)

- [ ] **Step 3: Commit**

```bash
git add src/components/before-you-start.tsx
git commit -m "feat(primer): add MiniGrid visual primitive"
```

---

### Task 3: `MiniDialog` primitive

**Files:**
- Modify: `src/components/before-you-start.tsx` (add component below `MiniGrid`)

**Interfaces:**
- Consumes: `DialogVisualEffect`, `Stage`, `C`.
- Produces: `MiniDialog({ effect, stage }: { effect: DialogVisualEffect; stage: Stage })` — a tiny dialog whose focus highlight moves down an option list (`option-down`) or hops between fields (`tab-fields`) when `stage === "result"`.

- [ ] **Step 1: Add the component**

Insert after `MiniGrid`:

```tsx
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck 2>&1 | grep before-you-start`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/before-you-start.tsx
git commit -m "feat(primer): add MiniDialog visual primitive"
```

---

### Task 4: `MiniRibbon` primitive (+ KeyTip / BorderGlyph helpers)

**Files:**
- Modify: `src/components/before-you-start.tsx` (add components below `MiniDialog`)

**Interfaces:**
- Consumes: `C`, the sequence `keyPhase` (0 = Alt, 1 = H, 2 = B, -1 = hold).
- Produces:
  - `KeyTip({ children })` — amber Excel-style KeyTip badge.
  - `BorderGlyph({ color })` — small square-border SVG.
  - `MiniRibbon({ keyPhase }: { keyPhase: number })` — Excel ribbon: Alt shows KeyTips, H activates the Home tab, B lights the Borders button and lands a border on the target cell; the completed state holds during `keyPhase === -1`.

- [ ] **Step 1: Add the helpers + ribbon**

Insert after `MiniDialog`:

```tsx
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
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 8 }}>
        <div style={{ display: "flex", gap: 6 }}>
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
        <span style={{ color: "hsl(var(--muted-foreground))", fontFamily: "ui-monospace, monospace", fontSize: 12 }}>→</span>
        <span style={{
          width: 30, height: 22, display: "grid", placeItems: "center", fontSize: 10, fontWeight: 600,
          fontFamily: "ui-monospace, monospace", background: "white",
          border: cellBordered ? `2px solid ${C.primary}` : "1px dashed hsl(var(--border))",
          transition: "border 200ms",
        }}>A1</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck 2>&1 | grep before-you-start`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/before-you-start.tsx
git commit -m "feat(primer): add MiniRibbon visual primitive"
```

---

### Task 5: Wire visuals in + section data + full-width ribbon + Ctrl→B change

**Files:**
- Modify: `src/components/before-you-start.tsx` (`AnimExRow`, `SectionCards`, `BYS_DATA`)

**Interfaces:**
- Consumes: `MiniGrid`, `MiniDialog`, `MiniRibbon`, `VisualSpec`, the hook's `{ keyPhase, stage }`.
- Produces: `MiniVisual({ spec, keyPhase, stage })` dispatcher; section cards now render their visuals.

- [ ] **Step 1: Add the `MiniVisual` dispatcher**

Insert just above `AnimExRow`:

```tsx
function MiniVisual({ spec, keyPhase, stage }: { spec: VisualSpec; keyPhase: number; stage: Stage }) {
  if (spec.kind === "grid") return <MiniGrid effect={spec.effect} stage={stage} />;
  if (spec.kind === "dialog") return <MiniDialog effect={spec.effect} stage={stage} />;
  return <MiniRibbon keyPhase={keyPhase} />;
}
```

- [ ] **Step 2: Render the visual in `AnimExRow`**

Wrap `AnimExRow`'s returned JSX so the existing `e.g.` row is the first child of a vertical flex column, and the visual renders below it. The existing row markup is unchanged except it's now nested. Final shape:

```tsx
function AnimExRow({ ex }: { ex: Example }) {
  const isSeq = ex.mode === "sequence";
  const { keyPhase, stage } = useExAnimation(ex.mode, ex.keys.length);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
        {/* ...existing e.g. / keys / arrow / action markup, unchanged... */}
      </div>
      {ex.visual && <MiniVisual spec={ex.visual} keyPhase={keyPhase} stage={stage} />}
    </div>
  );
}
```

Keep the inner row's existing children exactly as they are after Task 1 (they already use `keyPhase`).

- [ ] **Step 3: Make the ribbon card span full width in `SectionCards`**

In `SectionCards`, inside the `.map((g, gi) => ...)`, compute a flag and apply it to the card's outer `<div>` style:

```tsx
const hasRibbon = g.examples.some(e => e.visual?.kind === "ribbon");
```

Add `gridColumn: hasRibbon ? "1 / -1" : undefined,` to that card div's `style` object.

- [ ] **Step 4: Attach `visual` specs to the section examples + change Ctrl Formatting to Ctrl+B**

Edit `BYS_DATA` examples as follows (only the listed `examples` arrays change):

- **ctrl → Navigation:** `examples: [{ keys: ["Ctrl", "→"], mode: "combo", action: "Jump to data edge", visual: { kind: "grid", effect: "jump-right" } }]`
- **ctrl → Formatting:** replace entirely with `{ label: "Formatting", use: "Apply the most common styles instantly, without opening a single menu.", examples: [{ keys: ["Ctrl", "B"], mode: "combo", action: "Bold", visual: { kind: "grid", effect: "cell-bold" } }] }`
- **alt → Ribbon mode:** `examples: [{ keys: ["Alt", "H", "B"], mode: "sequence", action: "Add cell border", visual: { kind: "ribbon" } }]`
- **alt → Direct combos:** `examples: [{ keys: ["Alt", "="], mode: "combo", action: "AutoSum", visual: { kind: "grid", effect: "autosum" } }]`
- **arrows → Move around the worksheet:** `examples: [{ keys: ["Ctrl", "→"], mode: "combo", action: "Jump to last cell", visual: { kind: "grid", effect: "jump-right" } }]`
- **arrows → Move in menu's & dialog windows:** `examples: [{ keys: ["↓"], mode: "combo", action: "Move down to the next option", visual: { kind: "dialog", effect: "option-down" } }]`
- **numbers → Formatting:** `examples: [{ keys: ["Ctrl", "⇧", "5"], mode: "combo", action: "Apply percentage format", visual: { kind: "grid", effect: "cell-format" } }]`
- **special → In dialogs:** `examples: [{ keys: ["Tab"], mode: "combo", action: "Move to next field", visual: { kind: "dialog", effect: "tab-fields" } }]`
- **special → In the spreadsheet:** `examples: [{ keys: ["Tab"], mode: "combo", action: "Confirm entry, move 1 cell right", visual: { kind: "grid", effect: "step-right" } }]`

Leave `fn`, `mac`, and the ctrl "Everything else" example WITHOUT a `visual` field.

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck 2>&1 | grep before-you-start`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/components/before-you-start.tsx
git commit -m "feat(primer): wire mini-visuals into section cards, Ctrl+B for formatting"
```

---

### Task 6: Live visual verification

**Files:** none (verification only).

- [ ] **Step 1: Full typecheck sanity**

Run: `npm run typecheck 2>&1 | grep before-you-start`
Expected: no output (only the known pre-existing errors elsewhere remain).

- [ ] **Step 2: Visual check**

Start `npm run dev`, open `http://localhost:9002`, sign in, open the "Before you start" primer from the dashboard. For each section confirm:
- **Ctrl:** Navigation grid selection jumps A→D in sync with `Ctrl →`; Formatting cell "Q1" turns bold on `Ctrl B`.
- **Alt:** ribbon card is full-width; Alt shows the `H` KeyTip, H activates the Home tab + shows `B` KeyTip, B lights the Borders button and the A1 target cell gains a border; state holds, then loops.
- **Arrows:** worksheet grid jumps; menu dialog highlight moves to the 2nd option.
- **Numbers:** A1 morphs `0.5` → `50%`.
- **Esc·Enter·Tab:** dialog focus hops field 1→2; spreadsheet selection steps A1→B1.
- Each visual loops smoothly in sync with its key caps; nothing janky; the modal still fits (`maxHeight: 90vh`, detail pane scrolls).

- [ ] **Step 3: Reduced-motion check**

In the OS (or DevTools → Rendering → "Emulate prefers-reduced-motion: reduce"), reload and reopen the primer. Confirm each visual shows its finished/result state statically with no looping animation, and key caps show the final step.

- [ ] **Step 4: Final commit (if any tuning was needed)**

```bash
git add src/components/before-you-start.tsx
git commit -m "fix(primer): visual tuning from live check"
```

(Skip if no changes were required during verification.)

---

## Self-Review Notes

- **Spec coverage:** primitives (Part 1) → Tasks 2-4; sync hook → Task 1; data model `VisualSpec` → Task 1; section mapping incl. Ctrl→B change and skips for Undo/Fn/Mac → Task 5; full-width ribbon layout → Task 5 Step 3; reduced-motion → Task 1 + Task 6 Step 3; verification → Task 6.
- **Type consistency:** `useExAnimation` returns `{ keyPhase, stage }` (Task 1) consumed identically in Tasks 5; `MiniGrid(effect,stage)`, `MiniDialog(effect,stage)`, `MiniRibbon(keyPhase)` signatures match the `MiniVisual` dispatcher calls.
- **No placeholders:** all component bodies and data edits are given in full.

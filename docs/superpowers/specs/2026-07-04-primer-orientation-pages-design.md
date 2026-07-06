# Before-You-Start primer — orientation pages + icon cleanup

**Date:** 2026-07-04
**File touched:** `src/components/before-you-start.tsx` (+ a temporary demo route, later deleted)

## Goal

Add two orientation pages to the "Before you start" keyboard primer, remove the
Mac-only glyph icons from every page, and let the user pick the visual style for
the new pages via an in-browser A/B demo.

## 1. Two new pages (prepended, so they lead the primer)

Order becomes: **How to use the app → How to learn → Ctrl/Cmd → … → No-go.**
Both count toward the existing "open every section to continue" gate.

### Page 1 — "How Excel Ninja works" (hint: "Your path from zero to certified")

Three section cards + a closing "next level" strip:

1. **Flashcards — start here.** Flip through and learn each shortcut before any
   challenge; move on only once you can recall all of them from memory.
2. **Challenges — Training, then Timed.**
   - *Training* — no-pressure run to confirm the shortcuts stuck.
   - *Timed* — once training feels solid, prove it against the clock.
3. **Drills — precision under a limited mistake budget.** After every challenge
   is done, drills test you; exceed the error budget and the drill **resets to
   the start**.
   - Closing line: clear all of that and the level is complete — on to the next level.

### Page 2 — "How to actually get faster" (hint: "Repetition is the whole point")

- Doing the challenges/drills once then forgetting them doesn't make you a
  ninja — repetition does, ideally daily.
- Finished every level and earned the certificate? Start over. Muscle memory is
  built by repeating, not finishing.
- The 1-week / 1-month subscription isn't for rushing — it's a training window,
  the way an athlete or ninja drills the same moves until automatic.
- Don't cram it in one sitting. After finishing a level, wait a day or two, then
  repeat it **without** flashcards to jog your memory. Same for drills.

## 2. Icon removal (all pages)

- Sidebar row circle: zero-padded number (`01`, `02`, …) → green check when read.
- Detail header: drop `GlyphChip`; keep title + hint.
- No-go page keeps its amber `warn` treatment on the numbered dot.
- Retire the `glyph` field.

## 3. Mechanics

- New optional `body?: React.ReactNode` on `ItemData`; detail pane renders `body`
  when present, else falls back to existing `sections` / `nogo`. Existing page
  content is unchanged.

## 4. Visual demo plan

Build **both** variants for the two new pages:
- **Variant A** — looping animated flow (Flashcards → Training → Timed → Drills →
  Next level with a travelling token + drill mistakes/reset meter) and, for
  page 2, a muscle-memory strength bar + spaced-repetition calendar.
- **Variant B** — static illustrated step cards with subtle hover/fade-in only.

Expose both at a temporary `localhost:9002` route with an A/B toggle. Once the
user picks, wire the winner into the primer and delete the demo route.

## Verification

`npm run typecheck` (confirm no new errors in `before-you-start.tsx`) + dev-server
visual check at the demo route and inside the actual primer modal.

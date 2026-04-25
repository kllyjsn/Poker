# Mobile v2 — Test Plan

Testing PR #3 at https://dist-azorfvwh.devinapps.com (bundle `index-BhqEuil2.js` confirmed).

## What changed (user-visible)
- Hamburger drawer replaced by **always-visible bottom tab bar** (<md).
- Equity card picker is **two-step (rank → suit)** on mobile (tiles ≥ 48px / 64px), dense grid on desktop.
- Preflop matrix: **32×32 cells** that scroll horizontally inside the panel.
- Trainers index is a **2-column tile grid** with accent gradients & SVG icons.
- Dashboard Next-up is a **full-width hero CTA**.
- PWA manifest + apple-touch-icon; safe-area insets applied.

## Viewport
- Mobile under test: **~390×700** (Chromium window sized to 390×820; viewport ≈ 390×700 after chrome).
- Regression: **~1280×900** for md+ breakpoint.

## T1 — Bottom tab bar always visible (no hamburger)
**Path:** `/` at 390×820.
- **Assertion 1a (pass):** A 4-slot nav bar is pinned to the bottom of the viewport showing icons + labels: Dashboard, Curriculum, Trainers, Settings. Zero taps required to see it.
- **Assertion 1b (pass):** No hamburger icon anywhere in the top bar. (Broken impl would still show the hamburger button.)
- **Action:** tap the "Trainers" tab.
- **Assertion 1c:** Active tab label + icon turn gold (`text-chip-gold`). Route becomes `/trainers`. URL bar shows `/trainers`.

_Distinguishing broken vs. working_: If the bottom bar were missing, the only nav on mobile would be the wordmark in the top bar. If the hamburger were still present, the bottom bar wouldn't be the primary path.

## T2 — Trainers page as visual tile grid
**Path:** `/trainers`.
- **Assertion 2a (pass):** Exactly 5 tiles render in a **2-column** grid (Hand Ranking, Pot Odds, Equity Calc, Preflop Range, ICM Calc). Bottom tile row has only 1 filled tile (odd count).
- **Assertion 2b (pass):** Each tile has a **background gradient** (distinct accent color per trainer) and an **SVG icon** (not just text). Broken impl would show the old felt-panel list with no gradients.
- **Assertion 2c (pass):** Each tile shows a "Wk N" label and either "New" or an accuracy `%`.

_Distinguishing_: The old design was 1-column felt panels at mobile with `text-xl` name + paragraph description — visually very different.

## T3 — Equity picker two-step mobile flow
**Path:** `/trainers/equity`.
- **Action:** tap the first `As` slot under Player A to clear it via the `×` badge, then tap the now-empty slot.
- **Assertion 3a (pass):** A "1. Pick rank" card appears with a **2-row, 7-column grid of large (~48px high) rank buttons** `A K Q J T 9 8` top row, `7 6 5 4 3 2` bottom row. No 13-col grid of tiny card faces on mobile.
- **Action:** tap the `K` button.
- **Assertion 3b (pass):** Heading switches to "2. Pick suit". Four suit tiles appear in a **grid-cols-4 row** with each tile ~64px tall, white background, rank letter + suit symbol (♠ / ♥ / ♦ / ♣). The ♥ (already used for `Kh`) should be **disabled/greyed** (`bg-felt-800` + `cursor-not-allowed`).
- **Action:** tap `K♦`.
- **Assertion 3c (pass):** Picker closes; Player A #1 slot shows the `Kd` card.
- **Action:** tap "Run 10k Monte Carlo".
- **Assertion 3d (pass):** Result bars render; Player A and Player B percentages sum to ~100.0. (Numerical correctness already covered — this just proves the new picker integrates correctly with the unchanged equity engine.)

_Distinguishing_: Broken impl would show the old 13×4 dense grid at mobile width (tile ≈ 26px) — completely different layout.

## T4 — Preflop matrix tappable + scrollable
**Path:** `/trainers/preflop` with position=UTG.
- **Assertion 4a (pass):** Position selector shows 5 equal-width buttons in one row (UTG/HJ/CO/BTN/SB), no wrapping.
- **Assertion 4b (pass):** Matrix cells are **32px square** (vs. the old 28px). Cells on the right edge are initially clipped by the panel (the table is 13 × 32 = 416px, wider than the ~358px content area), and a "Scroll to see full matrix →" hint is visible below the matrix on mobile.
- **Action:** horizontally swipe the matrix.
- **Assertion 4c (pass):** The matrix scrolls inside the felt-panel, revealing the rightmost columns. The outer page does NOT scroll horizontally.

_Distinguishing_: Broken impl either (a) squeezes the table into 358px (cells < 28px, unreadable) or (b) lets the whole page scroll horizontally (page content overflows).

## T5 — Desktop regression
**Path:** resize window to ≈ 1280×900, reload `/`.
- **Assertion 5a (pass):** Left sidebar returns with wordmark, nav list, and progress bar. Bottom tab bar is **hidden**.
- **Assertion 5b (pass):** `/trainers/equity` picker activates on slot click and shows the **dense 13-col grid** of full card faces (not the two-step rank/suit flow).
- **Assertion 5c (pass):** `/trainers/preflop` matrix shows 40×40 cells (sm+ breakpoint).

## T6 — Bonus: safe-area padding not breaking layout at non-notched viewport
**Path:** still at 390×820 (no notch).
- **Assertion 6 (pass):** Bottom tab bar is flush with the bottom edge (no extra whitespace, since `env(safe-area-inset-bottom)` → 0 on this viewport). Top bar is flush with the top.

## Non-goals
- No PWA install test (browser-dependent prompt flow).
- No full lesson read-through (already regression-tested in prior session).
- No Monte Carlo numerical accuracy (already proven in PR #1 test report).

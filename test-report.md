# Mobile v2 — Test Report

**PR:** https://github.com/kllyjsn/Poker/pull/3
**Preview:** https://dist-azorfvwh.devinapps.com
**Method:** Chrome + CDP `Emulation.setDeviceMetricsOverride` at **390×700 (mobile=true)** and **1280×900 (desktop)**. Live bundle `index-BhqEuil2.js` confirmed matches this branch.
**Plan:** <ref_file file="/home/ubuntu/repos/poker-edge/test-plan-mobile-v2.md" />
**Recording:** https://app.devin.ai/attachments/26248bea-cd38-4b95-9167-f5025ae505e7/rec-1cc69f73-2d45-4922-83ee-5bbc5746718b-subtitled.mp4

## Summary

5 of 6 tests passed. **One real bug found on the preflop matrix at true mobile viewport**: the table-layout:fixed strategy shrinks every cell to ~24 px instead of the intended 32 px, and the matrix does **not** overflow/scroll — the whole matrix is just crammed into the narrow viewport, which is the regression the v2 PR claimed to fix.

Everything else (bottom tab bar, two-step card picker, trainers tile grid, desktop regression) works as specified.

---

## T1 — Bottom tab bar always visible (PASS)

**Setup:** Load `/` at 390×700 emulated.
**Result:** Bottom tab bar is pinned with 4 labeled icons (Dashboard / Curriculum / Trainers / Settings). Active tab (`Dashboard`) is gold. No hamburger button is rendered anywhere — confirmed via DOM grep (no `button aria-label="menu"` or similar).

![Dashboard at 390px](https://app.devin.ai/attachments/e6d53aa5-2045-4aee-886c-6aca4ec1cf74/t1b_dashboard_390.png)

## T2 — Trainers as visual tile grid (PASS)

**Setup:** Navigate to `/trainers` via bottom tab.
**Result:** 5 trainer tiles in a 2-column grid. Each tile has a distinct background gradient (emerald/amber/blue/rose/violet per trainer), an SVG icon, a trainer name, description, `Wk N` label, and "New" badge (since no drills attempted yet). This is a clear visual replacement of the pre-v2 single-column felt-panel list.

![Trainers tile grid](https://app.devin.ai/attachments/5a2eaae1-0746-42d6-8242-f50dc0c7c1d2/t2_trainers.png)

## T3 — Two-step equity card picker (PASS)

**Setup:** Navigate to `/trainers/equity`, tap Player A #1 slot.
**Result (3a):** "1. Pick rank" heading appears with a 2-row × 7-col grid of 48 px rank buttons (A K Q J T 9 8 / 7 6 5 4 3 2) — **not** the old 13×4 grid of tiny card faces.

![Rank picker step](https://app.devin.ai/attachments/c8f7fd97-5472-4275-9cd8-b7de29709289/t3a_rank_picker.png)

**Result (3b):** After tapping `K`, the heading switches to "2. Pick suit" and a 4-col row of ~64 px suit tiles appears. `K♥` is **correctly disabled/greyed** because `Kh` is already in Player A's hand. `← back to ranks` link present for correction.

![Suit picker with Kh disabled](https://app.devin.ai/attachments/09f0bc95-ab0f-436d-8472-9c85c5ce5999/t3b_suit_picker.png)

**Result (3c):** Selecting `K♦` closes the picker and populates the slot (visible in the next screenshot as `K♦` in Player A #1).

**Result (3d):** Run 10k Monte Carlo with KdKh vs QdQc → Player A 81.7% / Player B 18.3% (sum = 100.0%, matches KK vs QQ baseline).

![Equity result 81.7/18.3](https://app.devin.ai/attachments/38b698e4-0127-418a-8029-9e08daac4d14/t3d_equity_result.png)

## T4 — Preflop matrix 32 px cells + horizontal scroll (**FAIL**)

**Setup:** Navigate to `/trainers/preflop` at true 390×700 viewport.

**Assertion 4a (position selector):** Pass — UTG/HJ/CO/BTN/SB render in a single row of equal-width buttons.

**Assertion 4b (32 px cells) — FAIL.** Measured via DOM:
```
innerWidth        : 390
containerW        : 341
tableW            : 317
AA cell width     : 24.3  (expected 32)
AA cell height    : 24.3  (expected 32)
scrollW of parent : 341   (== clientWidth; no overflow available)
```
**Assertion 4c (horizontal scroll) — FAIL.** Since `scrollWidth === clientWidth`, the container is not scrollable. All 13 columns are rendered but crammed into 317 px, not the intended 416 px (13 × 32).

**Root cause:** `PreflopTrainer.tsx` uses `<table className="... table-fixed ...">` with no explicit width on the `<table>` element. Per CSS spec, `table-layout: fixed` on a table with no `width` falls back to the width of its containing block, so at narrow parent widths the columns get compressed proportionally instead of holding 32 px and overflowing the `overflow-x-auto` wrapper. The fix is to add an explicit width/min-width to the table (e.g. `class="... min-w-[28rem] sm:min-w-0 ..."` or a `<colgroup>` with fixed widths) so the table element itself is wider than the container on mobile.

![Preflop matrix squeezed at 390px](https://app.devin.ai/attachments/0490d2c0-9fa9-43b3-9985-9f2645fcb5c0/t4_preflop_bug.png)

Note that at desktop (1280 width) the same code renders cells at **40 px** correctly — because there the container is comfortably wider than the 13-column grid, so the compression fallback doesn't kick in.

## T5 — Desktop regression (PASS)

**Setup:** Switch `Emulation.setDeviceMetricsOverride` to 1280×900 mobile=false.

**Result (5a):** Left sidebar returns with `PokerEdge` wordmark, 4 nav items (Dashboard active, gold), and the `Progress · 0/60 / Streak · 0 days` footer. Bottom tab bar is absent.

![Desktop sidebar restored](https://app.devin.ai/attachments/6c2ff136-a2bb-46ab-8dff-5c803928008b/t5_desktop_regression.png)

**Result (5b):** On `/trainers/equity`, clicking a slot opens the dense 13-col × 4-row card grid (not the two-step flow). Occupied cards (`A♠`, `K♥`, `Q♦`, `Q♣`) are correctly disabled.

![Desktop equity dense picker](https://app.devin.ai/attachments/f6c7b005-4fff-4009-9512-cca879d55df1/t5c_equity_desktop.png)

**Result (5c):** On `/trainers/preflop`, cell width = 40 px (DOM: `getBoundingClientRect().width === 40`), sidebar + matrix both render properly.

## T6 — Safe-area padding not breaking non-notched layout (PASS)

At 390×700 emulated (no notch / `env(safe-area-inset-*)` = 0), bottom tab bar sits flush with viewport bottom, top bar flush with top. No visible gaps.

---

## Not tested
- **PWA install flow** — browser-dependent prompt, skipped.
- **Numerical correctness of trainers** — already proven in PR #1 test report (AA vs KK 82/18, UTG 18%, ICM, hand evaluator).
- **Notched-phone safe-area on real device** — only emulated viewport, no physical notch to verify against.

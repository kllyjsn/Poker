# Mobile Refactor — Test Plan

## What changed (user-visible)
Before: desktop-only layout. Fixed 240px sidebar permanently took ~63% of a 375px viewport, main had `p-8` everywhere, `text-4xl` headings clipped, equity card picker was ~520px wide (required horizontal scroll), ICM table had 6 columns that overflowed, trainer headers didn't wrap.

After:
- **Sidebar → hamburger drawer** below `md` breakpoint (768px). Sticky top bar with menu button + logo + lesson counter.
- Body scroll locked while drawer open; tap-backdrop or any nav link closes it.
- Main padding: `p-4 sm:p-6 md:p-8`.
- H1 `text-3xl sm:text-4xl`, panel stats `text-xl sm:text-2xl`, trainer headers `flex-wrap gap-3`.
- **Equity picker**: 52 cards use new `fluid` size (`w-full aspect-[5/7]`) — fills the 13-col grid no matter the container.
- Slot cards get a visible `×` clear button (replaces desktop-only right-click).
- **ICM**: on `<sm`, stacked per-player cards; on `≥sm`, full 6-col table.
- **Preflop matrix**: `h-7` cells on mobile, `h-10 w-10` on sm+, wrapped in responsive overflow with 420px max-width on mobile.
- Position selector is a `grid-cols-5`.
- Button rows (Call/Fold, Raise/Fold, Hand A/B/Tie) are `grid-cols-2` on mobile, flex on sm+.
- Buttons have `min-h-[44px]` touch target.

## Environment
- Running dev server locally at `http://localhost:5173` on branch `devin/1777040148-mobile-refactor`.
- Viewport under test: **375 × 667** (iPhone SE) — set via Chrome window resize (not DevTools, to keep recording clean).
- Secondary check: **768 × 1024** (iPad) to confirm desktop layout kicks in.

## Primary flow (one continuous recording)

All tests are at 375×667 unless noted.

### T1 — Drawer sidebar replaces fixed sidebar
- **Setup:** Resize browser to 375×667, navigate to `/`.
- **Expect (precondition):** sidebar is NOT visible. A sticky top bar shows hamburger icon, centered "PokerEdge" wordmark, right-side `0/60` counter.
- **Action:** click hamburger.
- **Assertion 1 (pass if true):** Sidebar drawer slides in from the left; a black translucent backdrop covers the rest of the page; body no longer scrolls (try scrolling — page doesn't move).
- **Action:** tap the backdrop.
- **Assertion 2:** Drawer slides out; sidebar returns to hidden state; page scroll is re-enabled.
- **Action:** open drawer, tap "Trainers".
- **Assertion 3:** Route changes to `/trainers` AND drawer closes automatically.

> Would a broken impl look identical? No — the pre-change app showed the sidebar unconditionally at 240px wide, so the mobile top bar would be absent and content would be crushed into ~135px.

### T2 — Equity picker fits on mobile
- **Navigate:** `/trainers/equity` (drawer → Trainers → Equity Calculator).
- **Action:** tap "Player A #1" slot.
- **Assertion 1:** A 13-column card picker renders and fits entirely within the viewport — no horizontal scroll on the outer page, no card clipped at the right edge. Each card shows rank + suit symbol.
- **Action:** tap the `A♠` card (top row, position depends on suit ordering — use the first visible ace).
- **Assertion 2:** Picker dismisses; Player A slot 1 now shows that card; picker disappears.
- **Action:** tap the card in Player A slot 1 to reopen picker; close picker via "Cancel".
- **Assertion 3:** Picker closes without changing the selected card.
- **Action:** tap the small `×` badge on Player A slot 1.
- **Assertion 4:** Card clears back to "Player A #1" placeholder.
- **Action:** fill all 4 hole cards then tap "Run 10k Monte Carlo".
- **Assertion 5:** Result bars appear for Player A and Player B; numbers sum to ~100%.

> Would a broken impl look identical? No — pre-change the picker used fixed `w-10` cards (520px total) which would overflow the 375px viewport and require horizontal scroll. The `×` clear badge didn't exist pre-change.

### T3 — ICM switches from table to stacked cards
- **Navigate:** `/trainers/icm`.
- **Action:** scroll to the Equities section (default preset populates values).
- **Assertion 1:** Equities render as a **vertical stack of 3 cards** (not a table). Each card shows "Player N", dollar equity in gold, and a 3-col grid (Stack / $% / Diff).
- **Action:** tap the "9-max final" preset.
- **Assertion 2:** Stack updates to 9 player cards; no horizontal scroll anywhere on the page.
- **Action:** resize window to ≥ 640px (e.g. 800×900).
- **Assertion 3:** Layout **switches to a 6-column table** with headers Seat / Stack / Chip % / $ Equity / $ % / Diff.

> Would a broken impl look identical? No — pre-change the only rendering was the 6-col table, which overflowed 375px.

### T4 — Preflop matrix + quiz buttons fit
- **Navigate:** `/trainers/preflop`.
- **Assertion 1:** Position selector shows 5 equal-width buttons (UTG/HJ/CO/BTN/SB) in one row. No wrapping.
- **Assertion 2:** 13×13 range matrix fits within the viewport (no page-level horizontal scroll). Cells are ~26–28px tall, `text-[9px]`, readable.
- **Action:** tap "Quiz".
- **Assertion 3:** Hand display reads at a reasonable size (not so large it overflows). Raise/Fold buttons are side-by-side and each fills exactly half the container width (not stretched to full row).

> Would a broken impl look identical? No — pre-change matrix cells were `w-9 h-9` (9×117 = 117px wide) forcing the 13-col grid to 117px which only barely fit; but position buttons were free-wrapping causing UTG to drop to its own line on narrow screens.

### T5 — Trainer headers + button rows
- **Navigate:** `/trainers/pot-odds`.
- **Assertion 1:** Header wraps cleanly — "Pot Odds Trainer" title on one line, "Streak: 0" either beside it (if it fits) or on a new line. No content clipped.
- **Action:** tap "Call" or "Fold" (each fills half the row on mobile, grid-cols-2).
- **Assertion 2:** Buttons occupy full row width as 2 equal columns (not centered narrow buttons).

### T6 — Regression at desktop widths (1280×900)
- **Resize** to 1280×900, navigate to `/`.
- **Assertion 1:** Fixed sidebar returns on the left (no hamburger visible). Main content uses wider padding. Dashboard Next Up card, stats, and week grid all render as before.
- **Assertion 2:** `/trainers/equity` picker shows 13 columns of larger cards. Icon clear `×` still visible — that's acceptable regression.
- **Assertion 3:** `/trainers/icm` shows the full 6-col table (not mobile cards).

> Label: **Regression** — proves desktop layout is unbroken.

## Non-goals (not testing)
- Dark-mode colors / typography details.
- Lesson reading at length (only smoke-navigate to /lesson/w1d1 to confirm breadcrumb wraps).
- Monte Carlo numerical correctness (already covered in prior test report).

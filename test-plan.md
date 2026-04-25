# PokerEdge — Test Plan

PR: https://github.com/kllyjsn/Poker/pull/1

App: 12-week curriculum + 5 interactive trainers + localStorage progress.
Tested against the local dev server at `http://localhost:5173`.

## What I'm testing

One continuous end-to-end flow that exercises every high-leverage surface: lesson progression, progress persistence, and each of the five trainers with a math-verifiable assertion.

## Tests (each with concrete pass/fail)

### T1 — Lesson progression & persistence
1. Visit `/` → dashboard shows "Next Up · W1D1 · The Table, the Deal, and the Action" and "Lessons Complete 0 / 60"
2. Click **Start lesson** → navigates to `/lesson/w01d01`
3. Click **Mark complete** → button swaps to "Completed (click to undo)"
4. Navigate to `/` → "Lessons Complete" shows **1 / 60** and sidebar progress bar shifts off zero
5. Hard refresh → counter still reads **1 / 60** (localStorage persistence)

**Pass criteria**: Completion counter equals 1/60 after refresh.

### T2 — Hand Ranking Quiz (evaluator correctness)
1. Open `/trainers/hand-ranking`
2. Inspect the visible hands + community
3. Mentally evaluate the correct winner, pick that answer
4. Expected: green "Correct ✓" plus the category name of the winning hand

**Pass criteria**: Evaluator's stated winner and category match the visible cards.

### T3 — Equity Calculator (canonical AA vs KK)
1. Open `/trainers/equity`
2. Default is As-Kh vs Qd-Qc → replace Player A to AA (spades + hearts) and Player B to KK (diamonds + clubs)
3. Click **Run 10k Monte Carlo**
4. Expected: Player A ≈ 82% (±1.5%), Player B ≈ 18% (±1.5%)

**Pass criteria**: AA equity within 80.5% – 83.5%.

### T4 — Preflop Range Trainer (position weights)
1. Open `/trainers/preflop`
2. Default position UTG → header reads "**31 / 169 hands (18%)**"
3. Click **BTN** → header should change to a substantially wider range (~45% / ~76 hands)
4. Click **Quiz** mode → a random hand appears, buttons for Raise/Fold work

**Pass criteria**: UTG shows 18% and BTN shows ≥40% with clearly more gold cells.

### T5 — Pot Odds Trainer (math correctness)
1. Open `/trainers/pot-odds`
2. Read pot, bet, and your-equity numbers
3. Compute pot odds mentally: `bet / (pot + 2*bet)` → compare to your equity
4. Pick the mathematically correct call/fold
5. Expected: green "Correct" plus the displayed pot-odds equation matches our mental math

**Pass criteria**: Displayed formula resolves to the exact required-equity % and matches the decision.

### T6 — ICM Calculator (short stack overperformance)
1. Open `/trainers/icm`
2. Click preset **Short vs big** (stacks 80/10/10, payouts 50/30/20)
3. Player 1 (chip leader 80%) should have $ equity **less than 80%** of prize pool (negative Diff)
4. Players 2 & 3 (10% chip stacks) should each have $ equity **greater than 10%** (positive Diff)

**Pass criteria**: Diff column is negative for the chip leader and positive for both short stacks.

## Evidence

- Full screen recording of the above flow
- Screenshots of each trainer's end state
- Comment posted back to PR #1 with summary

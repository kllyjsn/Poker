# PokerEdge

A 12-week curriculum that takes you from zero to genuine poker edge. Focused on **No-Limit Hold'em cash** and **tournaments (MTTs)**.

- **60 lessons** (5 days/week × 12 weeks), 25-45 minutes each
- **5 interactive trainers**: hand ranking quiz, pot odds, Monte Carlo equity, preflop range matrix, Malmuth-Harville ICM
- **Progress tracking** stored locally (no account, no server, no tracking)

## The curriculum

1. **Foundations** — rules, positions, hand rankings, pot odds primer
2. **Math Fundamentals** — outs, rule of 2 and 4, EV, implied odds
3. **Preflop Cash Ranges** — position, opens, 3-bets, blind defense
4. **Postflop Fundamentals** — c-bets, board texture, sizing, value/bluff
5. **Ranges and GTO Basics** — MDF, alpha, balanced vs exploitative
6. **Turn & River Play** — barrels, value, blockers, polarized vs merged
7. **Exploitative Play** — population tendencies, HUD stats, reads
8. **Tournament Fundamentals** — structure, stack sizes, chip EV vs $EV
9. **Late Stage & ICM** — push/fold, ICM, bubble, heads-up
10. **Mental Game & Bankroll** — variance, tilt, BRM, study routines
11. **Advanced Concepts** — combinatorics, metagame, multiway, overbets
12. **Synthesis & Expert Play** — solver workflow, hand review, graduation

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS 3
- React Router 7
- Zero backend — everything runs in-browser, progress is stored in `localStorage`

## Run locally

```bash
npm install
npm run dev
```

## Project layout

- `src/lib/poker.ts` — card primitives and 5-out-of-7 hand evaluator
- `src/lib/equity.ts` — Monte Carlo equity simulator
- `src/lib/odds.ts` — pot odds, MDF, alpha, rule-of-2-and-4
- `src/lib/icm.ts` — Malmuth-Harville ICM
- `src/lib/ranges.ts` — 6-max opening ranges per position
- `src/data/curriculum.ts` — all 60 lessons
- `src/pages/` — dashboard, curriculum, week, lesson, trainers, settings
- `src/pages/trainers/` — the five interactive tools
- `src/store/progress.ts` — localStorage progress with `useSyncExternalStore`

## Disclaimer

Content is opinionated and tuned for what a disciplined student can internalize in 90 days — not solver-perfect. Poker is a long game; play responsibly.

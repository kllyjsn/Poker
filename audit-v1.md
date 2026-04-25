# PokerEdge — "World-class" Audit

_Auditor: Devin. Scope: live app (dist-azorfvwh.devinapps.com) + source (3,182 LoC)._

## TL;DR

What you have today is a **solid curriculum + 5 standalone trainers**. It's a good *textbook with practice problems*. Making it world-class means turning it into a **learning system** that knows what the user got wrong, re-drills it at the right interval, and plugs into their actual play. The three highest-impact moves, in order:

1. **Add a spaced-repetition engine to the trainers** (Leitner/SM-2). Right now every drill is random — users re-drill what they already know. A minimum viable version is ~200 LoC and would move retention more than anything else on this list.
2. **Explain every wrong answer, always.** Today: "Incorrect ✗." World-class: "Incorrect. Your call needed 33% equity but your range vs. villain's calling range is 27% — fold here, even at good pot odds, because of reverse-implied odds." This is the single biggest quality gap.
3. **Import real hand histories** and point out leaks in the user's own play. It's the reason tools like GTO Wizard and DTO print money — people want their *own* hands reviewed, not synthetic ones.

Everything else is refinement on top.

---

## Priority tiers

| # | Recommendation | Impact | Effort | Why |
|---|---|---|---|---|
| **S — the learning loop** | | | | |
| 1 | Spaced-repetition per-drill ("this hand AJo BTN vs. 3-bet has been wrong 2×, retry in 1 day") | **huge** | M | Today drills are random; users re-drill what they already know |
| 2 | Explain *why* on every wrong answer (equity math, range, line) | **huge** | S-M | Right now Hand Ranking just shows winner; Pot Odds just "Incorrect ✗" |
| 3 | Per-situation accuracy dashboard ("BTN 3-bet pots: 62%") | high | M | Drill stats are aggregated only; users can't see leaks |
| **A — content** | | | | |
| 4 | Hand history import (PokerStars/GG/ACR) → leak report (VPIP/PFR/3bet/Cbet) | **huge** | L | The "killer feature" every serious product in this space has |
| 5 | 3-bet / 4-bet range trainer | high | M | Large curriculum hole — only RFI is covered |
| 6 | Cbet decision trainer (texture → bet/check) | high | M | Most critical postflop skill, currently untrained |
| 7 | Turn/river bet-sizing trainer (1/3 vs 2/3 vs overbet) | high | M | Sizing is where money is made/lost |
| 8 | MTT shove/fold trainer (Nash calling ranges at <15bb) | high | M | You advertise "MTT focus"; this is the single best MTT drill |
| 9 | Bluff-catching trainer (river call vs fold) | med | M | Classic ego check for mid-stakes players |
| 10 | Board texture classifier (dry/wet/dynamic/static) | med | S | Fast win, teaches a core concept |
| 11 | Quiz-gated lesson completion (3–4 Qs, ≥75% to mark complete) | high | M | Today "Mark complete" is a free button |
| 12 | Worked-example / puzzle blocks inside lessons (not just prose) | high | M-L | Most lessons are 200–500 words; zero puzzles inline |
| 13 | Placement test on first visit → auto-skip to appropriate week | med | S | Beginners and regs shouldn't see the same start screen |
| 14 | Auto-generate flashcards from `takeaways[]` → Anki-style review | med | S | The data model is already there |
| **A — polish / UX** | | | | |
| 15 | Cross-device sync (magic-link auth + Supabase) | high | L | Your laptop and phone currently don't share progress |
| 16 | Streak freezes (1-day grace/7-day streak, Duolingo model) | med | S | Current streak just resets — punishing |
| 17 | Weekly goal ring ("3/5 lessons, 40/150 drills this week") | med | S | Strong engagement driver |
| 18 | Haptic feedback on mobile (`navigator.vibrate`) on right/wrong | low | XS | Small touch, big polish signal |
| 19 | Audio feedback (subtle chip sound on correct, muted muck on wrong) | low | S | On-brand, most users will keep it off but love the option |
| 20 | Settings: rank display ("10" vs "T"), color-blind mode, sound on/off | low | S | You already declined "10", but someone will ask |
| 21 | Lesson TOC + "X min left" indicator | low | S | Long lessons feel endless |
| 22 | Show user's own mistake history on the lesson page ("last time you missed Q7 on a J98 board") | high | M | Closes the loop between trainer ↔ curriculum |
| **A — credibility / correctness** | | | | |
| 23 | Unit tests for `evaluate7`, `equity`, `icm`, `odds` vs. canonical values | high | S-M | Zero tests today. A pot-odds-string regression (already shipped once!) would be caught by one test |
| 24 | Deterministic seed on "Next hand" (shareable scenarios) | low | S | Lets users send friends "try hand #83421" |
| 25 | Solver-grade preflop ranges (vs. generic 18%/45%), sourced | high | M | Your ranges are reasonable but not attributed — move to a named published chart (e.g. Upswing, GTO Wizard free) |
| **B — retention / social** | | | | |
| 26 | Private leaderboards (join-with-code, 4–8 people) | high | M | Poker is tribal; group accountability >> solo |
| 27 | Badges ("First 100 drills", "Week 3 done", "95% on ICM") | med | S | Gamification lite |
| 28 | Share card (screenshot of a clean 5/5 streak, auto-generated PNG) | med | S | Free marketing |
| 29 | Push / email nudges for streak-at-risk | med | M | Requires backend — pair with #15 |
| **B — platform / observability** | | | | |
| 30 | Error boundary + Sentry (or PostHog) | high | S | First prod crash is currently silent |
| 31 | Lazy-load trainer routes → cut initial bundle from 342 kB | med | XS | One-line `React.lazy` per route |
| 32 | Lighthouse + axe-core pass (contrast, ARIA, focus rings) | med | S | Some gold-on-dark text is <4.5:1; buttons lack aria-labels |
| 33 | iOS safe-area on bottom tab bar (verify on notched devices) | med | S | Edge case — test on 14/15 Pro |
| 34 | True offline (cache lesson text + compiled trainer JS via SW) | med | M | You have the PWA manifest; service worker is minimal |
| **C — moats / delight** | | | | |
| 35 | AI coach note on any hand ("why this 3-bet is thin") | high | M-L | LLM + your range/equity libs — unique positioning |
| 36 | Solver-backed postflop spots (20 curated, GTO output displayed) | high | L | Matches the "edge" promise |
| 37 | 2-min explainer video per week (not per lesson) | med | L | Production effort; probably YouTube-embedded |
| 38 | Printable one-pager PDFs (preflop chart, pot-odds table, ICM rules) | low | S | Loved by users, cheap to ship |
| 39 | Live-mode "pocket tools" (pot-odds + ICM calculator optimized for playing a session, not learning) | med | S | Repurposes existing trainers into a different mode |

---

## The 3-PR roadmap I'd propose

If you want me to ship this, I'd sequence it as three focused PRs (each ~1 day):

### PR A — "The learning loop" (the biggest single jump)
- Spaced repetition: every wrong answer schedules a re-drill at 1d / 3d / 7d / 21d (SM-2 lite). New column in `progress.drills`: `{ due, interval, ease }`. Trainers pull "due first" before random.
- Explain-on-wrong for every trainer: hand-ranking shows the winning 5-card combo highlighted + category; pot-odds shows the equity math + outs-to-equity conversion; equity shows the range vs range breakdown; ICM shows which player the chip movement favors and why.
- Per-situation accuracy view at `/stats`: grouped by trainer + scenario class (e.g. "BTN opens", "Facing 3-bet", "River bluff-catching").
- Unit tests for `poker.ts`, `equity.ts`, `icm.ts`, `odds.ts` against published reference values (2+2 hand-eval tables, Wizards-of-Odds equities, ICMIZER ICM).

### PR B — "Your own hands"
- Hand-history parser (PokerStars format first, then GG) client-side, no upload.
- `/review/:handId` route: replays the hand card-by-card; on each decision point, runs your equity lib vs. a solver-ish range for villain; flags EV-losing actions.
- Aggregate leak dashboard: VPIP / PFR / 3bet / Cbet-flop / aggression factor, with per-position splits and a "here's what to fix" top-3 list.

### PR C — "Cross-device + retention"
- Supabase magic-link auth; migrate `progressStore` to a dual-write (localStorage + server). Existing users keep their progress; new users sync across devices.
- Streak freezes + weekly goal ring.
- Private leaderboards (join-by-code, share a session).
- Lazy-load trainers + error boundary + Sentry.

---

## Things NOT on this list (deliberately)

- **Custom native apps (iOS/Android).** Your PWA is enough; don't split the codebase until you have >10k DAU.
- **Real-money play or bankroll tracking with bank integration.** Compliance/regulatory nightmare; out of scope for a training product.
- **Live multi-table play against bots.** Interesting, but 10× the engineering of anything above and doesn't teach better than solver study.
- **Video course / lecture replacement.** PokerEdge's value is the tight feedback loop, not lecture delivery. Lean into interactivity.

---

## What I'd touch first if you gave me a half-day

1. Write the 4 unit-test files (~1 hr)
2. Add "explain on wrong" to Hand Ranking + Pot Odds + Equity (~2 hrs)
3. Ship the spaced-repetition minimum (due queue in `progressStore`) and wire it into one trainer (~2 hrs)

That's a half-day PR that visibly moves the product from "good" to "serious."

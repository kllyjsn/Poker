# PokerEdge — Path to "Best Poker Educator in the World"

**Status as of PR #4 (learning loop):** A solid foundation. We have a 12-week curriculum, 5 trainers, spaced repetition, explain-on-wrong, per-situation stats, and 69 unit tests. **But we are still ~10% of the way to "best in the world."** This document explains the other 90% and proposes a sequenced plan.

---

## 1. Honest assessment of where we stand

| Capability | Us | GTO Wizard | Run It Once Elite | Upswing Lab | DTO/Solver+ |
|---|---|---|---|---|---|
| Solver-grounded ranges | ❌ static heuristic | ✅ full | ✅ partial | ✅ full | ✅ full |
| Postflop trainer with EV loss | ❌ | ✅ | ⚠️ | ⚠️ | ✅ |
| Hand-history import + leak report | ❌ | ✅ | ❌ | ❌ | ✅ |
| Pro video content | ❌ | ⚠️ | ✅ deep | ✅ deep | ❌ |
| Cohort / community / coaching | ❌ | ❌ | ✅ | ✅ | ❌ |
| Spaced repetition / due queue | ✅ (PR #4) | ❌ | ❌ | ❌ | ❌ |
| Explain-on-wrong | ✅ (PR #4) | ✅ | n/a | n/a | ✅ |
| Per-situation analytics | ✅ (PR #4) | ✅ | ❌ | ❌ | ✅ |
| Mobile-first UX | ✅ | ⚠️ | ❌ | ❌ | ✅ |
| Cross-device sync | ❌ localStorage only | ✅ | ✅ | ✅ | ✅ |
| Personalized curriculum | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| Live-game pressure (timers, multitable) | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| Mental-game tooling | ❌ | ❌ | ⚠️ | ⚠️ | ❌ |
| Bankroll/format awareness | ❌ NLHE only | ✅ | ✅ | ⚠️ | ✅ |
| Trainer count | 5 | 30+ | n/a | 10+ | 20+ |
| Open-ended hand reviewer | ❌ | ✅ | ⚠️ | ❌ | ✅ |

**Where we already win:** mobile UX, spaced repetition, the explain-on-wrong UI, and the structured 12-week curriculum (most competitors have unstructured "video library" approaches). PWA + bottom tab bar beats every desktop-first competitor on phone.

**Where we lose badly:** zero solver, zero hand history, zero pro content, zero community, zero personalization, zero backend.

---

## 2. What "best in the world" actually means

Six properties define a world-class educator (in any field, applied here):

1. **Adaptive** — what a beginner sees on day 1 is different from what a $5/$10 reg sees, and the system figures that out.
2. **Solver-grounded** — every "right answer" can be traced to objective EV math, not heuristics.
3. **Personal** — works on **your** hands, not synthetic ones.
4. **Pressured** — practice mirrors real-game cognitive load (timers, multitable, range vs range, not just hand vs range).
5. **Communal** — students study with peers and get coached by humans (or an AI that feels human).
6. **Multi-modal** — text + interactive + video + audio (commute) + voice (hands-free study).

PokerEdge today is rich on (interactive) only. To win, we need to deliver on all six.

---

## 3. Top 10 gaps, ranked by impact

> Impact = expected lift in user proficiency × user willingness to pay × differentiation vs. competitors.

### #1 — Solver-grounded answers, not heuristics  *(massive)*
Today: `openingRange("UTG")` returns a hand-tuned 31-hand set. The Pot Odds trainer asserts "call" or "fold" based on `equity ≥ requiredPct`, which is a simplification that breaks down with multiway, future streets, and non-standard SPRs. We say "GTO-ish" — that hedge is doing a lot of work.

What "solver-grounded" looks like:
- Ship pre-solved range files (not run a solver in-browser — that's hours of compute). Wizard ships hundreds of MB of solver outputs as static JSON. We can do the same with ~3 stack depths × 5 positions × the most common preflop trees.
- Postflop: precompute "hero is in BTN vs BB SRP, board K72r, villain bets 50%" → here's the equilibrium response. Show the user what GTO does and **how much EV they cost themselves** by deviating.
- Every drill answer reports **EV loss in bb/100** vs the equilibrium. This is the language serious players speak.

This single change moves us from "good drill app" to "trainer regs would actually use." It's the highest-impact thing we can build.

### #2 — Hand-history paste + auto-review  *(massive)*
The #1 thing serious players pay for. Paste a PokerStars/GG/ACR hand-history string, the app:
- Parses positions, stacks, action.
- Compares each decision to the GTO baseline (uses #1).
- Outputs a verdict: "You called 3-bet 100% with KQs UTG vs CO. GTO calls 30%, folds 70%. EV loss: -0.4 bb."
- Aggregates across pasted hands → leak report ("you over-defend BB vs BTN by 12% — costs ~3 bb/100").

Even shipping just **preflop verdicts** (no postflop) is a step-function feature.

### #3 — Personalized curriculum from leak detection  *(huge)*
Today the curriculum is identical for everyone. Combined with #2, we can:
- Detect that User A loses 4 bb/100 to overcalling 3-bets → schedule extra 3-bet defense lessons in their next 2 weeks.
- Detect User B is fundamentally solid preflop but hemorrhages on river decisions → swap their week 6 "ranges" content for "river bet sizing."
- The 12-week curriculum becomes a *base track*, not a fixed sequence. SR already powers this for trainers; we extend it to lessons.

### #4 — Backend + cross-device sync  *(structural)*
Right now your laptop and phone don't share progress. This is unacceptable for a mobile-first app where the value prop is "drill on the train, study on the laptop." Plus we **need** server-side state to do anything in #5–#8.

Lightweight stack: **Supabase** (auth + Postgres + real-time) or **Convex**. ~3 days to integrate. Migrate localStorage → server with a one-time sync.

### #5 — Live-game pressure mode  *(big)*
Real poker has a 30-second timer. Multi-tables run in parallel. Decision quality under pressure is what separates a winning reg from a player who knows the answers but tilts off in real time.

Add:
- Per-drill timer (15s preflop, 30s postflop). Time out = wrong.
- "Sweat mode": 2–4 simultaneous drills running on tabs. User toggles between, makes a decision in each within the global timer. Mimics multi-tabling.
- New stat: **accuracy under pressure** (drill accuracy with timer ≤ 5s remaining).

Nobody else does this well. This is a genuine differentiator.

### #6 — Trainer breadth: 5 → 15  *(big)*
Competitors have 20–30 trainers. We have 5. Critical missing ones:
- **3-bet / 4-bet ranges** — preflop continuation past the open.
- **Cbet decision** — hardest fundamental skill, biggest leak source for $1/$2 players.
- **Turn barrel** — second-bullet decisions.
- **River decision** — pure showdown value vs. bluff catch.
- **Bet-sizing trainer** — given board + range, pick 1/3 / 2/3 / pot / overbet.
- **Blocker quiz** — "you have AhKh on AsTd5d2c5h, who blocks more flushes" type drills.
- **Board reader** — flop texture classification (wet/dry, dynamic/static, range advantage to whom).
- **MTT push/fold** — Nash ranges by stack depth (10bb, 15bb, 20bb).
- **Multiway pots** — 3+ players, range narrows hugely; almost no app teaches this well.
- **Blind defense** — BB vs SB, BB vs BTN, etc. Discrete spot families.

### #7 — Pro video content  *(huge but content-dependent)*
A 12-week video curriculum (60 lessons × 5 min = 5 hours of footage) recorded by a credentialed pro is a step-function in perceived value. This is **content production, not code**. Costs: ~$25k–$50k for a known pro, or $5k–$10k for a strong unknown. Or: license existing content (Solve for Why, Crush Live Poker).

Without this, we're competing as "tool"; with this, we're competing as "course + tool."

### #8 — Cohort / community  *(retention)*
Discord-style "Week 3 cohort" with weekly challenges, public leaderboards, study partners, and 1 live AMA per week. Users who study in cohorts complete 3–5× as much material as solo users. Drop-off is the silent killer of online courses.

Lightweight version: a `/cohort` page where users opt in to the current monthly cohort, see other members, weekly challenge leaderboard. Heavy version: integrate a real Discord, schedule live coaching.

### #9 — AI hand reviewer  *(differentiator)*
"Talk to GPT about a hand" but actually grounded in solver outputs. The user types or pastes a hand; the AI explains the GTO line in natural language ("Here you should fold because villain's range is heavily weighted toward stronger Ax — the call needs 32% equity but you have 27%.") Modern LLMs do this well **if** we ground them in solver outputs (#1). Without that grounding, they hallucinate.

### #10 — Mental game module  *(deep)*
Tilt journal, session debrief prompts, bankroll tracking, A/B-tested mindset interventions, daily mental-game lesson. Jared Tendler's *The Mental Game of Poker* is a $100M+ ecosystem and has zero good app implementation. Open lane.

---

## 4. The single biggest unlock

If forced to ship one thing: **#2 (hand-history import + verdict)**. Every other feature is "nice." Hand history is *transformative* — it turns the app from "drill on synthetic stuff" to "study your own play." It's also the feature with the highest willingness-to-pay (Wizard charges $99/mo primarily for this).

Hand-history import requires #1 (solver baselines) for the verdict, which is why I'd actually sequence them as a unit:

> **Big PR — solver baselines + hand-history reviewer (preflop only)**: ship pre-solved preflop charts for 6-max 100bb (15 positions × ranges, ~150 KB compressed), let the user paste a hand, and report EV loss per preflop decision. Postflop comes later.

This single PR moves PokerEdge from "good drill app" → "I review my session in this every night."

---

## 5. Sequenced roadmap

I'd ship in roughly this order. Each is a discrete PR (or PR pair) of 1–4 days.

### Phase 1 — credibility (4–6 weeks)
**P1.** Backend + auth + cross-device sync (Supabase). Without this nothing else scales.
**P2.** Solver baselines (preflop): pre-solved range files, replace static `openingRange()` calls. Add EV-loss readout to the Preflop trainer.
**P3.** Hand-history import + preflop verdict + first-pass leak report.
**P4.** 5 new trainers: 3-bet, 4-bet, cbet, blind defense, MTT push/fold.

After Phase 1, PokerEdge is competitive with Wizard's free tier.

### Phase 2 — depth (4–8 weeks)
**P5.** Postflop solver baselines (4–6 most common spot families, e.g. BTN vs BB SRP / 3BP).
**P6.** Full hand-history reviewer (preflop + postflop, hand-by-hand verdict).
**P7.** Live-pressure mode + sweat mode (multi-tab drills).
**P8.** Personalized curriculum: leak report → custom 4-week recovery plan.

After Phase 2, PokerEdge has a feature set Wizard doesn't (pressure mode, personalized recovery).

### Phase 3 — moat (8–12 weeks)
**P9.** AI hand-reviewer chat (grounded in #1).
**P10.** Cohort + leaderboards + Discord integration.
**P11.** Mental game module.
**P12.** Pro video content (if budget exists) or licensed library.

After Phase 3, PokerEdge has a defensible moat: nobody else combines solver + SR + pressure + community + curriculum + mental game in one product.

### Phase 4 — extend (ongoing)
- PLO / 6+ Hold'em variants
- Voice mode (commute study)
- Live-game emulator (4 villain bots)
- Multi-modal sync (audio lessons during commute, picks up in app)

---

## 6. Honest constraints

- **Solver compute is expensive.** Running PioSolver/GTO+ on a real spot is hours per spot. We need pre-solved data, either licensed or built from a one-time job. Estimated ~$2k–$10k of cloud compute to ship a respectable preflop + 4 postflop families.
- **Pro content costs real money.** A coach willing to put their face on it is $25k–$100k.
- **Backend introduces ops burden.** Once we have a server, we have uptime, security, GDPR, etc. Not free.
- **Anything "AI" needs guardrails.** LLMs hallucinate poker advice constantly. Every AI feature must be grounded in deterministic solver output, not free-form generation.

---

## 7. What I'd recommend we ship next

In priority order:

1. **Backend + cross-device sync** (Supabase). Unblocks everything else. ~2 days.
2. **Solver baselines for preflop + EV-loss readout.** ~2–3 days for static files + UI.
3. **Hand-history paste + preflop verdict.** ~3–4 days.

That's roughly one focused week of work and it would be the single biggest leap in product quality since the app was created.

Beyond that, I'd want a steering decision from you on whether we're building "a tool" (keep going on solver/HH/trainers) or "a school" (invest in video + cohort + coaching). The two paths diverge meaningfully.

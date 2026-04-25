// SM-2 lite spaced repetition.
//
// Each "card" represents one drillable scenario (e.g. "preflop:UTG:AJs",
// "pot-odds:bet-1/2-pot", "hand-ranking:Flush-beats-Straight"). Cards
// become due based on past performance: wrong answers come back quickly,
// right answers stretch out over days.
//
// We intentionally keep this simpler than full SM-2:
//   - ease starts at 2.5, clamped to [1.3, 3.0]
//   - first correct → 1d; second → 3d; thereafter → prev * ease
//   - any wrong answer → 10 minutes, ease -= 0.2

export interface SrsCard {
  attempts: number;
  correct: number;
  ease: number;          // multiplier for interval growth
  interval: number;      // ms until next due (after lastAt)
  due: number;           // epoch ms when this card should appear again
  lastAt?: number;       // epoch ms of last review
  streak: number;        // consecutive correct answers (resets on wrong)
}

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

export const SRS_DEFAULTS = {
  ease: 2.5,
  minEase: 1.3,
  maxEase: 3.0,
  firstCorrectMs: 1 * DAY,
  secondCorrectMs: 3 * DAY,
  failRelearnMs: 10 * MINUTE,
  easeBumpCorrect: 0.0,   // keep ease stable on correct (classic SM-2 only nudges ease on harder items)
  easePenaltyWrong: 0.2,
} as const;

export function newCard(now: number = Date.now()): SrsCard {
  return {
    attempts: 0,
    correct: 0,
    ease: SRS_DEFAULTS.ease,
    interval: 0,
    due: now,
    streak: 0,
  };
}

export function reviewCard(
  prev: SrsCard | undefined,
  correct: boolean,
  now: number = Date.now(),
): SrsCard {
  const c: SrsCard = prev ? { ...prev } : newCard(now);
  c.attempts += 1;
  c.lastAt = now;

  if (correct) {
    c.correct += 1;
    c.streak += 1;
    let nextInterval: number;
    if (c.streak === 1) nextInterval = SRS_DEFAULTS.firstCorrectMs;
    else if (c.streak === 2) nextInterval = SRS_DEFAULTS.secondCorrectMs;
    else nextInterval = Math.round((c.interval || SRS_DEFAULTS.firstCorrectMs) * c.ease);
    c.interval = nextInterval;
    c.due = now + nextInterval;
    c.ease = clamp(c.ease + SRS_DEFAULTS.easeBumpCorrect, SRS_DEFAULTS.minEase, SRS_DEFAULTS.maxEase);
  } else {
    c.streak = 0;
    c.interval = SRS_DEFAULTS.failRelearnMs;
    c.due = now + c.interval;
    c.ease = clamp(c.ease - SRS_DEFAULTS.easePenaltyWrong, SRS_DEFAULTS.minEase, SRS_DEFAULTS.maxEase);
  }
  return c;
}

export function isDue(c: SrsCard | undefined, now: number = Date.now()): boolean {
  if (!c) return true;     // never-seen cards are "due" (new material)
  return c.due <= now;
}

export function dueCards<T extends string>(
  cards: Record<T, SrsCard>,
  now: number = Date.now(),
): T[] {
  return (Object.keys(cards) as T[]).filter(k => cards[k].due <= now);
}

// Pick a weight for a scenario key given optional SR data.
// Wrong-heavy items get boosted; well-learned items get dampened.
export function pickWeight(c: SrsCard | undefined): number {
  if (!c || c.attempts === 0) return 1;
  const acc = c.correct / c.attempts;
  // items below 60% accuracy weighted 3x, above 90% weighted 0.3x
  if (acc < 0.6) return 3;
  if (acc > 0.9) return 0.3;
  return 1;
}

export function weightedPick<T>(items: T[], weights: number[], rng: () => number = Math.random): T {
  if (items.length === 0) throw new Error("weightedPick: empty");
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return items[Math.floor(rng() * items.length)];
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

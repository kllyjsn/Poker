// Core poker primitives: cards, decks, hand evaluation (5 out of 7).
// Hand evaluator uses a direct category approach. Plenty fast for drills
// and Monte Carlo estimates (~100k evals/sec in browser).

export type Suit = "s" | "h" | "d" | "c";
export type Rank =
  | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
  | "T" | "J" | "Q" | "K" | "A";

export interface Card {
  rank: Rank;
  suit: Suit;
}

export const RANKS: Rank[] = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"];
export const SUITS: Suit[] = ["s","h","d","c"];

export const RANK_VALUE: Record<Rank, number> = {
  "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8,
  "9": 9, "T": 10, "J": 11, "Q": 12, "K": 13, "A": 14,
};

export const SUIT_SYMBOL: Record<Suit, string> = {
  s: "\u2660", h: "\u2665", d: "\u2666", c: "\u2663",
};

export const SUIT_COLOR: Record<Suit, "red" | "black"> = {
  s: "black", h: "red", d: "red", c: "black",
};

export function cardId(c: Card): string { return `${c.rank}${c.suit}`; }

export function parseCard(s: string): Card {
  const r = s[0].toUpperCase() as Rank;
  const su = s[1].toLowerCase() as Suit;
  if (!RANKS.includes(r)) throw new Error(`bad rank ${s}`);
  if (!SUITS.includes(su)) throw new Error(`bad suit ${s}`);
  return { rank: r, suit: su };
}

export function fullDeck(): Card[] {
  const d: Card[] = [];
  for (const r of RANKS) for (const s of SUITS) d.push({ rank: r, suit: s });
  return d;
}

export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 169 starting-hand keys, e.g. "AKs", "TT", "72o".
export function startingHandKey(a: Card, b: Card): string {
  const ra = RANK_VALUE[a.rank];
  const rb = RANK_VALUE[b.rank];
  const [hi, lo] = ra >= rb ? [a, b] : [b, a];
  if (hi.rank === lo.rank) return `${hi.rank}${lo.rank}`;
  const suited = hi.suit === lo.suit ? "s" : "o";
  return `${hi.rank}${lo.rank}${suited}`;
}

// All 169 keys, ordered from strongest to weakest block by rank.
export function allStartingHands(): string[] {
  const out: string[] = [];
  for (let i = RANKS.length - 1; i >= 0; i--) {
    for (let j = RANKS.length - 1; j >= 0; j--) {
      const hi = RANKS[i];
      const lo = RANKS[j];
      if (i === j) out.push(`${hi}${lo}`);
      else if (i > j) out.push(`${hi}${lo}s`);
      else out.push(`${lo}${hi}o`);
    }
  }
  return out;
}

// ---- Hand evaluation ----------------------------------------------------
//
// Scoring scheme: return a single number where higher = stronger. The top
// 4 bits encode category (0..8), then up to five 4-bit kicker slots.
// That yields 24-bit ints that are safe to compare numerically.

export const HAND_CATEGORIES = [
  "High Card",
  "Pair",
  "Two Pair",
  "Three of a Kind",
  "Straight",
  "Flush",
  "Full House",
  "Four of a Kind",
  "Straight Flush",
] as const;
export type HandCategory = typeof HAND_CATEGORIES[number];

export interface EvalResult {
  score: number;
  category: HandCategory;
  ranks: number[]; // top 5 ranks used, high-to-low
}

function packScore(cat: number, kickers: number[]): number {
  let s = cat;
  for (let i = 0; i < 5; i++) {
    const k = kickers[i] ?? 0;
    s = (s << 4) | (k & 0xf);
  }
  return s;
}

function findStraightHigh(uniqueDesc: number[]): number {
  // `uniqueDesc` is descending list of unique rank values (2..14).
  const set = new Set(uniqueDesc);
  // check ace-low wheel
  if (set.has(14) && set.has(5) && set.has(4) && set.has(3) && set.has(2)) {
    // 5-high straight
    // mark the wheel via sentinel 5
  }
  for (const v of uniqueDesc) {
    if (v < 5) break;
    if (set.has(v) && set.has(v - 1) && set.has(v - 2) && set.has(v - 3) && set.has(v - 4)) {
      return v;
    }
  }
  if (set.has(14) && set.has(2) && set.has(3) && set.has(4) && set.has(5)) return 5;
  return 0;
}

export function evaluate7(cards: Card[]): EvalResult {
  if (cards.length < 5 || cards.length > 7) {
    throw new Error("evaluate7 expects 5..7 cards");
  }
  const values = cards.map(c => RANK_VALUE[c.rank]);
  const suits = cards.map(c => c.suit);

  // counts
  const rankCount = new Map<number, number>();
  for (const v of values) rankCount.set(v, (rankCount.get(v) ?? 0) + 1);
  const sortedByCount = [...rankCount.entries()]
    .sort((a, b) => b[1] - a[1] || b[0] - a[0]);

  // flush detection
  const suitCount = new Map<Suit, number>();
  for (const s of suits) suitCount.set(s, (suitCount.get(s) ?? 0) + 1);
  let flushSuit: Suit | null = null;
  for (const [s, n] of suitCount) if (n >= 5) { flushSuit = s; break; }

  // straight flush
  if (flushSuit) {
    const suited = cards.filter(c => c.suit === flushSuit).map(c => RANK_VALUE[c.rank]);
    const uniqueDesc = Array.from(new Set(suited)).sort((a, b) => b - a);
    const sfHigh = findStraightHigh(uniqueDesc);
    if (sfHigh) {
      return {
        score: packScore(8, [sfHigh]),
        category: "Straight Flush",
        ranks: [sfHigh],
      };
    }
  }

  // four of a kind
  if (sortedByCount[0][1] === 4) {
    const quad = sortedByCount[0][0];
    const kicker = values.filter(v => v !== quad).reduce((a, b) => Math.max(a, b), 0);
    return {
      score: packScore(7, [quad, kicker]),
      category: "Four of a Kind",
      ranks: [quad, kicker],
    };
  }

  // full house (trips + pair, or two trips)
  if (sortedByCount[0][1] === 3) {
    const trip = sortedByCount[0][0];
    let pair = 0;
    for (let i = 1; i < sortedByCount.length; i++) {
      if (sortedByCount[i][1] >= 2) { pair = sortedByCount[i][0]; break; }
    }
    if (pair) {
      return {
        score: packScore(6, [trip, pair]),
        category: "Full House",
        ranks: [trip, pair],
      };
    }
  }

  // flush
  if (flushSuit) {
    const suited = cards.filter(c => c.suit === flushSuit).map(c => RANK_VALUE[c.rank]);
    const top5 = suited.sort((a, b) => b - a).slice(0, 5);
    return { score: packScore(5, top5), category: "Flush", ranks: top5 };
  }

  // straight
  const uniqueDesc = Array.from(new Set(values)).sort((a, b) => b - a);
  const straightHigh = findStraightHigh(uniqueDesc);
  if (straightHigh) {
    return {
      score: packScore(4, [straightHigh]),
      category: "Straight",
      ranks: [straightHigh],
    };
  }

  // three of a kind
  if (sortedByCount[0][1] === 3) {
    const trip = sortedByCount[0][0];
    const kickers = values.filter(v => v !== trip).sort((a, b) => b - a).slice(0, 2);
    return {
      score: packScore(3, [trip, ...kickers]),
      category: "Three of a Kind",
      ranks: [trip, ...kickers],
    };
  }

  // two pair
  if (sortedByCount[0][1] === 2 && sortedByCount[1]?.[1] === 2) {
    const hi = sortedByCount[0][0];
    const lo = sortedByCount[1][0];
    const kicker = values.filter(v => v !== hi && v !== lo).reduce((a, b) => Math.max(a, b), 0);
    return {
      score: packScore(2, [hi, lo, kicker]),
      category: "Two Pair",
      ranks: [hi, lo, kicker],
    };
  }

  // pair
  if (sortedByCount[0][1] === 2) {
    const pair = sortedByCount[0][0];
    const kickers = values.filter(v => v !== pair).sort((a, b) => b - a).slice(0, 3);
    return {
      score: packScore(1, [pair, ...kickers]),
      category: "Pair",
      ranks: [pair, ...kickers],
    };
  }

  // high card
  const top5 = values.sort((a, b) => b - a).slice(0, 5);
  return { score: packScore(0, top5), category: "High Card", ranks: top5 };
}

export function describeHand(e: EvalResult): string {
  return e.category;
}

// -- Best-five helper --------------------------------------------------------
//
// Given the 5..7 cards passed to evaluate7 and the resulting EvalResult,
// return the specific 5 cards that form the winning hand. Useful for
// highlighting "the cards that matter" in trainer UIs.

export function bestFive(cards: Card[], eval_: EvalResult): Card[] {
  const cat = eval_.category;
  const byRank = new Map<number, Card[]>();
  for (const c of cards) {
    const v = RANK_VALUE[c.rank];
    if (!byRank.has(v)) byRank.set(v, []);
    byRank.get(v)!.push(c);
  }
  const bySuit = new Map<Suit, Card[]>();
  for (const c of cards) {
    if (!bySuit.has(c.suit)) bySuit.set(c.suit, []);
    bySuit.get(c.suit)!.push(c);
  }

  if (cat === "Straight Flush" || cat === "Flush") {
    let flushSuit: Suit | null = null;
    for (const [s, cs] of bySuit) if (cs.length >= 5) { flushSuit = s; break; }
    if (flushSuit) {
      const suited = bySuit.get(flushSuit)!.slice().sort((a, b) => RANK_VALUE[b.rank] - RANK_VALUE[a.rank]);
      if (cat === "Flush") return suited.slice(0, 5);
      // straight flush: pick the 5 suited cards forming the straight ending at ranks[0]
      const high = eval_.ranks[0];
      const want = high === 5
        ? [14, 5, 4, 3, 2]   // wheel (ace-low) SF
        : [high, high - 1, high - 2, high - 3, high - 4];
      const pool = suited.slice();
      const out: Card[] = [];
      for (const r of want) {
        const idx = pool.findIndex(c => RANK_VALUE[c.rank] === r);
        if (idx >= 0) out.push(pool.splice(idx, 1)[0]);
      }
      return out;
    }
  }

  if (cat === "Four of a Kind") {
    const quad = eval_.ranks[0];
    const kicker = eval_.ranks[1];
    return [...(byRank.get(quad) ?? []).slice(0, 4), ...(byRank.get(kicker) ?? []).slice(0, 1)];
  }

  if (cat === "Full House") {
    const trip = eval_.ranks[0];
    const pair = eval_.ranks[1];
    return [...(byRank.get(trip) ?? []).slice(0, 3), ...(byRank.get(pair) ?? []).slice(0, 2)];
  }

  if (cat === "Straight") {
    const high = eval_.ranks[0];
    const want = high === 5 ? [14, 5, 4, 3, 2] : [high, high - 1, high - 2, high - 3, high - 4];
    return want.map(r => (byRank.get(r) ?? [])[0]).filter(Boolean);
  }

  if (cat === "Three of a Kind") {
    const trip = eval_.ranks[0];
    const k1 = eval_.ranks[1];
    const k2 = eval_.ranks[2];
    return [...(byRank.get(trip) ?? []).slice(0, 3), ...(byRank.get(k1) ?? []).slice(0, 1), ...(byRank.get(k2) ?? []).slice(0, 1)];
  }

  if (cat === "Two Pair") {
    const hi = eval_.ranks[0];
    const lo = eval_.ranks[1];
    const k = eval_.ranks[2];
    return [...(byRank.get(hi) ?? []).slice(0, 2), ...(byRank.get(lo) ?? []).slice(0, 2), ...(byRank.get(k) ?? []).slice(0, 1)];
  }

  if (cat === "Pair") {
    const pair = eval_.ranks[0];
    const kickers = eval_.ranks.slice(1);
    const out = [...(byRank.get(pair) ?? []).slice(0, 2)];
    for (const k of kickers) out.push(...(byRank.get(k) ?? []).slice(0, 1));
    return out.slice(0, 5);
  }

  // High Card: top 5 cards descending
  const sorted = cards.slice().sort((a, b) => RANK_VALUE[b.rank] - RANK_VALUE[a.rank]);
  return sorted.slice(0, 5);
}

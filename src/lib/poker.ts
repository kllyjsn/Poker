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

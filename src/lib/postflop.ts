// Pedagogical postflop heuristics: cbet, turn barrel, river decision.
//
// These are rule-based "right answers" intended to teach common
// principles, not solver outputs. Every decision is paired with a
// human-readable rationale shown in the trainer's explain-on-wrong UI.
//
// Conventions:
//  - Hero is the preflop raiser (IP) unless stated otherwise.
//  - Cards are 2-char strings ("Ah", "Tc"); board is array of 3/4/5.

const RANK_ORDER = "23456789TJQKA";

export type CbetAction = "cbet-small" | "cbet-large" | "check";
export type BarrelAction = "barrel-small" | "barrel-large" | "check";
export type RiverAction = "call" | "fold";

export interface Board {
  cards: string[]; // length 3 (flop), 4 (turn), 5 (river)
}

interface BoardFeatures {
  highRank: number;          // 0-12
  paired: boolean;
  monotone: boolean;         // 3 same suit
  twoTone: boolean;          // 2+1 suits
  rainbow: boolean;
  connected: boolean;        // gaps <= 1 between top 3 ranks
  hasFlushDraw: boolean;
  hasStraightDraw: boolean;
  acePresent: boolean;
  topPairedAce: boolean;
}

export function rankIdx(r: string): number { return RANK_ORDER.indexOf(r); }

export function boardFeatures(cards: string[]): BoardFeatures {
  const ranks = cards.map(c => rankIdx(c[0])).sort((a, b) => b - a);
  const suits = cards.map(c => c[1]);
  const counts = new Map<number, number>();
  ranks.forEach(r => counts.set(r, (counts.get(r) ?? 0) + 1));
  const paired = [...counts.values()].some(v => v >= 2);
  const suitCounts = new Map<string, number>();
  suits.forEach(s => suitCounts.set(s, (suitCounts.get(s) ?? 0) + 1));
  const maxSuit = Math.max(...suitCounts.values());
  const monotone = maxSuit >= cards.length;
  const rainbow = maxSuit === 1;
  const twoTone = !monotone && !rainbow;
  // Connected: top 3 ranks span <= 4 slots (e.g. T98, JT8)
  const top3 = ranks.slice(0, 3);
  const span = top3[0] - top3[top3.length - 1];
  const connected = span <= 4;
  const hasFlushDraw = maxSuit >= 2;
  const hasStraightDraw = span <= 4 && new Set(top3).size === top3.length;
  const acePresent = ranks.includes(rankIdx("A"));
  const topPairedAce = paired && ranks[0] === rankIdx("A");
  return {
    highRank: ranks[0],
    paired,
    monotone,
    twoTone,
    rainbow,
    connected,
    hasFlushDraw,
    hasStraightDraw,
    acePresent,
    topPairedAce,
  };
}

/** Cbet decision (hero IP raiser vs BB caller, single-raised pot, 100bb). */
export function cbetDecision(board: Board): { action: CbetAction; reasons: string[] } {
  const f = boardFeatures(board.cards);
  const reasons: string[] = [];

  // Dry, ace-high or king-high rainbow → small cbet very high freq
  if (!f.paired && f.rainbow && (f.highRank >= rankIdx("Q"))) {
    reasons.push(`${RANK_ORDER[f.highRank]}-high rainbow board favors the preflop raiser`);
    reasons.push("Range advantage means small cbet (~33% pot) at high frequency");
    return { action: "cbet-small", reasons };
  }

  // Paired high boards → small cbet, range bet
  if (f.paired && f.highRank >= rankIdx("T")) {
    reasons.push(`Paired ${RANK_ORDER[f.highRank]}-high board favors the preflop raiser`);
    reasons.push("Range bet small (~33% pot) to deny equity from mid-pairs");
    return { action: "cbet-small", reasons };
  }

  // Monotone or wet connected boards → check more
  if (f.monotone || (f.hasStraightDraw && f.hasFlushDraw && f.highRank <= rankIdx("J"))) {
    reasons.push("Wet, dynamic boards reduce IP's range advantage");
    reasons.push("Check more often to protect your checking range and avoid getting raised");
    return { action: "check", reasons };
  }

  // Low connected boards (e.g. 765, T98) hit BB more
  if (f.highRank <= rankIdx("T") && f.connected && !f.paired) {
    reasons.push(`Low connected board (top card ${RANK_ORDER[f.highRank]}) hits BB's range`);
    reasons.push("Check more or use larger sizes only with strong hands and combo draws");
    return { action: "check", reasons };
  }

  // Dynamic, two-tone high boards (e.g. AhKh7d) → use bigger size
  if (f.twoTone && f.highRank >= rankIdx("Q") && !f.paired) {
    reasons.push(`Two-tone ${RANK_ORDER[f.highRank]}-high board: range advantage but vulnerable to draws`);
    reasons.push("Use a larger size (~66-75% pot) with strong hands and bluffs");
    return { action: "cbet-large", reasons };
  }

  // Default: cbet small
  reasons.push("No strong texture signal — default to small cbet (~33%)");
  return { action: "cbet-small", reasons };
}

/** Turn barrel decision (hero cbet small flop, BB called, turn arrives). */
export function turnBarrelDecision(
  flop: string[],
  turnCard: string,
): { action: BarrelAction; reasons: string[] } {
  const flopF = boardFeatures(flop);
  const allCards = [...flop, turnCard];
  const turnF = boardFeatures(allCards);
  const turnRank = rankIdx(turnCard[0]);
  const reasons: string[] = [];

  // Turn pairs the board → typically barrel smaller
  if (turnF.paired && !flopF.paired) {
    reasons.push(`Turn pairs the board (${turnCard[0]}${turnCard[0]})`);
    reasons.push("Pairing turns favor the cbettor — barrel small to keep pressure");
    return { action: "barrel-small", reasons };
  }

  // Turn completes a flush draw (3rd of a suit on a 2-tone flop)
  const flopSuits = flop.map(c => c[1]);
  const flopSuitCounts = new Map<string, number>();
  flopSuits.forEach(s => flopSuitCounts.set(s, (flopSuitCounts.get(s) ?? 0) + 1));
  const flopMaxSuit = Math.max(...flopSuitCounts.values());
  const turnSuit = turnCard[1];
  const turnCompletesFlush = flopMaxSuit === 2 && (flopSuitCounts.get(turnSuit) ?? 0) === 2;
  if (turnCompletesFlush) {
    reasons.push("Turn completes a 3-flush — BB realizes more flushes than IP");
    reasons.push("Check most hands; barrel only with the nut flush or pure bluff blockers");
    return { action: "check", reasons };
  }

  // Turn is overcard to flop (especially A or K)
  if (turnRank > flopF.highRank && turnRank >= rankIdx("Q")) {
    reasons.push(`Turn ${turnCard[0]} is an overcard that hits IP's range`);
    reasons.push("Barrel large — leverage range advantage and deny equity");
    return { action: "barrel-large", reasons };
  }

  // Turn brings a 4-straight on a low connected board
  if (turnF.connected && turnF.hasStraightDraw && turnF.highRank <= rankIdx("T")) {
    reasons.push("Turn extends a low straight structure — many straights and draws");
    reasons.push("Check back and pot-control; only barrel with a polarized strategy");
    return { action: "check", reasons };
  }

  // Brick turn (low blank that doesn't change anything) → small barrel
  if (turnRank < rankIdx("T") && !turnF.paired) {
    reasons.push(`Brick turn (${turnCard[0]}) doesn't change ranges`);
    reasons.push("Continue the flop story with a small barrel");
    return { action: "barrel-small", reasons };
  }

  reasons.push("No strong signal — default to small barrel");
  return { action: "barrel-small", reasons };
}

/**
 * River decision: facing a bet of `betPct` of pot with a bluff catcher.
 * Caller has assumed equity vs villain's range; we treat any "bluff catcher"
 * as 0% vs value combos and 100% vs bluff combos. Decision = call if
 * bluff frequency >= required threshold from pot odds.
 */
export function riverDecision(
  potBeforeBet: number,
  betSize: number,
  villainBluffFreqPct: number, // 0-100
): { action: RiverAction; requiredEquityPct: number; reasons: string[] } {
  const required = (betSize / (potBeforeBet + 2 * betSize)) * 100;
  const reasons: string[] = [
    `Bet ${betSize} into pot ${potBeforeBet}: pot odds = ${betSize}/(${potBeforeBet}+${betSize}+${betSize}) = ${required.toFixed(1)}%`,
    `Villain's range is ${villainBluffFreqPct}% bluffs / ${100 - villainBluffFreqPct}% value`,
    `With a pure bluff catcher you have ${villainBluffFreqPct}% equity`,
  ];
  if (villainBluffFreqPct >= required) {
    reasons.push(`${villainBluffFreqPct}% > ${required.toFixed(1)}% required → call`);
    return { action: "call", requiredEquityPct: required, reasons };
  }
  reasons.push(`${villainBluffFreqPct}% < ${required.toFixed(1)}% required → fold`);
  return { action: "fold", requiredEquityPct: required, reasons };
}

const RANKS = "23456789TJQKA".split("");
const SUITS = "shdc".split("");

/** Generate a random unique-card board of given length. */
export function randomBoard(n: number, rng: () => number = Math.random): string[] {
  const deck: string[] = [];
  for (const r of RANKS) for (const s of SUITS) deck.push(r + s);
  // Fisher-Yates partial
  for (let i = deck.length - 1; i > deck.length - 1 - n; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(deck.length - n);
}

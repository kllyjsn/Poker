// Monte Carlo equity calculator for heads-up or multi-way Hold'em.
// Fast enough for ~10-20k iterations in a browser without blocking.

import type { Card } from "./poker";
import { cardId, evaluate7, fullDeck, shuffle } from "./poker";

export interface EquityInput {
  hands: Card[][]; // each is 2 hole cards
  board?: Card[];  // 0..5 community cards
  iterations?: number;
}

export interface EquityResult {
  wins: number[];
  ties: number[];
  equities: number[]; // share of pot each player wins on average
  iterations: number;
}

export function simulateEquity(input: EquityInput): EquityResult {
  const { hands } = input;
  const board = input.board ?? [];
  const iterations = input.iterations ?? 5000;

  const used = new Set<string>();
  for (const h of hands) for (const c of h) used.add(cardId(c));
  for (const c of board) used.add(cardId(c));

  const remaining: Card[] = fullDeck().filter(c => !used.has(cardId(c)));
  const needed = 5 - board.length;

  const wins = new Array(hands.length).fill(0) as number[];
  const ties = new Array(hands.length).fill(0) as number[];
  const equities = new Array(hands.length).fill(0) as number[];

  for (let i = 0; i < iterations; i++) {
    const shuffled = shuffle(remaining);
    const community = board.concat(shuffled.slice(0, needed));
    let bestScore = -1;
    let bestIdx: number[] = [];
    for (let p = 0; p < hands.length; p++) {
      const all = hands[p].concat(community);
      const e = evaluate7(all);
      if (e.score > bestScore) {
        bestScore = e.score;
        bestIdx = [p];
      } else if (e.score === bestScore) {
        bestIdx.push(p);
      }
    }
    if (bestIdx.length === 1) {
      wins[bestIdx[0]]++;
      equities[bestIdx[0]] += 1;
    } else {
      const share = 1 / bestIdx.length;
      for (const p of bestIdx) {
        ties[p]++;
        equities[p] += share;
      }
    }
  }
  return {
    wins,
    ties,
    equities: equities.map(e => e / iterations),
    iterations,
  };
}

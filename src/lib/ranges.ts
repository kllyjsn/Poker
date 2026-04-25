// Baseline 6-max NL cash preflop opening ranges by position (100bb).
// Percentages are approximate and intended for training, not as solver
// truth. They lean slightly tighter than "modern aggressive" opens so
// students build discipline first and add spots later.

import { allStartingHands } from "./poker";

export type Position = "UTG" | "HJ" | "CO" | "BTN" | "SB";

// Hands are either keyed with standard notation (AKs, TT, 72o) or with
// a `+` suffix like "T9s+" (meaning T9s, JTs, QJs, KJs, KQs in the same
// suited-connector family, handled by expansion below).

const OPEN_RAISE_FIRST_IN: Record<Position, string[]> = {
  UTG: [
    "22+",
    "ATs+", "A5s", "A4s",
    "KTs+", "QTs+", "JTs", "T9s", "98s",
    "AJo+", "KQo",
  ],
  HJ: [
    "22+",
    "A8s+", "A5s", "A4s", "A3s",
    "K9s+", "Q9s+", "J9s+", "T8s+", "98s", "87s", "76s",
    "ATo+", "KJo+", "QJo",
  ],
  CO: [
    "22+",
    "A2s+",
    "K7s+", "Q8s+", "J8s+", "T7s+", "97s+", "86s+", "75s+", "65s", "54s",
    "A9o+", "KTo+", "QTo+", "JTo",
  ],
  BTN: [
    "22+",
    "A2s+",
    "K2s+", "Q5s+", "J7s+", "T7s+", "96s+", "86s+", "75s+", "64s+", "53s+", "43s",
    "A2o+", "K8o+", "Q9o+", "J9o+", "T9o", "98o",
  ],
  SB: [
    "22+",
    "A2s+",
    "K5s+", "Q8s+", "J8s+", "T8s+", "97s+", "86s+", "75s+", "65s", "54s",
    "A7o+", "KTo+", "QTo+", "JTo",
  ],
};

// Expand shorthand to explicit 169-hand set.
// Supports:
//   - Single hands: "AKs", "TT", "72o"
//   - Pair plus:    "22+" => 22..AA
//   - Pair range:   "22-99" => 22, 33, ..., 99
//   - Suited/Offsuit plus: "ATs+" => ATs, AJs, AQs, AKs
export function expand(entries: string[]): Set<string> {
  const all = new Set<string>();
  const RANKS = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"];
  const rankIdx = (r: string) => RANKS.indexOf(r);
  for (const e of entries) {
    if (e.length === 3 && e[2] === "+" && e[0] === e[1]) {
      // pair plus, e.g. "22+" => 22..AA
      const start = rankIdx(e[0]);
      for (let i = start; i < RANKS.length; i++) {
        all.add(`${RANKS[i]}${RANKS[i]}`);
      }
    } else if (e.length === 5 && e[2] === "-" && e[0] === e[1] && e[3] === e[4]) {
      // pair range, e.g. "22-99" => 22..99
      const start = rankIdx(e[0]);
      const end = rankIdx(e[3]);
      const lo = Math.min(start, end);
      const hi = Math.max(start, end);
      for (let i = lo; i <= hi; i++) {
        all.add(`${RANKS[i]}${RANKS[i]}`);
      }
    } else if (e.length === 4 && e[3] === "+") {
      // suited/offsuit plus, e.g. "ATs+" => ATs, AJs, AQs, AKs
      const hi = e[0];
      const lo = e[1];
      const so = e[2];
      const loStart = rankIdx(lo);
      const hiIdx = rankIdx(hi);
      for (let i = loStart; i < hiIdx; i++) {
        all.add(`${hi}${RANKS[i]}${so}`);
      }
    } else {
      all.add(e);
    }
  }
  return all;
}

export function openingRange(pos: Position): Set<string> {
  return expand(OPEN_RAISE_FIRST_IN[pos]);
}

// Utility for the UI: return a 13x13 matrix of { key, inRange } ordered
// with AA at top-left, 22 at bottom-right, suited above diagonal, offsuit
// below.
export function rangeMatrix(pos: Position): { key: string; inRange: boolean }[][] {
  const range = openingRange(pos);
  const RANKS = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];
  const matrix: { key: string; inRange: boolean }[][] = [];
  for (let r = 0; r < 13; r++) {
    const row: { key: string; inRange: boolean }[] = [];
    for (let c = 0; c < 13; c++) {
      const hi = RANKS[Math.min(r, c)];
      const lo = RANKS[Math.max(r, c)];
      let key: string;
      if (r === c) key = `${hi}${lo}`;
      else if (c > r) key = `${hi}${lo}s`;
      else key = `${hi}${lo}o`;
      row.push({ key, inRange: range.has(key) });
    }
    matrix.push(row);
  }
  return matrix;
}

export function allHands169(): string[] { return allStartingHands(); }

// 3-bet ranges by (raiser-position, hero-position) at 6-max 100bb.
//
// Hands fall into one of four buckets:
//   - "3bet-value": always 3-bet for value
//   - "3bet-bluff": always 3-bet as a blocker bluff (linear range)
//   - "call":       flat call the open
//   - "fold":       fold
//
// These are pedagogical defaults for training, not solver outputs.
// Cash-game oriented; tournament 3-bet sizing/freq differs.

import { expand } from "./ranges";
import type { Position } from "./ranges";

export type ThreeBetAction = "3bet-value" | "3bet-bluff" | "call" | "fold";

interface RangeBuckets {
  value: string[];
  bluff: string[];
  call: string[];
}

export type HeroPos = Position | "BB";
export type RaiserPos = Position;

// hero-position : raiser-position : buckets
type Matrix = Partial<Record<HeroPos, Partial<Record<RaiserPos, RangeBuckets>>>>;

const RANGES: Matrix = {
  // Hero on BTN
  BTN: {
    UTG: {
      value: ["QQ+", "AKs", "AKo"],
      bluff: ["A5s", "A4s"],
      call:  ["TT", "JJ", "AQs", "AJs", "ATs", "KQs", "KJs", "QJs", "JTs", "T9s", "98s", "AQo", "AJo"],
    },
    HJ: {
      value: ["QQ+", "AKs", "AKo"],
      bluff: ["A5s", "A4s", "KJs"],
      call:  ["TT", "JJ", "AQs", "AJs", "ATs", "KQs", "QJs", "JTs", "T9s", "98s", "AQo", "AJo", "KQo"],
    },
    CO: {
      value: ["JJ+", "AQs+", "AKo"],
      bluff: ["A5s", "A4s", "A3s", "KJs", "QJs"],
      call:  ["77", "88", "99", "TT", "AJs", "ATs", "KQs", "JTs", "T9s", "98s", "87s", "AJo", "AQo", "KQo"],
    },
  },
  // Hero in BB defending vs single raiser
  BB: {
    BTN: {
      value: ["TT+", "AQs+", "AKo"],
      bluff: ["A5s", "A4s", "A3s", "A2s", "KJs", "QJs", "76s"],
      call:  ["22-99",
              "A6s+", "A2s",  // suited Ax wheel + broadway calls (A5s/A4s/A3s are bluffs above)
              "K7s+", "Q8s+", "J7s+", "T7s+",
              "98s", "97s", "87s", "86s", "76s", "75s", "65s", "64s", "54s", "53s",
              "A8o+", "K9o+", "Q9o+", "J9o+", "T9o", "98o"],
    },
    CO: {
      value: ["JJ+", "AQs+", "AKo"],
      bluff: ["A5s", "A4s", "KJs", "76s"],
      call:  ["22-TT", "ATs", "A9s", "A8s", "KTs", "QTs", "J9s", "T9s", "98s", "87s",
              "AJo", "AQo", "KQo", "KJo", "QJo", "JTo"],
    },
    UTG: {
      value: ["QQ+", "AKs", "AKo"],
      bluff: ["A5s"],
      call:  ["22-JJ", "AQs", "AJs", "ATs", "A9s", "KQs", "KJs", "QJs", "JTs", "T9s", "98s",
              "AQo", "AJo", "KQo"],
    },
  },
  // Hero in SB facing BTN open (squeeze territory but keep simple)
  SB: {
    BTN: {
      value: ["TT+", "AQs+", "AKo"],
      bluff: ["A5s", "A4s", "KJs", "QJs"],
      call:  [],   // SB strategy: 3-bet or fold (mostly), keep call empty
    },
    CO: {
      value: ["JJ+", "AQs+", "AKo"],
      bluff: ["A5s", "A4s", "KJs"],
      call:  [],
    },
  },
};

export function threeBetRange(hero: HeroPos, raiser: RaiserPos): {
  value: Set<string>;
  bluff: Set<string>;
  call: Set<string>;
} | null {
  const m = (RANGES as Record<string, Record<string, RangeBuckets>>)[hero];
  if (!m) return null;
  const r = m[raiser];
  if (!r) return null;
  return {
    value: expand(r.value),
    bluff: expand(r.bluff),
    call: expand(r.call),
  };
}

export function threeBetAction(
  hero: HeroPos,
  raiser: RaiserPos,
  hand: string,
): ThreeBetAction {
  const r = threeBetRange(hero, raiser);
  if (!r) return "fold";
  if (r.value.has(hand)) return "3bet-value";
  if (r.bluff.has(hand)) return "3bet-bluff";
  if (r.call.has(hand)) return "call";
  return "fold";
}

/** Configured (hero, raiser) pairs the trainer can drill. */
export function threeBetSpots(): Array<{ hero: HeroPos; raiser: RaiserPos; label: string }> {
  return [
    { hero: "BTN", raiser: "UTG", label: "BTN vs UTG" },
    { hero: "BTN", raiser: "HJ",  label: "BTN vs HJ" },
    { hero: "BTN", raiser: "CO",  label: "BTN vs CO" },
    { hero: "BB",  raiser: "UTG", label: "BB vs UTG" },
    { hero: "BB",  raiser: "CO",  label: "BB vs CO" },
    { hero: "BB",  raiser: "BTN", label: "BB vs BTN" },
    { hero: "SB",  raiser: "BTN", label: "SB vs BTN" },
    { hero: "SB",  raiser: "CO",  label: "SB vs CO" },
  ];
}

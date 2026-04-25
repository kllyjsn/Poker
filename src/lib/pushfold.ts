// Nash push/fold ranges for short-stack tournament play.
//
// Stacks: 5bb, 8bb, 10bb, 12bb, 15bb, 20bb. Positions cover the
// last-action seats (UTG, HJ, CO, BTN, SB) heads-up vs the rest.
// Values are condensed from the standard "Nash" tables widely used
// in MTT training (e.g. ICMIZER, HoldemResources). For pedagogical
// purposes; ICM-aware ranges are tighter.

import { expand } from "./ranges";

export type ShoveStack = 5 | 8 | 10 | 12 | 15 | 20;
export type ShovePos = "UTG" | "HJ" | "CO" | "BTN" | "SB";

// position : stack-bb : range entries
type Table = Record<ShovePos, Record<ShoveStack, string[]>>;

const NASH: Table = {
  UTG: {
    5:  ["22+", "A2s+", "A2o+", "K7s+", "K9o+", "Q9s+", "QTo+", "J9s+", "JTo", "T8s+", "97s+", "87s", "76s"],
    8:  ["22+", "A2s+", "A5o+", "K8s+", "KTo+", "Q9s+", "QJo", "J9s+", "T9s", "98s"],
    10: ["33+", "A2s+", "A7o+", "K9s+", "KJo+", "QTs+", "QJo", "JTs"],
    12: ["44+", "A2s+", "A8o+", "KTs+", "KQo", "QJs"],
    15: ["66+", "A4s+", "A9o+", "KTs+", "KQo", "QJs"],
    20: ["88+", "A8s+", "AJo+", "KQs"],
  },
  HJ: {
    5:  ["22+", "A2s+", "A2o+", "K2s+", "K7o+", "Q5s+", "Q9o+", "J7s+", "JTo", "T7s+", "T9o", "97s+", "86s+", "75s+", "65s"],
    8:  ["22+", "A2s+", "A3o+", "K6s+", "K9o+", "Q8s+", "QTo+", "J8s+", "JTo", "T8s+", "98s", "87s"],
    10: ["22+", "A2s+", "A5o+", "K8s+", "KTo+", "Q9s+", "QJo", "J9s+", "T9s"],
    12: ["33+", "A2s+", "A7o+", "K9s+", "KJo+", "QTs+", "JTs"],
    15: ["55+", "A2s+", "A8o+", "KTs+", "KQo", "QJs"],
    20: ["77+", "A8s+", "AJo+", "KQs"],
  },
  CO: {
    5:  ["22+", "A2s+", "A2o+", "K2s+", "K2o+", "Q2s+", "Q6o+", "J5s+", "J9o+", "T5s+", "T9o", "95s+", "85s+", "75s+", "64s+", "54s"],
    8:  ["22+", "A2s+", "A2o+", "K2s+", "K7o+", "Q5s+", "Q9o+", "J7s+", "JTo", "T7s+", "T9o", "97s+", "86s+", "75s+", "65s"],
    10: ["22+", "A2s+", "A3o+", "K7s+", "K9o+", "Q8s+", "QTo+", "J8s+", "T8s+", "98s", "87s"],
    12: ["22+", "A2s+", "A5o+", "K8s+", "KTo+", "Q9s+", "QJo", "J9s+", "T9s"],
    15: ["33+", "A2s+", "A7o+", "K9s+", "KJo+", "QTs+", "JTs"],
    20: ["66+", "A5s+", "A9o+", "KTs+", "KQo", "QJs"],
  },
  BTN: {
    5:  ["22+", "A2s+", "A2o+", "K2s+", "K2o+", "Q2s+", "Q2o+", "J2s+", "J4o+", "T2s+", "T6o+", "94s+", "97o+", "84s+", "87o", "73s+", "63s+", "53s+", "43s"],
    8:  ["22+", "A2s+", "A2o+", "K2s+", "K3o+", "Q2s+", "Q7o+", "J5s+", "J9o+", "T6s+", "T9o", "95s+", "85s+", "75s+", "65s", "54s"],
    10: ["22+", "A2s+", "A2o+", "K2s+", "K6o+", "Q4s+", "Q8o+", "J7s+", "J9o+", "T7s+", "T9o", "97s+", "86s+", "76s", "65s"],
    12: ["22+", "A2s+", "A3o+", "K6s+", "K8o+", "Q7s+", "QTo+", "J8s+", "T8s+", "98s", "87s"],
    15: ["22+", "A2s+", "A6o+", "K8s+", "KTo+", "Q9s+", "QJo", "J9s+", "T9s"],
    20: ["55+", "A2s+", "A8o+", "KTs+", "KJo+", "QJs"],
  },
  SB: {
    5:  ["22+", "A2s+", "A2o+", "K2s+", "K2o+", "Q2s+", "Q2o+", "J2s+", "J2o+", "T2s+", "T5o+", "92s+", "95o+", "82s+", "86o+", "72s+", "76o", "62s+", "52s+", "42s+", "32s"],
    8:  ["22+", "A2s+", "A2o+", "K2s+", "K2o+", "Q2s+", "Q4o+", "J3s+", "J7o+", "T5s+", "T8o+", "94s+", "97o+", "84s+", "87o", "74s+", "64s+", "54s"],
    10: ["22+", "A2s+", "A2o+", "K2s+", "K4o+", "Q3s+", "Q7o+", "J5s+", "J9o+", "T6s+", "T9o", "95s+", "85s+", "75s+", "65s", "54s"],
    12: ["22+", "A2s+", "A2o+", "K4s+", "K7o+", "Q6s+", "Q9o+", "J7s+", "JTo", "T7s+", "98s", "87s"],
    15: ["22+", "A2s+", "A4o+", "K7s+", "K9o+", "Q8s+", "QTo+", "J8s+", "T8s+"],
    20: ["33+", "A2s+", "A7o+", "K8s+", "KJo+", "QTs+", "JTs"],
  },
};

export function nashShoveRange(pos: ShovePos, stack: ShoveStack): Set<string> {
  return expand(NASH[pos][stack]);
}

export function shoveAction(
  pos: ShovePos,
  stack: ShoveStack,
  hand: string,
): "shove" | "fold" {
  return nashShoveRange(pos, stack).has(hand) ? "shove" : "fold";
}

export const SHOVE_STACKS: ShoveStack[] = [5, 8, 10, 12, 15, 20];
export const SHOVE_POSITIONS: ShovePos[] = ["UTG", "HJ", "CO", "BTN", "SB"];

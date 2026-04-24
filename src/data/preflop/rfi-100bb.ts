/**
 * Mixed-strategy RFI (raise-first-in) frequencies for 6-max NL 100bb.
 *
 * Each position has:
 *   - `always`: hands raised at 100% frequency (e.g. AA from UTG).
 *   - `mixed`: hands with a partial raise frequency in [0,1]
 *     (e.g. 22 from UTG ≈ 50% raise / 50% fold).
 *   - everything else: raise frequency = 0%.
 *
 * Frequencies are pedagogical approximations of typical solver output
 * (PioSolver / GTO Wizard distributions for 6-max cash 100bb). They are
 * NOT generated from a solver here — that's the explicit next step in
 * the strategy roadmap. They are however materially more granular than
 * the binary in/out ranges that the rest of the app used previously.
 */
import type { Position } from "../../lib/ranges";

export interface RfiSpec {
  /** Hands raised at 100% frequency. Supports `22+`, `ATs+`, etc. */
  always: string[];
  /** Hands with a partial raise frequency. Each value is in [0,1]. */
  mixed: Record<string, number>;
  description: string;
}

export const RFI_100BB: Record<Position, RfiSpec> = {
  UTG: {
    always: [
      "33+",
      "ATs+", "A5s",
      "KTs+", "QTs+", "JTs", "T9s",
      "AJo+", "KQo",
    ],
    mixed: {
      "22":  0.50,
      "A4s": 0.40,
      "A3s": 0.20,
      "K9s": 0.30,
      "Q9s": 0.20,
      "J9s": 0.40,
      "98s": 0.30,
      "87s": 0.20,
      "ATo": 0.50,
      "KJo": 0.40,
      "QJo": 0.20,
    },
    description: "UTG opens ~17–18% at 6-max 100bb. Tight range — prefers hands that flop well in 5-handed pots OOP.",
  },
  HJ: {
    always: [
      "22+",
      "A9s+", "A5s",
      "KTs+", "QTs+", "JTs", "T9s",
      "AJo+", "KJo+", "QJo",
    ],
    mixed: {
      "A4s": 0.70,
      "A3s": 0.50,
      "A2s": 0.40,
      "K9s": 0.70,
      "K8s": 0.30,
      "Q9s": 0.60,
      "Q8s": 0.20,
      "J9s": 0.70,
      "T8s": 0.30,
      "98s": 0.50,
      "87s": 0.40,
      "76s": 0.30,
      "ATo": 0.70,
      "KTo": 0.40,
      "QTo": 0.30,
      "JTo": 0.30,
    },
    description: "HJ opens ~20–22%. Adds suited connectors and weaker offsuit broadways the UTG range folds.",
  },
  CO: {
    always: [
      "22+",
      "A8s+", "A5s", "A4s",
      "K9s+", "QTs+", "J9s+", "T9s", "98s", "87s",
      "ATo+", "KJo+", "QTo+",
    ],
    mixed: {
      "A7s": 0.80,
      "A3s": 0.70,
      "A2s": 0.70,
      "K8s": 0.70,
      "K7s": 0.40,
      "Q9s": 0.80,
      "Q8s": 0.50,
      "J8s": 0.60,
      "T8s": 0.70,
      "T7s": 0.30,
      "97s": 0.40,
      "76s": 0.60,
      "65s": 0.50,
      "54s": 0.40,
      "A9o": 0.80,
      "KTo": 0.70,
      "QJo": 0.80,
      "JTo": 0.70,
      "T9o": 0.30,
    },
    description: "CO opens ~27–30%. Steals the BTN/blinds; widens to all suited aces and most suited connectors.",
  },
  BTN: {
    always: [
      "22+",
      "A2s+",
      "K7s+", "Q9s+", "J9s+", "T9s", "98s", "87s", "76s",
      "A9o+", "KTo+", "QTo+", "JTo",
    ],
    mixed: {
      "K6s": 0.80,
      "K5s": 0.70,
      "K4s": 0.60,
      "K3s": 0.50,
      "K2s": 0.40,
      "Q8s": 0.80,
      "Q7s": 0.60,
      "Q6s": 0.50,
      "J8s": 0.80,
      "J7s": 0.50,
      "T8s": 0.80,
      "T7s": 0.50,
      "97s": 0.70,
      "96s": 0.50,
      "86s": 0.50,
      "75s": 0.50,
      "65s": 0.70,
      "54s": 0.60,
      "53s": 0.30,
      "A8o": 0.80,
      "A7o": 0.70,
      "A6o": 0.50,
      "A5o": 0.50,
      "A4o": 0.40,
      "A3o": 0.30,
      "A2o": 0.30,
      "K9o": 0.80,
      "Q9o": 0.70,
      "QJo": 1.00,
      "J9o": 0.50,
      "T9o": 0.60,
      "98o": 0.30,
      "87o": 0.20,
    },
    description: "BTN opens ~45–48%. Maximizes positional advantage — opens widely, including most offsuit broadways and many suited gappers.",
  },
  SB: {
    always: [
      "22+",
      "A2s+",
      "K8s+", "Q9s+", "J9s+", "T9s", "98s", "87s",
      "A9o+", "KTo+", "QJo",
    ],
    mixed: {
      "K7s": 0.70,
      "K6s": 0.50,
      "K5s": 0.40,
      "K4s": 0.30,
      "Q8s": 0.60,
      "Q7s": 0.40,
      "J8s": 0.60,
      "T8s": 0.60,
      "76s": 0.70,
      "65s": 0.60,
      "54s": 0.40,
      "A8o": 0.70,
      "A7o": 0.50,
      "A5o": 0.40,
      "K9o": 0.60,
      "QTo": 0.70,
      "JTo": 0.60,
      "T9o": 0.40,
    },
    description: "SB plays raise-or-fold (limps not modeled). Open ~37–40%. Slightly tighter than BTN — must play OOP postflop.",
  },
};

/**
 * Mixed-strategy responses to facing a 3-bet at 100bb 6-max.
 *
 * Hero opened, villain 3-bet. Hero now has three options:
 *   - 4-bet (typically to ~22bb)
 *   - call (typically to a 9bb 3-bet OOP from BB)
 *   - fold
 *
 * Each hand has frequencies in [0,1] with `fourbet + call + fold = 1`.
 * Hands not listed are 100% fold by default.
 *
 * These are pedagogical defaults that approximate solver output for
 * GTO Wizard 6-max NL 100bb cash. They are NOT solver-generated; that's
 * the explicit next step on the roadmap.
 */
import type { Position } from "../../lib/ranges";

export interface VsRaiseFreq {
  fourbet: number;
  call: number;
  fold: number;
}

export interface Vs3betSpec {
  hero: Position;
  threeBettor: "BB" | "SB" | Position;
  responses: Record<string, VsRaiseFreq>;
  description: string;
}

const f = (fb: number, c: number, fld: number = 1 - fb - c): VsRaiseFreq => ({
  fourbet: fb,
  call: c,
  fold: Math.max(0, Math.round(fld * 1000) / 1000),
});

const VS_3BET_CO_vs_BB: Record<string, VsRaiseFreq> = {
  // --- Always 4-bet for value ---
  "AA": f(1.0, 0.0),
  "KK": f(1.0, 0.0),
  // --- Mixed 4-bet for value ---
  "QQ": f(0.6, 0.4),
  "AKs": f(0.6, 0.4),
  "AKo": f(0.5, 0.5),
  // --- 4-bet bluffs (blockers + low equity) ---
  "A5s": f(0.5, 0.0),
  "A4s": f(0.4, 0.0),
  "A3s": f(0.3, 0.0),
  // --- Always call ---
  "JJ":  f(0.2, 0.8),
  "TT":  f(0.0, 1.0),
  "99":  f(0.0, 0.8),
  "AQs": f(0.3, 0.7),
  "AJs": f(0.0, 0.9),
  "ATs": f(0.0, 0.7),
  "KQs": f(0.0, 1.0),
  "KJs": f(0.1, 0.7),
  "QJs": f(0.0, 0.9),
  "JTs": f(0.0, 0.8),
  "T9s": f(0.0, 0.7),
  "98s": f(0.0, 0.6),
  "87s": f(0.0, 0.5),
  "76s": f(0.0, 0.3),
  "AQo": f(0.0, 0.7),
  "AJo": f(0.0, 0.4),
  "KQo": f(0.0, 0.5),
  // --- Mixed bottom ---
  "88":  f(0.0, 0.7),
  "77":  f(0.0, 0.5),
  "66":  f(0.0, 0.3),
  "55":  f(0.0, 0.2),
};

const VS_3BET_BTN_vs_BB: Record<string, VsRaiseFreq> = {
  "AA": f(1.0, 0.0),
  "KK": f(1.0, 0.0),
  "QQ": f(0.5, 0.5),
  "JJ": f(0.2, 0.8),
  "TT": f(0.0, 1.0),
  "99": f(0.0, 0.9),
  "88": f(0.0, 0.8),
  "77": f(0.0, 0.6),
  "66": f(0.0, 0.4),
  "55": f(0.0, 0.3),
  "44": f(0.0, 0.2),
  "AKs": f(0.5, 0.5),
  "AKo": f(0.4, 0.6),
  "AQs": f(0.3, 0.7),
  "AJs": f(0.1, 0.8),
  "ATs": f(0.0, 0.8),
  "A9s": f(0.0, 0.5),
  "A8s": f(0.0, 0.4),
  "A5s": f(0.5, 0.0),
  "A4s": f(0.4, 0.2),
  "A3s": f(0.3, 0.0),
  "A2s": f(0.2, 0.0),
  "AQo": f(0.0, 0.7),
  "AJo": f(0.0, 0.5),
  "ATo": f(0.0, 0.3),
  "KQs": f(0.1, 0.9),
  "KJs": f(0.0, 0.8),
  "KTs": f(0.0, 0.6),
  "K9s": f(0.0, 0.3),
  "K5s": f(0.2, 0.0),
  "KQo": f(0.0, 0.5),
  "KJo": f(0.0, 0.3),
  "QJs": f(0.0, 0.9),
  "QTs": f(0.0, 0.7),
  "Q9s": f(0.0, 0.4),
  "QJo": f(0.0, 0.3),
  "JTs": f(0.0, 0.9),
  "J9s": f(0.0, 0.5),
  "T9s": f(0.0, 0.7),
  "98s": f(0.0, 0.6),
  "87s": f(0.0, 0.5),
  "76s": f(0.0, 0.4),
  "65s": f(0.0, 0.3),
  "54s": f(0.0, 0.2),
};

export const VS_3BET_SPOTS: Vs3betSpec[] = [
  {
    hero: "CO",
    threeBettor: "BB",
    responses: VS_3BET_CO_vs_BB,
    description:
      "You opened CO, BB squeezed to ~10bb. Pot odds are unattractive (~28% needed) but you have position. Play solid value, call wide with implied-odds hands, 4-bet bluff with A-blockers.",
  },
  {
    hero: "BTN",
    threeBettor: "BB",
    responses: VS_3BET_BTN_vs_BB,
    description:
      "You opened BTN, BB squeezed. Widest defending range in poker — your initial range is ~45% so you can flat broadly with position.",
  },
];

export function vs3betFrequency(
  hero: Position,
  threeBettor: string,
  hand: string,
): VsRaiseFreq {
  const spot = VS_3BET_SPOTS.find(s => s.hero === hero && s.threeBettor === threeBettor);
  if (!spot) return { fourbet: 0, call: 0, fold: 1 };
  return spot.responses[hand] ?? { fourbet: 0, call: 0, fold: 1 };
}

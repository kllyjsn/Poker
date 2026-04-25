/**
 * Solver-grounded preflop oracle.
 *
 * Replaces the binary "in-range / out-of-range" answer with a mixed
 * frequency in [0,1] and a heuristic EV-loss-in-bb-per-100 estimate
 * for the chosen action vs the equilibrium.
 *
 * The data files under `src/data/preflop/` carry the actual frequencies
 * (RFI, vs-3bet). They are pedagogical approximations of solver output —
 * the explicit next step on the strategy roadmap is to swap the static
 * data for real solver baselines.
 */
import type { Position } from "./ranges";
import { expand } from "./ranges";
import { RFI_100BB, type RfiSpec } from "../data/preflop/rfi-100bb";
import { vs3betFrequency, type VsRaiseFreq } from "../data/preflop/vs-3bet-100bb";

// ---------- RFI ---------------------------------------------------------

/**
 * Returns the equilibrium raise frequency in [0,1] for `hand` from
 * `pos` at 100bb 6-max. 1.0 = always raise; 0.0 = always fold.
 */
export function rfiFrequency(pos: Position, hand: string): number {
  const spec = RFI_100BB[pos];
  if (!spec) return 0;
  const always = expandedAlways(spec);
  if (always.has(hand)) return 1.0;
  const m = spec.mixed[hand];
  if (m !== undefined) return m;
  return 0.0;
}

const expandedCache = new WeakMap<RfiSpec, Set<string>>();
function expandedAlways(spec: RfiSpec): Set<string> {
  let cached = expandedCache.get(spec);
  if (!cached) {
    cached = expand(spec.always);
    expandedCache.set(spec, cached);
  }
  return cached;
}

/**
 * The "best single action" — useful when we need a binary answer but
 * still want to be honest about marginal hands. Ties (50/50) break
 * toward folding (the conservative line).
 */
export function rfiBestAction(pos: Position, hand: string): "raise" | "fold" {
  return rfiFrequency(pos, hand) > 0.5 ? "raise" : "fold";
}

// ---------- vs-3bet ----------------------------------------------------

export type VsRaiseAction = "fourbet" | "call" | "fold";

/**
 * Returns the frequencies for facing a 3-bet.
 */
export function vs3betFreq(
  hero: Position,
  threeBettor: string,
  hand: string,
): VsRaiseFreq {
  return vs3betFrequency(hero, threeBettor, hand);
}

/**
 * The single highest-frequency action for facing a 3-bet.
 */
export function vs3betBestAction(
  hero: Position,
  threeBettor: string,
  hand: string,
): VsRaiseAction {
  const f = vs3betFreq(hero, threeBettor, hand);
  if (f.fourbet >= f.call && f.fourbet >= f.fold) return "fourbet";
  if (f.call >= f.fold) return "call";
  return "fold";
}

// ---------- EV loss ----------------------------------------------------

/**
 * Pedagogical EV-loss model in bb / 100 hands for a binary RFI choice.
 *
 * Heuristic shape:
 *   - Pure "always raise" hand, hero folds: ~4 bb/100
 *   - Pure "always fold" hand, hero raises: ~3 bb/100
 *   - Mixed hand chosen against its frequency: scales with the gap,
 *     with a small dead zone near the equilibrium boundary so 50/50
 *     decisions don't over-punish either action.
 *
 * This is NOT solver truth. It's a teaching signal that points users
 * toward the right consistent strategy.
 */
export function rfiEvLossBbPer100(
  correctFreq: number,
  action: "raise" | "fold",
): number {
  const userFreq = action === "raise" ? 1 : 0;
  return evLossFromFreq(correctFreq, userFreq, 4.0);
}

/**
 * EV-loss for facing a 3-bet. Largest-mistake scale is slightly higher
 * (~5 bb/100) than RFI because pots are deeper and decisions matter more.
 */
export function vs3betEvLossBbPer100(
  freq: VsRaiseFreq,
  action: VsRaiseAction,
): number {
  // Treat the chosen action as a "100% chosen" strategy and compare to
  // the equilibrium mixed frequencies. The cost of choosing "X 100%"
  // when equilibrium says X p% is approximately scale * (1 - p)^2.
  const p =
    action === "fourbet" ? freq.fourbet :
    action === "call"    ? freq.call :
                           freq.fold;
  const gap = 1 - p;
  if (gap < 0.15) return 0;
  return Math.round((5.0 * (gap - 0.15) / 0.85) * 100) / 100;
}

function evLossFromFreq(correctFreq: number, userFreq: number, scale: number): number {
  const diff = Math.abs(correctFreq - userFreq);
  if (diff < 0.15) return 0;
  return Math.round((scale * (diff - 0.15) / 0.85) * 100) / 100;
}

// ---------- Pretty labels for the explain panel -----------------------

export function freqLabel(freq: number): string {
  if (freq >= 0.99) return "Pure raise (100%)";
  if (freq <= 0.01) return "Pure fold (0%)";
  return `Mixed: raise ${Math.round(freq * 100)}% / fold ${Math.round((1 - freq) * 100)}%`;
}

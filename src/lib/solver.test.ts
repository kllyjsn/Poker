import { describe, it, expect } from "vitest";
import {
  rfiFrequency,
  rfiBestAction,
  rfiEvLossBbPer100,
  vs3betFreq,
  vs3betBestAction,
  vs3betEvLossBbPer100,
  freqLabel,
} from "./solver";
import type { Position } from "./ranges";

describe("RFI frequencies", () => {
  it("AA always raises from every position", () => {
    const positions: Position[] = ["UTG", "HJ", "CO", "BTN", "SB"];
    for (const p of positions) expect(rfiFrequency(p, "AA")).toBe(1);
  });

  it("72o never raises from any position", () => {
    const positions: Position[] = ["UTG", "HJ", "CO", "BTN", "SB"];
    for (const p of positions) expect(rfiFrequency(p, "72o")).toBe(0);
  });

  it("opens widen as position improves", () => {
    const open = (p: Position) => {
      const spec = RFI_FREQ_BY_POS_TEST(p);
      return spec.totalFreq;
    };
    expect(open("UTG")).toBeLessThan(open("HJ"));
    expect(open("HJ")).toBeLessThan(open("CO"));
    expect(open("CO")).toBeLessThan(open("BTN"));
  });

  it("returns mixed frequency for boundary hands", () => {
    expect(rfiFrequency("UTG", "22")).toBeGreaterThan(0);
    expect(rfiFrequency("UTG", "22")).toBeLessThan(1);
  });

  it("rfiBestAction gives single action at boundary", () => {
    expect(rfiBestAction("UTG", "AA")).toBe("raise");
    expect(rfiBestAction("UTG", "72o")).toBe("fold");
  });
});

describe("RFI EV loss model", () => {
  it("zero loss when matching pure-raise hand", () => {
    expect(rfiEvLossBbPer100(1.0, "raise")).toBe(0);
  });

  it("largest loss when folding a 100% raise hand", () => {
    expect(rfiEvLossBbPer100(1.0, "fold")).toBeGreaterThan(3.5);
  });

  it("smaller loss for mixed hand", () => {
    const pureLoss = rfiEvLossBbPer100(1.0, "fold");
    const mixedLoss = rfiEvLossBbPer100(0.5, "fold");
    expect(mixedLoss).toBeLessThan(pureLoss);
  });

  it("zero loss within dead zone (close to equilibrium)", () => {
    expect(rfiEvLossBbPer100(0.5, "raise")).toBeLessThan(2);
    // Right next to the boundary should be free
    expect(rfiEvLossBbPer100(0.85, "raise")).toBe(0);
  });

  it("loss is symmetric for symmetric mistakes", () => {
    const a = rfiEvLossBbPer100(0.7, "fold");
    const b = rfiEvLossBbPer100(0.3, "raise");
    expect(Math.abs(a - b)).toBeLessThan(0.01);
  });
});

describe("vs-3bet", () => {
  it("4-bets AA at 100% when CO opens vs BB 3-bet", () => {
    const f = vs3betFreq("CO", "BB", "AA");
    expect(f.fourbet).toBe(1);
    expect(vs3betBestAction("CO", "BB", "AA")).toBe("fourbet");
  });

  it("calls or folds with 22 — no 4-bet", () => {
    const f = vs3betFreq("CO", "BB", "22");
    expect(f.fourbet).toBe(0);
  });

  it("EV loss zero for taking the equilibrium-frequency action", () => {
    // AA 4-bets 100% so 4-betting is free
    const aa = vs3betFreq("CO", "BB", "AA");
    expect(vs3betEvLossBbPer100(aa, "fourbet")).toBe(0);
  });

  it("EV loss positive for folding AA vs 3-bet", () => {
    const aa = vs3betFreq("CO", "BB", "AA");
    expect(vs3betEvLossBbPer100(aa, "fold")).toBeGreaterThan(3);
  });
});

describe("freqLabel", () => {
  it("formats pure / mixed frequencies", () => {
    expect(freqLabel(1)).toMatch(/Pure raise/);
    expect(freqLabel(0)).toMatch(/Pure fold/);
    expect(freqLabel(0.5)).toBe("Mixed: raise 50% / fold 50%");
    expect(freqLabel(0.7)).toBe("Mixed: raise 70% / fold 30%");
  });
});

// Test-only helper: computes the average raise frequency across all hands
// for a position. Used as a sanity check that ranges widen by position.
function RFI_FREQ_BY_POS_TEST(pos: Position): { totalFreq: number } {
  const RANKS = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];
  let total = 0;
  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 13; j++) {
      const hi = RANKS[Math.min(i, j)];
      const lo = RANKS[Math.max(i, j)];
      let key: string;
      if (i === j) key = `${hi}${lo}`;
      else if (j > i) key = `${hi}${lo}s`;
      else key = `${hi}${lo}o`;
      total += rfiFrequency(pos, key);
    }
  }
  return { totalFreq: total };
}

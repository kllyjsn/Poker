import { describe, it, expect } from "vitest";
import { potOdds, mdf, bluffFrequency, ruleOf2And4, evCall } from "./odds";

describe("potOdds", () => {
  it("pot-sized bet requires 33% equity", () => {
    // bet=100, pot=100 -> 100 / (100+200) = 33.3%
    expect(potOdds(100, 100)).toBeCloseTo(1 / 3, 4);
  });
  it("half-pot bet requires 25% equity", () => {
    // bet=50, pot=100 -> 50 / (100+100) = 25%
    expect(potOdds(50, 100)).toBeCloseTo(0.25, 4);
  });
  it("third-pot bet requires 20% equity", () => {
    // bet=100/3, pot=100 -> ~33.3 / (100 + 66.67) = 0.2
    expect(potOdds(100 / 3, 100)).toBeCloseTo(0.2, 4);
  });
  it("returns 0 for non-positive bet", () => {
    expect(potOdds(0, 100)).toBe(0);
    expect(potOdds(-10, 100)).toBe(0);
  });
});

describe("mdf (minimum defense frequency)", () => {
  it("pot-sized bet requires defending 50%", () => {
    expect(mdf(100, 100)).toBeCloseTo(0.5, 4);
  });
  it("half-pot bet requires defending 66.67%", () => {
    expect(mdf(50, 100)).toBeCloseTo(2 / 3, 4);
  });
  it("no bet means 100% defense", () => {
    expect(mdf(0, 100)).toBe(1);
  });
});

describe("bluffFrequency (polarized river)", () => {
  it("pot-sized bet → 25% bluff, 75% value", () => {
    // bluff : value ratio is bet : (pot+bet) → bluffs are b/(pot+2b)
    // pot=100, bet=100 → 100 / (100 + 200) = 33.3% bluffs? no — bet/(pot+2bet) = 1/3
    // Actually classic polarized river GTO: bluff = bet/(pot+2*bet)
    expect(bluffFrequency(100, 100)).toBeCloseTo(1 / 3, 4);
  });
  it("tiny bet → low bluff frequency", () => {
    // bet=10, pot=100 → 10 / 120 = 8.3%
    expect(bluffFrequency(10, 100)).toBeCloseTo(10 / 120, 4);
  });
});

describe("ruleOf2And4 (outs -> equity %)", () => {
  it("flush draw on flop = 36% (9 outs × 4)", () => {
    expect(ruleOf2And4(9, 2)).toBe(36);
  });
  it("flush draw on turn = 18% (9 outs × 2)", () => {
    expect(ruleOf2And4(9, 1)).toBe(18);
  });
  it("8-out straight draw, 2 streets = 32%", () => {
    expect(ruleOf2And4(8, 2)).toBe(32);
  });
});

describe("evCall", () => {
  it("breakeven at exact pot-odds equity", () => {
    // pot=100, toCall=50 → 25% equity needed → EV at 25% = 0
    expect(evCall({ equity: 0.25, pot: 100, toCall: 50 })).toBeCloseTo(0, 6);
  });
  it("positive EV when equity exceeds pot odds", () => {
    expect(evCall({ equity: 0.4, pot: 100, toCall: 50 })).toBeGreaterThan(0);
  });
  it("negative EV when equity is below pot odds", () => {
    expect(evCall({ equity: 0.15, pot: 100, toCall: 50 })).toBeLessThan(0);
  });
});

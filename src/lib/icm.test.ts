import { describe, it, expect } from "vitest";
import { icmEquities, icmEquityShares } from "./icm";

describe("icmEquities", () => {
  it("equal stacks at 3-way FT with 50/30/20 payouts = equal equity", () => {
    const eq = icmEquities([100, 100, 100], [50, 30, 20]);
    expect(eq[0]).toBeCloseTo(eq[1], 6);
    expect(eq[1]).toBeCloseTo(eq[2], 6);
    const total = eq.reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(100, 6);
  });

  it("chip leader underperforms; short stacks overperform (ICM pressure)", () => {
    // 80/10/10 with 50/30/20 → classic example
    const eq = icmEquities([80, 10, 10], [50, 30, 20]);
    const chipPct = [80, 10, 10];
    const prizePct = eq.map(e => (e / 100) * 100);
    // Leader has 80% chips but must be below 80% of prize pool
    expect(prizePct[0]).toBeLessThan(chipPct[0]);
    // Short stacks have 10% chips each but should be above 10% of prize
    expect(prizePct[1]).toBeGreaterThan(chipPct[1]);
    expect(prizePct[2]).toBeGreaterThan(chipPct[2]);
    // Equities sum to total prize
    expect(eq.reduce((a, b) => a + b, 0)).toBeCloseTo(100, 4);
  });

  it("80/10/10 with 50/30/20 matches published reference (±0.5)", () => {
    // Well-known reference values: leader ~45.78, others ~27.11 each.
    const eq = icmEquities([80, 10, 10], [50, 30, 20]);
    expect(eq[0]).toBeCloseTo(45.78, 0);
    expect(eq[1]).toBeCloseTo(27.11, 0);
    expect(eq[2]).toBeCloseTo(27.11, 0);
  });

  it("heads-up splits linearly by chip share", () => {
    // Heads up with winner-take-all → equity = chip fraction
    const eq = icmEquities([60, 40], [100]);
    expect(eq[0]).toBeCloseTo(60, 4);
    expect(eq[1]).toBeCloseTo(40, 4);
  });

  it("zero chips returns zero equities", () => {
    const eq = icmEquities([0, 0, 0], [50, 30, 20]);
    for (const e of eq) expect(e).toBe(0);
  });

  it("icmEquityShares sums to 1", () => {
    const shares = icmEquityShares([40, 30, 20, 10], [50, 30, 20]);
    expect(shares.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6);
  });
});

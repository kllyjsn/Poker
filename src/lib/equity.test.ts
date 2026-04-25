import { describe, it, expect } from "vitest";
import { simulateEquity } from "./equity";
import { parseCard } from "./poker";

const p = (s: string) => parseCard(s);

describe("simulateEquity", () => {
  // Monte Carlo. Keep iterations modest to stay fast; widen tolerances
  // accordingly (±3% is typical for 5k iterations).
  it("AA vs KK ≈ 82 / 18 ±3", () => {
    const r = simulateEquity({
      hands: [[p("As"), p("Ah")], [p("Kd"), p("Kc")]],
      iterations: 5000,
    });
    expect(r.equities[0] * 100).toBeGreaterThan(79);
    expect(r.equities[0] * 100).toBeLessThan(85);
    expect(r.equities[1] * 100).toBeGreaterThan(15);
    expect(r.equities[1] * 100).toBeLessThan(21);
  });

  it("AKs vs QQ is a classic coin-flip ±3 (slight underdog for AK)", () => {
    const r = simulateEquity({
      hands: [[p("As"), p("Ks")], [p("Qd"), p("Qc")]],
      iterations: 5000,
    });
    // Known: AKs ~46.3%, QQ ~53.7%
    expect(r.equities[0] * 100).toBeGreaterThan(43);
    expect(r.equities[0] * 100).toBeLessThan(49);
  });

  it("equities sum to 1 (no pot leak)", () => {
    const r = simulateEquity({
      hands: [[p("As"), p("Ah")], [p("Kd"), p("Kc")], [p("Qd"), p("Qh")]],
      iterations: 2000,
    });
    const sum = r.equities.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 2);
  });

  it("river already run: equity is 0 or 1 (deterministic)", () => {
    // Board: 2s 3s 4s 5s 6s (straight flush). Hero As Ks loses to villain who has nothing special.
    // Actually: both players play the straight flush on board → tie. Pick a more decisive board.
    // Board: As Ad Ac Kc Kh — hero has KK (full house AAAKK with one A shared? Too complex)
    // Simpler: Board Ah 2h 7d Ts 3c, hero AA (pocket) vs villain KK.
    const r = simulateEquity({
      hands: [[p("As"), p("Ac")], [p("Kd"), p("Kc")]],
      board: [p("Ah"), p("2h"), p("7d"), p("Ts"), p("3s")],
      iterations: 1,
    });
    // Hero made quads (actually trips with AAA); villain just has KK. Hero wins 100%.
    expect(r.equities[0]).toBe(1);
    expect(r.equities[1]).toBe(0);
  });

  it("ties split pot (pocket pair vs same pocket pair on a rainbow board where no one improves)", () => {
    // Exactly-equal hands → 50/50 tie.
    const r = simulateEquity({
      hands: [[p("As"), p("Kh")], [p("Ac"), p("Kd")]],
      iterations: 2000,
    });
    expect(r.equities[0]).toBeCloseTo(r.equities[1], 1);
  });
});

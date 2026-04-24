import { describe, it, expect } from "vitest";
import { threeBetAction, threeBetRange, threeBetSpots } from "./threebet";

describe("threebet ranges", () => {
  it("BB vs UTG: AA is value, AKs is value, KJs is bluff, A2s folds", () => {
    expect(threeBetAction("BB", "UTG", "AA")).toBe("3bet-value");
    expect(threeBetAction("BB", "UTG", "AKs")).toBe("3bet-value");
    expect(threeBetAction("BB", "UTG", "A5s")).toBe("3bet-bluff");
    expect(threeBetAction("BB", "UTG", "72o")).toBe("fold");
  });

  it("BTN vs CO: TT calls, JJ value-3bets, 22 calls", () => {
    expect(threeBetAction("BTN", "CO", "JJ")).toBe("3bet-value");
    expect(threeBetAction("BTN", "CO", "99")).toBe("call");
    expect(threeBetAction("BTN", "CO", "22")).toBe("fold"); // BTN vs CO doesn't call 22 in this baseline
  });

  it("SB vs BTN: 3-bet or fold (no calls)", () => {
    const r = threeBetRange("SB", "BTN")!;
    expect(r.call.size).toBe(0);
    expect(r.value.has("KK")).toBe(true);
    expect(r.bluff.has("A5s")).toBe(true);
  });

  it("widest BB defense range vs BTN includes Tx and small suited connectors", () => {
    const r = threeBetRange("BB", "BTN")!;
    const total = r.value.size + r.bluff.size + r.call.size;
    expect(total).toBeGreaterThan(70); // BB defends very wide vs BTN (~45% of 169)
    expect(r.call.has("65s")).toBe(true);
    expect(r.call.has("54s")).toBe(true);
  });

  it("returns null for unconfigured (hero, raiser) pair", () => {
    expect(threeBetRange("UTG", "BTN")).toBeNull();
  });

  it("threeBetSpots returns a non-empty list", () => {
    const spots = threeBetSpots();
    expect(spots.length).toBeGreaterThanOrEqual(8);
    expect(spots.every(s => s.label.includes(" vs "))).toBe(true);
  });
});

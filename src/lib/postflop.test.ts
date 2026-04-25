import { describe, it, expect } from "vitest";
import { boardFeatures, cbetDecision, turnBarrelDecision, riverDecision, randomBoard } from "./postflop";

describe("boardFeatures", () => {
  it("rainbow Ace-high board is paired=false rainbow=true", () => {
    const f = boardFeatures(["Ah", "7c", "2d"]);
    expect(f.rainbow).toBe(true);
    expect(f.paired).toBe(false);
    expect(f.acePresent).toBe(true);
  });

  it("monotone hearts board is monotone=true", () => {
    const f = boardFeatures(["Kh", "9h", "5h"]);
    expect(f.monotone).toBe(true);
    expect(f.twoTone).toBe(false);
  });

  it("paired board detects pair", () => {
    const f = boardFeatures(["Tc", "Td", "5h"]);
    expect(f.paired).toBe(true);
  });

  it("low connected board detects connectivity", () => {
    const f = boardFeatures(["7c", "6d", "5h"]);
    expect(f.connected).toBe(true);
    expect(f.hasStraightDraw).toBe(true);
  });
});

describe("cbet decisions", () => {
  it("dry queen-high rainbow → cbet small", () => {
    const r = cbetDecision({ cards: ["Qh", "7c", "2d"] });
    expect(r.action).toBe("cbet-small");
  });

  it("monotone wet board → check", () => {
    const r = cbetDecision({ cards: ["Kh", "9h", "5h"] });
    expect(r.action).toBe("check");
  });

  it("low connected (765r) → check", () => {
    const r = cbetDecision({ cards: ["7c", "6d", "5h"] });
    expect(r.action).toBe("check");
  });

  it("paired ten-high → cbet small (range bet)", () => {
    const r = cbetDecision({ cards: ["Tc", "Td", "5h"] });
    expect(r.action).toBe("cbet-small");
  });

  it("two-tone Ace-high with draws → cbet large", () => {
    const r = cbetDecision({ cards: ["Ah", "Kh", "7d"] });
    expect(r.action).toBe("cbet-large");
  });
});

describe("turn barrel decisions", () => {
  it("Ace overcard turn on Q-high flop → barrel large", () => {
    const r = turnBarrelDecision(["Qh", "7c", "2d"], "Ah");
    expect(r.action).toBe("barrel-large");
  });

  it("turn pairs the board → barrel small", () => {
    const r = turnBarrelDecision(["Kh", "8c", "3d"], "8h");
    expect(r.action).toBe("barrel-small");
  });

  it("flush-completing turn → check", () => {
    const r = turnBarrelDecision(["Kh", "9h", "5d"], "2h");
    expect(r.action).toBe("check");
  });

  it("brick turn on dry board → barrel small", () => {
    const r = turnBarrelDecision(["Qh", "7c", "2d"], "4s");
    expect(r.action).toBe("barrel-small");
  });
});

describe("river decision (bluff catching)", () => {
  it("villain bluffs more than pot odds require → call", () => {
    const r = riverDecision(100, 50, 30); // pot odds = 50/200 = 25% required
    expect(r.action).toBe("call");
    expect(r.requiredEquityPct).toBeCloseTo(25, 1);
  });

  it("villain bluffs less than required → fold", () => {
    const r = riverDecision(100, 50, 20);
    expect(r.action).toBe("fold");
  });

  it("overbet requires more equity", () => {
    const r = riverDecision(100, 200, 30);
    // 200 / (100 + 200 + 200) = 40% required
    expect(r.requiredEquityPct).toBeCloseTo(40, 1);
    expect(r.action).toBe("fold");
  });
});

describe("randomBoard", () => {
  it("returns n unique cards", () => {
    const b = randomBoard(5);
    expect(b.length).toBe(5);
    expect(new Set(b).size).toBe(5);
  });
});

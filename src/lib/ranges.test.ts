import { describe, it, expect } from "vitest";
import { openingRange, rangeMatrix } from "./ranges";

describe("openingRange", () => {
  it("UTG opens exactly 31 hands (18% of 169)", () => {
    expect(openingRange("UTG").size).toBe(31);
  });

  it("BTN opens substantially wider than UTG", () => {
    expect(openingRange("BTN").size).toBeGreaterThan(openingRange("UTG").size);
  });

  it("AA is in every position's range", () => {
    for (const pos of ["UTG", "HJ", "CO", "BTN", "SB"] as const) {
      expect(openingRange(pos).has("AA")).toBe(true);
    }
  });

  it("72o is in no position's range", () => {
    for (const pos of ["UTG", "HJ", "CO", "BTN", "SB"] as const) {
      expect(openingRange(pos).has("72o")).toBe(false);
    }
  });

  it("range widens monotonically from UTG → BTN", () => {
    const sizes = (["UTG", "HJ", "CO", "BTN"] as const).map(p => openingRange(p).size);
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toBeGreaterThanOrEqual(sizes[i - 1]);
    }
  });

  it("pair-plus shorthand expands correctly (22+ → 22..AA)", () => {
    const utg = openingRange("UTG");
    for (const r of ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"]) {
      expect(utg.has(`${r}${r}`)).toBe(true);
    }
  });

  it("ATs+ shorthand includes ATs, AJs, AQs, AKs", () => {
    const utg = openingRange("UTG");
    for (const lo of ["T", "J", "Q", "K"]) {
      expect(utg.has(`A${lo}s`)).toBe(true);
    }
  });
});

describe("rangeMatrix", () => {
  it("returns a 13x13 matrix", () => {
    const m = rangeMatrix("UTG");
    expect(m.length).toBe(13);
    for (const row of m) expect(row.length).toBe(13);
  });

  it("diagonal keys are pairs", () => {
    const m = rangeMatrix("UTG");
    const pairs = m.map((row, i) => row[i].key);
    expect(pairs).toEqual(["AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44", "33", "22"]);
  });

  it("inRange flags match openingRange", () => {
    const pos = "BTN" as const;
    const matrix = rangeMatrix(pos);
    const range = openingRange(pos);
    let inCount = 0;
    for (const row of matrix) for (const c of row) if (c.inRange) inCount++;
    expect(inCount).toBe(range.size);
  });
});

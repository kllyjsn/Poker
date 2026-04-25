import { describe, it, expect } from "vitest";
import { nashShoveRange, shoveAction, SHOVE_POSITIONS, SHOVE_STACKS } from "./pushfold";

describe("Nash push/fold ranges", () => {
  it("at 10bb, BTN range is much wider than UTG", () => {
    const utg = nashShoveRange("UTG", 10).size;
    const btn = nashShoveRange("BTN", 10).size;
    expect(btn).toBeGreaterThan(utg * 2);
  });

  it("at 5bb, ranges are very wide everywhere (especially SB)", () => {
    expect(nashShoveRange("SB", 5).size).toBeGreaterThan(120);
    expect(nashShoveRange("BTN", 5).size).toBeGreaterThan(80);
  });

  it("at 20bb, ranges are very tight everywhere", () => {
    for (const pos of SHOVE_POSITIONS) {
      expect(nashShoveRange(pos, 20).size).toBeLessThan(50);
    }
  });

  it("AA always shoves, regardless of position or stack", () => {
    for (const pos of SHOVE_POSITIONS) {
      for (const stack of SHOVE_STACKS) {
        expect(shoveAction(pos, stack, "AA")).toBe("shove");
      }
    }
  });

  it("72o never shoves at any depth ≥ 10bb (might at 5bb SB)", () => {
    for (const pos of SHOVE_POSITIONS) {
      for (const stack of [10, 12, 15, 20] as const) {
        expect(shoveAction(pos, stack, "72o")).toBe("fold");
      }
    }
  });

  it("ranges widen monotonically as stack shrinks", () => {
    for (const pos of SHOVE_POSITIONS) {
      const sizes = SHOVE_STACKS.map(s => nashShoveRange(pos, s).size);
      // sizes ordered ascending by stack should be non-increasing
      for (let i = 1; i < sizes.length; i++) {
        expect(sizes[i]).toBeLessThanOrEqual(sizes[i - 1]);
      }
    }
  });
});

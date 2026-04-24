import { describe, it, expect } from "vitest";
import {
  fullDeck,
  shuffle,
  parseCard,
  evaluate7,
  bestFive,
  startingHandKey,
  allStartingHands,
  RANK_VALUE,
} from "./poker";

const p = (s: string) => parseCard(s);

describe("poker deck + cards", () => {
  it("fullDeck has 52 unique cards", () => {
    const d = fullDeck();
    expect(d.length).toBe(52);
    expect(new Set(d.map(c => c.rank + c.suit)).size).toBe(52);
  });

  it("shuffle is a permutation (length + contents preserved)", () => {
    const d = fullDeck();
    const s = shuffle(d);
    expect(s.length).toBe(52);
    const ids = new Set(s.map(c => c.rank + c.suit));
    for (const c of d) expect(ids.has(c.rank + c.suit)).toBe(true);
  });

  it("parseCard handles all ranks + suits", () => {
    expect(p("As")).toEqual({ rank: "A", suit: "s" });
    expect(p("Td")).toEqual({ rank: "T", suit: "d" });
    expect(p("2c")).toEqual({ rank: "2", suit: "c" });
    expect(() => p("1s")).toThrow();
    expect(() => p("Ax")).toThrow();
  });
});

describe("evaluate7 — canonical categories", () => {
  it("royal flush > straight flush > quads", () => {
    const royal = evaluate7([p("As"), p("Ks"), p("Qs"), p("Js"), p("Ts")]);
    const sf = evaluate7([p("9d"), p("8d"), p("7d"), p("6d"), p("5d")]);
    const quads = evaluate7([p("Ah"), p("Ac"), p("Ad"), p("As"), p("Kc"), p("Qc"), p("Jc")]);
    expect(royal.category).toBe("Straight Flush");
    expect(sf.category).toBe("Straight Flush");
    expect(royal.score).toBeGreaterThan(sf.score);
    expect(sf.score).toBeGreaterThan(quads.score);
    expect(quads.category).toBe("Four of a Kind");
  });

  it("recognizes the ace-low wheel straight", () => {
    const wheel = evaluate7([p("As"), p("2c"), p("3d"), p("4h"), p("5s")]);
    expect(wheel.category).toBe("Straight");
    expect(wheel.ranks[0]).toBe(5); // 5-high
  });

  it("recognizes a wheel straight flush (steel wheel)", () => {
    const sw = evaluate7([p("As"), p("2s"), p("3s"), p("4s"), p("5s"), p("Kd"), p("Qd")]);
    expect(sw.category).toBe("Straight Flush");
    expect(sw.ranks[0]).toBe(5);
  });

  it("full house beats flush", () => {
    const fh = evaluate7([p("Kh"), p("Kd"), p("Ks"), p("9c"), p("9d"), p("2s"), p("4h")]);
    const fl = evaluate7([p("As"), p("Ks"), p("Qs"), p("9s"), p("2s"), p("4h"), p("3c")]);
    expect(fh.category).toBe("Full House");
    expect(fl.category).toBe("Flush");
    expect(fh.score).toBeGreaterThan(fl.score);
  });

  it("straight beats three of a kind", () => {
    const st = evaluate7([p("9s"), p("8d"), p("7c"), p("6h"), p("5s"), p("Ac"), p("2d")]);
    const tk = evaluate7([p("8s"), p("8d"), p("8c"), p("Kh"), p("2s"), p("3c"), p("4d")]);
    expect(st.category).toBe("Straight");
    expect(tk.category).toBe("Three of a Kind");
    expect(st.score).toBeGreaterThan(tk.score);
  });

  it("two pair ranked by high pair then low pair then kicker", () => {
    // KK QQ with A kicker vs KK QQ with 9 kicker
    const hi = evaluate7([p("Kh"), p("Kd"), p("Qc"), p("Qs"), p("Ah"), p("2c"), p("3d")]);
    const lo = evaluate7([p("Kh"), p("Kd"), p("Qc"), p("Qs"), p("9h"), p("2c"), p("3d")]);
    expect(hi.category).toBe("Two Pair");
    expect(lo.category).toBe("Two Pair");
    expect(hi.score).toBeGreaterThan(lo.score);
  });

  it("pair kicker ordering respects AK > AQ", () => {
    const ak = evaluate7([p("As"), p("Ah"), p("Kd"), p("5c"), p("2s"), p("7h"), p("3c")]);
    const aq = evaluate7([p("As"), p("Ah"), p("Qd"), p("5c"), p("2s"), p("7h"), p("3c")]);
    expect(ak.score).toBeGreaterThan(aq.score);
  });

  it("high card returns top 5 descending", () => {
    const hc = evaluate7([p("As"), p("Kd"), p("9c"), p("7h"), p("5s"), p("3c"), p("2d")]);
    expect(hc.category).toBe("High Card");
    expect(hc.ranks).toEqual([14, 13, 9, 7, 5]);
  });

  it("flush selects best 5 same-suit cards", () => {
    const fl = evaluate7([p("As"), p("Ks"), p("9s"), p("7s"), p("3s"), p("2s"), p("4c")]);
    expect(fl.category).toBe("Flush");
    // ranks are top-5 same-suit descending: A, K, 9, 7, 3
    expect(fl.ranks).toEqual([14, 13, 9, 7, 3]);
  });

  it("evaluate7 rejects bad card counts", () => {
    expect(() => evaluate7([p("As")])).toThrow();
    expect(() => evaluate7([p("As"), p("Kd"), p("Qs"), p("Jh"), p("Tc"), p("9d"), p("8s"), p("7h")])).toThrow();
  });
});

describe("evaluate7 — stability of score packing", () => {
  it("score comparison is consistent (royal flush is the max possible category)", () => {
    const royal = evaluate7([p("As"), p("Ks"), p("Qs"), p("Js"), p("Ts")]);
    const others = [
      evaluate7([p("2s"), p("2c"), p("3d"), p("3h"), p("Kc")]), // two pair
      evaluate7([p("Ah"), p("Ac"), p("Ad"), p("As"), p("Kc")]), // quads (all aces)
      evaluate7([p("Kh"), p("Kd"), p("Ks"), p("9c"), p("9d")]), // full house
    ];
    for (const o of others) expect(royal.score).toBeGreaterThan(o.score);
  });
});

describe("bestFive", () => {
  it("returns 5 cards for every category", () => {
    const cards = [p("As"), p("Ah"), p("Kd"), p("Kc"), p("Qs"), p("7h"), p("2c")];
    const e = evaluate7(cards);
    const best = bestFive(cards, e);
    expect(best.length).toBe(5);
    // AA KK with Q kicker — verify the top-5 by rank
    const ranks = best.map(c => c.rank).sort();
    expect(ranks).toContain("A");
    expect(ranks).toContain("K");
  });

  it("flush picks top 5 same-suit cards", () => {
    const cards = [p("As"), p("Ks"), p("9s"), p("7s"), p("3s"), p("2s"), p("4c")];
    const e = evaluate7(cards);
    const best = bestFive(cards, e);
    expect(best.every(c => c.suit === "s")).toBe(true);
    expect(best.map(c => c.rank)).toEqual(["A", "K", "9", "7", "3"]);
  });

  it("wheel straight flush returns A,2,3,4,5 suited", () => {
    const cards = [p("As"), p("2s"), p("3s"), p("4s"), p("5s"), p("Kd"), p("Qd")];
    const e = evaluate7(cards);
    const best = bestFive(cards, e);
    expect(best.every(c => c.suit === "s")).toBe(true);
    expect(new Set(best.map(c => c.rank))).toEqual(new Set(["A", "2", "3", "4", "5"]));
  });

  it("full house picks 3 of trip rank + 2 of pair rank", () => {
    const cards = [p("Kh"), p("Kd"), p("Ks"), p("9c"), p("9d"), p("2s"), p("4h")];
    const e = evaluate7(cards);
    const best = bestFive(cards, e);
    const kCount = best.filter(c => c.rank === "K").length;
    const nineCount = best.filter(c => c.rank === "9").length;
    expect(kCount).toBe(3);
    expect(nineCount).toBe(2);
  });
});

describe("startingHandKey + allStartingHands", () => {
  it("suited-AK", () => {
    expect(startingHandKey(p("As"), p("Ks"))).toBe("AKs");
    expect(startingHandKey(p("Ks"), p("As"))).toBe("AKs");
  });
  it("offsuit-QJ", () => {
    expect(startingHandKey(p("Qs"), p("Jh"))).toBe("QJo");
    expect(startingHandKey(p("Jh"), p("Qs"))).toBe("QJo");
  });
  it("pair", () => {
    expect(startingHandKey(p("9s"), p("9d"))).toBe("99");
  });
  it("allStartingHands has exactly 169 unique keys", () => {
    const all = allStartingHands();
    expect(all.length).toBe(169);
    expect(new Set(all).size).toBe(169);
  });
  it("rank values sanity", () => {
    expect(RANK_VALUE.A).toBe(14);
    expect(RANK_VALUE["2"]).toBe(2);
    expect(RANK_VALUE.T).toBe(10);
  });
});

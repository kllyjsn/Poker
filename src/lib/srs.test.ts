import { describe, it, expect } from "vitest";
import {
  newCard,
  reviewCard,
  isDue,
  dueCards,
  pickWeight,
  weightedPick,
  SRS_DEFAULTS,
} from "./srs";

describe("srs", () => {
  const T0 = 1_700_000_000_000;

  it("new card is due now", () => {
    const c = newCard(T0);
    expect(isDue(c, T0)).toBe(true);
    expect(c.attempts).toBe(0);
    expect(c.ease).toBe(SRS_DEFAULTS.ease);
  });

  it("undefined card counts as due (new material)", () => {
    expect(isDue(undefined)).toBe(true);
  });

  it("first correct answer pushes due by 1 day", () => {
    const c = reviewCard(undefined, true, T0);
    expect(c.correct).toBe(1);
    expect(c.attempts).toBe(1);
    expect(c.streak).toBe(1);
    expect(c.interval).toBe(SRS_DEFAULTS.firstCorrectMs);
    expect(c.due).toBe(T0 + SRS_DEFAULTS.firstCorrectMs);
  });

  it("second correct answer pushes due by 3 days", () => {
    const c1 = reviewCard(undefined, true, T0);
    const c2 = reviewCard(c1, true, c1.due);
    expect(c2.streak).toBe(2);
    expect(c2.interval).toBe(SRS_DEFAULTS.secondCorrectMs);
  });

  it("third correct answer multiplies interval by ease", () => {
    let c = reviewCard(undefined, true, T0);
    c = reviewCard(c, true, c.due);
    const prevInterval = c.interval;
    c = reviewCard(c, true, c.due);
    expect(c.streak).toBe(3);
    expect(c.interval).toBe(Math.round(prevInterval * c.ease));
  });

  it("wrong answer resets streak and schedules 10-min relearn", () => {
    let c = reviewCard(undefined, true, T0);
    c = reviewCard(c, true, c.due);
    c = reviewCard(c, false, c.due);
    expect(c.streak).toBe(0);
    expect(c.interval).toBe(SRS_DEFAULTS.failRelearnMs);
    expect(c.ease).toBeCloseTo(SRS_DEFAULTS.ease - SRS_DEFAULTS.easePenaltyWrong, 10);
  });

  it("ease is clamped to [1.3, 3.0]", () => {
    let c = newCard(T0);
    for (let i = 0; i < 20; i++) c = reviewCard(c, false, T0 + i);
    expect(c.ease).toBeGreaterThanOrEqual(SRS_DEFAULTS.minEase);
    expect(c.ease).toBeCloseTo(SRS_DEFAULTS.minEase, 10);
  });

  it("dueCards returns only due items", () => {
    const now = T0;
    const cards = {
      a: { ...newCard(now), due: now - 1 },
      b: { ...newCard(now), due: now + 1_000_000 },
      c: { ...newCard(now), due: now },
    };
    const due = dueCards(cards, now);
    expect(new Set(due)).toEqual(new Set(["a", "c"]));
  });

  it("pickWeight boosts wrong items", () => {
    const low = { ...newCard(0), attempts: 10, correct: 3 };    // 30%
    const mid = { ...newCard(0), attempts: 10, correct: 7 };    // 70%
    const hi  = { ...newCard(0), attempts: 10, correct: 10 };   // 100%
    expect(pickWeight(low)).toBeGreaterThan(pickWeight(mid));
    expect(pickWeight(mid)).toBeGreaterThan(pickWeight(hi));
  });

  it("weightedPick respects weight distribution", () => {
    // bias 99% toward 'a' — deterministic rng stream picks 'a' reliably
    const seq = [0.01, 0.02, 0.03, 0.05];
    let i = 0;
    const rng = () => seq[i++ % seq.length];
    const picks = Array.from({ length: 10 }, () =>
      weightedPick(["a", "b"], [99, 1], rng),
    );
    expect(picks.every(p => p === "a")).toBe(true);
  });
});

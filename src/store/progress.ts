// localStorage-backed progress store. No backend needed.

import type { SrsCard } from "../lib/srs";
import { reviewCard } from "../lib/srs";

export interface LessonProgress {
  completed: boolean;
  completedAt?: number;
}

export interface DrillStat {
  attempts: number;
  correct: number;
  lastAt?: number;
  /**
   * Cumulative EV loss in bb / 100 hands across all attempts in this
   * trainer. Solver-driven trainers (preflop, 3bet, ...) write here on
   * every drill; non-solver trainers (hand ranking, equity calc) leave
   * it undefined.
   */
  evLossBbPer100?: number;
}

export interface ProgressState {
  startedAt: number;
  lessons: Record<string, LessonProgress>;
  drills: Record<string, DrillStat>;
  /**
   * Per-scenario spaced-repetition cards, keyed by
   * `${trainer}:${scenarioKey}` (e.g. `preflop:UTG:AJs`,
   * `pot-odds:bet-1/2`, `hand-ranking:Flush-vs-Straight`).
   */
  srs: Record<string, SrsCard>;
  streak: { count: number; lastDay?: string };
  notes: Record<string, string>;
}

const KEY = "poker-edge-progress-v1";

function emptyState(): ProgressState {
  return {
    startedAt: Date.now(),
    lessons: {},
    drills: {},
    srs: {},
    streak: { count: 0 },
    notes: {},
  };
}

function dayKey(ts: number = Date.now()): string {
  const d = new Date(ts);
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

type Listener = (s: ProgressState) => void;

class ProgressStore {
  private state: ProgressState;
  private listeners = new Set<Listener>();

  constructor() {
    this.state = this.load();
  }

  private load(): ProgressState {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return emptyState();
      // shallow-merge so older stored states (without srs/...) upgrade safely.
      return { ...emptyState(), ...JSON.parse(raw) };
    } catch {
      return emptyState();
    }
  }

  private save(): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.state));
    } catch {
      // ignore
    }
  }

  get(): ProgressState { return this.state; }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    this.state = { ...this.state };
    this.save();
    for (const l of this.listeners) l(this.state);
  }

  completeLesson(id: string): void {
    this.state.lessons[id] = { completed: true, completedAt: Date.now() };
    this.bumpStreak();
    this.emit();
  }

  uncompleteLesson(id: string): void {
    delete this.state.lessons[id];
    this.emit();
  }

  isComplete(id: string): boolean { return !!this.state.lessons[id]?.completed; }

  /**
   * Record a drill result. Updates the aggregate drill counter AND the
   * per-scenario SRS card if a scenario key is provided. Optional
   * `evLossBbPer100` is added to the trainer's running total — solver
   * trainers should pass it; others can omit it.
   */
  recordDrill(
    id: string,
    correct: boolean,
    scenarioKey?: string,
    evLossBbPer100?: number,
  ): void {
    const cur = this.state.drills[id] ?? { attempts: 0, correct: 0 };
    cur.attempts += 1;
    if (correct) cur.correct += 1;
    cur.lastAt = Date.now();
    if (evLossBbPer100 !== undefined) {
      cur.evLossBbPer100 = (cur.evLossBbPer100 ?? 0) + evLossBbPer100;
    }
    this.state.drills[id] = cur;
    if (scenarioKey) {
      const k = `${id}:${scenarioKey}`;
      this.state.srs[k] = reviewCard(this.state.srs[k], correct);
    }
    this.emit();
  }

  srsCard(trainer: string, scenarioKey: string): SrsCard | undefined {
    return this.state.srs[`${trainer}:${scenarioKey}`];
  }

  setNote(id: string, text: string): void {
    this.state.notes[id] = text;
    this.emit();
  }

  reset(): void {
    this.state = emptyState();
    this.emit();
  }

  private bumpStreak(): void {
    const today = dayKey();
    const { streak } = this.state;
    if (streak.lastDay === today) return;
    // yesterday?
    const y = new Date();
    y.setUTCDate(y.getUTCDate() - 1);
    const yKey = dayKey(y.getTime());
    if (streak.lastDay === yKey) streak.count += 1;
    else streak.count = 1;
    streak.lastDay = today;
  }
}

export const progressStore = new ProgressStore();

// React hook wrapping the store.
import { useSyncExternalStore } from "react";

export function useProgress(): ProgressState {
  return useSyncExternalStore(
    (cb) => progressStore.subscribe(cb),
    () => progressStore.get(),
    () => progressStore.get(),
  );
}

/**
 * Derive per-trainer SRS queue statistics (total cards, due cards, new
 * material). Useful for surfacing "23 cards due today" on the dashboard.
 */
export function srsQueueStats(
  state: ProgressState,
  now: number = Date.now(),
): { total: number; due: number; byTrainer: Record<string, { total: number; due: number }> } {
  const byTrainer: Record<string, { total: number; due: number }> = {};
  let total = 0;
  let due = 0;
  for (const [k, card] of Object.entries(state.srs)) {
    const trainer = k.split(":")[0];
    const entry = byTrainer[trainer] ?? (byTrainer[trainer] = { total: 0, due: 0 });
    entry.total += 1;
    total += 1;
    if (card.due <= now) {
      entry.due += 1;
      due += 1;
    }
  }
  return { total, due, byTrainer };
}

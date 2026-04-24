// localStorage-backed progress store. No backend needed.

export interface LessonProgress {
  completed: boolean;
  completedAt?: number;
}

export interface DrillStat {
  attempts: number;
  correct: number;
  lastAt?: number;
}

export interface ProgressState {
  startedAt: number;
  lessons: Record<string, LessonProgress>;
  drills: Record<string, DrillStat>;
  streak: { count: number; lastDay?: string };
  notes: Record<string, string>;
}

const KEY = "poker-edge-progress-v1";

function emptyState(): ProgressState {
  return {
    startedAt: Date.now(),
    lessons: {},
    drills: {},
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

  recordDrill(id: string, correct: boolean): void {
    const cur = this.state.drills[id] ?? { attempts: 0, correct: 0 };
    cur.attempts += 1;
    if (correct) cur.correct += 1;
    cur.lastAt = Date.now();
    this.state.drills[id] = cur;
    this.emit();
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

import { progressStore, useProgress } from "../store/progress";
import { TOTAL_LESSONS } from "../data/curriculum";

export function Settings() {
  const progress = useProgress();
  const completed = Object.values(progress.lessons).filter(l => l.completed).length;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "poker-edge-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    if (!confirm("Reset all progress? This cannot be undone.")) return;
    progressStore.reset();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-chip-ivory/70">
          Manage your progress and local data.
        </p>
      </header>

      <section className="felt-panel p-5 space-y-3">
        <h2 className="text-xl font-semibold">Your Data</h2>
        <div className="text-sm text-chip-ivory/70">
          <div>Lessons completed: <strong>{completed} / {TOTAL_LESSONS}</strong></div>
          <div>Drill attempts: <strong>{Object.values(progress.drills).reduce((a, b) => a + b.attempts, 0)}</strong></div>
          <div>Current streak: <strong>{progress.streak.count} days</strong></div>
          <div>Started: <strong>{new Date(progress.startedAt).toLocaleDateString()}</strong></div>
        </div>
        <p className="text-xs text-chip-ivory/50">
          All data is stored locally in your browser. No account, no server, no tracking.
        </p>
      </section>

      <section className="felt-panel p-5 space-y-3">
        <h2 className="text-xl font-semibold">Actions</h2>
        <div className="flex gap-3 flex-wrap">
          <button className="btn-ghost" onClick={exportData}>
            Export progress (JSON)
          </button>
          <button className="btn-danger" onClick={reset}>
            Reset all progress
          </button>
        </div>
      </section>

      <section className="felt-panel p-5 text-sm text-chip-ivory/70 space-y-2">
        <h2 className="text-xl font-semibold text-chip-ivory">About</h2>
        <p>
          PokerEdge is an opinionated 12-week curriculum for No-Limit Hold'em cash and MTTs.
          It combines written lessons with interactive math and range trainers.
        </p>
        <p>
          The content is not solver-perfect. It's designed to match what a disciplined
          student can internalize and apply in 90 days.
        </p>
        <p className="text-chip-ivory/50 text-xs pt-2">
          Gamble responsibly. Poker is a long game; results compress to skill only over
          massive samples.
        </p>
      </section>
    </div>
  );
}

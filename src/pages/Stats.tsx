import { useMemo } from "react";
import { Link } from "react-router-dom";
import { srsQueueStats, useProgress } from "../store/progress";
import type { ProgressState } from "../store/progress";

const TRAINERS = [
  { id: "hand-ranking", name: "Hand Ranking", slug: "hand-ranking", accent: "text-emerald-400" },
  { id: "pot-odds", name: "Pot Odds", slug: "pot-odds", accent: "text-sky-400" },
  { id: "preflop", name: "Preflop", slug: "preflop", accent: "text-rose-400" },
] as const;

export function Stats() {
  const progress = useProgress();
  const queue = useMemo(() => srsQueueStats(progress), [progress]);

  const perTrainer = TRAINERS.map(t => {
    const d = progress.drills[t.id];
    const attempts = d?.attempts ?? 0;
    const correct = d?.correct ?? 0;
    const acc = attempts > 0 ? Math.round((correct / attempts) * 100) : null;
    const evLossTotal = d?.evLossBbPer100 ?? 0;
    const evLossPer = attempts > 0 ? evLossTotal / attempts : 0;
    return { ...t, attempts, correct, acc, evLossTotal, evLossPer };
  });

  const breakdown = scenarioBreakdown(progress);
  const weakest = weakestScenarios(progress, 5);
  const totalAttempts = perTrainer.reduce((a, t) => a + t.attempts, 0);
  const totalCorrect = perTrainer.reduce((a, t) => a + t.correct, 0);
  // Sum EV loss across only solver-tracked trainers.
  const totalEvLoss = perTrainer.reduce((a, t) => a + (t.evLossTotal ?? 0), 0);
  const evLossPer = totalAttempts > 0 ? totalEvLoss / totalAttempts : 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Your stats</h1>
        <p className="text-sm sm:text-base text-chip-ivory/70">
          Per-trainer accuracy, per-situation breakdown, and spaced-repetition queue.
        </p>
      </header>

      {totalAttempts === 0 ? (
        <EmptyState />
      ) : (
        <>
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Total attempts"
              value={String(totalAttempts)}
              detail={`${totalCorrect} correct`}
            />
            <StatCard
              label="Overall accuracy"
              value={`${Math.round((totalCorrect / totalAttempts) * 100)}%`}
            />
            <StatCard
              label="Due now"
              value={String(queue.due)}
              detail={`of ${queue.total} learned`}
              accent={queue.due > 0 ? "text-chip-gold" : undefined}
            />
            <StatCard
              label="Streak"
              value={String(progress.streak.count)}
              detail="days"
            />
          </section>

          {totalEvLoss > 0 && (
            <section className="felt-panel p-4 sm:p-6">
              <div className="text-xs text-chip-gold uppercase tracking-wider mb-3">
                Solver scorecard · EV loss
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Avg per decision"
                  value={`\u2212${evLossPer.toFixed(2)}`}
                  detail="bb / 100 hands"
                  accent={evLossPer > 0.5 ? "text-chip-red" : "text-chip-gold"}
                />
                <StatCard
                  label="Cumulative loss"
                  value={`\u2212${totalEvLoss.toFixed(1)}`}
                  detail={`across ${totalAttempts} drills`}
                  accent="text-chip-red"
                />
              </div>
              <p className="text-[11px] text-chip-ivory/55 mt-3">
                EV loss is computed against equilibrium frequencies. 0 = playing solver-perfect; higher = more bb left on the table per 100 hands at this skill level.
              </p>
            </section>
          )}

          <section className="felt-panel p-4 sm:p-6">
            <div className="text-xs text-chip-gold uppercase tracking-wider mb-3">
              Per-trainer accuracy
            </div>
            <div className="divide-y divide-felt-700">
              {perTrainer.map(t => {
                const tq = queue.byTrainer[t.id] ?? { total: 0, due: 0 };
                return (
                  <div key={t.id} className="py-3 flex items-center gap-3 flex-wrap">
                    <Link
                      to={`/trainers/${t.slug}`}
                      className={"font-semibold hover:underline " + t.accent}
                    >
                      {t.name}
                    </Link>
                    <div className="text-sm text-chip-ivory/70 flex-1 min-w-[8rem]">
                      {t.attempts === 0 ? (
                        <span className="text-chip-ivory/50">No attempts yet</span>
                      ) : (
                        <>
                          <strong>{t.acc}%</strong> · {t.correct}/{t.attempts} · {tq.due} due
                        </>
                      )}
                    </div>
                    {t.acc !== null && <AccBar pct={t.acc} />}
                  </div>
                );
              })}
            </div>
          </section>

          {weakest.length > 0 && (
            <section className="felt-panel p-4 sm:p-6">
              <div className="text-xs text-chip-gold uppercase tracking-wider mb-3">
                Weakest 5 spots
              </div>
              <ul className="space-y-1 text-sm">
                {weakest.map(w => (
                  <li key={w.key} className="flex items-center justify-between gap-3">
                    <span className="font-mono text-chip-ivory/90 truncate">{w.key}</span>
                    <span className="text-chip-red font-semibold shrink-0">
                      {w.acc}% · {w.correct}/{w.attempts}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-chip-ivory/50 mt-3">
                The preflop quiz biases future hands toward your weakest spots.
              </p>
            </section>
          )}

          {breakdown.length > 0 && (
            <section className="felt-panel p-4 sm:p-6 space-y-5">
              <div className="text-xs text-chip-gold uppercase tracking-wider">
                Situation breakdown
              </div>
              {breakdown.map(group => (
                <div key={group.trainer}>
                  <div className="text-sm font-semibold mb-2 capitalize">{group.trainer}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {group.items.map(item => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between gap-2 text-xs bg-felt-800/50 rounded-md px-2.5 py-1.5"
                      >
                        <span className="font-mono text-chip-ivory/80 truncate">{item.key}</span>
                        <span className={item.acc >= 80
                          ? "text-chip-gold shrink-0"
                          : item.acc >= 60
                            ? "text-chip-ivory/70 shrink-0"
                            : "text-chip-red shrink-0"}>
                          {item.acc}% · {item.attempts}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, detail, accent }: {
  label: string;
  value: string;
  detail?: string;
  accent?: string;
}) {
  return (
    <div className="felt-panel p-3 sm:p-4">
      <div className="text-[10px] sm:text-xs text-chip-ivory/60 uppercase tracking-wider">{label}</div>
      <div className={"text-xl sm:text-2xl font-bold mt-1 " + (accent ?? "text-chip-ivory")}>
        {value}
      </div>
      {detail && <div className="text-[10px] text-chip-ivory/50 mt-0.5">{detail}</div>}
    </div>
  );
}

function AccBar({ pct }: { pct: number }) {
  return (
    <div className="w-24 h-1.5 rounded-full bg-felt-700 overflow-hidden">
      <div
        className={pct >= 80 ? "h-full bg-chip-gold" : pct >= 60 ? "h-full bg-sky-400" : "h-full bg-chip-red"}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <section className="felt-panel p-8 text-center space-y-3">
      <div className="text-chip-ivory/60">No drill attempts yet.</div>
      <div>
        <Link to="/trainers" className="btn inline-block">Open trainers</Link>
      </div>
    </section>
  );
}

interface ScenarioRow { key: string; attempts: number; correct: number; acc: number }
interface ScenarioGroup { trainer: string; items: ScenarioRow[] }

function scenarioBreakdown(state: ProgressState): ScenarioGroup[] {
  const groups: Record<string, ScenarioRow[]> = {};
  for (const [k, card] of Object.entries(state.srs)) {
    if (card.attempts === 0) continue;
    const [trainer, ...rest] = k.split(":");
    const scenario = rest.join(":");
    const acc = Math.round((card.correct / card.attempts) * 100);
    (groups[trainer] ??= []).push({ key: scenario, attempts: card.attempts, correct: card.correct, acc });
  }
  const out: ScenarioGroup[] = Object.entries(groups).map(([trainer, items]) => ({
    trainer,
    items: items.sort((a, b) => b.attempts - a.attempts).slice(0, 20),
  }));
  return out.sort((a, b) => a.trainer.localeCompare(b.trainer));
}

function weakestScenarios(state: ProgressState, n: number): ScenarioRow[] {
  const rows: ScenarioRow[] = [];
  for (const [k, card] of Object.entries(state.srs)) {
    if (card.attempts < 2) continue;   // need >=2 attempts for a meaningful %
    const acc = Math.round((card.correct / card.attempts) * 100);
    rows.push({ key: k, attempts: card.attempts, correct: card.correct, acc });
  }
  rows.sort((a, b) => a.acc - b.acc || b.attempts - a.attempts);
  return rows.slice(0, n);
}

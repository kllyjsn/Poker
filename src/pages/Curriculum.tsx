import { Link } from "react-router-dom";
import { CURRICULUM } from "../data/curriculum";
import { useProgress } from "../store/progress";

export function Curriculum() {
  const progress = useProgress();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-2">12-Week Curriculum</h1>
        <p className="text-chip-ivory/70">
          Click any week to expand its lessons. Each day is 25-45 minutes of focused work.
        </p>
      </header>

      {CURRICULUM.map(w => (
        <section key={w.week} className="felt-panel p-4 sm:p-6">
          <div className="flex items-start justify-between mb-3 gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="text-xs text-chip-gold uppercase tracking-widest">
                Week {w.week}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">{w.title}</h2>
              <p className="text-chip-ivory/70 mt-1">{w.theme}</p>
            </div>
            <Link to={`/week/${w.week}`} className="btn-ghost text-sm">
              View week
            </Link>
          </div>
          <ul className="divide-y divide-felt-700">
            {w.lessons.map(l => {
              const done = progress.lessons[l.id]?.completed;
              return (
                <li key={l.id} className="py-2 flex items-center gap-3">
                  <span className={done
                    ? "w-5 h-5 rounded-full bg-chip-gold text-felt-900 text-xs flex items-center justify-center font-bold"
                    : "w-5 h-5 rounded-full border border-felt-600"}>
                    {done ? "\u2713" : ""}
                  </span>
                  <Link
                    to={`/lesson/${l.id}`}
                    className="flex-1 hover:text-chip-gold transition"
                  >
                    <span className="text-chip-ivory/60 text-xs mr-2">D{l.day}</span>
                    {l.title}
                  </Link>
                  <span className="text-xs text-chip-ivory/50">{l.minutes}m</span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

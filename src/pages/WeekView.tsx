import { Link, useParams } from "react-router-dom";
import { findWeek } from "../data/curriculum";
import { useProgress } from "../store/progress";

export function WeekView() {
  const { week } = useParams();
  const w = findWeek(Number(week));
  const progress = useProgress();

  if (!w) return <div>Week not found.</div>;

  return (
    <div className="space-y-6">
      <Link to="/curriculum" className="text-xs text-chip-ivory/60 hover:text-chip-gold">
        &larr; All weeks
      </Link>
      <header>
        <div className="text-xs text-chip-gold uppercase tracking-widest mb-1">
          Week {w.week}
        </div>
        <h1 className="text-4xl font-bold mb-2">{w.title}</h1>
        <p className="text-chip-ivory/80 italic">{w.theme}</p>
        <p className="mt-3 text-chip-ivory/70 max-w-3xl">{w.description}</p>
      </header>

      <section className="space-y-3">
        {w.lessons.map(l => {
          const done = progress.lessons[l.id]?.completed;
          return (
            <Link
              key={l.id}
              to={`/lesson/${l.id}`}
              className="felt-panel p-4 flex items-center gap-4 hover:border-chip-gold/50 transition block"
            >
              <div className={done
                ? "w-9 h-9 rounded-full bg-chip-gold text-felt-900 font-bold flex items-center justify-center"
                : "w-9 h-9 rounded-full border border-felt-600 flex items-center justify-center text-chip-ivory/60"}>
                {done ? "\u2713" : `D${l.day}`}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{l.title}</div>
                <div className="text-sm text-chip-ivory/60">{l.focus}</div>
              </div>
              <div className="text-xs text-chip-ivory/50">{l.minutes} min</div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

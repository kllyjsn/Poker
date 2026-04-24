import { Link } from "react-router-dom";
import { CURRICULUM, ALL_LESSONS, TOTAL_LESSONS } from "../data/curriculum";
import { useProgress } from "../store/progress";

export function Dashboard() {
  const progress = useProgress();
  const completedLessons = new Set(
    Object.entries(progress.lessons)
      .filter(([, v]) => v.completed)
      .map(([k]) => k),
  );
  const nextLesson = ALL_LESSONS.find(l => !completedLessons.has(l.id));
  const currentWeek = nextLesson
    ? CURRICULUM.find(w => w.week === nextLesson.week)
    : CURRICULUM[CURRICULUM.length - 1];

  const completed = completedLessons.size;
  const pct = Math.round((completed / TOTAL_LESSONS) * 100);

  const totalDrills = Object.values(progress.drills).reduce(
    (a, b) => a + b.attempts, 0);
  const totalCorrect = Object.values(progress.drills).reduce(
    (a, b) => a + b.correct, 0);
  const drillPct = totalDrills > 0
    ? Math.round((totalCorrect / totalDrills) * 100)
    : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <div className="text-chip-gold text-xs sm:text-sm uppercase tracking-widest mb-1 sm:mb-2">
          Your Edge Path
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 leading-tight">
          {completed === 0
            ? "Welcome. Let's build an edge."
            : completed === TOTAL_LESSONS
              ? "You've graduated the foundation."
              : `Week ${currentWeek?.week} · ${currentWeek?.title}`}
        </h1>
        <p className="text-sm sm:text-base text-chip-ivory/70 max-w-2xl">
          {completed === 0
            ? "12 weeks. 60 lessons. Five interactive trainers. Everything you need to go from zero to genuine edge in NLHE cash and tournaments."
            : currentWeek?.description}
        </p>
      </header>

      {/* Today's lesson — hero CTA */}
      {nextLesson && (
        <section className="relative felt-panel overflow-hidden p-5 sm:p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-chip-gold/15 via-transparent to-transparent" />
          <div className="relative">
            <div className="text-[11px] sm:text-xs text-chip-gold uppercase tracking-wider mb-1 font-semibold">
              Next Up · W{nextLesson.week}D{nextLesson.day} · ~{nextLesson.minutes} min
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1.5 leading-snug">{nextLesson.title}</h2>
            <p className="text-sm text-chip-ivory/70 mb-4">{nextLesson.focus}</p>
            <div className="grid grid-cols-1 sm:flex sm:items-center gap-2 sm:gap-3">
              <Link to={`/lesson/${nextLesson.id}`} className="btn w-full sm:w-auto">
                Start lesson →
              </Link>
              {nextLesson.trainer && (
                <Link
                  to={`/trainers/${nextLesson.trainer}`}
                  className="btn-ghost w-full sm:w-auto text-sm"
                >
                  Open linked trainer
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="stat-grid">
        <Stat label="Lessons Complete" value={`${completed} / ${TOTAL_LESSONS}`} detail={`${pct}%`} />
        <Stat label="Drill Accuracy" value={totalDrills ? `${drillPct}%` : "—"} detail={`${totalDrills} attempts`} />
        <Stat label="Streak" value={`${progress.streak.count}d`} detail="daily practice" />
        <Stat label="Days since start" value={daysSince(progress.startedAt) + "d"} detail="of 90" />
      </section>

      {/* Week grid */}
      <section>
        <h2 className="text-xl font-semibold mb-3">The 12-Week Path</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CURRICULUM.map(w => {
            const wComplete = w.lessons.filter(l => completedLessons.has(l.id)).length;
            const wPct = Math.round((wComplete / w.lessons.length) * 100);
            return (
              <Link
                key={w.week}
                to={`/week/${w.week}`}
                className="felt-panel p-4 hover:border-chip-gold/50 transition block"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs text-chip-gold tracking-widest">
                    WEEK {w.week}
                  </span>
                  <span className="text-xs text-chip-ivory/60">
                    {wComplete}/{w.lessons.length}
                  </span>
                </div>
                <div className="font-semibold mb-1">{w.title}</div>
                <div className="text-xs text-chip-ivory/60 mb-2">{w.theme}</div>
                <div className="h-1 rounded-full bg-felt-700 overflow-hidden">
                  <div
                    className="h-full bg-chip-gold"
                    style={{ width: `${wPct}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="felt-panel p-3 sm:p-4">
      <div className="text-xs text-chip-ivory/60 uppercase tracking-wider">{label}</div>
      <div className="text-xl sm:text-2xl font-bold mt-1">{value}</div>
      {detail && <div className="text-xs text-chip-ivory/50 mt-1">{detail}</div>}
    </div>
  );
}

function daysSince(ts: number): number {
  return Math.max(0, Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24)));
}

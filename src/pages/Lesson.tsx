import { Link, useNavigate, useParams } from "react-router-dom";
import { ALL_LESSONS, findLesson, findWeek } from "../data/curriculum";
import { progressStore, useProgress } from "../store/progress";

export function LessonPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const progress = useProgress();
  const lesson = id ? findLesson(id) : undefined;

  if (!lesson) return <div>Lesson not found.</div>;

  const done = progress.lessons[lesson.id]?.completed;
  const week = findWeek(lesson.week);
  const idx = ALL_LESSONS.findIndex(l => l.id === lesson.id);
  const next = ALL_LESSONS[idx + 1];
  const prev = ALL_LESSONS[idx - 1];

  return (
    <article className="space-y-8 pb-12">
      <div className="flex items-center gap-3 text-xs text-chip-ivory/60">
        <Link to="/curriculum" className="hover:text-chip-gold">Curriculum</Link>
        <span>&rsaquo;</span>
        <Link to={`/week/${lesson.week}`} className="hover:text-chip-gold">
          Week {lesson.week} · {week?.title}
        </Link>
        <span>&rsaquo;</span>
        <span>Day {lesson.day}</span>
      </div>

      <header>
        <div className="text-chip-gold text-xs uppercase tracking-widest mb-2">
          W{lesson.week} · Day {lesson.day} · {lesson.minutes} min
        </div>
        <h1 className="text-4xl font-bold mb-3">{lesson.title}</h1>
        <p className="text-xl text-chip-ivory/80 italic">{lesson.focus}</p>
      </header>

      <section className="felt-panel p-5">
        <div className="text-xs text-chip-gold uppercase tracking-wider mb-2">
          Objectives
        </div>
        <ul className="list-disc list-inside space-y-1 text-chip-ivory/90">
          {lesson.objectives.map((o, i) => <li key={i}>{o}</li>)}
        </ul>
      </section>

      {lesson.sections.map((s, i) => (
        <section key={i} className="prose-content">
          {s.heading && (
            <h2 className="text-2xl font-semibold mb-3 text-chip-gold">
              {s.heading}
            </h2>
          )}
          {s.body && (
            <p className="text-chip-ivory/90 leading-relaxed whitespace-pre-wrap">
              {s.body}
            </p>
          )}
          {s.bullets && (
            <ul className="mt-3 space-y-1.5">
              {s.bullets.map((b, j) => (
                <li key={j} className="flex gap-2">
                  <span className="text-chip-gold mt-0.5">&middot;</span>
                  <span className="text-chip-ivory/90">{b}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="felt-panel p-5">
        <div className="text-xs text-chip-gold uppercase tracking-wider mb-2">
          Key Takeaways
        </div>
        <ul className="space-y-2">
          {lesson.takeaways.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-chip-gold font-bold">&#9656;</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      {lesson.drill && (
        <section className="felt-panel p-5 border border-chip-gold/30">
          <div className="text-xs text-chip-gold uppercase tracking-wider mb-2">
            Drill
          </div>
          <p className="text-chip-ivory/90">{lesson.drill}</p>
        </section>
      )}

      {lesson.trainer && (
        <section className="felt-panel p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-chip-gold uppercase tracking-wider mb-1">
                Interactive Trainer
              </div>
              <p className="text-chip-ivory/80">
                Reinforce today's lesson with hands-on reps.
              </p>
            </div>
            <Link to={`/trainers/${lesson.trainer}`} className="btn">
              Open trainer
            </Link>
          </div>
        </section>
      )}

      <div className="flex items-center gap-3 pt-4">
        <button
          className={done ? "btn-ghost" : "btn"}
          onClick={() => {
            if (done) progressStore.uncompleteLesson(lesson.id);
            else progressStore.completeLesson(lesson.id);
          }}
        >
          {done ? "\u2713 Completed (click to undo)" : "Mark complete"}
        </button>
        {next && (
          <button
            className="btn-ghost"
            onClick={() => {
              if (!done) progressStore.completeLesson(lesson.id);
              nav(`/lesson/${next.id}`);
            }}
          >
            {done ? "Next lesson" : "Complete + next"} &rarr;
          </button>
        )}
      </div>

      <div className="flex justify-between text-sm text-chip-ivory/60 border-t border-felt-700 pt-4">
        {prev ? (
          <Link to={`/lesson/${prev.id}`} className="hover:text-chip-gold">
            &larr; {prev.title}
          </Link>
        ) : <span />}
        {next ? (
          <Link to={`/lesson/${next.id}`} className="hover:text-chip-gold">
            {next.title} &rarr;
          </Link>
        ) : <span />}
      </div>
    </article>
  );
}

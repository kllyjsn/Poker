import { Link } from "react-router-dom";
import { useProgress } from "../store/progress";

const TRAINERS = [
  {
    slug: "hand-ranking",
    name: "Hand Ranking Quiz",
    desc: "Compare two 5-card hands; pick the winner. Build instant recognition of the 9 hand categories.",
    week: 1,
  },
  {
    slug: "pot-odds",
    name: "Pot Odds Trainer",
    desc: "Random bet/pot scenarios. Compute required equity and decide call vs fold.",
    week: 1,
  },
  {
    slug: "equity",
    name: "Equity Calculator",
    desc: "Monte Carlo heads-up / multi-way equity for any hole cards and board.",
    week: 2,
  },
  {
    slug: "preflop",
    name: "Preflop Range Trainer",
    desc: "13x13 range matrix per position. Drill your opens until they're automatic.",
    week: 3,
  },
  {
    slug: "icm",
    name: "ICM Calculator",
    desc: "Malmuth-Harville ICM. Input stacks and payouts, see $ equity for every seat.",
    week: 9,
  },
];

export function Trainers() {
  const progress = useProgress();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold mb-2">Trainers</h1>
        <p className="text-chip-ivory/70">
          Five interactive tools. Use them alongside the lessons — not as a replacement.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TRAINERS.map(t => {
          const stat = progress.drills[t.slug];
          const acc = stat && stat.attempts > 0
            ? Math.round((stat.correct / stat.attempts) * 100)
            : null;
          return (
            <Link
              key={t.slug}
              to={`/trainers/${t.slug}`}
              className="felt-panel p-5 hover:border-chip-gold/50 transition block"
            >
              <div className="flex items-start justify-between mb-1">
                <h2 className="text-xl font-bold">{t.name}</h2>
                <span className="text-xs text-chip-ivory/50">
                  Intro in Week {t.week}
                </span>
              </div>
              <p className="text-sm text-chip-ivory/70 mb-3">{t.desc}</p>
              {stat && (
                <div className="text-xs text-chip-ivory/60">
                  {stat.attempts} reps · {acc}% accuracy
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

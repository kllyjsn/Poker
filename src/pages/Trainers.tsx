import { Link } from "react-router-dom";
import { useProgress } from "../store/progress";

type IconName = "cards" | "pot" | "equity" | "matrix" | "icm";

const TRAINERS: Array<{
  slug: string;
  name: string;
  desc: string;
  week: number;
  icon: IconName;
  accent: string;
}> = [
  {
    slug: "hand-ranking",
    name: "Hand Ranking",
    desc: "Compare two 5-card hands. Build instant recognition of the 9 categories.",
    week: 1,
    icon: "cards",
    accent: "from-emerald-500/30 to-emerald-700/10",
  },
  {
    slug: "pot-odds",
    name: "Pot Odds",
    desc: "Random bet/pot scenarios. Compute required equity; call or fold.",
    week: 1,
    icon: "pot",
    accent: "from-sky-500/30 to-sky-700/10",
  },
  {
    slug: "equity",
    name: "Equity Calc",
    desc: "Monte-Carlo equity for any hole cards and board. 10,000 iterations.",
    week: 2,
    icon: "equity",
    accent: "from-amber-500/30 to-amber-700/10",
  },
  {
    slug: "preflop",
    name: "Preflop Range",
    desc: "13×13 range matrix per position. Drill opens until automatic.",
    week: 3,
    icon: "matrix",
    accent: "from-rose-500/30 to-rose-700/10",
  },
  {
    slug: "icm",
    name: "ICM Calc",
    desc: "Malmuth-Harville ICM. Stacks × payouts → $ equity per seat.",
    week: 9,
    icon: "icm",
    accent: "from-violet-500/30 to-violet-700/10",
  },
];

export function Trainers() {
  const progress = useProgress();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Trainers</h1>
        <p className="text-sm sm:text-base text-chip-ivory/70">
          Five interactive tools. Use them alongside the lessons.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {TRAINERS.map(t => {
          const attempts = progress.drills[t.slug]?.attempts ?? 0;
          const correct = progress.drills[t.slug]?.correct ?? 0;
          const acc = attempts > 0 ? Math.round((correct / attempts) * 100) : null;
          return (
            <Link
              key={t.slug}
              to={`/trainers/${t.slug}`}
              className="group relative felt-panel overflow-hidden p-4 sm:p-5 hover:border-chip-gold/50 active:scale-[.98] transition block"
            >
              <div className={`absolute inset-0 -z-0 bg-gradient-to-br ${t.accent} opacity-60 group-hover:opacity-80 transition`} />
              <div className="relative z-10 flex flex-col h-full min-h-[140px] sm:min-h-[160px]">
                <div className="mb-2"><TrainerIcon name={t.icon} /></div>
                <div className="font-bold text-base sm:text-lg leading-tight">{t.name}</div>
                <div className="text-[11px] sm:text-xs text-chip-ivory/70 mt-1">{t.desc}</div>
                <div className="mt-auto pt-2 text-[10px] sm:text-xs flex items-center justify-between text-chip-ivory/60">
                  <span>Wk {t.week}</span>
                  {acc !== null ? (
                    <span className="text-chip-gold font-semibold">{acc}% · {attempts}</span>
                  ) : (
                    <span>New</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function TrainerIcon({ name }: { name: IconName }) {
  const base = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "text-chip-gold",
  };
  switch (name) {
    case "cards":
      return (
        <svg {...base}>
          <rect x="3" y="6" width="11" height="14" rx="2" />
          <rect x="10" y="4" width="11" height="14" rx="2" />
        </svg>
      );
    case "pot":
      return (
        <svg {...base}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4v8l5 3" />
        </svg>
      );
    case "equity":
      return (
        <svg {...base}>
          <path d="M4 20V10" />
          <path d="M10 20V4" />
          <path d="M16 20v-6" />
          <path d="M22 20H2" />
        </svg>
      );
    case "matrix":
      return (
        <svg {...base}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
        </svg>
      );
    case "icm":
      return (
        <svg {...base}>
          <path d="M3 21h18M6 21V9M12 21V4M18 21v-8" />
          <circle cx="6" cy="9" r="1.2" fill="currentColor" />
          <circle cx="12" cy="4" r="1.2" fill="currentColor" />
          <circle cx="18" cy="13" r="1.2" fill="currentColor" />
        </svg>
      );
  }
}

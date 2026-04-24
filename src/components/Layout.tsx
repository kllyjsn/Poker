import { NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import { useProgress } from "../store/progress";
import { TOTAL_LESSONS } from "../data/curriculum";

const NAV = [
  { to: "/", label: "Dashboard", icon: "\u25C8" },
  { to: "/curriculum", label: "Curriculum", icon: "\u2630" },
  { to: "/trainers", label: "Trainers", icon: "\u2660" },
  { to: "/settings", label: "Settings", icon: "\u2699" },
];

export function Layout() {
  const progress = useProgress();
  const completed = Object.values(progress.lessons).filter(l => l.completed).length;
  const pct = Math.round((completed / TOTAL_LESSONS) * 100);

  return (
    <div className="min-h-full flex">
      <aside className="w-60 shrink-0 border-r border-felt-700 bg-felt-800/60 p-4 flex flex-col">
        <div className="mb-6">
          <div className="text-2xl font-bold tracking-tight">
            <span className="text-chip-gold">Poker</span>Edge
          </div>
          <div className="text-xs text-chip-ivory/60">
            From zero to edge in 90 days
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                clsx(
                  "px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition",
                  isActive
                    ? "bg-felt-700 text-chip-gold"
                    : "text-chip-ivory/80 hover:bg-felt-700/60 hover:text-chip-ivory",
                )
              }
            >
              <span className="text-base">{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-4">
          <div className="text-xs text-chip-ivory/60 mb-1">
            Progress · {completed}/{TOTAL_LESSONS}
          </div>
          <div className="h-1.5 rounded-full bg-felt-700 overflow-hidden">
            <div
              className="h-full bg-chip-gold transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-chip-ivory/60">
            Streak · {progress.streak.count} day{progress.streak.count === 1 ? "" : "s"}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

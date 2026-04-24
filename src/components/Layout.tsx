import { NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import { useProgress } from "../store/progress";
import { TOTAL_LESSONS } from "../data/curriculum";

const NAV = [
  { to: "/", label: "Dashboard", icon: "home" },
  { to: "/curriculum", label: "Curriculum", icon: "book" },
  { to: "/trainers", label: "Trainers", icon: "spade" },
  { to: "/settings", label: "Settings", icon: "gear" },
] as const;

export function Layout() {
  const progress = useProgress();

  const completed = Object.values(progress.lessons).filter(l => l.completed).length;
  const pct = Math.round((completed / TOTAL_LESSONS) * 100);

  return (
    <div className="min-h-full md:flex">
      {/* Desktop sidebar (md+) */}
      <aside
        className="hidden md:flex md:static inset-y-0 left-0 w-64 shrink-0 border-r border-felt-700 bg-felt-800/60 p-4 flex-col"
        aria-label="Primary"
      >
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
                  "px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 transition",
                  isActive
                    ? "bg-felt-700 text-chip-gold"
                    : "text-chip-ivory/80 hover:bg-felt-700/60 hover:text-chip-ivory",
                )
              }
            >
              <NavIcon name={n.icon} />
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

      <main className="flex-1 min-w-0 md:overflow-y-auto">
        {/* Mobile sticky top */}
        <header className="md:hidden sticky top-0 z-30 bg-felt-900/95 backdrop-blur border-b border-felt-700 pt-safe">
          <div className="flex items-center justify-between px-4 h-14">
            <NavLink to="/" className="text-lg font-bold tracking-tight">
              <span className="text-chip-gold">Poker</span>Edge
            </NavLink>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 rounded-full bg-felt-700 overflow-hidden">
                <div
                  className="h-full bg-chip-gold transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-xs text-chip-ivory/70 tabular-nums">
                {completed}/{TOTAL_LESSONS}
              </div>
            </div>
          </div>
        </header>

        {/* Content area — pb accounts for bottom tab bar on mobile */}
        <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-felt-800/95 backdrop-blur border-t border-felt-700 pb-safe"
        aria-label="Primary"
      >
        <div className="grid grid-cols-4">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                clsx(
                  "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition min-h-[60px]",
                  isActive
                    ? "text-chip-gold"
                    : "text-chip-ivory/60 hover:text-chip-ivory",
                )
              }
            >
              <NavIcon name={n.icon} big />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

function NavIcon({ name, big }: { name: "home" | "book" | "spade" | "gear"; big?: boolean }) {
  const size = big ? 22 : 18;
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "home":
      return (
        <svg {...common}><path d="M3 12L12 3l9 9" /><path d="M5 10v10h14V10" /></svg>
      );
    case "book":
      return (
        <svg {...common}><path d="M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4V4z" /><path d="M4 16a4 4 0 014-4h12" /></svg>
      );
    case "spade":
      return (
        <svg {...common} fill="currentColor" stroke="none"><path d="M12 2c-3 4-8 6-8 11a5 5 0 007.5 4.3L11 22h2l-.5-4.7A5 5 0 0020 13c0-5-5-7-8-11z" /></svg>
      );
    case "gear":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 01-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 012.8-2.8l.1.1a1.7 1.7 0 001.8.3h0a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 012.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8v0a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z" />
        </svg>
      );
  }
}

import { useMemo, useState } from "react";
import clsx from "clsx";
import type { Position } from "../../lib/ranges";
import { openingRange, rangeMatrix } from "../../lib/ranges";
import { allStartingHands } from "../../lib/poker";
import { progressStore } from "../../store/progress";

const POSITIONS: Position[] = ["UTG", "HJ", "CO", "BTN", "SB"];
const POSITION_DESC: Record<Position, string> = {
  UTG: "Under the Gun · tightest",
  HJ: "Hijack · still tight",
  CO: "Cutoff · opens up",
  BTN: "Button · widest",
  SB: "Small Blind · raise-or-fold vs BB",
};

export function PreflopTrainer() {
  const [position, setPosition] = useState<Position>("UTG");
  const [mode, setMode] = useState<"chart" | "quiz">("chart");

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold mb-1">Preflop Range Trainer</h1>
          <p className="text-chip-ivory/70">
            Opening ranges (RFI) at 100bb, 6-max. Chart to study, quiz to drill.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className={mode === "chart" ? "btn" : "btn-ghost"}
            onClick={() => setMode("chart")}
          >Chart</button>
          <button
            className={mode === "quiz" ? "btn" : "btn-ghost"}
            onClick={() => setMode("quiz")}
          >Quiz</button>
        </div>
      </header>

      <section className="felt-panel p-4 flex gap-2 flex-wrap">
        {POSITIONS.map(p => (
          <button
            key={p}
            className={clsx(
              "px-4 py-2 rounded-lg font-semibold transition",
              position === p
                ? "bg-chip-gold text-felt-900"
                : "border border-felt-600 hover:bg-felt-700/60",
            )}
            onClick={() => setPosition(p)}
          >
            {p}
          </button>
        ))}
        <div className="w-full text-xs text-chip-ivory/60 pt-1">
          {POSITION_DESC[position]}
        </div>
      </section>

      {mode === "chart" ? <ChartView position={position} /> : <QuizView position={position} />}
    </div>
  );
}

function ChartView({ position }: { position: Position }) {
  const matrix = useMemo(() => rangeMatrix(position), [position]);
  const range = openingRange(position);
  return (
    <section className="felt-panel p-4">
      <div className="text-xs text-chip-gold uppercase tracking-wider mb-2">
        Opening range · {range.size} / 169 hands ({Math.round(range.size / 169 * 100)}%)
      </div>
      <div className="overflow-x-auto">
        <table className="border-collapse mx-auto">
          <tbody>
            {matrix.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className={clsx(
                      "text-[10px] md:text-xs font-mono border border-felt-900 w-9 h-9 md:w-10 md:h-10 text-center",
                      cell.inRange
                        ? "bg-chip-gold/80 text-felt-900 font-bold"
                        : "bg-felt-800 text-chip-ivory/50",
                      r === c ? "!bg-felt-700" : "",
                      cell.inRange && r === c ? "!bg-chip-gold !text-felt-900" : "",
                    )}
                    title={cell.key}
                  >
                    {cell.key}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-chip-ivory/60 pt-3">
        Gold cells = open/raise first-in. Diagonal = pairs. Upper-right = suited.
        Lower-left = offsuit.
      </div>
    </section>
  );
}

function QuizView({ position }: { position: Position }) {
  const range = useMemo(() => openingRange(position), [position]);
  const [hand, setHand] = useState<string>(() => randomHand());
  const [reveal, setReveal] = useState<null | "raise" | "fold">(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const correct = range.has(hand) ? "raise" : "fold";

  const answer = (guess: "raise" | "fold") => {
    setReveal(guess);
    const ok = guess === correct;
    progressStore.recordDrill(`preflop-${position}`, ok);
    if (ok) {
      const s = streak + 1;
      setStreak(s);
      if (s > best) setBest(s);
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    setHand(randomHand());
    setReveal(null);
  };

  return (
    <section className="felt-panel p-6 space-y-5">
      <div className="flex justify-between text-sm">
        <div>Position: <strong className="text-chip-gold">{position}</strong></div>
        <div>Streak: <strong className="text-chip-gold">{streak}</strong> · Best: {best}</div>
      </div>

      <div className="text-center py-8">
        <div className="text-xs text-chip-ivory/60 uppercase tracking-widest mb-3">
          First in, action on you. Raise or fold?
        </div>
        <div className="text-7xl font-mono font-bold text-chip-gold">
          {hand}
        </div>
      </div>

      {reveal === null ? (
        <div className="flex gap-3 justify-center">
          <button className="btn" onClick={() => answer("raise")}>Raise</button>
          <button className="btn-danger" onClick={() => answer("fold")}>Fold</button>
        </div>
      ) : (
        <div className="space-y-3 text-center">
          <div className={reveal === correct
            ? "text-chip-gold font-semibold text-lg"
            : "text-chip-red font-semibold text-lg"}>
            {reveal === correct ? "Correct \u2713" : "Incorrect \u2717"}
            {" — "}
            GTO-ish says <strong>{correct.toUpperCase()}</strong> from {position}.
          </div>
          <button className="btn" onClick={next}>Next hand &rarr;</button>
        </div>
      )}
    </section>
  );
}

function randomHand(): string {
  const all = allStartingHands();
  return all[Math.floor(Math.random() * all.length)];
}

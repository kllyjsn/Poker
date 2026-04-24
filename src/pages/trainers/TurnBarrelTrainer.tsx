import { useState } from "react";
import clsx from "clsx";
import { progressStore, useProgress } from "../../store/progress";
import { pickWeight, weightedPick, type SrsCard } from "../../lib/srs";
import { turnBarrelDecision, type BarrelAction } from "../../lib/postflop";
import { PlayingCard } from "../../components/Card";
import { parseCard } from "../../lib/poker";

const DRILL_ID = "turn-barrel";
const ACTIONS: BarrelAction[] = ["barrel-small", "barrel-large", "check"];
const ACTION_LABEL: Record<BarrelAction, string> = {
  "barrel-small": "Barrel small (≈40%)",
  "barrel-large": "Barrel large (≈75%+)",
  "check":        "Check",
};

const SPOTS: Array<{ key: string; flop: string[]; turn: string }> = [
  { key: "Q72r-Ah-overcard",        flop: ["Qh", "7c", "2d"], turn: "Ah" },
  { key: "K83r-Kc-pair-board",      flop: ["Kh", "8c", "3d"], turn: "Kc" },
  { key: "K83r-8d-pair-board",      flop: ["Kh", "8c", "3d"], turn: "8d" },
  { key: "Kh9h5d-2h-flush-comes",   flop: ["Kh", "9h", "5d"], turn: "2h" },
  { key: "Q72r-4s-brick",           flop: ["Qh", "7c", "2d"], turn: "4s" },
  { key: "765r-8c-straight-comes",  flop: ["7c", "6d", "5h"], turn: "8c" },
  { key: "JT9-Qd-straight-comes",   flop: ["Jc", "Td", "9h"], turn: "Qd" },
  { key: "T93r-Ah-overcard",        flop: ["Tc", "9d", "3h"], turn: "Ah" },
  { key: "AhKh7d-2c-brick",         flop: ["Ah", "Kh", "7d"], turn: "2c" },
  { key: "AhKh7d-Th-flush-comes",   flop: ["Ah", "Kh", "7d"], turn: "Th" },
  { key: "QJTr-Ks-straight-comes",  flop: ["Qd", "Jc", "Th"], turn: "Ks" },
  { key: "955-Kc-overcard",         flop: ["9c", "5d", "5h"], turn: "Kc" },
];

export function TurnBarrelTrainer() {
  const progress = useProgress();
  const [spotIdx, setSpotIdx] = useState(() => pickSpot(progress.srs));
  const [reveal, setReveal] = useState<BarrelAction | null>(null);
  const spot = SPOTS[spotIdx];
  const result = turnBarrelDecision(spot.flop, spot.turn);
  const card = progress.srs[`${DRILL_ID}:${spot.key}`];

  const choose = (a: BarrelAction) => {
    setReveal(a);
    progressStore.recordDrill(DRILL_ID, a === result.action, spot.key);
  };
  const next = () => {
    setSpotIdx(pickSpot(progress.srs, spotIdx));
    setReveal(null);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Turn Barrel Trainer</h1>
        <p className="text-chip-ivory/70 text-sm">
          You c-bet small on the flop and BB called. Turn arrives. Barrel sizing or check?
        </p>
      </header>

      <section className="felt-panel p-6 space-y-5">
        <div className="space-y-3">
          <div className="text-[11px] uppercase tracking-widest text-chip-ivory/50 text-center">Flop → Turn</div>
          <div className="flex justify-center items-center gap-2 sm:gap-3">
            {spot.flop.map(c => <PlayingCard key={c} card={parseCard(c)} size="md" dimmed />)}
            <div className="text-chip-ivory/40 text-2xl mx-1">·</div>
            <PlayingCard card={parseCard(spot.turn)} size="lg" highlight />
          </div>
        </div>

        {card && card.attempts > 0 && (
          <div className="text-[11px] text-chip-ivory/50 text-center">
            Seen {card.attempts}× · {Math.round((card.correct / card.attempts) * 100)}% correct
          </div>
        )}

        {reveal === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {ACTIONS.map(a => (
              <button
                key={a}
                onClick={() => choose(a)}
                className={clsx(
                  "px-3 py-3 rounded-lg font-semibold border min-h-[52px]",
                  a === "barrel-small" && "bg-chip-gold/80 text-felt-900 border-chip-gold",
                  a === "barrel-large" && "bg-amber-600/40 text-chip-ivory border-amber-500/60",
                  a === "check"        && "bg-felt-700/60 text-chip-ivory border-felt-600",
                )}
              >
                {ACTION_LABEL[a]}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className={clsx(
              "text-center text-lg font-semibold",
              reveal === result.action ? "text-chip-gold" : "text-chip-red",
            )}>
              {reveal === result.action ? "Correct ✓" : "Incorrect ✗"} — Best line: <strong>{ACTION_LABEL[result.action]}</strong>
            </div>
            <div className="bg-felt-900/60 p-4 rounded-lg space-y-2 text-sm">
              <div className="text-xs text-chip-gold uppercase tracking-wider">Why</div>
              <ul className="text-chip-ivory/85 space-y-1 list-disc list-inside">
                {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
            <div className="flex justify-center">
              <button className="btn" onClick={next}>Next spot →</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function pickSpot(srs: Record<string, SrsCard>, exclude?: number): number {
  const weights = SPOTS.map(s => pickWeight(srs[`${DRILL_ID}:${s.key}`]));
  if (exclude !== undefined) weights[exclude] *= 0.1;
  return weightedPick(SPOTS.map((_, i) => i), weights);
}

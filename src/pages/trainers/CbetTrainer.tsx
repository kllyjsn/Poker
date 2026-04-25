import { useState } from "react";
import clsx from "clsx";
import { progressStore, useProgress } from "../../store/progress";
import { pickWeight, weightedPick, type SrsCard } from "../../lib/srs";
import { cbetDecision, randomBoard, type CbetAction } from "../../lib/postflop";
import { PlayingCard } from "../../components/Card";
import { parseCard } from "../../lib/poker";

const DRILL_ID = "cbet";
const ACTIONS: CbetAction[] = ["cbet-small", "cbet-large", "check"];
const ACTION_LABEL: Record<CbetAction, string> = {
  "cbet-small": "C-bet small (≈33%)",
  "cbet-large": "C-bet large (≈75%)",
  "check":      "Check",
};

// Twelve canonical training boards. Each gets its own SR scenario key.
const SPOTS: Array<{ key: string; cards: string[] }> = [
  { key: "Ace-high-rainbow",   cards: ["Ah", "7c", "2d"] },
  { key: "King-high-rainbow",  cards: ["Kh", "8c", "3d"] },
  { key: "Queen-high-rainbow", cards: ["Qh", "7c", "2d"] },
  { key: "Paired-Ten",         cards: ["Tc", "Td", "5h"] },
  { key: "Paired-Six",         cards: ["6c", "6d", "Js"] },
  { key: "Wet-low-connected",  cards: ["7c", "6d", "5h"] },
  { key: "Wet-mid-connected",  cards: ["Jc", "Td", "9h"] },
  { key: "Monotone-K-high",    cards: ["Kh", "9h", "5h"] },
  { key: "Monotone-T-high",    cards: ["Th", "8h", "3h"] },
  { key: "Two-tone-A-high",    cards: ["Ah", "Kh", "7d"] },
  { key: "Two-tone-Q-high",    cards: ["Qd", "Jd", "4c"] },
  { key: "Dry-9-high",         cards: ["9c", "5d", "2h"] },
];

export function CbetTrainer() {
  const progress = useProgress();
  const [spotIdx, setSpotIdx] = useState(() => pickSpot(progress.srs));
  const [reveal, setReveal] = useState<CbetAction | null>(null);
  const [randomMode, setRandomMode] = useState(false);
  const [randomCards, setRandomCards] = useState<string[]>(() => randomBoard(3));

  const cards = randomMode ? randomCards : SPOTS[spotIdx].cards;
  const spotKey = randomMode ? `random:${cards.join("")}` : SPOTS[spotIdx].key;
  const result = cbetDecision({ cards });
  const card = progress.srs[`${DRILL_ID}:${spotKey}`];

  const choose = (a: CbetAction) => {
    setReveal(a);
    progressStore.recordDrill(DRILL_ID, a === result.action, spotKey);
  };

  const next = () => {
    if (randomMode) {
      setRandomCards(randomBoard(3));
    } else {
      setSpotIdx(pickSpot(progress.srs, spotIdx));
    }
    setReveal(null);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">C-Bet Decision Trainer</h1>
        <p className="text-chip-ivory/70 text-sm">
          You opened preflop and BB called. Flop comes. Choose your c-bet sizing or check.
        </p>
      </header>

      <section className="felt-panel p-3 sm:p-4 flex items-center justify-between">
        <div className="text-xs text-chip-ivory/60">
          {randomMode ? "Random board mode (no SR scenario)" : `Curated board: ${SPOTS[spotIdx].key.replace(/-/g, " ")}`}
        </div>
        <button
          className="btn-ghost text-xs"
          onClick={() => { setRandomMode(m => !m); setReveal(null); setRandomCards(randomBoard(3)); }}
        >
          {randomMode ? "Use curated boards" : "Random boards"}
        </button>
      </section>

      <section className="felt-panel p-6 space-y-5">
        <div className="flex justify-center gap-2 sm:gap-3">
          {cards.map(c => (
            <PlayingCard key={c} card={parseCard(c)} size="lg" />
          ))}
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
                  a === "cbet-small" && "bg-chip-gold/80 text-felt-900 border-chip-gold",
                  a === "cbet-large" && "bg-amber-600/40 text-chip-ivory border-amber-500/60",
                  a === "check"      && "bg-felt-700/60 text-chip-ivory border-felt-600",
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
              <button className="btn" onClick={next}>Next board →</button>
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
  const idx = weightedPick(SPOTS.map((_, i) => i), weights);
  return idx;
}

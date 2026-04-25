import { useState } from "react";
import clsx from "clsx";
import { progressStore, useProgress } from "../../store/progress";
import { pickWeight, weightedPick, type SrsCard } from "../../lib/srs";
import { riverDecision, type RiverAction } from "../../lib/postflop";
import { postflopEvLossBbPer100 } from "../../lib/solver";
import { PlayingCard } from "../../components/Card";
import { parseCard } from "../../lib/poker";

const DRILL_ID = "river";
const ACTIONS: RiverAction[] = ["call", "fold"];
const ACTION_LABEL: Record<RiverAction, string> = {
  call: "Call",
  fold: "Fold",
};

// Each spot: a board, hero's bluff catcher, pot, bet, villain's range composition.
// `bluffPct` is the share of villain's range that is a pure bluff (we have any equity vs).
interface RiverSpot {
  key: string;
  board: string[];
  hero: string[];
  potBefore: number;
  bet: number;
  bluffPct: number;     // 0-100
  comboNarrative: string;
}

const SPOTS: RiverSpot[] = [
  {
    key: "Ace-blocker-half-pot",
    board: ["Ah", "Kd", "7c", "5s", "2h"],
    hero:  ["Ac", "Tc"],
    potBefore: 100, bet: 50, bluffPct: 28,
    comboNarrative:
      "You have an ace blocker on a dry-ish runout. Villain's small bet polarizes — value: KK, AK, sets, two-pair (≈14 combos); bluffs: missed JT/QT (≈5 combos).",
  },
  {
    key: "Bluff-catch-overbet",
    board: ["Qh", "Jh", "5c", "2d", "9s"],
    hero:  ["Qc", "9d"],
    potBefore: 100, bet: 150, bluffPct: 18,
    comboNarrative:
      "Villain overbets. Polarized — mostly straights/sets and rare missed flush draws. Top pair is a thin call only if villain bluffs ≥40%.",
  },
  {
    key: "Flush-board-medium",
    board: ["Ks", "8s", "3s", "4d", "Jc"],
    hero:  ["Ac", "Kh"],
    potBefore: 80, bet: 60, bluffPct: 35,
    comboNarrative:
      "3 spades on board. You have top pair, no spade. Villain's range: many flushes (heavy value) but also many missed draws and air. ~35% bluffs is realistic.",
  },
  {
    key: "Paired-board-thin-call",
    board: ["9c", "9d", "5h", "2c", "Kh"],
    hero:  ["Tc", "9h"],
    potBefore: 80, bet: 40, bluffPct: 32,
    comboNarrative:
      "Trip 9s with a weak kicker. Villain's range: some 9x value (Qx9x, KK, K9), some bluffs. Half-pot bet keeps lots of bluffs in.",
  },
  {
    key: "Straight-completed-fold",
    board: ["8c", "7d", "6h", "5s", "2c"],
    hero:  ["Ad", "8h"],
    potBefore: 100, bet: 75, bluffPct: 12,
    comboNarrative:
      "4-straight on board. Top pair is a bluff catcher only against air — but villain's range here is mostly value (9x, sets, two-pair).",
  },
  {
    key: "Big-bluff-frequency-call",
    board: ["Td", "9d", "5c", "Jc", "2h"],
    hero:  ["Kh", "Tc"],
    potBefore: 100, bet: 50, bluffPct: 38,
    comboNarrative:
      "Multiway draws missed; many bluff combos. With top pair on a connected board you should call vs a half-pot bet.",
  },
  {
    key: "Small-bet-merge",
    board: ["Ah", "8s", "5d", "2c", "Tc"],
    hero:  ["8c", "9c"],
    potBefore: 100, bet: 33, bluffPct: 24,
    comboNarrative:
      "Villain's small bet merges thin value (Ax) with some bluffs. Required equity is only ~20%.",
  },
];

export function RiverDecisionTrainer() {
  const progress = useProgress();
  const [spotIdx, setSpotIdx] = useState(() => pickSpot(progress.srs));
  const [reveal, setReveal] = useState<RiverAction | null>(null);
  const spot = SPOTS[spotIdx];
  const result = riverDecision(spot.potBefore, spot.bet, spot.bluffPct);
  const card = progress.srs[`${DRILL_ID}:${spot.key}`];

  const choose = (a: RiverAction) => {
    setReveal(a);
    const ok = a === result.action;
    progressStore.recordDrill(DRILL_ID, ok, spot.key, postflopEvLossBbPer100(ok, 3.0));
  };
  const next = () => {
    setSpotIdx(pickSpot(progress.srs, spotIdx));
    setReveal(null);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">River Decision Trainer</h1>
        <p className="text-chip-ivory/70 text-sm">
          You hold a bluff catcher. Villain bets. Bluff frequency vs pot odds — call or fold?
        </p>
      </header>

      <section className="felt-panel p-6 space-y-5">
        <div className="space-y-3">
          <div className="text-[11px] uppercase tracking-widest text-chip-ivory/50 text-center">Hero's hand</div>
          <div className="flex justify-center gap-2">
            {spot.hero.map(c => <PlayingCard key={c} card={parseCard(c)} size="md" highlight />)}
          </div>
          <div className="text-[11px] uppercase tracking-widest text-chip-ivory/50 text-center pt-2">Board</div>
          <div className="flex justify-center gap-1.5 sm:gap-2">
            {spot.board.map(c => <PlayingCard key={c} card={parseCard(c)} size="sm" />)}
          </div>
        </div>

        <div className="text-center text-sm bg-felt-900/60 p-3 rounded-lg">
          Pot: <strong className="text-chip-gold">${spot.potBefore}</strong> ·
          {" "}Villain bets <strong className="text-chip-gold">${spot.bet}</strong>
          {" "}({Math.round((spot.bet / spot.potBefore) * 100)}% pot)
        </div>

        {card && card.attempts > 0 && (
          <div className="text-[11px] text-chip-ivory/50 text-center">
            Seen {card.attempts}× · {Math.round((card.correct / card.attempts) * 100)}% correct
          </div>
        )}

        {reveal === null ? (
          <div className="grid grid-cols-2 gap-2">
            {ACTIONS.map(a => (
              <button
                key={a}
                onClick={() => choose(a)}
                className={clsx(
                  "px-3 py-3 rounded-lg font-semibold border min-h-[52px]",
                  a === "call" ? "bg-chip-gold/90 text-felt-900 border-chip-gold" : "bg-felt-700/60 text-chip-ivory border-felt-600",
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
              <div className="text-xs text-chip-gold uppercase tracking-wider">Math + range read</div>
              <ul className="text-chip-ivory/85 space-y-1 list-disc list-inside">
                {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
              <div className="text-[11px] text-chip-ivory/65 pt-2 border-t border-felt-700/50">
                {spot.comboNarrative}
              </div>
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

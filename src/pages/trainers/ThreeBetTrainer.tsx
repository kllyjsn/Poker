import { useState } from "react";
import clsx from "clsx";
import { allStartingHands } from "../../lib/poker";
import { pickWeight, weightedPick } from "../../lib/srs";
import { progressStore, useProgress } from "../../store/progress";
import {
  threeBetAction,
  threeBetRange,
  threeBetSpots,
  type HeroPos,
  type RaiserPos,
  type ThreeBetAction,
} from "../../lib/threebet";
import { postflopEvLossBbPer100 } from "../../lib/solver";

const DRILL_ID = "3bet";

const ACTION_LABEL: Record<ThreeBetAction, string> = {
  "3bet-value": "3-Bet (Value)",
  "3bet-bluff": "3-Bet (Bluff)",
  "call":       "Call",
  "fold":       "Fold",
};

const ACTIONS: ThreeBetAction[] = ["3bet-value", "3bet-bluff", "call", "fold"];

export function ThreeBetTrainer() {
  const spots = threeBetSpots();
  const [spotIdx, setSpotIdx] = useState(0);
  const spot = spots[spotIdx];
  const progress = useProgress();

  const range = threeBetRange(spot.hero, spot.raiser);

  const pickHand = (): string => {
    const hands = allStartingHands();
    const weights = hands.map(h => pickWeight(progress.srs[`${DRILL_ID}:${spot.label}:${h}`]));
    return weightedPick(hands, weights);
  };

  const [hand, setHand] = useState(() => pickHand());
  const [reveal, setReveal] = useState<ThreeBetAction | null>(null);
  const correct = threeBetAction(spot.hero, spot.raiser, hand);
  const card = progress.srs[`${DRILL_ID}:${spot.label}:${hand}`];

  const choose = (action: ThreeBetAction) => {
    setReveal(action);
    const ok = action === correct;
    progressStore.recordDrill(
      DRILL_ID, ok, `${spot.label}:${hand}`, postflopEvLossBbPer100(ok, 5.0),
    );
  };

  const next = () => {
    setHand(pickHand());
    setReveal(null);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">3-Bet / Defense Trainer</h1>
        <p className="text-chip-ivory/70 text-sm">
          Hero faces a raise. Choose: 3-bet for value, 3-bet as a bluff, flat call, or fold.
          Spaced repetition surfaces hands you miss.
        </p>
      </header>

      <section className="felt-panel p-3 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {spots.map((s, i) => (
            <button
              key={s.label}
              className={clsx(
                "px-2 py-2 rounded-lg text-sm font-semibold min-h-[44px]",
                i === spotIdx
                  ? "bg-chip-gold text-felt-900"
                  : "border border-felt-600 hover:bg-felt-700/60",
              )}
              onClick={() => { setSpotIdx(i); setReveal(null); setHand(pickHand()); }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      <section className="felt-panel p-6 space-y-5">
        <div className="text-xs text-chip-ivory/60 uppercase tracking-widest text-center">
          You're {posLabel(spot.hero)}, {posLabel(spot.raiser)} opens.
        </div>
        <div className="text-center text-6xl sm:text-7xl font-mono font-bold text-chip-gold py-4">
          {hand}
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
                  a === "3bet-value" && "bg-chip-gold/90 text-felt-900 border-chip-gold",
                  a === "3bet-bluff" && "bg-amber-700/40 text-chip-ivory border-amber-600/60",
                  a === "call"       && "bg-felt-700/60 text-chip-ivory border-felt-600",
                  a === "fold"       && "bg-felt-900/60 text-chip-ivory/80 border-felt-700",
                )}
              >
                {ACTION_LABEL[a]}
              </button>
            ))}
          </div>
        ) : (
          <ResultPanel
            spot={spot}
            hand={hand}
            chosen={reveal}
            correct={correct}
            range={range}
            onNext={next}
          />
        )}
      </section>
    </div>
  );
}

function ResultPanel({
  spot, hand, chosen, correct, range, onNext,
}: {
  spot: { hero: HeroPos; raiser: RaiserPos; label: string };
  hand: string;
  chosen: ThreeBetAction;
  correct: ThreeBetAction;
  range: ReturnType<typeof threeBetRange>;
  onNext: () => void;
}) {
  const ok = chosen === correct;
  return (
    <div className="space-y-4">
      <div className={clsx(
        "text-center text-lg font-semibold",
        ok ? "text-chip-gold" : "text-chip-red",
      )}>
        {ok ? "Correct ✓" : "Incorrect ✗"} — Best line: <strong>{ACTION_LABEL[correct]}</strong>
      </div>
      <div className="bg-felt-900/60 p-4 rounded-lg space-y-2 text-sm">
        <div className="text-xs text-chip-gold uppercase tracking-wider">Why</div>
        <div className="text-chip-ivory/85">{rationale(spot, hand, correct)}</div>
        {range && (
          <div className="text-[11px] text-chip-ivory/60 pt-2 border-t border-felt-700/50">
            <span className="font-semibold">{spot.label} ranges</span> ·
            {" "}3-bet value: {range.value.size} · 3-bet bluff: {range.bluff.size} ·
            {" "}call: {range.call.size} ·
            {" "}fold: {169 - (range.value.size + range.bluff.size + range.call.size)}
          </div>
        )}
      </div>
      <div className="flex justify-center">
        <button className="btn" onClick={onNext}>Next hand →</button>
      </div>
    </div>
  );
}

function posLabel(p: string): string {
  if (p === "BB") return "in the BB";
  if (p === "SB") return "in the SB";
  return `in the ${p}`;
}

function rationale(
  spot: { hero: HeroPos; raiser: RaiserPos },
  hand: string,
  correct: ThreeBetAction,
): string {
  const handRef = `${hand}`;
  switch (correct) {
    case "3bet-value":
      return `${handRef} is at the top of your range vs a ${spot.raiser} open. Always 3-bet for value — call too often and you cap your range, which villain can exploit on later streets.`;
    case "3bet-bluff":
      return `${handRef} works better as a 3-bet bluff than a call: it has card-removal effects (blocks villain's calling/4-bet range) and plays poorly multiway. Polarize: 3-bet or fold.`;
    case "call":
      return `${handRef} flats: it has too much equity to fold but isn't strong enough to 3-bet for value. In position, calling realizes equity and keeps villain's bluffs in.`;
    case "fold":
      return `${handRef} is dominated and folds vs a ${spot.raiser} open. Defending too wide here is a major leak — the marginal hands you'd add bleed money in 3-bet pots and against postflop aggression.`;
  }
}

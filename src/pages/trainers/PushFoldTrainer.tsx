import { useMemo, useState } from "react";
import clsx from "clsx";
import { allStartingHands } from "../../lib/poker";
import { pickWeight, weightedPick, type SrsCard } from "../../lib/srs";
import { progressStore, useProgress } from "../../store/progress";
import {
  nashShoveRange,
  shoveAction,
  SHOVE_POSITIONS,
  SHOVE_STACKS,
  type ShovePos,
  type ShoveStack,
} from "../../lib/pushfold";

const DRILL_ID = "push-fold";

export function PushFoldTrainer() {
  const progress = useProgress();
  const [pos, setPos] = useState<ShovePos>("BTN");
  const [stack, setStack] = useState<ShoveStack>(10);
  const [mode, setMode] = useState<"chart" | "quiz">("chart");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">MTT Push / Fold Trainer</h1>
        <p className="text-chip-ivory/70 text-sm">
          Short-stack Nash equilibrium. Action folds to you — shove all-in or fold?
        </p>
      </header>

      <section className="felt-panel p-3 sm:p-4 space-y-3">
        <div className="grid grid-cols-5 gap-2">
          {SHOVE_POSITIONS.map(p => (
            <button
              key={p}
              onClick={() => setPos(p)}
              className={clsx(
                "px-2 py-2 rounded-lg font-semibold text-sm min-h-[44px]",
                pos === p ? "bg-chip-gold text-felt-900" : "border border-felt-600 hover:bg-felt-700/60",
              )}
            >{p}</button>
          ))}
        </div>
        <div className="grid grid-cols-6 gap-2">
          {SHOVE_STACKS.map(s => (
            <button
              key={s}
              onClick={() => setStack(s)}
              className={clsx(
                "px-2 py-2 rounded-lg font-semibold text-sm min-h-[44px]",
                stack === s ? "bg-chip-gold text-felt-900" : "border border-felt-600 hover:bg-felt-700/60",
              )}
            >{s}bb</button>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <button className={mode === "chart" ? "btn" : "btn-ghost"} onClick={() => setMode("chart")}>Chart</button>
          <button className={mode === "quiz" ? "btn" : "btn-ghost"} onClick={() => setMode("quiz")}>Quiz</button>
        </div>
      </section>

      {mode === "chart" ? <ChartView pos={pos} stack={stack} /> : <QuizView pos={pos} stack={stack} progressSrs={progress.srs} />}
    </div>
  );
}

function ChartView({ pos, stack }: { pos: ShovePos; stack: ShoveStack }) {
  const range = useMemo(() => nashShoveRange(pos, stack), [pos, stack]);
  const RANKS = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];

  return (
    <section className="felt-panel p-3 sm:p-4">
      <div className="text-xs text-chip-gold uppercase tracking-wider mb-2">
        Nash shove range · {pos} · {stack}bb · {range.size} / 169 hands ({Math.round(range.size / 169 * 100)}%)
      </div>
      <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 pb-1">
        <table className="border-collapse mx-auto table-fixed text-[10px] sm:text-xs min-w-[26rem] sm:min-w-0">
          <tbody>
            {RANKS.map((rRank, r) => (
              <tr key={r}>
                {RANKS.map((cRank, c) => {
                  const hi = r <= c ? rRank : cRank;
                  const lo = r <= c ? cRank : rRank;
                  let key: string;
                  if (r === c) key = `${hi}${lo}`;
                  else if (c > r) key = `${hi}${lo}s`;
                  else key = `${hi}${lo}o`;
                  const inRange = range.has(key);
                  return (
                    <td
                      key={c}
                      className={clsx(
                        "font-mono font-semibold border border-felt-900 text-center w-8 h-8 sm:w-10 sm:h-10",
                        inRange ? "bg-chip-gold/80 text-felt-900" : "bg-felt-800 text-chip-ivory/50",
                        r === c ? "!bg-felt-700" : "",
                        inRange && r === c ? "!bg-chip-gold !text-felt-900" : "",
                      )}
                    >
                      {key}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-[10px] text-chip-ivory/40 text-center pt-1 sm:hidden">Scroll to see full matrix →</div>
      </div>
      <div className="text-xs text-chip-ivory/60 pt-3">
        Gold = shove, gray = fold. Ranges widen as stacks shrink and as position improves.
      </div>
    </section>
  );
}

function QuizView({
  pos, stack, progressSrs,
}: {
  pos: ShovePos;
  stack: ShoveStack;
  progressSrs: Record<string, SrsCard>;
}) {
  const pickHand = (): string => {
    const hands = allStartingHands();
    const weights = hands.map(h => pickWeight(progressSrs[`${DRILL_ID}:${pos}-${stack}bb:${h}`]));
    return weightedPick(hands, weights);
  };

  const [hand, setHand] = useState(() => pickHand());
  const [reveal, setReveal] = useState<null | "shove" | "fold">(null);
  const correct = shoveAction(pos, stack, hand);
  const card = progressSrs[`${DRILL_ID}:${pos}-${stack}bb:${hand}`];

  const choose = (a: "shove" | "fold") => {
    setReveal(a);
    progressStore.recordDrill(DRILL_ID, a === correct, `${pos}-${stack}bb:${hand}`);
  };
  const next = () => {
    setHand(pickHand());
    setReveal(null);
  };

  return (
    <section className="felt-panel p-6 space-y-5">
      <div className="text-xs text-chip-ivory/60 uppercase tracking-widest text-center">
        {pos} · {stack}bb stack · folds to you
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
        <div className="grid grid-cols-2 gap-3">
          <button className="btn" onClick={() => choose("shove")}>Shove all-in</button>
          <button className="btn-danger" onClick={() => choose("fold")}>Fold</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className={clsx(
            "text-center text-lg font-semibold",
            reveal === correct ? "text-chip-gold" : "text-chip-red",
          )}>
            {reveal === correct ? "Correct ✓" : "Incorrect ✗"} — Nash says <strong>{correct.toUpperCase()}</strong>
          </div>
          <div className="bg-felt-900/60 p-4 rounded-lg space-y-1 text-sm">
            <div className="text-xs text-chip-gold uppercase tracking-wider">Why</div>
            <div className="text-chip-ivory/85">
              {correct === "shove"
                ? `${hand} is in the Nash shove range from ${pos} at ${stack}bb. Folding is a clear EV mistake — you'd be passing up positive expected value.`
                : `${hand} is too weak to shove ${stack}bb from ${pos}. Shoving here is dominated by villains' calling ranges and burns equity needed for ICM survival.`}
            </div>
            <div className="text-[11px] text-chip-ivory/60 pt-2 border-t border-felt-700/50">
              At {stack}bb, {pos} shoves {nashShoveRange(pos, stack).size}/169 hands ({Math.round(nashShoveRange(pos, stack).size / 169 * 100)}%).
              Compare: {pos} at 5bb shoves {nashShoveRange(pos, 5).size}, at 20bb shoves {nashShoveRange(pos, 20).size}.
            </div>
          </div>
          <div className="flex justify-center">
            <button className="btn" onClick={next}>Next hand →</button>
          </div>
        </div>
      )}
    </section>
  );
}

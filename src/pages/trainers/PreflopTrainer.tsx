import { useMemo, useState } from "react";
import clsx from "clsx";
import type { Position } from "../../lib/ranges";
import { openingRange, rangeMatrix } from "../../lib/ranges";
import { allStartingHands } from "../../lib/poker";
import { pickWeight, weightedPick } from "../../lib/srs";
import { rfiFrequency, rfiBestAction, rfiEvLossBbPer100, freqLabel } from "../../lib/solver";
import { progressStore, useProgress } from "../../store/progress";

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
      <header className="flex items-start justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Preflop Range Trainer</h1>
          <p className="text-chip-ivory/70">
            Opening ranges (RFI) at 100bb, 6-max. Chart to study, quiz to drill.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
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

      <section className="felt-panel p-3 sm:p-4">
        <div className="grid grid-cols-5 gap-2">
          {POSITIONS.map(p => (
            <button
              key={p}
              className={clsx(
                "px-2 sm:px-4 py-2 rounded-lg font-semibold transition min-h-[44px]",
                position === p
                  ? "bg-chip-gold text-felt-900"
                  : "border border-felt-600 hover:bg-felt-700/60",
              )}
              onClick={() => setPosition(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="text-xs text-chip-ivory/60 pt-2">
          {POSITION_DESC[position]}
        </div>
      </section>

      {mode === "chart" ? <ChartView position={position} /> : <QuizView position={position} />}
    </div>
  );
}

function ChartView({ position }: { position: Position }) {
  const matrix = useMemo(() => rangeMatrix(position), [position]);
  // Compute total weighted hands (frequency * 1) — i.e., the expected
  // open count under the mixed strategy.
  const weightedCount = useMemo(() => {
    let n = 0;
    for (const row of matrix) for (const cell of row) n += rfiFrequency(position, cell.key);
    return n;
  }, [matrix, position]);
  return (
    <section className="felt-panel p-3 sm:p-4">
      <div className="text-xs text-chip-gold uppercase tracking-wider mb-2">
        Opening frequency · {weightedCount.toFixed(1)} / 169 hands ({Math.round(weightedCount / 169 * 100)}%)
      </div>
      <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 pb-1">
        <table className="border-collapse mx-auto table-fixed text-[10px] sm:text-xs min-w-[26rem] sm:min-w-0">
          <tbody>
            {matrix.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => {
                  const freq = rfiFrequency(position, cell.key);
                  return (
                    <td
                      key={c}
                      className={clsx(
                        "font-mono font-semibold border border-felt-900 text-center",
                        "w-8 h-8 sm:w-10 sm:h-10",
                        freq > 0
                          ? freq >= 0.99
                            ? "bg-chip-gold text-felt-900"
                            : freq >= 0.6
                              ? "bg-chip-gold/75 text-felt-900"
                              : freq >= 0.3
                                ? "bg-chip-gold/45 text-felt-900"
                                : "bg-chip-gold/20 text-chip-ivory"
                          : "bg-felt-800 text-chip-ivory/50",
                        r === c && freq === 0 ? "!bg-felt-700" : "",
                      )}
                      title={`${cell.key} · ${Math.round(freq * 100)}%`}
                    >
                      {cell.key}
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
        Gold intensity = raise frequency. Solid = always raise; faded = mixed strategy. Diagonal = pairs.
      </div>
    </section>
  );
}

function QuizView({ position }: { position: Position }) {
  const progress = useProgress();

  // SR-weighted hand selection: hands the user tends to miss come back
  // more often. New hands (never seen) get baseline weight 1.
  const pickNextHand = (): string => {
    const hands = allStartingHands();
    const weights = hands.map(h => {
      const card = progress.srs[`preflop:${position}:${h}`];
      return pickWeight(card);
    });
    return weightedPick(hands, weights);
  };

  const [hand, setHand] = useState<string>(() => pickNextHand());
  const [reveal, setReveal] = useState<null | "raise" | "fold">(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const equilibriumFreq = rfiFrequency(position, hand);
  const correct: "raise" | "fold" = rfiBestAction(position, hand);
  const scenarioKey = `${position}:${hand}`;
  const card = progress.srs[`preflop:${scenarioKey}`];

  // Which positions open this hand? Useful context on the reveal.
  const openedBy = useMemo(() => {
    return POSITIONS.filter(p => openingRange(p).has(hand));
  }, [hand]);

  const [lastEvLoss, setLastEvLoss] = useState<number | null>(null);

  const answer = (guess: "raise" | "fold") => {
    setReveal(guess);
    const ok = guess === correct;
    const evLoss = rfiEvLossBbPer100(equilibriumFreq, guess);
    setLastEvLoss(evLoss);
    progressStore.recordDrill("preflop", ok, scenarioKey, evLoss);
    if (ok) {
      const s = streak + 1;
      setStreak(s);
      if (s > best) setBest(s);
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    setHand(pickNextHand());
    setReveal(null);
  };

  return (
    <section className="felt-panel p-6 space-y-5">
      <div className="flex justify-between text-sm">
        <div>Position: <strong className="text-chip-gold">{position}</strong></div>
        <div>Streak: <strong className="text-chip-gold">{streak}</strong> · Best: {best}</div>
      </div>

      <div className="text-center py-6 sm:py-8">
        <div className="text-xs text-chip-ivory/60 uppercase tracking-widest mb-3">
          First in, action on you. Raise or fold?
        </div>
        <div className="text-6xl sm:text-7xl font-mono font-bold text-chip-gold">
          {hand}
        </div>
        {card && card.attempts > 0 && (
          <div className="text-[11px] text-chip-ivory/50 mt-2">
            Seen {card.attempts}× · {Math.round((card.correct / card.attempts) * 100)}% correct
          </div>
        )}
      </div>

      {reveal === null ? (
        <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-center">
          <button className="btn" onClick={() => answer("raise")}>Raise</button>
          <button className="btn-danger" onClick={() => answer("fold")}>Fold</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className={clsx(
            "text-center text-lg font-semibold",
            reveal === correct ? "text-chip-gold" : "text-chip-red",
          )}>
            {reveal === correct ? "Correct \u2713" : "Incorrect \u2717"}
            {" — "}
            Equilibrium says <strong>{correct.toUpperCase()}</strong> from {position}.
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-felt-900/60 rounded-lg p-3 text-center">
              <div className="text-[10px] uppercase tracking-widest text-chip-ivory/50">Equilibrium frequency</div>
              <FrequencyBar freq={equilibriumFreq} />
              <div className="text-xs text-chip-ivory/80 mt-1">{freqLabel(equilibriumFreq)}</div>
            </div>
            <div className="bg-felt-900/60 rounded-lg p-3 text-center">
              <div className="text-[10px] uppercase tracking-widest text-chip-ivory/50">Your EV loss</div>
              <div className={clsx(
                "text-2xl font-bold mt-1",
                (lastEvLoss ?? 0) === 0 ? "text-chip-gold" : "text-chip-red",
              )}>
                {lastEvLoss === 0 || lastEvLoss === null ? "0" : `−${lastEvLoss.toFixed(2)}`}
              </div>
              <div className="text-[10px] text-chip-ivory/50">bb / 100 hands</div>
            </div>
          </div>

          <div className="felt-panel bg-felt-900/60 p-4 space-y-3">
            <div className="text-xs text-chip-gold uppercase tracking-wider">Why</div>
            <div className="text-sm text-chip-ivory/85">
              {openedBy.length === 0 ? (
                <><strong>{hand}</strong> is <em>not</em> opened from any position at 6-max 100bb. It's too weak to RFI.</>
              ) : openedBy.length === 5 ? (
                <><strong>{hand}</strong> is strong enough to open from <strong>every position</strong> (including UTG). Always raise.</>
              ) : (
                <>
                  <strong>{hand}</strong> opens from:{" "}
                  {openedBy.map((p, i) => (
                    <span key={p}>
                      <strong className="text-chip-gold">{p}</strong>{i < openedBy.length - 1 ? ", " : ""}
                    </span>
                  ))}
                  . Folds from tighter seats.
                </>
              )}
            </div>
            <PositionBar hand={hand} />
            <div className="text-[11px] text-chip-ivory/60">
              {classifyHand(hand)}
            </div>
          </div>

          <div className="flex justify-center">
            <button className="btn" onClick={next}>Next hand &rarr;</button>
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * Visual frequency bar showing the equilibrium raise frequency.
 * Gold = raise share, dim = fold share.
 */
function FrequencyBar({ freq }: { freq: number }) {
  const raisePct = Math.round(freq * 100);
  return (
    <div className="mt-2 h-3 w-full rounded-full bg-felt-800 overflow-hidden border border-felt-700">
      <div
        className="h-full bg-chip-gold transition-all"
        style={{ width: `${raisePct}%` }}
      />
    </div>
  );
}

/** Horizontal bar showing which of the 5 positions open this hand. */
function PositionBar({ hand }: { hand: string }) {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {POSITIONS.map(p => {
        const included = openingRange(p).has(hand);
        return (
          <div
            key={p}
            className={clsx(
              "text-[10px] font-bold text-center py-1.5 rounded-md border",
              included
                ? "bg-chip-gold/80 text-felt-900 border-chip-gold"
                : "bg-felt-800/60 text-chip-ivory/40 border-felt-700",
            )}
          >
            {p}
          </div>
        );
      })}
    </div>
  );
}

/** Short textual note about the hand family (pairs, suited aces, etc.). */
function classifyHand(hand: string): string {
  if (hand.length === 2) {
    const r = hand[0];
    if ("AKQJ".includes(r)) return "Big pair — premium, 3-bet for value everywhere.";
    if ("T98".includes(r)) return "Middle pair — strong opens, cautious vs 3-bets.";
    return "Small pair — open in late position to setmine.";
  }
  const suited = hand.endsWith("s");
  if (hand.startsWith("A") && suited) return "Suited ace — blocker value + flush / wheel potential.";
  if (hand.startsWith("A") && !suited) return "Offsuit ace — weaker; folds in early position.";
  if (hand.startsWith("K") && suited) return "Suited king — premium Broadway, opens widely.";
  if (suited) return "Suited hand — playable for postflop equity (flushes, connectors).";
  return "Offsuit hand — needs rank strength to profitably open.";
}

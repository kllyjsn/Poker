import { useState } from "react";
import { evCall, mdf, potOdds } from "../../lib/odds";
import { progressStore } from "../../store/progress";

interface Scenario {
  pot: number;
  bet: number;
  equity: number;  // 0..100 ("you estimate X% equity")
  /** Scenario class for SRS, e.g. "bet-1/2-pot". */
  scenarioKey: string;
}

const BET_FRACS = [
  { frac: 1 / 3, label: "1/3 pot" },
  { frac: 1 / 2, label: "1/2 pot" },
  { frac: 2 / 3, label: "2/3 pot" },
  { frac: 3 / 4, label: "3/4 pot" },
  { frac: 1,     label: "pot" },
  { frac: 1.5,   label: "overbet 1.5x" },
];

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeScenario(): Scenario {
  const pot = rand(5, 50) * 10; // 50..500
  const bucket = BET_FRACS[rand(0, BET_FRACS.length - 1)];
  const bet = Math.round(pot * bucket.frac / 5) * 5 || 5;
  const equity = rand(15, 55);
  return { pot, bet, equity, scenarioKey: bucket.label };
}

export function PotOddsTrainer() {
  const [s, setS] = useState<Scenario>(() => makeScenario());
  const [reveal, setReveal] = useState(false);
  const [streak, setStreak] = useState(0);

  const requiredPct = Math.round(potOdds(s.bet, s.pot) * 100);
  const defendFreq = Math.round(mdf(s.bet, s.pot) * 100);
  const correctAnswer: "call" | "fold" = s.equity >= requiredPct ? "call" : "fold";
  const evIfCall = evCall({ equity: s.equity / 100, pot: s.pot, toCall: s.bet });

  const answer = (guess: "call" | "fold") => {
    setReveal(true);
    const ok = guess === correctAnswer;
    progressStore.recordDrill("pot-odds", ok, s.scenarioKey);
    setStreak(ok ? streak + 1 : 0);
  };

  const next = () => {
    setS(makeScenario());
    setReveal(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pot Odds Trainer</h1>
          <p className="text-chip-ivory/70">
            Given villain's bet and your equity estimate — call or fold?
          </p>
        </div>
        <div className="text-sm">Streak: <strong className="text-chip-gold">{streak}</strong></div>
      </header>

      <section className="felt-panel p-6 space-y-5">
        <div className="stat-grid">
          <Info label="Pot" value={`$${s.pot}`} />
          <Info label="Villain bets" value={`$${s.bet}`} detail={s.scenarioKey} />
          <Info label="To call" value={`$${s.bet}`} />
          <Info label="Your equity" value={`${s.equity}%`} />
        </div>

        {!reveal ? (
          <div className="grid grid-cols-2 sm:flex sm:justify-center gap-3">
            <button className="btn" onClick={() => answer("call")}>Call</button>
            <button className="btn-danger" onClick={() => answer("fold")}>Fold</button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className={correctAnswer === "call"
              ? "text-chip-gold font-semibold text-lg"
              : "text-chip-red font-semibold text-lg"}>
              Correct answer: {correctAnswer.toUpperCase()}
              {" "}({s.equity >= requiredPct
                ? `+${s.equity - requiredPct}% over the threshold`
                : `${requiredPct - s.equity}% short`})
            </div>
            <div className="felt-panel p-4 text-sm space-y-1.5 bg-felt-900/60">
              <div>
                Pot odds = <span className="font-mono">{s.bet} / ({s.pot} + {s.bet} + {s.bet}) = {requiredPct}%</span>
              </div>
              <div>
                Required equity: <strong>{requiredPct}%</strong> · You have: <strong>{s.equity}%</strong>
              </div>
              <div>
                EV of a call (at your equity):{" "}
                <strong className={evIfCall >= 0 ? "text-chip-gold" : "text-chip-red"}>
                  {evIfCall >= 0 ? "+" : ""}${evIfCall.toFixed(2)}
                </strong>
              </div>
              <div className="text-chip-ivory/70">MDF (defense frequency vs this bet): {defendFreq}%</div>
            </div>
            <button className="btn" onClick={next}>Next &rarr;</button>
          </div>
        )}
      </section>

      <section className="felt-panel p-5 text-sm text-chip-ivory/70">
        <strong className="text-chip-ivory">Reference points:</strong>{" "}
        1/3 pot = 20% · 1/2 pot = 25% · 2/3 pot = 29% · pot = 33% · 1.5x pot = 38%.
      </section>
    </div>
  );
}

function Info({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="felt-panel p-3">
      <div className="text-xs text-chip-ivory/60 uppercase tracking-wider">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
      {detail && <div className="text-[10px] text-chip-ivory/50 mt-0.5">{detail}</div>}
    </div>
  );
}

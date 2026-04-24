import { useMemo, useState } from "react";
import { icmEquities } from "../../lib/icm";

export function ICMTrainer() {
  const [stacksStr, setStacksStr] = useState("50, 30, 20");
  const [payoutsStr, setPayoutsStr] = useState("50, 30, 20");

  const { stacks, payouts } = useMemo(() => ({
    stacks: parseNums(stacksStr),
    payouts: parseNums(payoutsStr),
  }), [stacksStr, payoutsStr]);

  const equities = useMemo(() => {
    if (stacks.length === 0 || payouts.length === 0) return [];
    return icmEquities(stacks, payouts);
  }, [stacks, payouts]);

  const totalChips = stacks.reduce((a, b) => a + b, 0);
  const totalPrize = payouts.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">ICM Calculator</h1>
        <p className="text-chip-ivory/70">
          Malmuth-Harville. Enter chip stacks and payout structure (comma-separated).
        </p>
      </header>

      <section className="felt-panel p-4 sm:p-5 space-y-4">
        <div>
          <label className="text-xs text-chip-gold uppercase tracking-wider block mb-1">
            Chip Stacks
          </label>
          <input
            value={stacksStr}
            onChange={e => setStacksStr(e.target.value)}
            className="w-full bg-felt-900 border border-felt-600 rounded-lg px-3 py-2 font-mono"
            placeholder="50, 30, 20"
          />
        </div>
        <div>
          <label className="text-xs text-chip-gold uppercase tracking-wider block mb-1">
            Payouts
          </label>
          <input
            value={payoutsStr}
            onChange={e => setPayoutsStr(e.target.value)}
            className="w-full bg-felt-900 border border-felt-600 rounded-lg px-3 py-2 font-mono"
            placeholder="50, 30, 20"
          />
        </div>
        <div className="flex gap-2 flex-wrap text-xs">
          <PresetButton
            label="3-way FT"
            onClick={() => { setStacksStr("50, 30, 20"); setPayoutsStr("50, 30, 20"); }}
          />
          <PresetButton
            label="Bubble 4-way"
            onClick={() => { setStacksStr("70, 20, 15, 10"); setPayoutsStr("50, 30, 20, 0"); }}
          />
          <PresetButton
            label="Short vs big"
            onClick={() => { setStacksStr("80, 10, 10"); setPayoutsStr("50, 30, 20"); }}
          />
          <PresetButton
            label="9-max final"
            onClick={() => {
              setStacksStr("30, 20, 18, 12, 10, 6, 2, 1, 1");
              setPayoutsStr("30, 20, 14, 10, 8, 6, 5, 4, 3");
            }}
          />
        </div>
      </section>

      <section className="felt-panel p-4 sm:p-5">
        <div className="flex justify-between items-baseline mb-3 gap-2 flex-wrap">
          <div className="text-xs text-chip-gold uppercase tracking-wider">
            Equities
          </div>
          <div className="text-xs text-chip-ivory/60">
            {totalChips} chips · {totalPrize} prize pool
          </div>
        </div>
        {equities.length === 0 ? (
          <div className="text-chip-ivory/60">Enter stacks and payouts.</div>
        ) : (
          <>
            {/* Mobile: stacked cards */}
            <div className="sm:hidden space-y-2">
              {equities.map((e, i) => {
                const chipPct = (stacks[i] / totalChips) * 100;
                const prizePct = (e / totalPrize) * 100;
                const diff = prizePct - chipPct;
                return (
                  <div key={i} className="rounded-lg border border-felt-700 p-3">
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="font-semibold">Player {i + 1}</div>
                      <div className="text-chip-gold font-mono font-bold">${e.toFixed(2)}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-chip-ivory/60">Stack</div>
                        <div className="font-mono">{stacks[i]} ({chipPct.toFixed(1)}%)</div>
                      </div>
                      <div>
                        <div className="text-chip-ivory/60">$ %</div>
                        <div className="font-mono">{prizePct.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-chip-ivory/60">Diff</div>
                        <div className={"font-mono " +
                          (diff > 0 ? "text-chip-gold" : diff < 0 ? "text-chip-red" : "")}>
                          {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: full table */}
            <table className="hidden sm:table w-full text-sm">
              <thead>
                <tr className="text-chip-ivory/60 text-xs uppercase tracking-wider">
                  <th className="text-left py-2">Seat</th>
                  <th className="text-right">Stack</th>
                  <th className="text-right">Chip %</th>
                  <th className="text-right">$ Equity</th>
                  <th className="text-right">$ %</th>
                  <th className="text-right">Diff</th>
                </tr>
              </thead>
              <tbody>
                {equities.map((e, i) => {
                  const chipPct = (stacks[i] / totalChips) * 100;
                  const prizePct = (e / totalPrize) * 100;
                  const diff = prizePct - chipPct;
                  return (
                    <tr key={i} className="border-t border-felt-700">
                      <td className="py-2">Player {i + 1}</td>
                      <td className="text-right font-mono">{stacks[i]}</td>
                      <td className="text-right font-mono">{chipPct.toFixed(1)}%</td>
                      <td className="text-right font-mono text-chip-gold">${e.toFixed(2)}</td>
                      <td className="text-right font-mono">{prizePct.toFixed(1)}%</td>
                      <td className={"text-right font-mono " +
                        (diff > 0 ? "text-chip-gold" : diff < 0 ? "text-chip-red" : "")}>
                        {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
        <div className="text-xs text-chip-ivory/60 mt-3">
          <strong>Diff</strong> = how much your $ equity over/underperforms your chip share.
          Short stacks typically <span className="text-chip-gold">overperform</span>; chip leaders
          underperform.
        </div>
      </section>
    </div>
  );
}

function parseNums(s: string): number[] {
  return s
    .split(/[,\s]+/)
    .map(x => Number(x))
    .filter(n => Number.isFinite(n) && n > 0);
}

function PresetButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-md border border-felt-600 hover:bg-felt-700/60 transition"
    >
      {label}
    </button>
  );
}

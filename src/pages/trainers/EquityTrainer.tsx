import { useMemo, useState } from "react";
import { PlayingCard } from "../../components/Card";
import { simulateEquity } from "../../lib/equity";
import type { Card, Rank, Suit } from "../../lib/poker";
import { cardId, fullDeck, parseCard } from "../../lib/poker";

type Slot = "a1" | "a2" | "b1" | "b2" | "f1" | "f2" | "f3" | "t" | "r";
const SLOT_LABELS: Record<Slot, string> = {
  a1: "Player A #1", a2: "Player A #2",
  b1: "Player B #1", b2: "Player B #2",
  f1: "Flop 1", f2: "Flop 2", f3: "Flop 3",
  t: "Turn", r: "River",
};

function defaultCards(): Record<Slot, Card | null> {
  return {
    a1: parseCard("As"), a2: parseCard("Kh"),
    b1: parseCard("Qd"), b2: parseCard("Qc"),
    f1: null, f2: null, f3: null, t: null, r: null,
  };
}

export function EquityTrainer() {
  const [cards, setCards] = useState<Record<Slot, Card | null>>(defaultCards());
  const [activeSlot, setActiveSlot] = useState<Slot | null>(null);
  const [result, setResult] = useState<{ a: number; b: number; iter: number } | null>(null);
  const [running, setRunning] = useState(false);

  const usedIds = useMemo(() => {
    const s = new Set<string>();
    for (const c of Object.values(cards)) if (c) s.add(cardId(c));
    return s;
  }, [cards]);

  const canRun = cards.a1 && cards.a2 && cards.b1 && cards.b2;

  const run = () => {
    if (!canRun) return;
    setRunning(true);
    setResult(null);
    // use setTimeout to let the button state paint
    setTimeout(() => {
      const board: Card[] = [cards.f1, cards.f2, cards.f3, cards.t, cards.r]
        .filter((c): c is Card => !!c);
      const res = simulateEquity({
        hands: [[cards.a1!, cards.a2!], [cards.b1!, cards.b2!]],
        board,
        iterations: 10000,
      });
      setResult({
        a: Math.round(res.equities[0] * 1000) / 10,
        b: Math.round(res.equities[1] * 1000) / 10,
        iter: res.iterations,
      });
      setRunning(false);
    }, 10);
  };

  const clearSlot = (s: Slot) =>
    setCards(prev => ({ ...prev, [s]: null }));

  const pickCard = (c: Card) => {
    if (!activeSlot) return;
    if (usedIds.has(cardId(c))) return;
    setCards(prev => ({ ...prev, [activeSlot]: c }));
    setActiveSlot(null);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold mb-1">Equity Calculator</h1>
        <p className="text-chip-ivory/70">
          Heads-up equity via Monte Carlo. Click a slot, then pick a card.
        </p>
      </header>

      <section className="felt-panel p-6 space-y-4">
        <div className="grid grid-cols-2 gap-6">
          {["a", "b"].map(p => (
            <div key={p}>
              <div className="text-xs text-chip-gold uppercase tracking-wider mb-2">
                Player {p.toUpperCase()}
              </div>
              <div className="flex gap-2">
                {([1, 2] as const).map(n => {
                  const slot = (p + n) as Slot;
                  const c = cards[slot];
                  const active = activeSlot === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => setActiveSlot(active ? null : slot)}
                      onContextMenu={(e) => { e.preventDefault(); clearSlot(slot); }}
                      className={active ? "ring-2 ring-chip-gold rounded-md" : ""}
                      title={c ? "Right-click to clear" : "Click to pick a card"}
                    >
                      {c ? <PlayingCard card={c} size="md" /> : <EmptySlot label={SLOT_LABELS[slot]} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <div className="text-xs text-chip-gold uppercase tracking-wider mb-2">
            Board
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["f1","f2","f3","t","r"] as Slot[]).map(slot => {
              const c = cards[slot];
              const active = activeSlot === slot;
              return (
                <button
                  key={slot}
                  onClick={() => setActiveSlot(active ? null : slot)}
                  onContextMenu={(e) => { e.preventDefault(); clearSlot(slot); }}
                  className={active ? "ring-2 ring-chip-gold rounded-md" : ""}
                  title={c ? "Right-click to clear" : "Click to pick a card"}
                >
                  {c ? <PlayingCard card={c} size="md" /> : <EmptySlot label={SLOT_LABELS[slot]} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button className="btn" onClick={run} disabled={!canRun || running}>
            {running ? "Simulating..." : "Run 10k Monte Carlo"}
          </button>
          <button
            className="btn-ghost"
            onClick={() => { setCards(defaultCards()); setResult(null); setActiveSlot(null); }}
          >
            Reset
          </button>
        </div>

        {result && (
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-felt-700">
            <ResultBar label="Player A" pct={result.a} />
            <ResultBar label="Player B" pct={result.b} />
            <div className="col-span-2 text-xs text-chip-ivory/50">
              {result.iter.toLocaleString()} iterations
            </div>
          </div>
        )}
      </section>

      {activeSlot && (
        <section className="felt-panel p-4">
          <div className="text-xs text-chip-gold uppercase tracking-wider mb-2">
            Pick a card for {SLOT_LABELS[activeSlot]}
          </div>
          <CardPicker
            onPick={pickCard}
            disabled={(id) => usedIds.has(id)}
          />
        </section>
      )}
    </div>
  );
}

function EmptySlot({ label }: { label: string }) {
  return (
    <div className="w-14 h-20 rounded-md border-2 border-dashed border-felt-600 flex items-center justify-center text-[10px] text-chip-ivory/40 p-1 text-center">
      {label}
    </div>
  );
}

function ResultBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-bold text-chip-gold">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2 rounded-full bg-felt-700 overflow-hidden">
        <div className="h-full bg-chip-gold" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CardPicker({
  onPick, disabled,
}: {
  onPick: (c: { rank: Rank; suit: Suit }) => void;
  disabled: (id: string) => boolean;
}) {
  const all = useMemo(() => fullDeck(), []);
  return (
    <div className="grid grid-cols-13 gap-1" style={{ gridTemplateColumns: "repeat(13, minmax(0,1fr))" }}>
      {all.map(c => {
        const id = cardId(c);
        const dis = disabled(id);
        return (
          <button
            key={id}
            disabled={dis}
            onClick={() => onPick(c)}
            className={
              "p-0 bg-transparent border-0 " +
              (dis ? "opacity-25" : "hover:brightness-110")
            }
          >
            <PlayingCard card={c} size="sm" />
          </button>
        );
      })}
    </div>
  );
}

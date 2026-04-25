import { useMemo, useState } from "react";
import clsx from "clsx";
import { PlayingCard } from "../../components/Card";
import { simulateEquity } from "../../lib/equity";
import type { Card, Rank, Suit } from "../../lib/poker";
import { RANKS, SUIT_COLOR, SUIT_SYMBOL, cardId, parseCard } from "../../lib/poker";

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
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Equity Calculator</h1>
        <p className="text-chip-ivory/70">
          Heads-up equity via Monte Carlo. Tap a slot, then pick a card. Long-press a card to clear.
        </p>
      </header>

      <section className="felt-panel p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                    <SlotButton
                      key={slot}
                      slot={slot}
                      card={c}
                      active={active}
                      onActivate={() => setActiveSlot(active ? null : slot)}
                      onClear={() => clearSlot(slot)}
                    />
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
          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            {(["f1","f2","f3","t","r"] as Slot[]).map(slot => {
              const c = cards[slot];
              const active = activeSlot === slot;
              return (
                <SlotButton
                  key={slot}
                  slot={slot}
                  card={c}
                  active={active}
                  onActivate={() => setActiveSlot(active ? null : slot)}
                  onClear={() => clearSlot(slot)}
                />
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <button className="btn flex-1 sm:flex-initial" onClick={run} disabled={!canRun || running}>
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
        <section className="felt-panel p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="text-xs text-chip-gold uppercase tracking-wider">
              Pick a card for {SLOT_LABELS[activeSlot]}
            </div>
            <button
              className="text-xs text-chip-ivory/60 hover:text-chip-ivory underline"
              onClick={() => setActiveSlot(null)}
            >
              Cancel
            </button>
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

function SlotButton({
  slot, card, active, onActivate, onClear,
}: {
  slot: Slot;
  card: Card | null;
  active: boolean;
  onActivate: () => void;
  onClear: () => void;
}) {
  return (
    <div className={active ? "ring-2 ring-chip-gold rounded-md relative" : "relative"}>
      <button
        onClick={onActivate}
        onContextMenu={(e) => { e.preventDefault(); onClear(); }}
        className="block"
        title={card ? "Tap clear button (×) to remove" : "Tap to pick a card"}
      >
        {card ? <PlayingCard card={card} size="md" /> : <EmptySlot label={SLOT_LABELS[slot]} />}
      </button>
      {card && (
        <button
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-felt-900 border border-felt-600 text-chip-ivory text-xs leading-none flex items-center justify-center hover:bg-chip-red"
          aria-label="Clear card"
        >
          ×
        </button>
      )}
    </div>
  );
}

function EmptySlot({ label }: { label: string }) {
  return (
    <div className="w-12 h-[68px] sm:w-14 sm:h-20 rounded-md border-2 border-dashed border-felt-600 flex items-center justify-center text-[10px] text-chip-ivory/40 p-1 text-center">
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
  const [rank, setRank] = useState<Rank | null>(null);
  // Desktop keeps the dense grid; mobile uses the two-step picker.
  return (
    <div>
      {/* Mobile: two-step (rank then suit) */}
      <div className="sm:hidden space-y-3">
        <div>
          <div className="text-[11px] text-chip-ivory/60 uppercase tracking-wider mb-1.5">
            {rank ? "2. Pick suit" : "1. Pick rank"}
          </div>
          {!rank ? (
            <div className="grid grid-cols-7 gap-1.5">
              {RANKS.slice().reverse().map(r => {
                // rank is available if at least one suit with this rank is still free
                const available = (["s","h","d","c"] as Suit[]).some(s => !disabled(cardId({ rank: r, suit: s })));
                return (
                  <button
                    key={r}
                    disabled={!available}
                    onClick={() => setRank(r)}
                    className={clsx(
                      "h-12 rounded-lg font-bold font-mono text-lg transition active:scale-95",
                      available
                        ? "bg-felt-700 text-chip-ivory hover:bg-felt-600 border border-felt-600"
                        : "bg-felt-800 text-chip-ivory/20 border border-felt-800 cursor-not-allowed",
                    )}
                  >{r}</button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2">
                {(["s","h","d","c"] as Suit[]).map(s => {
                  const id = cardId({ rank, suit: s });
                  const dis = disabled(id);
                  return (
                    <button
                      key={s}
                      disabled={dis}
                      onClick={() => { onPick({ rank, suit: s }); setRank(null); }}
                      className={clsx(
                        "h-16 rounded-lg flex flex-col items-center justify-center font-mono transition active:scale-95 border-2",
                        dis
                          ? "bg-felt-800 border-felt-800 text-chip-ivory/20 cursor-not-allowed"
                          : "bg-white text-black border-felt-600 hover:brightness-110",
                      )}
                      aria-label={`${rank}${s}`}
                    >
                      <span className="font-bold text-base leading-none">{rank}</span>
                      <span className={clsx(
                        "text-xl leading-none mt-0.5",
                        dis ? "" : SUIT_COLOR[s] === "red" ? "text-red-600" : "text-black",
                      )}>{SUIT_SYMBOL[s]}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setRank(null)}
                className="text-xs text-chip-ivory/60 underline"
              >← back to ranks</button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop: dense 13-col grid */}
      <DesktopDeckGrid onPick={onPick} disabled={disabled} />
    </div>
  );
}

function DesktopDeckGrid({
  onPick, disabled,
}: {
  onPick: (c: { rank: Rank; suit: Suit }) => void;
  disabled: (id: string) => boolean;
}) {
  const deck = useMemo(() => allDeckOrdered(), []);
  return (
    <div className="hidden sm:grid gap-1" style={{ gridTemplateColumns: "repeat(13, minmax(0,1fr))" }}>
      {deck.map(c => {
        const id = cardId(c);
        const dis = disabled(id);
        return (
          <button
            key={id}
            disabled={dis}
            onClick={() => onPick(c)}
            className={
              "p-0 bg-transparent border-0 block " +
              (dis ? "opacity-25 cursor-not-allowed" : "hover:brightness-110")
            }
            aria-label={`${c.rank}${c.suit}`}
          >
            <PlayingCard card={c} size="fluid" />
          </button>
        );
      })}
    </div>
  );
}

function allDeckOrdered(): Card[] {
  const out: Card[] = [];
  for (const s of ["s","h","d","c"] as Suit[]) {
    for (const r of RANKS) out.push({ rank: r, suit: s });
  }
  return out;
}

import { useMemo, useState } from "react";
import { PlayingCard } from "../../components/Card";
import type { Card } from "../../lib/poker";
import { evaluate7, fullDeck, shuffle } from "../../lib/poker";
import { progressStore } from "../../store/progress";

interface Scenario {
  handA: Card[];
  handB: Card[];
  community: Card[];
  winner: "A" | "B" | "TIE";
}

function makeScenario(): Scenario {
  const deck = shuffle(fullDeck());
  const handA = [deck[0], deck[1]];
  const handB = [deck[2], deck[3]];
  const community = deck.slice(4, 9);
  const evA = evaluate7(handA.concat(community));
  const evB = evaluate7(handB.concat(community));
  const winner: "A" | "B" | "TIE" =
    evA.score > evB.score ? "A" : evB.score > evA.score ? "B" : "TIE";
  return { handA, handB, community, winner };
}

export function HandRankingTrainer() {
  const [scenario, setScenario] = useState<Scenario>(() => makeScenario());
  const [picked, setPicked] = useState<"A" | "B" | "TIE" | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const evA = useMemo(
    () => evaluate7(scenario.handA.concat(scenario.community)),
    [scenario],
  );
  const evB = useMemo(
    () => evaluate7(scenario.handB.concat(scenario.community)),
    [scenario],
  );

  const answer = (guess: "A" | "B" | "TIE") => {
    setPicked(guess);
    const ok = guess === scenario.winner;
    progressStore.recordDrill("hand-ranking", ok);
    if (ok) {
      const s = streak + 1;
      setStreak(s);
      if (s > best) setBest(s);
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    setScenario(makeScenario());
    setPicked(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Hand Ranking Quiz</h1>
          <p className="text-chip-ivory/70">Which 5-card hand wins?</p>
        </div>
        <div className="text-right text-sm shrink-0">
          <div>Streak: <strong className="text-chip-gold">{streak}</strong></div>
          <div className="text-chip-ivory/60">Best: {best}</div>
        </div>
      </header>

      <section className="felt-panel p-4 sm:p-6 space-y-5">
        <div>
          <div className="text-xs text-chip-gold uppercase tracking-wider mb-2">
            Community
          </div>
          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            {scenario.community.map((c, i) => (
              <PlayingCard key={i} card={c} size="md" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlayerHand
            label="Hand A"
            cards={scenario.handA}
            category={picked ? evA.category : undefined}
            won={picked ? scenario.winner === "A" : undefined}
          />
          <PlayerHand
            label="Hand B"
            cards={scenario.handB}
            category={picked ? evB.category : undefined}
            won={picked ? scenario.winner === "B" : undefined}
          />
        </div>

        {!picked ? (
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2 pt-2">
            <button className="btn" onClick={() => answer("A")}>Hand A wins</button>
            <button className="btn" onClick={() => answer("B")}>Hand B wins</button>
            <button className="btn-ghost col-span-2" onClick={() => answer("TIE")}>Tie</button>
          </div>
        ) : (
          <div className="pt-2 space-y-3">
            <div className={picked === scenario.winner
              ? "text-chip-gold text-lg font-semibold"
              : "text-chip-red text-lg font-semibold"}>
              {picked === scenario.winner ? "Correct \u2713" : "Incorrect \u2717"}
              {" — "}
              {scenario.winner === "TIE"
                ? "Tie"
                : `Hand ${scenario.winner} wins with ${scenario.winner === "A" ? evA.category : evB.category}`}
            </div>
            <button className="btn" onClick={next}>Next hand &rarr;</button>
          </div>
        )}
      </section>
    </div>
  );
}

function PlayerHand({
  label, cards, category, won,
}: {
  label: string;
  cards: Card[];
  category?: string;
  won?: boolean;
}) {
  return (
    <div className={
      "rounded-xl p-4 border-2 " +
      (won === true ? "border-chip-gold bg-chip-gold/10"
        : won === false ? "border-felt-700 bg-felt-700/40 opacity-70"
          : "border-felt-600 bg-felt-800/50")
    }>
      <div className="text-xs text-chip-gold uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="flex gap-1.5 sm:gap-2 mb-2">
        {cards.map((c, i) => <PlayingCard key={i} card={c} />)}
      </div>
      {category && (
        <div className="text-sm text-chip-ivory/80">
          Best 5: <strong>{category}</strong>
        </div>
      )}
    </div>
  );
}

import clsx from "clsx";
import type { Card as PokerCard } from "../lib/poker";
import { SUIT_COLOR, SUIT_SYMBOL } from "../lib/poker";

interface Props {
  card?: PokerCard;
  size?: "sm" | "md" | "lg";
  facedown?: boolean;
  className?: string;
}

export function PlayingCard({ card, size = "md", facedown, className }: Props) {
  const sizes = {
    sm: "w-10 h-14 text-sm",
    md: "w-14 h-20 text-lg",
    lg: "w-20 h-28 text-2xl",
  }[size];

  if (!card || facedown) {
    return (
      <div
        className={clsx(
          "rounded-md border-2 border-felt-700",
          "bg-felt-600/80 shadow-lg",
          sizes,
          className,
        )}
      >
        <div className="w-full h-full rounded-sm bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(255,255,255,0.06)_6px,rgba(255,255,255,0.06)_12px)]" />
      </div>
    );
  }

  const color = SUIT_COLOR[card.suit];
  const sym = SUIT_SYMBOL[card.suit];

  return (
    <div
      className={clsx(
        "card-face flex flex-col justify-between px-1.5 py-1 font-mono",
        color === "red" ? "text-card-red" : "text-card-black",
        sizes,
        className,
      )}
    >
      <div className="flex flex-col items-start leading-none">
        <span className="font-bold">{card.rank}</span>
        <span className="text-base leading-none">{sym}</span>
      </div>
      <div className="self-end text-2xl leading-none">{sym}</div>
    </div>
  );
}

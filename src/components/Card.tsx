import clsx from "clsx";
import type { Card as PokerCard } from "../lib/poker";
import { SUIT_COLOR, SUIT_SYMBOL } from "../lib/poker";

interface Props {
  card?: PokerCard;
  size?: "sm" | "md" | "lg" | "fluid";
  facedown?: boolean;
  dimmed?: boolean;    // used to mute cards NOT in the best-five set
  highlight?: boolean; // used to emphasize cards IN the best-five set
  className?: string;
}

export function PlayingCard({ card, size = "md", facedown, dimmed, highlight, className }: Props) {
  const sizes = {
    sm: "w-10 h-14 text-sm",
    md: "w-12 h-[68px] text-base sm:w-14 sm:h-20 sm:text-lg",
    lg: "w-16 h-24 text-xl sm:w-20 sm:h-28 sm:text-2xl",
    fluid: "w-full aspect-[5/7] text-[10px] sm:text-xs",
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
        "card-face flex flex-col justify-between px-1.5 py-1 font-mono transition",
        color === "red" ? "text-card-red" : "text-card-black",
        dimmed && "opacity-40",
        highlight && "ring-2 ring-chip-gold ring-offset-1 ring-offset-felt-900",
        sizes,
        className,
      )}
    >
      <div className="flex flex-col items-start leading-none">
        <span className="font-bold">{card.rank}</span>
        <span className="leading-none">{sym}</span>
      </div>
      <div className="self-end leading-none">{sym}</div>
    </div>
  );
}

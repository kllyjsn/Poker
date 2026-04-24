// Malmuth-Harville ICM model. For small fields (<=9 players) this is
// plenty fast. Returns each player's share of the total prize pool.

export function icmEquities(stacks: number[], payouts: number[]): number[] {
  // Defensive normalization
  const n = stacks.length;
  const totalChips = stacks.reduce((a, b) => a + b, 0);
  if (totalChips === 0) return stacks.map(() => 0);

  const equities = new Array<number>(n).fill(0);
  const order = stacks.map((_, i) => i);

  function recurse(
    remaining: number[],
    remainingStacks: number[],
    place: number,
    prob: number,
  ): void {
    if (place >= payouts.length || remaining.length === 0) return;
    const total = remainingStacks.reduce((a, b) => a + b, 0);
    if (total === 0) return;
    for (let i = 0; i < remaining.length; i++) {
      const idx = remaining[i];
      const stack = remainingStacks[i];
      const p = prob * (stack / total);
      equities[idx] += p * payouts[place];
      const nextRemaining = remaining.filter((_, j) => j !== i);
      const nextStacks = remainingStacks.filter((_, j) => j !== i);
      if (nextRemaining.length > 0 && place + 1 < payouts.length) {
        recurse(nextRemaining, nextStacks, place + 1, p);
      }
    }
  }

  recurse(order, stacks.slice(), 0, 1);
  return equities;
}

export function icmEquityShares(stacks: number[], payouts: number[]): number[] {
  const abs = icmEquities(stacks, payouts);
  const total = payouts.reduce((a, b) => a + b, 0);
  if (total === 0) return abs.map(() => 0);
  return abs.map(x => x / total);
}

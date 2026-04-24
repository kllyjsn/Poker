// Pot odds / MDF / EV helpers.

export function potOdds(toCall: number, pot: number): number {
  // Required equity to make a break-even call, as a fraction.
  if (toCall <= 0) return 0;
  return toCall / (pot + 2 * toCall);
}

export function mdf(bet: number, pot: number): number {
  // Minimum defense frequency to be unexploitable against a bet.
  if (bet <= 0) return 1;
  return pot / (pot + bet);
}

export function bluffFrequency(bet: number, pot: number): number {
  // GTO bluff frequency on river for polarized bet size.
  // bluff : value = bet : (pot + 2*bet) - actually bluffs / total bets
  if (bet <= 0) return 0;
  return bet / (pot + 2 * bet);
}

export function ruleOf2And4(outs: number, streetsToGo: 1 | 2): number {
  // Heuristic hit probability (%).
  return streetsToGo === 2 ? outs * 4 : outs * 2;
}

export interface EVInput {
  equity: number;     // 0..1
  pot: number;        // current pot before our action
  toCall: number;     // amount we must put in
}

export function evCall(in_: EVInput): number {
  const { equity, pot, toCall } = in_;
  // We win pot + toCall (villain's bet + existing pot) with equity, else lose toCall.
  return equity * (pot + toCall) - (1 - equity) * toCall;
}

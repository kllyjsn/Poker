// 12-week poker curriculum (ground zero -> expert).
// Focus: NLHE cash + MTTs.

export interface LessonSection {
  heading?: string;
  body?: string;
  bullets?: string[];
}

export interface Lesson {
  id: string;           // e.g. "w01d01"
  week: number;         // 1..12
  day: number;          // 1..5
  title: string;
  focus: string;        // one-liner
  objectives: string[];
  minutes: number;      // estimated study time
  sections: LessonSection[];
  takeaways: string[];
  trainer?: string;     // router path segment, e.g. "equity"
  drill?: string;       // self-check prompt
}

export interface Week {
  week: number;
  title: string;
  theme: string;
  description: string;
  lessons: Lesson[];
}

export const CURRICULUM: Week[] = [
  // =====================================================================
  // WEEK 1: FOUNDATIONS
  // =====================================================================
  {
    week: 1,
    title: "Foundations",
    theme: "Rules, hand rankings, and the shape of a hand",
    description:
      "You leave this week fluent in the mechanics of No-Limit Hold'em and tournament structure, and you can rank any five-card hand instantly.",
    lessons: [
      {
        id: "w01d01",
        week: 1, day: 1,
        title: "The Table, the Deal, and the Action",
        focus: "Seats, blinds, button, and the streets of betting",
        minutes: 35,
        objectives: [
          "Name every seat around a 6-max and 9-handed table",
          "Describe the action flow preflop, flop, turn, river",
          "Explain blinds, antes, and why they force action",
        ],
        sections: [
          { heading: "The table", body:
            "Hold'em is played with a dealer button that moves one seat left after every hand. The two players left of the button post the small blind (SB) and big blind (BB) — mandatory bets that seed the pot. Everyone else acts without putting anything in until they choose to. At a 6-max table the seats are UTG, HJ (hijack), CO (cutoff), BTN, SB, BB; at 9-handed you add UTG+1, MP, and Lojack between UTG and HJ." },
          { heading: "Action flow", body:
            "Preflop the first to act is UTG (the seat left of the BB). Postflop, the action resets: the first active player left of the button acts first on every street. This is why the button is the most valuable seat — it acts last on the flop, turn, and river." },
          { heading: "The four streets",
            bullets: [
              "Preflop — two hole cards dealt, betting begins with UTG",
              "Flop — three community cards, action left of button",
              "Turn — fourth community card, another round of betting",
              "River — fifth and final card, final betting round, then showdown",
            ] },
        ],
        takeaways: [
          "Position = order of action. Late position acts last postflop.",
          "Blinds exist to inject dead money and create leverage.",
          "Button is the most profitable seat by far.",
        ],
        drill: "Sketch a 6-max table and label every seat, including where preflop and postflop action starts.",
      },
      {
        id: "w01d02",
        week: 1, day: 2,
        title: "Hand Rankings, Cold",
        focus: "Instant recognition of hand strength",
        minutes: 30,
        objectives: [
          "List the 9 hand categories from best to worst without thinking",
          "Break ties with kickers correctly",
          "Recognize the ace-low 'wheel' straight",
        ],
        sections: [
          { heading: "The ladder (strongest first)",
            bullets: [
              "Straight Flush — five consecutive same-suit cards",
              "Four of a Kind — four cards of one rank",
              "Full House — three of a kind + a pair",
              "Flush — five same-suit cards, any order",
              "Straight — five consecutive ranks, mixed suits",
              "Three of a Kind — three cards of one rank",
              "Two Pair — two different pairs",
              "Pair — two cards of one rank",
              "High Card — nothing else",
            ] },
          { heading: "Kickers break ties",
            body: "When two players have the same category, the next-highest card in their five-card hand decides it. AK > AQ when both flop an ace. Three of a kind ties go to the higher triplet first, then kickers." },
          { heading: "The wheel",
            body: "A-2-3-4-5 is a legal straight (the 'wheel'), with the 5 as the high card. It loses to any 6-high or higher straight." },
        ],
        takeaways: [
          "Hand ranking memory should be automatic — zero hesitation.",
          "A flush always beats a straight; a full house always beats a flush.",
          "The wheel straight has a 5 as its highest card, not an ace.",
        ],
        trainer: "hand-ranking",
        drill: "Rank these five hands: set of sevens; 9-high flush; Broadway straight; aces full of deuces; top two pair.",
      },
      {
        id: "w01d03",
        week: 1, day: 3,
        title: "169 Starting Hands",
        focus: "The shape of preflop — why not 1,326?",
        minutes: 25,
        objectives: [
          "Explain why there are exactly 169 distinct starting hands",
          "Classify any hole card combo as pair / suited / offsuit",
          "Read a 13x13 range matrix",
        ],
        sections: [
          { heading: "From 1,326 to 169",
            body: "There are 52 * 51 / 2 = 1,326 unique two-card combinations. But most are strategically identical — AhKh plays the same as AdKd preflop. Collapsing by category yields 169 distinct hands: 13 pairs, 78 suited hands, 78 offsuit hands." },
          { heading: "Combo math",
            bullets: [
              "Pairs: 6 combos each (C(4,2))",
              "Suited: 4 combos each (one per suit)",
              "Offsuit: 12 combos each (4 * 3)",
              "Total: 13*6 + 78*4 + 78*12 = 78 + 312 + 936 = 1,326",
            ] },
          { heading: "The matrix",
            body: "A 13x13 grid is the standard way to display ranges. Pairs run down the diagonal. Suited hands live above the diagonal, offsuit below. Stronger hands cluster in the top-left." },
        ],
        takeaways: [
          "There are 169 distinct starting hands, 1,326 specific combos.",
          "AKs (4 combos) is rarer than AKo (12 combos).",
          "Suited matters more than most beginners think.",
        ],
      },
      {
        id: "w01d04",
        week: 1, day: 4,
        title: "Pot Odds, the Simplest Version",
        focus: "The most important math you will ever learn",
        minutes: 35,
        objectives: [
          "Compute pot odds as a ratio and as required equity",
          "Recognize when a call is +EV given your equity estimate",
          "Internalize three reference points: 2:1, 3:1, 4:1",
        ],
        sections: [
          { heading: "The formula",
            body: "Pot odds = toCall / (pot + toCall). That fraction is the minimum equity your hand needs for a break-even call. If the pot is $100 and villain bets $50, you are getting 150-to-50 = 3:1, i.e. you need 25% equity." },
          { heading: "Reference points",
            bullets: [
              "Half-pot bet => you need 25% to call",
              "Pot-size bet => you need 33%",
              "2x pot overbet => you need 40%",
              "1/3 pot probe => you need 20%",
            ] },
          { heading: "Why this matters",
            body: "Poker decisions reduce to this question: 'Is my equity greater than the price I'm paying?' Everything else — reads, ranges, tells — is just a way to estimate your equity more accurately." },
        ],
        takeaways: [
          "Learn the three reference numbers — 20%, 25%, 33%, 40% — cold.",
          "If equity > required equity, calling is profitable in a vacuum.",
          "Implied odds and reverse implied odds adjust this baseline later.",
        ],
        trainer: "pot-odds",
        drill: "Villain bets $75 into a $100 pot. What pot odds are you getting? What equity do you need?",
      },
      {
        id: "w01d05",
        week: 1, day: 5,
        title: "Week 1 Review + Mental Model",
        focus: "Put it together; audit your weak points",
        minutes: 25,
        objectives: [
          "Retrieve everything from Week 1 without notes",
          "Pick the one topic you want to revisit",
          "Set your Week 2 study schedule",
        ],
        sections: [
          { heading: "Self-test",
            bullets: [
              "Who acts first preflop? Postflop?",
              "Which is better: flush or full house?",
              "How many AK combos exist? How many AKs?",
              "Pot is 200, villain bets 100. What equity do you need?",
              "What's the wheel straight?",
            ] },
          { heading: "Why review matters",
            body: "The brain consolidates during spaced retrieval, not during study. A 10-minute quiz beats an hour of rereading. Take notes on what you miss — those are your Week 2 targets." },
        ],
        takeaways: [
          "Week 1 = vocabulary. You need it cold before anything later makes sense.",
          "Build a habit of ending every study session with a 5-minute self-quiz.",
          "If you missed more than two items, revisit the relevant day.",
        ],
        drill: "Answer the five self-test questions out loud, then check against the earlier lessons.",
      },
    ],
  },

  // =====================================================================
  // WEEK 2: MATH FUNDAMENTALS
  // =====================================================================
  {
    week: 2,
    title: "Math Fundamentals",
    theme: "Outs, EV, and the rule of 2 and 4",
    description:
      "Turn 'I think I have about half' into precise numbers. You learn to count outs, estimate equity on the fly, and compute expected value for any decision.",
    lessons: [
      {
        id: "w02d01",
        week: 2, day: 1,
        title: "Counting Outs",
        focus: "How many cards improve your hand — exactly?",
        minutes: 30,
        objectives: [
          "Count outs for common draws: flush, OESD, gutshot, combo draws",
          "Subtract 'tainted' outs correctly",
          "Recognize backdoor outs (worth roughly 1.5 outs each)",
        ],
        sections: [
          { heading: "Basic counts",
            bullets: [
              "Flush draw (4 of suit): 9 outs",
              "Open-ended straight draw: 8 outs",
              "Gutshot straight draw: 4 outs",
              "Overcards: 6 outs (often overcounted)",
              "Flush + OESD combo: 15 outs",
            ] },
          { heading: "Tainted outs",
            body: "An 'out' that makes your hand but also makes villain a better one is not really an out. Flush draw on a paired board? Some of your flush cards give villain a full house. Always ask: 'If this card comes, am I actually ahead?'" },
        ],
        takeaways: [
          "Nine, eight, and four are the three numbers you'll use most often.",
          "Discount overcards heavily — they are not clean outs.",
          "Combo draws (flush + straight) dominate because outs compound.",
        ],
        drill: "You hold 8h9h on a board of 6h-7s-Kh. How many outs to the best hand?",
      },
      {
        id: "w02d02",
        week: 2, day: 2,
        title: "The Rule of 2 and 4",
        focus: "Mental equity estimation in 2 seconds",
        minutes: 25,
        objectives: [
          "Multiply outs x 2 (one street) or x 4 (two streets) to approximate %",
          "Understand when the rule under- and over-estimates",
          "Sanity-check with a true equity calculator",
        ],
        sections: [
          { heading: "The shortcut",
            body: "With one card to come, equity ≈ outs x 2. With two cards to come (flop to river, assuming you'll see both), equity ≈ outs x 4. This is accurate within ~2% for most cases." },
          { heading: "When it breaks",
            body: "For high out counts (>12) the rule overestimates — use outs x 3.5 instead. It also doesn't account for villain betting you off the draw on the turn. 'Two cards to come' is a fantasy when stacks are deep and opponents bet." },
        ],
        takeaways: [
          "9 outs x 4 = 36% on the flop — roughly right.",
          "15 outs x 4 = 60%? Actually closer to 54% — don't over-apply.",
          "Rule of 4 assumes free cards. Villain usually won't give them.",
        ],
        drill: "You flopped a flush draw (9 outs) and a gutshot (3 new outs). Approximate equity with 2 cards to come.",
      },
      {
        id: "w02d03",
        week: 2, day: 3,
        title: "Expected Value",
        focus: "The single metric that governs every decision",
        minutes: 40,
        objectives: [
          "Write an EV equation for any call/bet/fold decision",
          "Sum across possible outcomes weighted by probability",
          "Convert between dollars-per-hand and bb/100",
        ],
        sections: [
          { heading: "The equation",
            body: "EV(call) = equity * (pot + toCall) - (1 - equity) * toCall. EV(fold) = 0. Choose the higher one. EV(bet) is trickier: you have to model villain's fold %, his calling range, and what happens on later streets." },
          { heading: "Why EV > outcome",
            body: "You can make a +EV decision and lose. You can make a -EV decision and win. Over thousands of hands, EV decisions win money; outcomes converge. Judge yourself by process, not results." },
        ],
        takeaways: [
          "Always compare EV(action) to EV(fold) — zero, by definition.",
          "Outcome variance is huge. Process variance is what you control.",
          "bb/100 is the standard win-rate unit. A great live cash player is +5 to +10 bb/100.",
        ],
        drill: "Villain shoves $120 into a $60 pot. You estimate 35% equity. What's EV(call) vs EV(fold)?",
      },
      {
        id: "w02d04",
        week: 2, day: 4,
        title: "Implied and Reverse Implied Odds",
        focus: "The future money that changes everything",
        minutes: 30,
        objectives: [
          "Define implied odds and when they exist",
          "Define reverse implied odds",
          "Discount or inflate your pot odds correctly",
        ],
        sections: [
          { heading: "Implied odds",
            body: "Money you expect to win on later streets if you hit. Deep stacks + disguised draw (like a set draw with a pair) = huge implied odds. Short stacks or transparent draws = minimal. You can call with slightly worse than raw pot odds when implied odds are strong." },
          { heading: "Reverse implied odds",
            body: "Money you expect to lose on later streets if you hit a second-best hand. Classic: calling with A8 on A-K-x — you either have the best hand and win little, or have the worst hand and pay off. Dominated hands live in reverse-implied-odds hell." },
        ],
        takeaways: [
          "Stacks-behind matters more than pot odds for drawing hands.",
          "Dominated hands (Axo, Kxo) cost you when you hit, not just when you miss.",
          "Sets (88 on 8-K-2) are the best implied-odds hand in poker.",
        ],
        drill: "You have 55 on the button vs a 3bb UTG raise, 100bb effective. What implied-odds price do you need to set-mine?",
      },
      {
        id: "w02d05",
        week: 2, day: 5,
        title: "Week 2 Review + Equity Calculator Intro",
        focus: "Start using a real equity tool",
        minutes: 35,
        objectives: [
          "Use the in-app equity trainer to check your intuitions",
          "Compare Monte Carlo results to Rule-of-4 estimates",
          "Build a library of ~10 canonical spots",
        ],
        sections: [
          { heading: "Practice loop",
            body: "Open the equity trainer. Deal yourself a random flop + draws. Estimate equity with rule-of-4 before clicking Run. Record your error. After 50 reps your estimation accuracy improves to within 3%." },
          { heading: "Canonical spots worth memorizing",
            bullets: [
              "AK vs TT preflop — classic coin flip (~47/53)",
              "Flush draw vs top pair on flop — ~35% (2 cards)",
              "Set over set preflop — ~10% to the loser",
              "AA vs KK — ~82%",
              "Overpair vs flush draw + pair — ~50/50",
            ] },
        ],
        takeaways: [
          "Equity drills compound. Do 20 minutes a day, not 3 hours a week.",
          "Canonical spots anchor your intuition for everything else.",
          "AA vs a random hand is ~85%. AA is less dominant than it feels.",
        ],
        trainer: "equity",
        drill: "Run 10 equity scenarios in the trainer; log your estimate vs the simulated value.",
      },
    ],
  },

  // =====================================================================
  // WEEK 3: PREFLOP HOLD'EM CASH
  // =====================================================================
  {
    week: 3,
    title: "Preflop Cash Ranges",
    theme: "Position, opens, 3-bets, and blind defense",
    description:
      "Most money is lost preflop by bad range selection. Fix your opens and your defense and you erase entire leaks.",
    lessons: [
      {
        id: "w03d01",
        week: 3, day: 1,
        title: "Why Position is Everything",
        focus: "The structural edge of acting last",
        minutes: 30,
        objectives: [
          "Quantify the positional advantage in win-rate terms",
          "Explain why IP (in position) realizes more equity",
          "Accept that you should play tighter from early position",
        ],
        sections: [
          { heading: "Information",
            body: "When you act last, you see every opponent's decision before you make yours. Bluffs become cheaper, value hands easier to size, and bluff-catchers easier to play. You realize something like 110% of your equity IP vs 90% OOP." },
          { heading: "Stats",
            body: "On the button, winning players post 10-15 bb/100 lifetime win-rates. From UTG, the same players often lose at small-stakes. Same player, same skill — position alone creates a gap of 20+ bb/100." },
        ],
        takeaways: [
          "Play tight UTG, loose on the BTN. This isn't a preference — it's math.",
          "OOP, you realize less of your equity. Price your calls accordingly.",
          "If there's one 'free' edge in poker, it's closing the action IP.",
        ],
      },
      {
        id: "w03d02",
        week: 3, day: 2,
        title: "6-max Open-Raise Ranges",
        focus: "Memorize your RFI (raise first in) ranges",
        minutes: 40,
        objectives: [
          "State each position's open range by frequency",
          "Recognize a hand that's a clear open vs a clear fold",
          "Use the in-app range trainer to drill",
        ],
        sections: [
          { heading: "Frequencies at 100bb",
            bullets: [
              "UTG: ~15% of hands",
              "HJ: ~19%",
              "CO: ~28%",
              "BTN: ~45%",
              "SB: ~35% (as a raise-or-fold strategy)",
            ] },
          { heading: "Open sizing",
            body: "Online 6-max: 2.2-2.5x. Live 1-3 / 2-5: 4-6x to account for sticky callers. From the SB, size up ~0.5bb to give the BB worse odds." },
        ],
        takeaways: [
          "Memorize your UTG and BTN ranges first. Others interpolate.",
          "Opening sizing adapts to the pool; ranges stay fixed.",
          "If you can't confidently open a hand, fold it from UTG.",
        ],
        trainer: "preflop",
        drill: "Drill your UTG opening range on the preflop trainer until you hit 90% accuracy.",
      },
      {
        id: "w03d03",
        week: 3, day: 3,
        title: "3-bet and 4-bet Ranges",
        focus: "Linear vs polarized reraising",
        minutes: 35,
        objectives: [
          "Explain the difference between a linear and polarized 3-bet range",
          "Pick the right structure based on position and stack depth",
          "Start 4-betting with a small, disciplined range",
        ],
        sections: [
          { heading: "Linear vs polarized",
            body: "A linear 3-bet range is the top X% of hands (like QQ+, AK, AQ). Best when your opponent won't 4-bet bluff — just get value. A polarized range mixes premium value (AA-QQ, AK) with selected bluffs (A5s, suited connectors). Use this when 4-betting is live, so your range is hard to play against." },
          { heading: "IP vs OOP",
            body: "IP you can 3-bet wider and linearly. OOP (especially from the blinds vs late-position opens) you need to be polarized, because flatting OOP is painful." },
        ],
        takeaways: [
          "3-bet linear against calling stations, polarized against thinking regs.",
          "Never 4-bet bluff without positional or stack reasoning — it's the most expensive bluff line.",
          "AK is always, always a 3-bet. Not a flat.",
        ],
      },
      {
        id: "w03d04",
        week: 3, day: 4,
        title: "Defending the Blinds",
        focus: "The SB and BB are leaky by default — patch them",
        minutes: 35,
        objectives: [
          "Use pot odds to decide BB defense frequencies",
          "Pick a 3-bet vs flat mix from the BB",
          "Stop cold-calling from the SB",
        ],
        sections: [
          { heading: "BB math",
            body: "Vs a 2.5x open you're closing the action for 1.5bb into a 4bb pot — 27% pot odds. That means you can defend almost any hand that flops some equity. But 'defend' does not mean 'call' — 3-bet and flat need to be balanced." },
          { heading: "SB strategy",
            body: "A raise-or-fold strategy from the SB vs BTN opens is cleanest for most players. Flatting OOP in a multiway pot after the BB squeezes is a nightmare. Sim-based strategies do flat with select hands, but as a human, 'raise or fold' is cheaper than a flatting mix you'll butcher." },
        ],
        takeaways: [
          "BB is the single biggest positional loser. Tight BB defense = leak.",
          "SB flatting vs BTN opens bleeds money. Raise or fold.",
          "3-bet defense shows more than flatting — it forces real decisions.",
        ],
      },
      {
        id: "w03d05",
        week: 3, day: 5,
        title: "Week 3 Review + Preflop Drill Block",
        focus: "40 minutes of pure range reps",
        minutes: 45,
        objectives: [
          "Drill every position's opening range to 90%+ accuracy",
          "Take notes on your confusion hands",
          "Print a cheat sheet if helpful — but don't rely on it mid-session",
        ],
        sections: [
          { heading: "Spaced repetition plan",
            body: "Run 10 hands per position in the trainer. After each miss, write the hand on your confusion list. Repeat daily for 5 days. Ranges stick to long-term memory in about a week of spaced reps." },
        ],
        takeaways: [
          "Preflop fluency unlocks every postflop lesson — no fluency, no progress.",
          "A miss is a study opportunity, not a failure.",
          "Your confusion list is your personalized Week 3 review.",
        ],
        trainer: "preflop",
        drill: "Do 50 preflop trainer hands across positions; log accuracy.",
      },
    ],
  },

  // =====================================================================
  // WEEK 4: POSTFLOP FUNDAMENTALS
  // =====================================================================
  {
    week: 4,
    title: "Postflop Fundamentals",
    theme: "C-bets, board texture, and sizing",
    description:
      "The flop is the decision zone. You learn why we bet, when we check, and how to pick sizes that map to your range, not just your hand.",
    lessons: [
      {
        id: "w04d01",
        week: 4, day: 1,
        title: "Continuation Betting",
        focus: "Why the preflop raiser bets the flop",
        minutes: 35,
        objectives: [
          "Identify c-bet EV sources: fold equity, showdown equity, protection",
          "Pick spots to c-bet vs check back",
          "Size c-bets by board texture",
        ],
        sections: [
          { heading: "Three reasons to c-bet",
            bullets: [
              "Fold equity — villain's range whiffs the flop often",
              "Showdown equity — our overpair or top pair is ahead",
              "Protection — deny equity to draws and weak pairs",
            ] },
          { heading: "When to check back",
            body: "On connected, wet boards vs strong ranges, checking back with marginal hands preserves showdown value. The rule of thumb: if villain has more nutted combos than you, don't blast into them." },
        ],
        takeaways: [
          "C-bet when your range connects with the flop better than villain's.",
          "Small c-bets (33%) work on dry boards; bigger (66%) on wet boards.",
          "If c-betting feels automatic, you're missing checks.",
        ],
      },
      {
        id: "w04d02",
        week: 4, day: 2,
        title: "Reading Board Texture",
        focus: "Dry vs wet, paired, connected, monotone",
        minutes: 30,
        objectives: [
          "Classify boards along 4 dimensions",
          "Predict the density of draws for each texture",
          "Adjust aggression by texture",
        ],
        sections: [
          { heading: "Four textural axes",
            bullets: [
              "Connectedness — how many straights are possible?",
              "Suitedness — 2-tone vs monotone vs rainbow",
              "Pairing — paired boards kill straights and dampen flushes",
              "High-card density — A-K-5 hits the preflop raiser hard",
            ] },
          { heading: "Examples",
            body: "K-7-2 rainbow is dry and static — big c-bet range, small size. 9h-8h-7c is wet and dynamic — polarized response, larger sizes. Qs-Js-Ts is a nightmare monotone where sets are in terrible shape." },
        ],
        takeaways: [
          "Dry + high-card = c-bet small, often.",
          "Wet + connected = polarize or check.",
          "Monotone = play cautiously; single suits dominate.",
        ],
      },
      {
        id: "w04d03",
        week: 4, day: 3,
        title: "Bet Sizing Theory",
        focus: "Why small/medium/large each exist",
        minutes: 35,
        objectives: [
          "Explain when to use 25%, 33%, 50%, 66%, 100%, overbet",
          "Link sizing to range advantage and nut advantage",
          "Avoid the 'always 66%' trap",
        ],
        sections: [
          { heading: "The four sizing tiers",
            bullets: [
              "25-33% — range advantage, want to bet wide",
              "50-66% — balanced value/bluff mixes",
              "75-100% — polarized, strong nut advantage",
              "Overbet — extreme nut advantage, usually on turn/river",
            ] },
          { heading: "Nut advantage vs range advantage",
            body: "Range advantage = average hand strength is higher. Nut advantage = you have more of the very best hands. You bet small when you have only range advantage; you bet big when you have nut advantage." },
        ],
        takeaways: [
          "Sizing maps to range shape, not to the strength of your specific hand.",
          "Overbetting requires a clear nut-advantage story — don't force it.",
          "Small-bet strategies are hugely underused at small stakes.",
        ],
      },
      {
        id: "w04d04",
        week: 4, day: 4,
        title: "Value vs Bluff Frequency",
        focus: "Keeping your betting range balanced",
        minutes: 35,
        objectives: [
          "Derive the bluff:value ratio for a given bet size",
          "Build value-heavy ranges at small stakes",
          "Understand when to deviate for exploits",
        ],
        sections: [
          { heading: "The ratios",
            body: "On the river, for a pot-sized bet, villain gets 2:1 pot odds, so your bluff frequency should be ~33% of bets (to make him indifferent). Smaller bets need fewer bluffs (half pot => 25% bluffs); overbets need more." },
          { heading: "Exploit the pool",
            body: "At low stakes, players overcall. Bluff less. Value-bet thinner. At high stakes, players hero-fold. Bluff more. The balanced answer is a starting point; exploits are where the money is." },
        ],
        takeaways: [
          "Balance exists to defend you against thinking opponents.",
          "Against calling stations, cut bluffs in half.",
          "Against nits, add bluffs at every street.",
        ],
      },
      {
        id: "w04d05",
        week: 4, day: 5,
        title: "Week 4 Review + Sizing Drill",
        focus: "Cement sizing intuition with concrete boards",
        minutes: 30,
        objectives: [
          "Work 10 flop spots from memory",
          "Pick size and justify it in one sentence",
          "Identify where your reasoning breaks down",
        ],
        sections: [
          { heading: "Practice flops",
            bullets: [
              "K72r as PFR vs BB caller",
              "9h8h7c on a 3-bet pot",
              "AKQ rainbow vs CO caller",
              "5s4s3s in a multiway pot",
              "JT9 two-tone on a 4-bet pot",
            ] },
        ],
        takeaways: [
          "Pick a size, defend it in one sentence. That's the drill.",
          "Strong players can always explain their sizing in terms of ranges.",
          "Guessing sizes is a leak. Eliminate it.",
        ],
      },
    ],
  },

  // =====================================================================
  // WEEK 5: RANGES & GTO BASICS
  // =====================================================================
  {
    week: 5,
    title: "Ranges and GTO Basics",
    theme: "Thinking in ranges and understanding unexploitable play",
    description:
      "You start thinking in ranges, not hands. You understand what GTO actually means, what MDF is, and where the model's assumptions fail.",
    lessons: [
      {
        id: "w05d01",
        week: 5, day: 1,
        title: "Thinking in Ranges",
        focus: "Stop guessing one hand — assign a distribution",
        minutes: 30,
        objectives: [
          "Build a range based on a line (preflop + each street)",
          "Weigh combos: value, bluff, marginal",
          "Reject 'what does villain have?' for 'what's his range?'",
        ],
        sections: [
          { heading: "The shift",
            body: "Amateurs ask 'does he have AK or a bluff?' Pros ask 'out of 60 combos, how many value hands and how many bluffs?' The answer lets you compute pot odds vs the whole distribution." },
          { heading: "Range narrowing",
            body: "Every action villain takes removes combos from his range. A UTG 3-bet cuts him to maybe 15 combos. A c-bet narrows further. By the river, you often know 60-80% of his combos — if you've been paying attention." },
        ],
        takeaways: [
          "Your read isn't a hand; it's a range.",
          "Range narrowing = EV compounding.",
          "The best players build villain's range in real time, street by street.",
        ],
      },
      {
        id: "w05d02",
        week: 5, day: 2,
        title: "Range vs Range Equity",
        focus: "Why 'who's ahead?' is the wrong question",
        minutes: 35,
        objectives: [
          "Compute range vs range equity in an equity tool",
          "Explain why range-vs-range equity is stable even when hand-vs-hand isn't",
          "Identify ranges that dominate vs ranges that race",
        ],
        sections: [
          { heading: "Stability",
            body: "Hand-vs-hand equity swings wildly (44 vs AK is 52/48, but 44 vs AKs is 48/52). Range-vs-range is much stabler — a UTG open range has ~42% equity vs a BB calling range on any flop, give or take 2-3%." },
          { heading: "Domination",
            body: "When UTG opens and BTN 3-bets, BTN has more high-card combos and more premium pairs. Their range dominates UTG's in terms of high-side outcomes. This is why 4-betting linearly works even without bluffs at low stakes." },
        ],
        takeaways: [
          "Range vs range equity is the proper lens for strategy design.",
          "A range can dominate without any single hand dominating.",
          "Learn your equity vs common opponent ranges cold.",
        ],
      },
      {
        id: "w05d03",
        week: 5, day: 3,
        title: "MDF and Alpha",
        focus: "The unexploitability backbone",
        minutes: 35,
        objectives: [
          "Compute MDF for any bet size",
          "Derive alpha (the bluffing threshold)",
          "Understand where the model breaks in practice",
        ],
        sections: [
          { heading: "MDF",
            body: "Minimum Defense Frequency is the fraction of your range you must continue with to make villain's bluffs unprofitable. MDF = pot / (pot + bet). For a pot-sized bet, MDF is 50%. Any less and every bluff prints money." },
          { heading: "Alpha",
            body: "Alpha is the complement: the fold frequency that makes a bluff immediately +EV. alpha = bet / (pot + bet). Pot-size bet: alpha = 50%. You need villain to fold 50%+ for a bluff to profit immediately." },
        ],
        takeaways: [
          "MDF is a floor, not a target. Against weak players, defend less — they don't bluff enough.",
          "Alpha tells you the 'bluff-to-win' threshold.",
          "Don't pay MDF tax in spots where villain clearly isn't balanced.",
        ],
      },
      {
        id: "w05d04",
        week: 5, day: 4,
        title: "Balanced vs Unbalanced Strategies",
        focus: "When to play GTO and when to deviate",
        minutes: 30,
        objectives: [
          "Define 'balanced' in technical terms",
          "Explain why GTO is a ceiling, not a profit maximizer",
          "Decide when to deviate based on population reads",
        ],
        sections: [
          { heading: "What balanced means",
            body: "A balanced range has the right value:bluff ratio at every bet size and street such that villain cannot exploit any specific response. It's the ceiling on how badly you can lose — not the maximum you can win." },
          { heading: "Exploit vs GTO",
            body: "Against a population that folds too much, you should bluff more than GTO. Against a station pool, bluff less. GTO is your default when you know nothing; exploits are your edge when you know something." },
        ],
        takeaways: [
          "GTO = unexploitable, not max-profit.",
          "In small stakes, exploitative play crushes GTO.",
          "Use balanced play as the fallback when you lack info.",
        ],
      },
      {
        id: "w05d05",
        week: 5, day: 5,
        title: "Solver Intro (Without a Solver)",
        focus: "What solvers do, so you can read solver outputs",
        minutes: 30,
        objectives: [
          "Explain what a solver iterates on",
          "Read a solver 'strategy frequency' chart",
          "Identify two facts solvers can't capture",
        ],
        sections: [
          { heading: "What a solver does",
            body: "A solver (PioSOLVER, GTO+, etc.) finds an approximate Nash equilibrium for a specified spot: stacks, ranges, bet sizes, raise trees. It iterates — each side adjusts against the other — until neither can improve." },
          { heading: "Limits",
            body: "Solvers require inputs. Garbage ranges in, garbage solution out. They also assume perfect play on both sides — something no human does. Treat solver output as reference, not gospel." },
        ],
        takeaways: [
          "Solvers are calculators. You give inputs; they compute Nash.",
          "The value is in comparing solver output to human default — that's where edges live.",
          "Don't buy a solver yet. Learn to read outputs first.",
        ],
      },
    ],
  },

  // =====================================================================
  // WEEK 6: TURN & RIVER PLAY
  // =====================================================================
  {
    week: 6,
    title: "Turn & River Play",
    theme: "Barrels, value, bluffs, and blockers",
    description:
      "Later streets are where small edges compound into big pots. You learn barrel selection, river value betting, river bluffs with blockers, and what polarization really means.",
    lessons: [
      {
        id: "w06d01",
        week: 6, day: 1,
        title: "The Second Barrel",
        focus: "Which turns to fire and which to give up",
        minutes: 35,
        objectives: [
          "Identify favorable turns for the c-bettor",
          "Decide between barrel / check-behind / check-raise-bluff-catch",
          "Avoid the 'auto double barrel' trap",
        ],
        sections: [
          { heading: "Favorable turns for PFR",
            body: "Overcards (A, K) usually favor the preflop raiser because they add to his linear range. Brick turns (low blanks) often favor the caller because his range had more underpairs. Cards that complete obvious draws are usually bad barrels." },
          { heading: "Check-behind spots",
            body: "Medium strength hands (TP weak kicker, underpairs) prefer to check the turn IP for pot control. Barreling turns them into bluffs that don't fold anything better." },
        ],
        takeaways: [
          "Turn cards favor the player whose range gained high-card density.",
          "Don't barrel rivers you don't want to triple on — start the story early.",
          "Second barrels deplete villain's range much faster than c-bets.",
        ],
      },
      {
        id: "w06d02",
        week: 6, day: 2,
        title: "River Value Betting",
        focus: "Extracting thin value without going broke",
        minutes: 35,
        objectives: [
          "Decide bet size based on villain's call-range width",
          "Recognize when thin value beats a check",
          "Spot the 'turn into a bluff' trap",
        ],
        sections: [
          { heading: "Thin value",
            body: "The goal isn't to get called by better; it's to be called by worse. When you have a hand that beats half of villain's calling range, bet small. When you beat only the bottom of his range, check and hope for a bluff." },
          { heading: "Sizing",
            body: "For thin value, use 33-50% pot. Big bets fold out the hands that paid you. Larger sizes are for polarized hands — near-nuts or bluffs." },
        ],
        takeaways: [
          "Thin value is where skilled cash-game players earn.",
          "If villain's calling range has more hands worse than yours, bet.",
          "Checking a strong-ish hand is fine. Turning it into a bluff is not.",
        ],
      },
      {
        id: "w06d03",
        week: 6, day: 3,
        title: "River Bluffing and Blockers",
        focus: "Why you bluff with certain cards, not others",
        minutes: 40,
        objectives: [
          "Define blockers and un-blockers",
          "Pick bluff combos by blocker effect",
          "Avoid bluffing with cards that unblock villain's folds",
        ],
        sections: [
          { heading: "Blockers",
            body: "A blocker is a card that removes a combo from villain's range. Holding the Ace of hearts on a flushing board means villain has fewer nut flushes. Good bluff candidates block villain's value and un-block his folds." },
          { heading: "Example",
            body: "On a board of Ks-Qs-5h-2c-9s, bluffing with Ah beats bluffing with 7s7d because it blocks AsXs and doesn't remove villain's busted draws." },
        ],
        takeaways: [
          "Bluffs are selected by blocker effect, not random inclination.",
          "Holding a weak pair is often the worst bluffing hand — it blocks folds.",
          "Great bluffs feel slightly scary. That's usually a sign you picked the right card.",
        ],
      },
      {
        id: "w06d04",
        week: 6, day: 4,
        title: "Polarized vs Merged",
        focus: "The two shapes your range can take",
        minutes: 30,
        objectives: [
          "Define polarized and merged ranges",
          "Match shape to bet size",
          "Recognize when villain's bet size tells you his shape",
        ],
        sections: [
          { heading: "Polarized",
            body: "Very strong hands and bluffs — nothing in the middle. Typical for large river bets. You're not betting medium hands because villain will snap with worse only when you have worse still, and snap with better always." },
          { heading: "Merged",
            body: "Medium and strong value, few or no bluffs. Typical for small river bets. Good vs passive opponents who call wide but rarely raise." },
        ],
        takeaways: [
          "Big size = polarized. Small size = merged. Know which you are.",
          "Polarized ranges force all-or-nothing decisions on villain.",
          "Merged ranges extract from stations without risking stacks.",
        ],
      },
      {
        id: "w06d05",
        week: 6, day: 5,
        title: "Week 6 Review + Full Hand Analysis",
        focus: "Walk a hand end-to-end",
        minutes: 40,
        objectives: [
          "Narrate a hand street by street in ranges",
          "Identify the key decision point",
          "Suggest an alternate line and its EV trade-off",
        ],
        sections: [
          { heading: "Review hand",
            body: "UTG opens 2.5bb, BTN 3-bets to 8bb, UTG calls. Flop Ks-Jd-5c. UTG check, BTN bets 6bb (35% pot), UTG calls. Turn 7h. UTG check, BTN bets 17bb (50%), UTG calls. River 2s. UTG checks, BTN bets 60bb (over pot) — 85bb behind. What's UTG's range? What's BTN's polarized range? Who has the nut advantage?" },
        ],
        takeaways: [
          "Every strong player can narrate ranges and pot sizes from memory.",
          "The key decision is rarely on the river — usually street 1 or 2.",
          "Slow down on big spots. Recite the range before deciding.",
        ],
      },
    ],
  },

  // =====================================================================
  // WEEK 7: EXPLOITATIVE PLAY
  // =====================================================================
  {
    week: 7,
    title: "Exploitative Play",
    theme: "Where the real money lives",
    description:
      "GTO is the floor. Exploits are the edge. You learn population tendencies at different stakes, how to read opponents, and when to deviate.",
    lessons: [
      {
        id: "w07d01",
        week: 7, day: 1,
        title: "Population Tendencies",
        focus: "Your opponents are not solvers",
        minutes: 30,
        objectives: [
          "Describe small-stakes live, small-stakes online, and mid-stakes populations",
          "Predict deviations from GTO in each pool",
          "Pick your three biggest exploits per pool",
        ],
        sections: [
          { heading: "Live small stakes ($1/3, $2/5)",
            bullets: [
              "VPIP 35%+, calls wide preflop",
              "Under-3-bets (often 3-bet range is QQ+ AK)",
              "Over-calls and under-raises postflop",
              "Huge leaks: flatting premiums, slowplaying sets",
            ] },
          { heading: "Online small stakes (NL10-NL50)",
            bullets: [
              "Tighter VPIP (~22%), more 3-bets",
              "Balanced c-bet, under-bluffs turn and river",
              "Over-folds blinds to BTN opens",
              "Huge leak: river underbluff — bluff them often",
            ] },
        ],
        takeaways: [
          "Live pools fold too little. Online pools bluff too little.",
          "Your adjustments depend on which pool you play in, not on theory.",
          "Pick 3 exploits per session. More than that and you'll drift.",
        ],
      },
      {
        id: "w07d02",
        week: 7, day: 2,
        title: "Showdowns and Bet-Sizing Tells",
        focus: "Information that's nearly free",
        minutes: 30,
        objectives: [
          "Extract three pieces of info from every showdown",
          "Recognize the small-bet/big-bet pattern of amateur players",
          "Take notes that influence future hands",
        ],
        sections: [
          { heading: "Showdown info",
            body: "Every showdown is a probe into villain's range. If villain check-called 3 streets with second pair, you know his thresholds for check-calling. If villain overbet the river with two pair (not the nuts), you know his overbets are merged — bluff-catch wider next time." },
          { heading: "Bet-sizing tells",
            body: "Small bets (1/3 pot) often signal weak value or draws. Big bets (75%+) signal polarized ranges. Irregularly large bets vs normal ones within the same player signal strength. Watch sizing patterns, not words." },
        ],
        takeaways: [
          "If you don't take notes, you're starting from zero every hand.",
          "Showdowns give more info than any HUD stat.",
          "Sizing patterns are the #1 live and online tell at low stakes.",
        ],
      },
      {
        id: "w07d03",
        week: 7, day: 3,
        title: "Exploiting Nits",
        focus: "The tight-passive fit-or-fold player",
        minutes: 25,
        objectives: [
          "Identify a nit in 30 hands",
          "Steal more often against nits",
          "Respect their value bets — fold more",
        ],
        sections: [
          { heading: "Signatures",
            body: "VPIP <15%, PFR <12%, 3-bet <4%, aggression factor high but aggressive lines only with premiums. You'll see them fold preflop constantly and raise only when they have it." },
          { heading: "Adjustments",
            body: "Open 2.5x wider against them when you're IP. 3-bet them light from the blinds (suited wheel aces, suited connectors) — they fold 70%+ to 3-bets. When they bet big on the river, fold your bluff-catchers." },
        ],
        takeaways: [
          "Attack the weakest part of a nit's game: preflop and flop.",
          "When they finally fire, believe them.",
          "Nits print you money on preflop steals and bluff-c-bets.",
        ],
      },
      {
        id: "w07d04",
        week: 7, day: 4,
        title: "Exploiting Stations",
        focus: "The loose-passive calling machine",
        minutes: 25,
        objectives: [
          "Identify a station in 20 hands",
          "Value-bet thinner against stations",
          "Cut bluffs aggressively",
        ],
        sections: [
          { heading: "Signatures",
            body: "VPIP 40%+, PFR 10%, very low aggression factor, folds to c-bet <45%. They call wide, rarely raise, and pay off two streets without complaint." },
          { heading: "Adjustments",
            body: "Open tighter (they'll call anyway, no fold equity). Bet top pair for 3 streets of value, ignore balance. Never bluff the river — they call with ace-high. Double barrel only when you have draws or real equity, not as pure bluff." },
        ],
        takeaways: [
          "Stations are the most profitable regulars in any game.",
          "Thin value beats bluffs 10:1 against them.",
          "Patience printed, aggression lit on fire.",
        ],
      },
      {
        id: "w07d05",
        week: 7, day: 5,
        title: "HUD Stats — the Four You Need",
        focus: "Don't learn 40. Learn 4 and use them",
        minutes: 25,
        objectives: [
          "Define VPIP, PFR, 3-bet, and AF",
          "Use each to categorize opponents in ~50 hands",
          "Avoid overreacting to small samples",
        ],
        sections: [
          { heading: "The four stats",
            bullets: [
              "VPIP — % of hands voluntarily put in pot (looseness)",
              "PFR — % of hands preflop-raised (aggression preflop)",
              "3-bet — % of hands 3-bet preflop",
              "AF — Aggression Factor ((bet + raise) / call) postflop",
            ] },
          { heading: "Small-sample hell",
            body: "A stat from 40 hands is noise. Require 200+ hands before acting on anything except very stable baselines (VPIP converges fastest). For 3-bet you need 500+ hands to trust it." },
        ],
        takeaways: [
          "VPIP/PFR/3-bet/AF is all you need to categorize 90% of players.",
          "40-hand reads are worse than no read.",
          "Never deviate hard based on stats in a spot where a showdown gave you better info.",
        ],
      },
    ],
  },

  // =====================================================================
  // WEEK 8: TOURNAMENT FUNDAMENTALS
  // =====================================================================
  {
    week: 8,
    title: "Tournament Fundamentals",
    theme: "Structure, stack depth, and Chip EV",
    description:
      "MTTs differ from cash because chips aren't money and structure matters. This week you learn stack sizes, stages, and why tournament poker is 'survive + accumulate'.",
    lessons: [
      {
        id: "w08d01",
        week: 8, day: 1,
        title: "MTT Structure 101",
        focus: "What makes a tournament a tournament",
        minutes: 30,
        objectives: [
          "Describe blinds escalation and its effect on stack depth",
          "Explain the four stages of an MTT",
          "Recognize turbo vs deep structures",
        ],
        sections: [
          { heading: "Structure",
            body: "Tournaments escalate blinds every 10-20 minutes. Each level, the avg stack in big blinds shrinks unless players bust. A 200bb start often compresses to 30bb by the middle stages. The structure dictates strategy." },
          { heading: "Four stages",
            bullets: [
              "Early (100bb+) — deep stacks, cash-game-like",
              "Middle (30-50bb) — antes, stealing, 3-bet pressure",
              "Late / bubble — ICM, tight passive by avg player",
              "Final table — extreme ICM, negotiated pay jumps",
            ] },
        ],
        takeaways: [
          "MTT strategy is stage-dependent. A good early game is a bad late game.",
          "Turbo structures reduce the skill edge massively.",
          "Deep structures are where skill compounds.",
        ],
      },
      {
        id: "w08d02",
        week: 8, day: 2,
        title: "Chip EV vs Dollar EV",
        focus: "Why chips aren't money",
        minutes: 35,
        objectives: [
          "Explain why chip EV can be +EV but $EV -EV",
          "Define ICM in intuitive terms",
          "Avoid chip-EV mistakes on the bubble and final table",
        ],
        sections: [
          { heading: "The gap",
            body: "In cash, $100 in chips is $100. In tournaments, chips have declining marginal value — your 100th chip is worth less than your 10th, because you can only win first place once. A chip-EV +10% coinflip on the bubble can be $-EV." },
          { heading: "ICM",
            body: "Independent Chip Model assigns dollar values to stacks based on remaining payouts. It's the formal way to convert chip stacks into tournament equity. We'll compute it explicitly in Week 9." },
        ],
        takeaways: [
          "Chip EV ≠ $EV. The gap is largest near the money and at final tables.",
          "A 55/45 flip can be -$EV when payouts are top-heavy.",
          "The pros fold QQ on the bubble in extreme spots — not a mistake.",
        ],
      },
      {
        id: "w08d03",
        week: 8, day: 3,
        title: "Stack Sizes and M",
        focus: "How deep are you, really?",
        minutes: 30,
        objectives: [
          "Compute M (orbits-of-survival) for any stack",
          "Translate M into strategic tempo",
          "Know the push/fold threshold (~15bb)",
        ],
        sections: [
          { heading: "M",
            body: "M = stack / (SB + BB + antes per orbit). At M>20 you can play chess. At M 10-20 you're in 'reshove territory' — 3-bet jams, tight calls. At M<10 you're shoving or folding." },
          { heading: "Stack bands",
            bullets: [
              "100bb+ — deep, postflop matters",
              "40-100bb — 3-bet pots dominate",
              "20-40bb — open/3-bet shove dynamics",
              "10-20bb — reshove/call-shove ranges",
              "<10bb — pure push/fold",
            ] },
        ],
        takeaways: [
          "Stack depth dictates line, not hand strength.",
          "Below 15bb you must shove first-in or you're bleeding.",
          "Above 40bb, postflop edges dominate; below, preflop does.",
        ],
      },
      {
        id: "w08d04",
        week: 8, day: 4,
        title: "Early-Game Deep Play",
        focus: "Play cash-game tight + speculative hands",
        minutes: 30,
        objectives: [
          "Open solid ranges with 150bb+ stacks",
          "Play suited connectors and small pairs for set value",
          "Avoid getting stacked with one pair",
        ],
        sections: [
          { heading: "Deep-stack priorities",
            body: "Deep, equity realization > fold equity. Play position. Avoid marginal spots. Top pair is rarely stack-off strength at 200bb+. Look for set-mining and suited-connector implied odds." },
        ],
        takeaways: [
          "Deep = postflop. Shallow = preflop. Adjust accordingly.",
          "Avoid losing 100bb with TPTK at 200bb stacks.",
          "Set-mining and suited connectors are your deep-stack bread and butter.",
        ],
      },
      {
        id: "w08d05",
        week: 8, day: 5,
        title: "Middle Stage — Antes and Stealing",
        focus: "Free money in the middle of every pot",
        minutes: 30,
        objectives: [
          "Calculate ante contribution to the pot",
          "Widen open ranges once antes kick in",
          "Identify steal-spots from late position",
        ],
        sections: [
          { heading: "Ante math",
            body: "At 1k/2k with 200 antes at a 9-handed table, the pot is 1k + 2k + 9*200 = 4.8k before any action. That's 40% more than a no-ante pot. Your EV of an uncontested steal jumps — widen opens from late position accordingly." },
          { heading: "Table dynamics",
            body: "Middle stage is when regs start getting tight (approaching bubble). Exploit by 3-betting their opens, light ISO-raising limpers, and attacking tight blinds." },
        ],
        takeaways: [
          "Antes transform the economics. Open 10-15% wider in late position.",
          "Tight pre-bubble players are the softest targets in MTTs.",
          "Middle stage > early stage for EV/hour.",
        ],
      },
    ],
  },

  // =====================================================================
  // WEEK 9: TOURNAMENT LATE STAGE & ICM
  // =====================================================================
  {
    week: 9,
    title: "Late Stage & ICM",
    theme: "Push/fold, ICM, bubble play, heads-up",
    description:
      "The most profitable area of tournament poker. You learn push/fold charts, ICM implications, bubble strategy, and heads-up dynamics.",
    lessons: [
      {
        id: "w09d01",
        week: 9, day: 1,
        title: "Push/Fold Charts",
        focus: "Below 15bb, everything collapses to two decisions",
        minutes: 35,
        objectives: [
          "Name the jam/fold ranges by position and stack",
          "Explain why these charts exist (Nash)",
          "Apply them under time pressure",
        ],
        sections: [
          { heading: "Nash push/fold",
            body: "In heads-up push/fold equilibrium, each stack size has a Nash range. At 10bb UTG of 9-handed, you jam roughly 12% of hands. At 10bb CO, maybe 18%. BTN wider, SB wider still. Memorize the shape, not every combo." },
          { heading: "Adjusting",
            body: "Nash assumes villains call Nash too. If villains call tighter than Nash (common), shove wider. If they call looser, shove tighter." },
        ],
        takeaways: [
          "At 10bb and below, your entire strategy is a jam/fold chart.",
          "Memorizing charts is a finite project — do it once.",
          "Nash is the ceiling; exploits push your ranges wider.",
        ],
      },
      {
        id: "w09d02",
        week: 9, day: 2,
        title: "ICM in Practice",
        focus: "Use ICM to decide borderline spots",
        minutes: 40,
        objectives: [
          "Compute ICM for a given 9-handed final table",
          "Translate chip equities into $ values",
          "Decide between calls that are +chipEV but -$EV",
        ],
        sections: [
          { heading: "Malmuth-Harville",
            body: "The standard ICM model. Each player's equity = probability of finishing 1st * payout1 + probability of finishing 2nd * payout2 + ... Probabilities are derived from chip fractions recursively." },
          { heading: "Example",
            body: "At a 3-way final table with stacks 50/30/20 and payouts 50/30/20, the chipEV big stack has about 47% of the prize pool — not 50%. Short stacks 'overperform' their chip %." },
        ],
        takeaways: [
          "Short stacks always have more $ equity than their chip fraction.",
          "Big stacks press because their chip fraction overperforms their $ equity.",
          "Mid stacks should be the most careful — they benefit most from folds.",
        ],
        trainer: "icm",
      },
      {
        id: "w09d03",
        week: 9, day: 3,
        title: "Bubble Dynamics",
        focus: "When one pay jump = the whole tournament",
        minutes: 35,
        objectives: [
          "Identify the bubble and its incentives",
          "Apply ICM pressure as a big stack",
          "Survive as a short stack without fold-all-ins",
        ],
        sections: [
          { heading: "Big stack strategy",
            body: "Open nearly any two cards from late position. Medium stacks will fold QQ to a shove. Small stacks must play tight. You print for free during the last 15 minutes before the bubble bursts." },
          { heading: "Short stack strategy",
            body: "If you're the shortest, you're the most pressured. Jam first-in when it's the only +chipEV move, but fold hands that would be borderline otherwise. Don't call shoves without elite equity." },
        ],
        takeaways: [
          "The bubble is where ICM abuse is biggest.",
          "Big stacks vs medium stacks = massive EV.",
          "Short stacks must survive; medium stacks must not tangle.",
        ],
      },
      {
        id: "w09d04",
        week: 9, day: 4,
        title: "Heads-Up Play",
        focus: "The most aggressive game in poker",
        minutes: 35,
        objectives: [
          "Open the BTN >70% in HU",
          "Defend BB wider than you think",
          "Master 3-bet pots in HU",
        ],
        sections: [
          { heading: "Why wide",
            body: "HU, the BB is the only opponent. The button opens any two cards that beat random — that's 72%+. The BB defends ~60% (including 3-bets). Both players are in a constant stealing/restealing war." },
          { heading: "Key adjustments",
            body: "C-bet frequency is lower than 6-max (smaller range advantage). Float more on flops, attack turns that kill the PFR's range." },
        ],
        takeaways: [
          "Ranges are 5x wider heads-up than 6-max.",
          "Passive HU is losing HU.",
          "The biggest edge is getting the BB right.",
        ],
      },
      {
        id: "w09d05",
        week: 9, day: 5,
        title: "ICM Trainer Block",
        focus: "40 minutes of ICM drills",
        minutes: 40,
        objectives: [
          "Solve 10 ICM scenarios to within 2% error",
          "Internalize the short stack overperformance pattern",
          "Log your biggest surprises",
        ],
        sections: [
          { heading: "Drill plan",
            body: "Use the ICM trainer. Set up 3-way, 4-way, and 6-way final tables. Guess each player's $ share before clicking 'Compute'. Log your error. Do 10 reps across stack distributions." },
        ],
        takeaways: [
          "ICM intuition is slow to build. Only reps fix this.",
          "A single ICM blunder at a final table costs more than a session of cash.",
          "Expect short stacks to be worth 1.5-2x their chip fraction.",
        ],
        trainer: "icm",
      },
    ],
  },

  // =====================================================================
  // WEEK 10: MENTAL GAME & BANKROLL
  // =====================================================================
  {
    week: 10,
    title: "Mental Game & Bankroll",
    theme: "You vs yourself",
    description:
      "The skill ceiling is low; the discipline ceiling is high. You learn variance, tilt, bankroll management, and session routines.",
    lessons: [
      {
        id: "w10d01",
        week: 10, day: 1,
        title: "Variance and Sample Size",
        focus: "Why your win-rate isn't your results",
        minutes: 30,
        objectives: [
          "Explain standard deviation in bb/100",
          "Compute 95% confidence intervals for a win-rate",
          "Accept that 50k hands proves almost nothing",
        ],
        sections: [
          { heading: "The numbers",
            body: "6-max NL cash has a standard deviation of ~95-105 bb/100. Over 10k hands, your 95% CI around a true 5bb/100 win-rate is ±19bb/100. You could measure -14 or +24 with the same true skill. 100k hands narrows to ±6. 1M hands narrows to ±2." },
        ],
        takeaways: [
          "You can't 'feel' your win-rate. You need large samples.",
          "Downswings of 20-40 buy-ins happen to winning players regularly.",
          "Judge yourself by decisions, not bankroll shape.",
        ],
      },
      {
        id: "w10d02",
        week: 10, day: 2,
        title: "Tilt",
        focus: "The most expensive mistake you make",
        minutes: 30,
        objectives: [
          "Recognize your three tilt triggers",
          "Build a stop-loss and stop-win rule",
          "Use a 5-minute tilt protocol when emotion spikes",
        ],
        sections: [
          { heading: "Tilt recognition",
            body: "Tilt is any emotional state that pulls you off your game. Common triggers: bad beats, coolers, losing to a specific opponent, feeling 'owed' chips. The tell is playing hands you wouldn't deal into at hand 1." },
          { heading: "Protocols",
            body: "Stop-loss: quit at 3 buy-ins down. Stop-win: also real — cognitive fatigue after a big win is its own tilt. Tilt protocol: stand up, 2 min of deep breathing, verbalize the trigger. If it doesn't shake, quit." },
        ],
        takeaways: [
          "Tilt costs more than any leak you can study away.",
          "Preset stop-loss and stop-win rules. Don't negotiate mid-session.",
          "Tilt recovery is a skill. Practice it.",
        ],
      },
      {
        id: "w10d03",
        week: 10, day: 3,
        title: "Bankroll Management",
        focus: "The number of buy-ins you need to survive",
        minutes: 30,
        objectives: [
          "Pick a BRM tier (conservative, moderate, aggressive)",
          "Know standard cash and MTT bankroll requirements",
          "Decide when to move up or down",
        ],
        sections: [
          { heading: "Cash BRM",
            bullets: [
              "Conservative: 50 buy-ins at current stake",
              "Moderate: 30 buy-ins",
              "Aggressive: 20 buy-ins (don't do this unless you have backup)",
            ] },
          { heading: "MTT BRM",
            bullets: [
              "MTTs have extreme variance — 200+ buy-ins is standard",
              "Satellite-heavy schedules: ~150 buy-ins OK",
              "Hypers/turbos: 300+ buy-ins, variance is brutal",
            ] },
        ],
        takeaways: [
          "Underbankrolled = playing scared = playing badly.",
          "MTT BRM is 5-10x cash BRM. Don't bridge it.",
          "Move down when you hit 30bi cash / 100bi MTT.",
        ],
      },
      {
        id: "w10d04",
        week: 10, day: 4,
        title: "A-Game Discipline",
        focus: "Only play your best game",
        minutes: 25,
        objectives: [
          "Identify your A-game, B-game, C-game",
          "Pre-commit to quitting when B-game appears",
          "Build a pre-session warm-up",
        ],
        sections: [
          { heading: "The three games",
            body: "A-game: focused, fast, right decisions even in tough spots. B-game: still profitable but slower and miss thin spots. C-game: autopilot, tilt-prone, trails money. The gap from A to C is huge — multiple bb/100." },
          { heading: "Warm-up",
            body: "3-5 minutes pre-session: review 3 hand histories, look at preflop charts, set one goal for the session. This raises baseline to A-game faster." },
        ],
        takeaways: [
          "Never play C-game. Ever.",
          "A structured warm-up is worth 1-2 bb/100.",
          "Length of session should be capped by mental energy, not bankroll.",
        ],
      },
      {
        id: "w10d05",
        week: 10, day: 5,
        title: "Study Routines",
        focus: "How pros stay ahead",
        minutes: 25,
        objectives: [
          "Build a weekly study schedule",
          "Pick 3 review modes: hand history, solver, community",
          "Balance play vs study ratio",
        ],
        sections: [
          { heading: "Pro schedule",
            body: "Winning regs spend 25-33% of their poker time on study. A typical week: 20 hrs play + 5-7 hrs study. Study modes: hand history review (biggest ROI), solver work (concept refinement), community (peer review and new ideas)." },
        ],
        takeaways: [
          "Play without study is grinding. Study without play is theory.",
          "Hand history review is #1. Solver is #2.",
          "Block 30 minutes daily. Consistency beats marathon sessions.",
        ],
      },
    ],
  },

  // =====================================================================
  // WEEK 11: ADVANCED CONCEPTS
  // =====================================================================
  {
    week: 11,
    title: "Advanced Concepts",
    theme: "Combinatorics, metagame, multiway, overbets",
    description:
      "The fine edges. Small frequency shifts that separate strong regs from winning pros.",
    lessons: [
      {
        id: "w11d01",
        week: 11, day: 1,
        title: "Combinatorics and Blockers",
        focus: "Counting combos like a card counter",
        minutes: 35,
        objectives: [
          "Count combos in any range for any hand class",
          "Use card removal to update your range read",
          "Apply combinatorics to river bluff-catches",
        ],
        sections: [
          { heading: "Core counts",
            bullets: [
              "Any suited hand: 4 combos",
              "Any offsuit hand: 12 combos",
              "Any pair: 6 combos",
              "Top set with a paired card: 3 combos (1 less)",
              "Two pair: 9 combos (3*3)",
            ] },
          { heading: "River example",
            body: "Board Ks-Qs-Jc-5h-2s. Villain's river bet range includes flushes (?), sets (KK=3, QQ=3, JJ=3), two pair (KQ=12... but KQs is mostly in his preflop raising range)... count the combos and compute the value:bluff ratio he'd need." },
        ],
        takeaways: [
          "Combos turn fuzzy reads into exact numbers.",
          "Paired boards halve certain combo counts — remember KK has only 3 combos once a K is out.",
          "Always ask: how many combos of bluff vs value?",
        ],
      },
      {
        id: "w11d02",
        week: 11, day: 2,
        title: "Metagame and Leveling",
        focus: "Playing against the player, not the hand",
        minutes: 30,
        objectives: [
          "Identify 'level 1-4' thinking in opponents",
          "Pick your level based on history",
          "Avoid leveling yourself out of a correct call",
        ],
        sections: [
          { heading: "Levels",
            bullets: [
              "Level 1: My cards",
              "Level 2: His cards",
              "Level 3: What he thinks I have",
              "Level 4: What he thinks I think he has",
            ] },
          { heading: "Rule",
            body: "Play one level above your opponent. Against Level 1 (amateur), play Level 2 (range reading). Against Level 3 (thinking reg), play Level 4 (range-vs-range). Don't play Level 4 against Level 1 — you'll out-think the spot." },
        ],
        takeaways: [
          "Most people play at Level 2 or below. Exploit with Level 3.",
          "Never play Level 5 poker. Ever.",
          "History between you and villain creates leveling opportunities.",
        ],
      },
      {
        id: "w11d03",
        week: 11, day: 3,
        title: "Multiway Pots",
        focus: "Three or more = different game",
        minutes: 30,
        objectives: [
          "Tighten your bluff frequency in multiway pots",
          "Value-bet thinner because someone usually has it",
          "Avoid bloat with marginal hands",
        ],
        sections: [
          { heading: "Why multiway is different",
            body: "In a 3-way pot the second-best hand stacks off way less often, so implied odds for draws increase. Bluffs are much worse (you need everyone to fold). Value hands get called down wider." },
        ],
        takeaways: [
          "Cut bluffs in half for every extra player in the pot.",
          "Flush draws and sets love multiway.",
          "One-pair hands hate multiway.",
        ],
      },
      {
        id: "w11d04",
        week: 11, day: 4,
        title: "Check-Raising",
        focus: "The most feared line at low stakes",
        minutes: 30,
        objectives: [
          "Build a balanced check-raise range on wet flops",
          "Recognize when to check-raise as a bluff",
          "Understand why small-stakes players under-check-raise",
        ],
        sections: [
          { heading: "Check-raise theory",
            body: "Check-raises happen when the checking player has a stronger hand or a strong-enough draw that wants to build the pot. Bluffs should be chosen with blockers and equity (combo draws, OESDs)." },
          { heading: "Exploit",
            body: "Small-stakes players under-check-raise by 50%+. That means c-bet ranges should NOT be protected with trap-check-raises as much as theory suggests — because you face far fewer of them in practice." },
        ],
        takeaways: [
          "Check-raising is the most intimidating line — and the most under-used at low stakes.",
          "Build yours around combo draws and sets.",
          "Discount villain's check-raise frequency when villain is a small-stakes reg.",
        ],
      },
      {
        id: "w11d05",
        week: 11, day: 5,
        title: "Overbets and Underbets",
        focus: "The sizes that separate regs from pros",
        minutes: 35,
        objectives: [
          "Identify overbet spots: nut advantage + polarization",
          "Identify underbet spots: range advantage + merged value",
          "Defend against overbets correctly (MDF)",
        ],
        sections: [
          { heading: "Overbets",
            body: "Overbetting works when you have a clear nut advantage and villain's range can have strong but not-nut hands that want to call. Classic spot: 3bb 3-bettor facing BB caller on Ace-high runout. Villain has Kx-like hands; you overbet with AK, sets, and bluffs that block villain's folds." },
          { heading: "Underbets",
            body: "Underbetting (15-33% pot) works when you have range advantage and want to bet wide for thin value. Classic spot: BTN c-betting 25% into big blind on dry high-card flops." },
        ],
        takeaways: [
          "Overbets require a nut-advantage story. Build it from preflop.",
          "Underbets are the GTO answer when ranges are wide.",
          "Most small-stakes players never use either size. Exploit with both.",
        ],
      },
    ],
  },

  // =====================================================================
  // WEEK 12: SYNTHESIS & EXPERT PLAY
  // =====================================================================
  {
    week: 12,
    title: "Synthesis & Expert Play",
    theme: "Study workflows, hand review, graduation",
    description:
      "The capstone. You build a personal study system, lock in a hand-review process, and set the path for the next year.",
    lessons: [
      {
        id: "w12d01",
        week: 12, day: 1,
        title: "Solver Workflow",
        focus: "How to actually use a solver",
        minutes: 35,
        objectives: [
          "Define inputs for a useful solver run",
          "Know the three outputs to extract first",
          "Avoid the 'memorize the solution' trap",
        ],
        sections: [
          { heading: "Inputs",
            bullets: [
              "Preflop ranges (check Nash or published)",
              "Bet sizes (restrict to 33/66/125 to speed up)",
              "Effective stacks and pot size",
              "Rake and other realism flags",
            ] },
          { heading: "Extraction",
            body: "After a run, extract: (1) my c-bet frequency by flop, (2) my check-raise frequency, (3) my turn-barrel frequency. These three numbers guide your practical strategy 90% of the time." },
        ],
        takeaways: [
          "Solvers are calculators, not playbooks.",
          "Focus on frequencies, not specific combos.",
          "Solutions vary with inputs; guard against garbage in.",
        ],
      },
      {
        id: "w12d02",
        week: 12, day: 2,
        title: "Hand Review Framework",
        focus: "The 20-minute hand post-mortem",
        minutes: 30,
        objectives: [
          "Write a preflop/flop/turn/river audit per hand",
          "Assign a decision grade per street",
          "Extract one concrete learning per hand",
        ],
        sections: [
          { heading: "Framework",
            body: "Per hand: (1) preflop — was my range right? (2) flop — was my size and action aligned with range advantage? (3) turn — did I barrel the right cards? (4) river — was my value/bluff ratio defensible? Grade each A-F. Store the one biggest leak." },
          { heading: "Frequency",
            body: "Review 3-5 hands per session. Pick the biggest pots and the biggest mistakes. Over 90 days that's 300+ reviewed hands — a small lifetime's worth of concrete learning." },
        ],
        takeaways: [
          "Reviewed hands beat played hands by 3-5x in terms of EV/hour of study.",
          "Grade, don't lecture yourself. A-F keeps it scannable.",
          "Keep a leak file. Reread it before sessions.",
        ],
      },
      {
        id: "w12d03",
        week: 12, day: 3,
        title: "Your Personal Study Schedule",
        focus: "Build a sustainable weekly system",
        minutes: 25,
        objectives: [
          "Allocate hours: play / review / theory",
          "Pick your weakest area each week",
          "Build a 6-week rolling plan",
        ],
        sections: [
          { heading: "Template",
            body: "Weekly: 4-5 play sessions (2-4 hrs each), 1 theory session (90 min, solver or book), 1 review session (90 min, 5 hands deep). That's ~15 hrs/week — sustainable around a job." },
        ],
        takeaways: [
          "Consistency beats intensity.",
          "Weakest-area focus beats equal-time-on-everything.",
          "Rolling 6-week plan keeps you from chasing shiny objects.",
        ],
      },
      {
        id: "w12d04",
        week: 12, day: 4,
        title: "Moving Up Stakes",
        focus: "When and how",
        minutes: 25,
        objectives: [
          "Apply 'shot-taking' rules with a stop-loss",
          "Know the minimum sample before a full move",
          "Plan your move-down triggers",
        ],
        sections: [
          { heading: "Shot rules",
            body: "Take a shot at the next stake with 3 buy-ins earmarked. Stop-loss: 3 buy-ins. If you win 2+ buy-ins, continue. If you lose all 3, drop back. Log every shot." },
          { heading: "Full move",
            body: "After 5k+ hands at the new stake with a non-negative win-rate AND bankroll at target (30 or 50 buy-ins at the new stake), commit fully." },
        ],
        takeaways: [
          "Shot-taking is a skill. Most players take uncalibrated, ego-driven shots.",
          "Win-rate at the new stake, not bankroll alone, is the graduation criterion.",
          "Know your move-down trigger in advance.",
        ],
      },
      {
        id: "w12d05",
        week: 12, day: 5,
        title: "Graduation: Capstone + Next 90 Days",
        focus: "What you've learned and what's next",
        minutes: 40,
        objectives: [
          "Pass the capstone quiz (20 mixed questions)",
          "Write a 3-item goal list for the next 90 days",
          "Celebrate — you built a foundation 95% of players never build",
        ],
        sections: [
          { heading: "What you know now",
            body: "Preflop ranges across positions. EV math and pot odds in under 3 seconds. Board texture and sizing mapped to range advantage. Exploits for the three major opponent types. ICM and push/fold for tournaments. Mental game and bankroll discipline. A personal study system." },
          { heading: "What's next",
            bullets: [
              "Volume — 10k hands/month minimum for 3 months",
              "One advanced course on a single topic (e.g. turn play, ICM late-stage)",
              "Join a study group or hire a coach for 4 sessions",
              "Move up one stake if BRM and win-rate support it",
            ] },
        ],
        takeaways: [
          "Three months doesn't make you an expert. It gives you the scaffolding experts are built on.",
          "You now learn 10x faster than before — because you know the vocabulary.",
          "Keep reviewing. Keep drilling. Compound the edge.",
        ],
      },
    ],
  },
];

export const ALL_LESSONS: Lesson[] = CURRICULUM.flatMap(w => w.lessons);

export function findLesson(id: string): Lesson | undefined {
  return ALL_LESSONS.find(l => l.id === id);
}

export function findWeek(n: number): Week | undefined {
  return CURRICULUM.find(w => w.week === n);
}

export const TOTAL_LESSONS = ALL_LESSONS.length;

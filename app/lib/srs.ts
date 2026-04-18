// Spaced Repetition System — Ebbinghaus-inspired fixed interval ladder

export interface SRSCard {
  word: string;       // VocabItem.word (primary key)
  nextReview: string; // ISO date string
  interval: number;   // days until next review
  step: number;       // position in INTERVALS ladder (0–5)
  lapses: number;     // times forgotten
}

// Review intervals in days: 1 → 3 → 7 → 14 → 30 → 60
export const INTERVALS = [1, 3, 7, 14, 30, 60];

function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Create a brand-new SRS card (scheduled for tomorrow) */
export function newCard(word: string): SRSCard {
  return { word, nextReview: addDays(1), interval: 1, step: 0, lapses: 0 };
}

/** Is this card due for review today? */
export function isDue(card: SRSCard): boolean {
  return new Date(card.nextReview) <= new Date();
}

/** Advance or reset a card after a review answer */
export function reviewCard(card: SRSCard, correct: boolean): SRSCard {
  if (!correct) {
    return {
      ...card,
      step: 0,
      interval: INTERVALS[0],
      lapses: card.lapses + 1,
      nextReview: addDays(INTERVALS[0]),
    };
  }
  const nextStep = Math.min(card.step + 1, INTERVALS.length - 1);
  return {
    ...card,
    step: nextStep,
    interval: INTERVALS[nextStep],
    nextReview: addDays(INTERVALS[nextStep]),
  };
}

/** Number of cards due today */
export function dueCount(cards: SRSCard[]): number {
  return cards.filter(isDue).length;
}

/** Nearest upcoming review date among cards not yet due */
export function nextDueDate(cards: SRSCard[]): Date | null {
  const upcoming = cards.filter((c) => !isDue(c));
  if (upcoming.length === 0) return null;
  return new Date(
    upcoming.reduce((a, b) =>
      new Date(a.nextReview) < new Date(b.nextReview) ? a : b
    ).nextReview
  );
}

/**
 * Weekly reflection deck builder. Contract: docs/specs/feature/weekly-reflection.md
 *
 * Framework-free: replays review history through the scheduler to compare bucket
 * state at the start of the ISO week with today.
 */

import type { Grade } from "@/lib/scheduler";
import type { StarterCard } from "@/lib/starter-deck";
import { bucketForTask, buildVocabularySnapshot, type VocabularyCounts } from "@/lib/vocabulary-snapshot";
import { rebuild, newTask, type Task } from "@/lib/scheduler";

export type ReviewRecord = {
  taskId: string;
  reviewedAtMs: number;
  grade: Grade;
};

export type ReflectionVisual =
  | { kind: "band-shift"; before: VocabularyCounts; after: VocabularyCounts; movedToHeld: number }
  | { kind: "horizon"; bins: readonly { dayOffset: number; count: number }[] }
  | { kind: "review-activity"; reviewCount: number };

export type ReflectionCardModel = {
  id: string;
  headline: string;
  visual: ReflectionVisual;
  derivationHref?: string;
};

export type WeeklyReflectionModel =
  | { status: "hidden" }
  | {
      status: "idle" | "ready" | "read";
      isoWeek: string;
      languageCode: string;
      languageName: string;
      teaser: string;
      unread: boolean;
      cards: ReflectionCardModel[];
    };

export function isoWeekId(timestampMs: number): string {
  const date = new Date(timestampMs);
  const tmp = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function startOfIsoWeek(timestampMs: number): number {
  const date = new Date(timestampMs);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - day + 1);
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime();
}

type DeckCardInput = Pick<StarterCard, "taskId" | "wordId" | "lemma" | "frequencyRank" | "front" | "back">;

export function buildWeeklyReflection(input: {
  now: number;
  languageCode: string;
  languageName: string;
  cards: readonly DeckCardInput[];
  reviews: readonly ReviewRecord[];
  seenValue: string | undefined;
}): WeeklyReflectionModel {
  const isoWeek = isoWeekId(input.now);
  const weekStart = startOfIsoWeek(input.now);

  if (input.reviews.length === 0) {
    return { status: "hidden" };
  }

  const reviewsThisWeek = input.reviews.filter((review) => review.reviewedAtMs >= weekStart);
  const tasksAtWeekStart = tasksFromReviews(input.cards, input.reviews, weekStart);
  const tasksNow = tasksFromReviews(input.cards, input.reviews);

  const meaningCards = input.cards.filter((card) => card.taskId.endsWith(":meaning-recall"));
  const movedToHeld = countMovedToHeld(meaningCards, tasksAtWeekStart, tasksNow, reviewsThisWeek);

  const snapshotNow = buildVocabularySnapshot(meaningCards, tasksNow, input.now);

  const snapshotAtWeekStart = buildVocabularySnapshot(meaningCards, tasksAtWeekStart, weekStart);

  const unread = isReflectionUnread(isoWeek, input.languageCode, input.seenValue);

  if (reviewsThisWeek.length === 0) {
    return {
      status: unread ? "idle" : "read",
      isoWeek,
      languageCode: input.languageCode,
      languageName: input.languageName,
      teaser: copy.idleTeaser(input.languageName),
      unread,
      cards: [
        {
          id: "idle-week",
          headline: copy.idleHeadline(input.languageName),
          visual: { kind: "horizon", bins: snapshotNow.horizon },
          derivationHref: "/progress#signals",
        },
      ],
    };
  }

  const deckCards: ReflectionCardModel[] = [];

  if (movedToHeld > 0) {
    deckCards.push({
      id: "movement",
      headline: copy.movementHeadline(movedToHeld, input.languageName),
      visual: {
        kind: "band-shift",
        before: snapshotAtWeekStart.counts,
        after: snapshotNow.counts,
        movedToHeld,
      },
      derivationHref: "/progress#signals",
    });
  }

  deckCards.push({
    id: "activity",
    headline: copy.activityHeadline(reviewsThisWeek.length, input.languageName),
    visual: { kind: "review-activity", reviewCount: reviewsThisWeek.length },
  });

  if (snapshotNow.horizon.some((bin) => bin.count > 0)) {
    deckCards.push({
      id: "horizon",
      headline: copy.horizonHeadline(input.languageName),
      visual: { kind: "horizon", bins: snapshotNow.horizon },
      derivationHref: "/progress#signals",
    });
  }

  const cards = deckCards.slice(0, 5);
  const last = cards[cards.length - 1];
  if (last && !last.derivationHref) {
    cards[cards.length - 1] = { ...last, derivationHref: "/progress#signals" };
  }

  const teaser =
    movedToHeld > 0
      ? copy.readyTeaserMoved(movedToHeld, input.languageName)
      : copy.readyTeaserActivity(reviewsThisWeek.length, input.languageName);

  return {
    status: unread ? "ready" : "read",
    isoWeek,
    languageCode: input.languageCode,
    languageName: input.languageName,
    teaser,
    unread,
    cards,
  };
}

function isReflectionUnread(isoWeek: string, languageCode: string, seenValue: string | undefined) {
  const expected = `${isoWeek}:${languageCode}`;
  return seenValue !== expected;
}

function tasksFromReviews(
  cards: readonly DeckCardInput[],
  reviews: readonly ReviewRecord[],
  cutoffMs?: number,
): Record<string, Task> {
  const byTask = new Map<string, { at: number; grade: Grade }[]>();

  for (const review of reviews) {
    if (cutoffMs !== undefined && review.reviewedAtMs >= cutoffMs) continue;
    const list = byTask.get(review.taskId) ?? [];
    list.push({ at: review.reviewedAtMs, grade: review.grade });
    byTask.set(review.taskId, list);
  }

  const out: Record<string, Task> = {};
  for (const card of cards) {
    const history = byTask.get(card.taskId) ?? [];
    history.sort((a, b) => a.at - b.at);
    out[card.taskId] =
      history.length === 0
        ? newTask(card.taskId, card.wordId)
        : rebuild(card.taskId, card.wordId, history).task;
  }

  return out;
}

function countMovedToHeld(
  meaningCards: readonly DeckCardInput[],
  tasksAtWeekStart: Record<string, Task>,
  tasksNow: Record<string, Task>,
  reviewsThisWeek: readonly ReviewRecord[],
): number {
  const reviewedThisWeek = new Set(reviewsThisWeek.map((review) => review.taskId));
  let moved = 0;

  for (const card of meaningCards) {
    if (!reviewedThisWeek.has(card.taskId)) continue;
    const before = bucketForTask(tasksAtWeekStart[card.taskId] ?? newTask(card.taskId, card.wordId));
    const after = bucketForTask(tasksNow[card.taskId] ?? newTask(card.taskId, card.wordId));
    if (before !== "held" && after === "held") moved += 1;
  }

  return moved;
}

const copy = {
  idleTeaser: (language: string) => `This week in ${language} — nothing shifted yet`,
  idleHeadline: (language: string) =>
    `You did not review ${language} this week. Nothing changed in your measured vocabulary — that is expected after a light week. The queue will be larger when you return; the schedule is unchanged.`,
  movementHeadline: (count: number, language: string) => {
    const word = count === 1 ? "word" : "words";
    return `This week ${count} ${word} moved from shaky to held in ${language}.`;
  },
  activityHeadline: (count: number, language: string) => {
    const answer = count === 1 ? "answer" : "answers";
    return `You recorded ${count} review ${answer} in ${language} this week.`;
  },
  horizonHeadline: (language: string) =>
    `Here is when your ${language} reviews are due over the next thirty days.`,
  readyTeaserMoved: (count: number, language: string) => {
    const word = count === 1 ? "word" : "words";
    return `${count} ${word} moved to held in ${language} this week`;
  },
  readyTeaserActivity: (count: number, language: string) =>
    `${count} review ${count === 1 ? "answer" : "answers"} in ${language} this week`,
} as const;

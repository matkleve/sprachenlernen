import { cookies } from "next/headers";

import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import { listReviewsForTaskIds } from "@/lib/db/review-log";
import { languageLabel } from "@/lib/languages";
import { REFLECTION_SEEN_COOKIE } from "@/lib/reflection-seen";
import { buildWeeklyReflection, type ReviewRecord, type WeeklyReflectionModel } from "@/lib/weekly-reflection";

/**
 * Loads the weekly reflection deck for the active language. Contract:
 * docs/specs/feature/weekly-reflection.md
 */
export async function readWeeklyReflection(now: number = Date.now()): Promise<WeeklyReflectionModel> {
  const pool = await poolForActiveLanguage();
  if (pool.status === "no-language" || pool.status === "error") {
    return { status: "hidden" };
  }

  const languageCode = pool.languageCodes[0] ?? "";
  const reviewsResult = await listReviewsForTaskIds(pool.cards.map((card) => card.taskId));
  if (reviewsResult.status === "error") {
    return { status: "hidden" };
  }

  const jar = await cookies();
  const seenValue = jar.get(REFLECTION_SEEN_COOKIE)?.value;

  const reviews: ReviewRecord[] = reviewsResult.reviews.map((row) => ({
    taskId: row.taskId,
    reviewedAtMs: new Date(row.reviewedAt).getTime(),
    grade: row.grade,
  }));

  return buildWeeklyReflection({
    now,
    languageCode,
    languageName: languageLabel(languageCode).endonym,
    cards: pool.cards.map((card) => ({
      taskId: card.taskId,
      wordId: card.wordId,
      lemma: card.lemma,
      frequencyRank: card.frequencyRank,
      front: card.front,
      back: card.back,
      descriptionKey: card.descriptionKey,
    })),
    reviews,
    seenValue,
  });
}

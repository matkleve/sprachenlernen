import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import {
  budgetProfileForMethod,
  itemCountForBudgetMinutes,
} from "@/lib/exercise-recipe/budget";
import type { SessionContext } from "@/lib/exercise-recipe/types";
import { pickSentenceTargets } from "@/lib/exercise-recipe/sentence-target";
import type { ExerciseRecipe, ExerciseStep } from "@/lib/exercise-runner/types";
import { loadMeaningRecallDeck } from "@/lib/starter-deck";

async function meaningRecallCardsForPractice(): Promise<readonly import("@/lib/starter-deck").StarterCard[]> {
  try {
    const pool = await poolForActiveLanguage();
    if (pool.status === "ok") return pool.cards;
  } catch {
    // Unsigned tests and local runs without Supabase env fall back to shipped deck.
  }

  const fallback = loadMeaningRecallDeck("es");
  if (fallback.status === "ok") return fallback.deck.cards;
  return [];
}

export function composeBuildASentenceRecipe(
  cards: readonly import("@/lib/starter-deck").StarterCard[],
  ctx: SessionContext,
): ExerciseRecipe | null {
  const profile = budgetProfileForMethod("build-a-sentence");
  const budgetMinutes = ctx.budgetMinutes ?? 3;
  const itemCount = profile
    ? itemCountForBudgetMinutes(budgetMinutes, profile)
    : 3;
  const targets = pickSentenceTargets(cards, ctx.heldLemmas ?? new Set(), itemCount);
  if (targets.length === 0) return null;

  const steps: ExerciseStep[] = [];

  // One step per target, not two. Writing and correcting used to be separate
  // screens with `reveal-answer` in between, which showed a model sentence to
  // compare against — a recast, and recasts are often not noticed as
  // corrections at all (docs/study/STUDY-006-production.md). `sentence-check`
  // marks what it can prove and lets the learner fix it in place.
  targets.forEach((target, index) => {
    const suffix = targets.length > 1 ? ` (${index + 1}/${targets.length})` : "";
    steps.push({
      id: `write-${index + 1}`,
      type: "do",
      component: "sentence-check",
      labelKey: "stepLabelWrite",
      config: {
        word: target.word,
        gloss: target.gloss,
        lemma: target.lemma,
        itemIndex: index + 1,
        itemCount: targets.length,
        labelSuffix: suffix,
      },
    });
  });

  steps.push({
    id: "decide-1",
    type: "decide",
    component: "offers",
    labelKey: "stepLabelDecide",
    config: {
      offers: ["Schedule this word for review"],
      declineLabel: "Not now — done",
    },
  });

  return {
    methodId: "build-a-sentence",
    sourceId: targets[0]!.taskId,
    steps,
  };
}

export async function resolveBuildASentenceRecipe(ctx: SessionContext): Promise<ExerciseRecipe | null> {
  const cards = await meaningRecallCardsForPractice();
  return composeBuildASentenceRecipe(cards, ctx);
}

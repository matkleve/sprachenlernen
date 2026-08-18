import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import type { SessionContext } from "@/lib/exercise-recipe/types";
import { pickSentenceTarget } from "@/lib/exercise-recipe/sentence-target";
import type { ExerciseRecipe } from "@/lib/exercise-runner/types";
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
  const target = pickSentenceTarget(cards, ctx.heldLemmas);
  if (!target) return null;

  return {
    methodId: "build-a-sentence",
    sourceId: target.taskId,
    steps: [
      {
        id: "prepare-1",
        type: "prepare",
        component: "checklist",
        label: "How it works",
        config: {
          introKey: "introBuildASentence",
          items: ["Pen and paper or keyboard", "Your target language — not English"],
        },
      },
      {
        id: "write-1",
        type: "do",
        component: "type-with-word",
        label: "Write",
        config: {
          word: target.word,
          gloss: target.gloss,
          lemma: target.lemma,
        },
      },
      {
        id: "review-1",
        type: "review",
        component: "reveal-answer",
        label: "Compare",
        config: {
          word: target.word,
          gloss: target.gloss,
        },
      },
      {
        id: "decide-1",
        type: "decide",
        component: "offers",
        label: "Next",
        config: {
          offers: ["Schedule this word for review"],
          declineLabel: "Not now — done",
        },
      },
    ],
  };
}

export async function resolveBuildASentenceRecipe(ctx: SessionContext): Promise<ExerciseRecipe | null> {
  const cards = await meaningRecallCardsForPractice();
  return composeBuildASentenceRecipe(cards, ctx);
}

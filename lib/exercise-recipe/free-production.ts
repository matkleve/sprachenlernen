import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import type { SessionContext } from "@/lib/exercise-recipe/types";
import { pickProductionHints } from "@/lib/exercise-recipe/sentence-target";
import type { ExerciseRecipe } from "@/lib/exercise-runner/types";
import { loadMeaningRecallDeck } from "@/lib/starter-deck";

const DEFAULT_DURATION_SEC = 600;

const OPEN_PROMPTS = [
  "Write about something that happened to you recently.",
  "Describe a place you enjoy spending time.",
  "What would you do if you had tomorrow completely free?",
  "Write about a person who matters to you.",
  "Describe your ideal weekend.",
] as const;

async function meaningRecallCardsForPractice(): Promise<
  readonly import("@/lib/starter-deck").StarterCard[]
> {
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

function writingDurationSec(ctx: SessionContext): number {
  if (ctx.durationSec !== undefined && ctx.durationSec > 0) return ctx.durationSec;
  return DEFAULT_DURATION_SEC;
}

export function composeFreeProductionRecipe(
  cards: readonly import("@/lib/starter-deck").StarterCard[],
  ctx: SessionContext,
): ExerciseRecipe {
  const hints = pickProductionHints(cards, ctx.heldLemmas);
  const prompt =
    OPEN_PROMPTS[hints.promptIndex % OPEN_PROMPTS.length] ?? OPEN_PROMPTS[0];

  return {
    methodId: "free-production",
    sourceId: hints.sourceId,
    steps: [
      {
        id: "prepare-1",
        type: "prepare",
        component: "checklist",
        label: "Get ready",
        config: {
          items: ["Pen and paper or keyboard", "A quiet few minutes"],
        },
      },
      {
        id: "write-1",
        type: "do",
        component: "timed-write",
        label: "Write",
        config: {
          prompt,
          durationSec: writingDurationSec(ctx),
          optionalWords: hints.optionalWords,
        },
      },
      {
        id: "submit-1",
        type: "submit",
        component: "capture",
        label: "Your writing",
        config: { accept: ["photo", "text"], required: true },
      },
      {
        id: "review-1",
        type: "review",
        component: "feedback",
        label: "Review",
        config: {},
      },
      {
        id: "decide-1",
        type: "decide",
        component: "offers",
        label: "Next",
        config: {
          offers: ["Add errors as cards", "Explain one error"],
          declineLabel: "Not now — done",
        },
      },
    ],
  };
}

export async function resolveFreeProductionRecipe(
  ctx: SessionContext,
): Promise<ExerciseRecipe | null> {
  const cards = await meaningRecallCardsForPractice();
  return composeFreeProductionRecipe(cards, ctx);
}

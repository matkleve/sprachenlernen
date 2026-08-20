import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import { RUNNER_CHROME_OVERHEAD_SEC } from "@/lib/exercise-recipe/budget";
import type { SessionContext } from "@/lib/exercise-recipe/types";
import { pickProductionHints } from "@/lib/exercise-recipe/sentence-target";
import type { ExerciseRecipe } from "@/lib/exercise-runner/types";
import { loadMeaningRecallDeck } from "@/lib/starter-deck";

const DEFAULT_DURATION_SEC = 600;

const PROMPT_KEYS = [
  "freeProductionPromptRecent",
  "freeProductionPromptPlace",
  "freeProductionPromptFreeDay",
  "freeProductionPromptPerson",
  "freeProductionPromptWeekend",
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
  if (ctx.budgetMinutes !== undefined) {
    const chrome = RUNNER_CHROME_OVERHEAD_SEC;
    const chromeStepsSec = 180;
    return Math.max(300, ctx.budgetMinutes * 60 - chrome - chromeStepsSec);
  }
  if (ctx.durationSec !== undefined && ctx.durationSec > 0) return ctx.durationSec;
  return DEFAULT_DURATION_SEC;
}

export function composeFreeProductionRecipe(
  cards: readonly import("@/lib/starter-deck").StarterCard[],
  ctx: SessionContext,
): ExerciseRecipe {
  const hints = pickProductionHints(cards, ctx.heldLemmas);
  const promptKey = PROMPT_KEYS[hints.promptIndex % PROMPT_KEYS.length] ?? PROMPT_KEYS[0];

  return {
    methodId: "free-production",
    sourceId: hints.sourceId,
    steps: [
      {
        id: "prepare-1",
        type: "prepare",
        component: "checklist",
        labelKey: "stepLabelPrepare",
        config: {
          introKey: "introFreeProduction",
          itemKeys: ["prepareItemKeyboard", "prepareItemQuiet", "prepareItemTargetLang"],
        },
      },
      {
        id: "write-1",
        type: "do",
        component: "timed-write",
        labelKey: "stepLabelWrite",
        config: {
          promptKey,
          durationSec: writingDurationSec(ctx),
          optionalWords: hints.optionalWords,
        },
      },
      {
        id: "submit-1",
        type: "submit",
        component: "capture",
        labelKey: "stepLabelYourWriting",
        config: { accept: ["photo", "text"], required: true },
      },
      {
        id: "review-1",
        type: "review",
        component: "feedback",
        labelKey: "stepLabelReview",
        config: {},
      },
      {
        id: "decide-1",
        type: "decide",
        component: "offers",
        labelKey: "stepLabelDecide",
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

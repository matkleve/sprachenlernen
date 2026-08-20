/**
 * Session contract for method detail pre-start surface.
 * Contract: docs/specs/service/method-session-viability.md
 */
import type { MethodEntry } from "@/lib/method-catalogue";
import { resolveExerciseRecipe } from "@/lib/exercise-recipe";
import {
  CARD_CHROME_OVERHEAD_SEC,
  SEC_PER_CARD,
  budgetProfileForMethod,
  cardCountForBudgetMinutes,
  countLearningUnits,
  estimateWallClockSec,
} from "@/lib/exercise-recipe/budget";
import { checkSessionViability } from "@/lib/exercise-recipe/viability";
import type { ExerciseRecipe } from "@/lib/exercise-runner/types";
import { resolveSessionBudgetMinutes } from "@/lib/method-session-budget";
import { usesExerciseRunner, usesWordsReview } from "@/lib/method-session";

export type SessionFeedbackMode =
  | "self-mark"
  | "exemplar"
  | "assisted"
  | "rubric"
  | "honest-none";

export type SessionContract = {
  learningUnits: number;
  feedbackMode: SessionFeedbackMode;
  feedbackLabelKey: string;
  budgetMinutes: number;
  wallEstimateMinutes: number;
  volumeLabelKey: string;
};

const FEEDBACK_LABEL_KEYS: Record<SessionFeedbackMode, string> = {
  "self-mark": "sessionFeedbackSelfMark",
  exemplar: "sessionFeedbackExemplar",
  assisted: "sessionFeedbackAssisted",
  rubric: "sessionFeedbackRubric",
  "honest-none": "sessionFeedbackHonestNone",
};

export function detectFeedbackMode(recipe: ExerciseRecipe): SessionFeedbackMode {
  for (const step of recipe.steps) {
    if (step.type !== "review" || !step.component) continue;

    switch (step.component) {
      case "self-mark":
        return "self-mark";
      case "feedback":
        return "assisted";
      case "rubric":
        return "rubric";
      case "reveal-answer": {
        const exemplar = step.config.exemplar;
        if (typeof exemplar === "string" && exemplar.trim()) return "exemplar";
        return "honest-none";
      }
      default:
        break;
    }
  }

  return "self-mark";
}

export function volumeLabelKeyForMethod(methodId: string): string {
  switch (methodId) {
    case "build-a-sentence":
      return "sessionVolumeWords";
    case "srs-session":
      return "sessionVolumeCards";
    case "free-production":
      return "sessionVolumeWriting";
    case "partial-dictation":
    case "full-dictation":
      return "sessionVolumeSentences";
    default:
      return "sessionVolumeUnits";
  }
}

function sessionLearningUnits(recipe: ExerciseRecipe, methodId: string): number {
  const units = countLearningUnits(recipe);
  if (units > 0) return units;
  if (recipe.steps.some((step) => step.component === "timed-write")) return 1;
  if (recipe.steps.some((step) => step.component === "text-display")) return 1;
  if (methodId === "free-production") return 1;
  return 0;
}

export async function resolveSessionContract(
  method: MethodEntry,
  budgetMinutes?: number,
): Promise<SessionContract | null> {
  if (!method.hosted) return null;

  const resolved =
    budgetMinutes ?? resolveSessionBudgetMinutes(method.durations, undefined);
  if (resolved === undefined) return null;

  if (usesWordsReview(method)) {
    const learningUnits = cardCountForBudgetMinutes(resolved);
    const wallSec = CARD_CHROME_OVERHEAD_SEC + learningUnits * SEC_PER_CARD;
    return {
      learningUnits,
      feedbackMode: "self-mark",
      feedbackLabelKey: FEEDBACK_LABEL_KEYS["self-mark"],
      budgetMinutes: resolved,
      wallEstimateMinutes: Math.max(1, Math.round(wallSec / 60)),
      volumeLabelKey: volumeLabelKeyForMethod(method.id),
    };
  }

  if (!usesExerciseRunner(method)) return null;

  const recipe = await resolveExerciseRecipe(method.id, { budgetMinutes: resolved });
  if (!recipe) return null;

  const viability = checkSessionViability(recipe, { budgetMinutes: resolved });
  if (!viability.ok && viability.failures.includes("G2")) return null;

  const profile = budgetProfileForMethod(method.id);
  const wallSec = estimateWallClockSec(recipe, profile);
  const feedbackMode = detectFeedbackMode(recipe);
  const learningUnits = sessionLearningUnits(recipe, method.id);

  return {
    learningUnits,
    feedbackMode,
    feedbackLabelKey: FEEDBACK_LABEL_KEYS[feedbackMode],
    budgetMinutes: resolved,
    wallEstimateMinutes: Math.max(1, Math.round(wallSec / 60)),
    volumeLabelKey: volumeLabelKeyForMethod(method.id),
  };
}

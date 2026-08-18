import type { SessionContext } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe } from "@/lib/exercise-runner/types";

export function composeFreeProductionRecipe(ctx: SessionContext): ExerciseRecipe {
  const durationSec = ctx.durationSec ?? 600;

  return {
    methodId: "free-production",
    steps: [
      {
        id: "prepare-1",
        type: "prepare",
        component: "checklist",
        label: "Get ready",
        config: {
          items: ["A topic in mind", "Pen, keyboard, or voice memo"],
        },
      },
      {
        id: "write-1",
        type: "do",
        component: "timed-write",
        label: "Write freely",
        config: {
          prompt: "Write on any topic — no model text to copy.",
          durationSec,
        },
      },
      {
        id: "submit-1",
        type: "submit",
        component: "capture",
        label: "Hand in",
        config: { accept: ["text", "photo"], required: false },
      },
      {
        id: "review-1",
        type: "review",
        component: "feedback",
        label: "Review",
        config: { answerKey: "" },
      },
      {
        id: "decide-1",
        type: "decide",
        component: "offers",
        label: "Next",
        config: {
          offers: ["Save a phrase as a card"],
          declineLabel: "Not now — done",
        },
      },
    ],
  };
}

export function resolveFreeProductionRecipe(ctx: SessionContext): ExerciseRecipe {
  return composeFreeProductionRecipe(ctx);
}

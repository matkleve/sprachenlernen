import type { SessionContext } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe } from "@/lib/exercise-runner/types";

export function composeDiaryThreeSentencesRecipe(ctx: SessionContext): ExerciseRecipe {
  const durationSec = ctx.durationSec ?? 300;

  return {
    methodId: "diary-three-sentences",
    steps: [
      {
        id: "prepare-1",
        type: "prepare",
        component: "checklist",
        label: "Get ready",
        config: { items: ["Keyboard or pen", "Something real from today"] },
      },
      {
        id: "write-1",
        type: "do",
        component: "timed-write",
        label: "Three sentences",
        config: {
          prompt: "Write exactly three sentences about your day — genuine, not polished.",
          durationSec,
          minSentences: 3,
        },
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

export function resolveDiaryThreeSentencesRecipe(ctx: SessionContext): ExerciseRecipe {
  return composeDiaryThreeSentencesRecipe(ctx);
}

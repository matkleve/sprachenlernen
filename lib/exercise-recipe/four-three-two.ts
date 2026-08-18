import type { SessionContext } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe, ExerciseStep } from "@/lib/exercise-runner/types";

const ROUNDS = [
  { round: 1, minutes: 4, durationSec: 4 * 60 },
  { round: 2, minutes: 3, durationSec: 3 * 60 },
  { round: 3, minutes: 2, durationSec: 2 * 60 },
] as const;

export function composeFourThreeTwoRecipe(ctx: SessionContext): ExerciseRecipe {
  const loop: ExerciseStep[] = [];

  ROUNDS.forEach((meta) => {
    loop.push(
      {
        id: `round-${meta.round}-marker`,
        type: "do",
        component: "round-marker",
        label: `Round ${meta.round}`,
        config: {
          round: meta.round,
          totalRounds: ROUNDS.length,
          minutes: meta.minutes,
        },
      },
      {
        id: `round-${meta.round}-speak`,
        type: "do",
        component: "speak-prompt",
        label: "Tell the story",
        config: {
          body: "Tell the same story out loud — speed up each round.",
        },
      },
      {
        id: `round-${meta.round}-wait`,
        type: "wait",
        label: "Round time",
        config: { durationSec: meta.durationSec },
      },
    );
  });

  return {
    methodId: "four-three-two",
    steps: [
      {
        id: "prepare-1",
        type: "prepare",
        component: "prompt",
        label: "How this works",
        config: {
          body: "Pick one short story you can tell. You will tell it three times: four minutes, then three, then two.",
        },
      },
      ...loop,
      {
        id: "submit-1",
        type: "submit",
        component: "voice-submit",
        label: "Optional recording",
        config: { required: false, hint: "Optional: keep one round as a voice memo." },
      },
      {
        id: "review-1",
        type: "review",
        component: "rubric",
        label: "Self-rate",
        config: {
          dimensions: [
            {
              id: "fluency",
              label: "Fluency",
              options: ["Smoother each round", "About the same", "Harder at the end"],
            },
            {
              id: "confidence",
              label: "Confidence",
              options: ["More confident", "Unchanged", "Less confident"],
            },
          ],
        },
      },
      {
        id: "decide-1",
        type: "decide",
        component: "offers",
        label: "Next",
        config: {
          offers: ["Try another story tomorrow"],
          declineLabel: "Not now — done",
        },
      },
    ],
  };
}

export function resolveFourThreeTwoRecipe(ctx: SessionContext): ExerciseRecipe {
  return composeFourThreeTwoRecipe(ctx);
}

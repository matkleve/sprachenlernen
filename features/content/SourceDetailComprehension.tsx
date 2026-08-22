"use client";

import { ComprehensionQuestionsStep } from "@/features/exercise-runner/steps/ComprehensionQuestionsStep";
import type { ComprehensionQuestion } from "@/lib/exercise-recipe/comprehension-questions";

type SourceDetailComprehensionProps = {
  questions: readonly ComprehensionQuestion[];
};

/** Reuse: exercise-runner ComprehensionQuestionsStep — same check UI on source detail. */
export function SourceDetailComprehension({ questions }: SourceDetailComprehensionProps) {
  return <ComprehensionQuestionsStep config={{ questions }} />;
}

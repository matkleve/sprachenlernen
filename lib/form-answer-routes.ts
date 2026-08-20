/**
 * Form-answer route helpers. Contract:
 * docs/specs/service/form-practice.md (answer routes §)
 */

import { GRADES, type Grade } from "@/lib/scheduler";

export type FormAnswerRoute = "typed" | "build" | "spoken";

/** Spoken answers are self-graded — no Easy (longest interval requires machine check). */
export const FORM_SPOKEN_GRADES = ["again", "hard", "good"] as const satisfies readonly Grade[];

export function gradesForFormAnswerRoute(route: FormAnswerRoute): readonly Grade[] {
  return route === "spoken" ? FORM_SPOKEN_GRADES : GRADES;
}

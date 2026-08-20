/**
 * Contract: docs/specs/service/form-practice.md (spoken route §)
 */
import { describe, expect, it } from "vitest";

import { FORM_SPOKEN_GRADES, gradesForFormAnswerRoute } from "@/lib/form-answer-routes";
import { GRADES } from "@/lib/scheduler";

describe("form-answer-routes", () => {
  it("offers three grades on the spoken route, not four", () => {
    expect(FORM_SPOKEN_GRADES).toEqual(["again", "hard", "good"]);
    expect(gradesForFormAnswerRoute("spoken").length).toBe(3);
    expect(gradesForFormAnswerRoute("spoken").includes("easy")).toBe(false);
  });

  it("keeps four grades on typed and build routes", () => {
    expect(gradesForFormAnswerRoute("typed")).toEqual(GRADES);
    expect(gradesForFormAnswerRoute("build")).toEqual(GRADES);
  });
});

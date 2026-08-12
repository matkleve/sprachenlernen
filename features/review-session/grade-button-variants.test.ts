import { describe, expect, it } from "vitest";

import { gradeButtonVariants } from "@/features/review-session/grade-button-variants";

describe("gradeButtonVariants", () => {
  it("tints each grade with its token family", () => {
    expect(gradeButtonVariants({ grade: "again" })).toContain("bg-grade-again-soft");
    expect(gradeButtonVariants({ grade: "hard" })).toContain("bg-grade-hard-soft");
    expect(gradeButtonVariants({ grade: "good" })).toContain("bg-grade-good-soft");
    expect(gradeButtonVariants({ grade: "easy" })).toContain("bg-grade-easy-soft");
  });
});

import { describe, expect, it } from "vitest";

import { gradeButtonVariants } from "./GradeButton";

describe("gradeButtonVariants", () => {
  it("tints each grade with its token family", () => {
    expect(gradeButtonVariants({ grade: "again" })).toContain("bg-grade-again-soft");
    expect(gradeButtonVariants({ grade: "hard" })).toContain("bg-grade-hard-soft");
    expect(gradeButtonVariants({ grade: "good" })).toContain("bg-grade-good-soft");
    expect(gradeButtonVariants({ grade: "easy" })).toContain("bg-grade-easy-soft");
  });

  it("includes press feedback classes", () => {
    expect(gradeButtonVariants({ grade: "good" })).toContain("active:scale");
  });

  it("meets the 44px touch target at rest", () => {
    expect(gradeButtonVariants({ grade: "good" })).toContain("h-11");
    expect(gradeButtonVariants({ grade: "good" })).toContain("after:inset-y-0");
  });
});

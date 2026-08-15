import { describe, expect, it } from "vitest";

import { shellPageContentVariants } from "./shell-page-content";

describe("shellPageContentVariants", () => {
  it("applies scrollable rhythm for destination pages", () => {
    const classes = shellPageContentVariants({ mode: "scrollable-destination", width: "wide" });
    expect(classes).toContain("md:pt-page-top");
    expect(classes.split(" ")).not.toContain("pt-page-top");
    expect(classes).toContain("pb-page-bottom");
    expect(classes).toContain("max-w-5xl");
    expect(classes).not.toContain("h-review-session");
  });

  it("applies runner constraints on mobile", () => {
    const classes = shellPageContentVariants({ mode: "one-screen-runner", width: "narrow" });
    expect(classes).toContain("h-review-session");
    expect(classes).toContain("overflow-hidden");
    expect(classes).toContain("max-w-2xl");
    expect(classes.split(" ")).not.toContain("pt-page-top");
    expect(classes.split(" ")).not.toContain("pb-page-bottom");
  });

  it("treats drill-in like scrollable for rhythm", () => {
    const classes = shellPageContentVariants({ mode: "scrollable-drill-in", width: "narrow" });
    expect(classes).toContain("md:pt-page-top");
    expect(classes.split(" ")).not.toContain("pt-page-top");
    expect(classes).toContain("pb-page-bottom");
  });
});

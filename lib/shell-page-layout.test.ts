import { describe, expect, it } from "vitest";

import { isActiveReviewSession, shellPageLayout } from "./shell-page-layout";

describe("shellPageLayout", () => {
  it("marks destination roots as scrollable-destination", () => {
    expect(shellPageLayout("/methods")).toBe("scrollable-destination");
    expect(shellPageLayout("/words")).toBe("scrollable-destination");
    expect(shellPageLayout("/progress")).toBe("scrollable-destination");
  });

  it("marks method detail as scrollable-drill-in", () => {
    expect(shellPageLayout("/methods/srs-session")).toBe("scrollable-drill-in");
  });

  it("marks active review session as one-screen-runner", () => {
    const params = new URLSearchParams({ method: "srs-session" });
    expect(shellPageLayout("/words/review", params)).toBe("one-screen-runner");
    expect(isActiveReviewSession("/words/review", params)).toBe(true);
  });

  it("marks active exercise session as one-screen-exercise", () => {
    const params = new URLSearchParams({ method: "build-a-sentence" });
    expect(shellPageLayout("/practice", params)).toBe("one-screen-exercise");
  });

  it("marks review route without active session as scrollable-drill-in", () => {
    expect(shellPageLayout("/words/review")).toBe("scrollable-drill-in");
    expect(shellPageLayout("/words/review", new URLSearchParams({ method: "other" }))).toBe(
      "scrollable-drill-in",
    );
  });
});

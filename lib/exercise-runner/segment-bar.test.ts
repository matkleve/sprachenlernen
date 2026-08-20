import { describe, expect, it } from "vitest";

import { segmentBarClass } from "@/lib/exercise-runner/segment-bar";

describe("segmentBarClass", () => {
  it("uses primary for the active step that is not done", () => {
    expect(segmentBarClass(1, 1, "seen")).toContain("bg-accent");
    expect(segmentBarClass(1, 1, "seen")).not.toContain("bg-accent-soft");
  });

  it("keeps done styling when navigating back to a completed step", () => {
    expect(segmentBarClass(0, 0, "done")).toBe("bg-accent-soft dark:bg-accent/35");
  });

  it("uses lighter gray for seen steps that are not active", () => {
    expect(segmentBarClass(2, 1, "seen")).toContain("bg-line-strong/45");
  });

  it("uses line token for unseen steps", () => {
    expect(segmentBarClass(3, 1, "unseen")).toBe("bg-line");
  });
});

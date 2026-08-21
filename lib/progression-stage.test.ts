import { describe, expect, it } from "vitest";

import {
  chapterForStage,
  clampStage,
  crossesChapter,
  MAX_STAGE,
  MIN_STAGE,
  progressionStages,
  stageDetail,
  stageScopeStyle,
} from "@/lib/progression-stage";

/** Contract: docs/specs/page/progression-explorer.md § Acceptance criteria */

const CONTRAST_BEARING = [
  "--color-ink",
  "--color-canvas",
  "--color-surface",
  "--color-muted",
] as const;

const DECORATIVE = [
  "--stage-glow",
  "--stage-grain",
  "--stage-bevel",
  "--stage-rule",
  "--radius-card",
  "--stage-edge-roughness",
  "--stage-stars",
] as const;

const styleAt = (stage: number) => stageScopeStyle({ stage }) as unknown as Record<string, string>;

describe("chapterForStage", () => {
  it.each([
    [1, "workshop"],
    [2, "workshop"],
    [3, "workshop"],
    [4, "library"],
    [5, "library"],
    [6, "library"],
    [7, "observatory"],
    [8, "observatory"],
    [9, "observatory"],
  ])("maps stage %i to %s", (stage, id) => {
    expect(chapterForStage(stage).id).toBe(id);
  });

  it("covers every stage the data defines — no gap can silently appear", () => {
    for (const entry of progressionStages) {
      const chapter = chapterForStage(entry.stage);
      expect(entry.stage).toBeGreaterThanOrEqual(chapter.stageFrom);
      expect(entry.stage).toBeLessThanOrEqual(chapter.stageTo);
    }
  });
});

describe("clampStage", () => {
  it.each([
    [0, MIN_STAGE],
    [-4, MIN_STAGE],
    [10, MAX_STAGE],
    [999, MAX_STAGE],
    [4.4, 4],
    [Number.NaN, MIN_STAGE],
  ])("clamps %s to %i", (input, expected) => {
    expect(clampStage(input)).toBe(expected);
  });
});

describe("a stage never moves a contrast-bearing token", () => {
  it.each([
    [1, 2],
    [2, 3],
    [4, 5],
    [5, 6],
    [7, 8],
    [8, 9],
  ])("holds colours steady between stages %i and %i", (from, to) => {
    const a = styleAt(from);
    const b = styleAt(to);
    for (const token of CONTRAST_BEARING) {
      expect(b[token]).toBe(a[token]);
    }
  });

  it("does change them across a chapter boundary — that is the moment", () => {
    expect(styleAt(4)["--color-canvas"]).not.toBe(styleAt(3)["--color-canvas"]);
    expect(styleAt(7)["--color-canvas"]).not.toBe(styleAt(6)["--color-canvas"]);
  });
});

describe("every step is perceptible in the output", () => {
  it.each([
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 9],
  ])("changes at least one decorative value from %i to %i", (from, to) => {
    const a = styleAt(from);
    const b = styleAt(to);
    const skinChanged = stageDetail(from).skin !== stageDetail(to).skin;
    const changed = DECORATIVE.some((token) => a[token] !== b[token]);
    expect(changed || skinChanged).toBe(true);
  });
});

describe("crossesChapter", () => {
  it("reports the two boundaries and nothing else", () => {
    expect(crossesChapter(3, 4)).toBe(true);
    expect(crossesChapter(6, 7)).toBe(true);
    expect(crossesChapter(1, 3)).toBe(false);
    expect(crossesChapter(4, 6)).toBe(false);
    expect(crossesChapter(7, 9)).toBe(false);
  });
});

describe("stageDetail", () => {
  it("gives every stage a label a person can read", () => {
    for (let stage = MIN_STAGE; stage <= MAX_STAGE; stage++) {
      expect(stageDetail(stage).label.length).toBeGreaterThan(0);
    }
  });

  it("adds stars only in the observatory chapter", () => {
    expect(stageDetail(6).stars).toBe(0);
    expect(stageDetail(7).stars).toBeGreaterThan(0);
    expect(stageDetail(9).stars).toBeGreaterThan(stageDetail(7).stars);
  });

  it("rough card edges only in workshop — library onward is straight", () => {
    expect(Number(styleAt(1)["--stage-edge-roughness"])).toBeGreaterThan(0);
    expect(Number(styleAt(3)["--stage-edge-roughness"])).toBeGreaterThan(0);
    expect(Number(styleAt(4)["--stage-edge-roughness"])).toBe(0);
    expect(Number(styleAt(9)["--stage-edge-roughness"])).toBe(0);
    expect(stageDetail(1).edgeRoughness).toBeGreaterThan(stageDetail(2).edgeRoughness);
    expect(stageDetail(2).edgeRoughness).toBeGreaterThan(stageDetail(3).edgeRoughness);
  });
});

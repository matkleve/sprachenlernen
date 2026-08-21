import { describe, expect, it } from "vitest";

import {
  chapterForStage,
  clampStage,
  crossesChapter,
  lampCount,
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
] as const;

const styleAt = (stage: number, lit = true) =>
  stageScopeStyle({ stage, lit }) as unknown as Record<string, string>;

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
    [9, MAX_STAGE],
    [999, MAX_STAGE],
    [4.4, 4],
    [Number.NaN, MIN_STAGE],
  ])("clamps %s to %i", (input, expected) => {
    expect(clampStage(input)).toBe(expected);
  });
});

describe("a stage never moves a contrast-bearing token", () => {
  /**
   * The load-bearing rule of the whole model. `check:contrast` validates
   * chapters; if a stage could move `ink` or `canvas`, every stage would need
   * its own review and the palette count would go from six to sixteen.
   */
  it.each([
    [1, 2],
    [2, 3],
    [4, 5],
    [5, 6],
    [7, 8],
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
  ])("changes at least one decorative value from %i to %i", (from, to) => {
    const a = styleAt(from);
    const b = styleAt(to);
    const changed = DECORATIVE.some((token) => a[token] !== b[token]);
    const lampsChanged = lampCount(from) !== lampCount(to);
    expect(changed || lampsChanged).toBe(true);
  });
});

describe("built versus lit", () => {
  it("dims the light when nobody has been here", () => {
    expect(Number(styleAt(6, false)["--stage-glow"])).toBeLessThan(
      Number(styleAt(6, true)["--stage-glow"]),
    );
    expect(Number(styleAt(6, false)["--stage-lamp-opacity"])).toBeLessThan(1);
  });

  it("never takes a lamp away — structure is biography, not a punishment", () => {
    for (const entry of progressionStages) {
      expect(lampCount(entry.stage)).toBe(entry.lamps);
    }
    // `lit` is not even an input to the count.
    expect(lampCount(8)).toBeGreaterThan(lampCount(1));
  });

  it("leaves colours untouched when unlit — dimming is not a theme change", () => {
    const lit = styleAt(5, true);
    const unlit = styleAt(5, false);
    for (const token of CONTRAST_BEARING) {
      expect(unlit[token]).toBe(lit[token]);
    }
  });
});

describe("crossesChapter", () => {
  it("reports the two boundaries and nothing else", () => {
    expect(crossesChapter(3, 4)).toBe(true);
    expect(crossesChapter(6, 7)).toBe(true);
    expect(crossesChapter(1, 3)).toBe(false);
    expect(crossesChapter(4, 6)).toBe(false);
  });
});

describe("stageDetail", () => {
  it("gives every stage a label a person can read", () => {
    for (let stage = MIN_STAGE; stage <= MAX_STAGE; stage++) {
      expect(stageDetail(stage).label.length).toBeGreaterThan(0);
    }
  });
});

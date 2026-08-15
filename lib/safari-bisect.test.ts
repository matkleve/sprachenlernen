import { describe, expect, it } from "vitest";

import {
  PROGRESS_BISECT_MAX_LEVEL,
  WORDS_BISECT_MAX_LEVEL,
  bisectLevelHref,
  parseBisectLevel,
} from "./safari-bisect";

describe("parseBisectLevel", () => {
  it("defaults to 0 for missing or invalid input", () => {
    expect(parseBisectLevel(undefined, WORDS_BISECT_MAX_LEVEL)).toBe(0);
    expect(parseBisectLevel("nope", PROGRESS_BISECT_MAX_LEVEL)).toBe(0);
    expect(parseBisectLevel("-1", WORDS_BISECT_MAX_LEVEL)).toBe(0);
  });

  it("clamps to max level", () => {
    expect(parseBisectLevel("99", WORDS_BISECT_MAX_LEVEL)).toBe(WORDS_BISECT_MAX_LEVEL);
  });

  it("parses valid levels", () => {
    expect(parseBisectLevel("3", PROGRESS_BISECT_MAX_LEVEL)).toBe(3);
  });
});

describe("bisectLevelHref", () => {
  it("builds level query URLs", () => {
    expect(bisectLevelHref("/words-bisect", 2)).toBe("/words-bisect?level=2");
  });
});

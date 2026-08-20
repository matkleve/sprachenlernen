import { describe, expect, it } from "vitest";

import {
  LEARNER_SOURCE_MAX_BODY_CHARS,
  rejectOversizeLearnerText,
} from "@/lib/learner-text-limits";

/** Contract: docs/specs/feature/word-capture.md § Data. */
describe("rejectOversizeLearnerText", () => {
  it("accepts ordinary text", () => {
    expect(rejectOversizeLearnerText("Una mañana de verano.")).toBeNull();
  });

  it("accepts the empty string — emptiness is the caller's error, not this one's", () => {
    expect(rejectOversizeLearnerText("")).toBeNull();
  });

  it("treats the ceiling as inclusive", () => {
    expect(rejectOversizeLearnerText("a".repeat(LEARNER_SOURCE_MAX_BODY_CHARS))).toBeNull();
  });

  it("refuses one character past the ceiling", () => {
    const rejection = rejectOversizeLearnerText("a".repeat(LEARNER_SOURCE_MAX_BODY_CHARS + 1));
    expect(rejection?.status).toBe("error");
    expect(rejection?.error).toContain("too long");
  });

  it("names the ceiling in the message, so the learner knows what to aim for", () => {
    const rejection = rejectOversizeLearnerText("a".repeat(LEARNER_SOURCE_MAX_BODY_CHARS + 1));
    expect(rejection?.error).toContain("100,000");
  });

  it("is stricter than the column constraint for astral characters, never looser", () => {
    // "🙂" is one Postgres character and two UTF-16 code units. Counting code
    // units means a value this check accepts always satisfies char_length();
    // counting the other way round would let a row through that the database
    // then refuses, which is the failure this ordering exists to prevent.
    const emoji = "🙂".repeat(LEARNER_SOURCE_MAX_BODY_CHARS / 2 + 1);
    expect(emoji.length).toBeGreaterThan(LEARNER_SOURCE_MAX_BODY_CHARS);
    expect(rejectOversizeLearnerText(emoji)?.status).toBe("error");
  });
});

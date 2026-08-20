import { describe, expect, it } from "vitest";

import { estimateReadingMinutes, formatReadingTimeLabel } from "@/lib/reading-time";

describe("reading-time", () => {
  it("estimates minutes from token count at default WPM", () => {
    expect(estimateReadingMinutes(400)).toBe(2);
    expect(estimateReadingMinutes(2000)).toBe(10);
  });

  it("formats a preview label", () => {
    expect(formatReadingTimeLabel(800)).toBe("~4 min");
  });
});

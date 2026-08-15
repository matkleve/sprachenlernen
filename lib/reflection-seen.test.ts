import { describe, expect, it } from "vitest";

import { reflectionSeenValue, parseReflectionSeen, isReflectionUnread } from "@/lib/reflection-seen";

describe("reflection-seen", () => {
  it("round-trips iso week and language in the cookie value", () => {
    const value = reflectionSeenValue("2026-W33", "es");
    expect(parseReflectionSeen(value)).toEqual({ isoWeek: "2026-W33", languageCode: "es" });
  });

  it("treats a different week or language as unread", () => {
    const seen = reflectionSeenValue("2026-W32", "es");
    expect(isReflectionUnread("2026-W33", "es", seen)).toBe(true);
    expect(isReflectionUnread("2026-W32", "it", seen)).toBe(true);
    expect(isReflectionUnread("2026-W32", "es", seen)).toBe(false);
  });
});

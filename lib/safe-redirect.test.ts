import { describe, expect, it } from "vitest";

import { safeInternalPath } from "@/lib/safe-redirect";

/**
 * Contract: docs/specs/service/auth.md § Behavior 8.
 *
 * `startsWith("/")` is not an internal-path check. A protocol-relative URL
 * begins with `/` and resolves to a foreign origin, which is how a link on
 * this deployment's own domain lands on someone else's.
 */
describe("safeInternalPath", () => {
  const fallback = "/methods";

  it.each([
    ["//evil.com", "protocol-relative"],
    ["///evil.com", "three slashes collapse the same way"],
    ["/\\evil.com", "backslash is normalised to a slash by the URL parser"],
    ["/\\/evil.com", "mixed slash and backslash"],
    ["\\\\evil.com", "UNC-style"],
    ["https://evil.com", "absolute"],
    ["http://evil.com", "absolute, insecure"],
    ["javascript:alert(1)", "scheme"],
    ["methods", "relative, no leading slash"],
    ["", "empty"],
  ])("refuses %s (%s)", (candidate) => {
    expect(safeInternalPath(candidate, fallback)).toBe(fallback);
  });

  it.each([
    "/methods",
    "/words/review",
    "/content/6f1f6d16-1f4e-4c1a-9e9b-3d2a5f0c8a11",
    "/progress?deck=due",
    "/words#top",
  ])("allows the internal path %s", (candidate) => {
    expect(safeInternalPath(candidate, fallback)).toBe(candidate);
  });

  it("falls back when the value is missing", () => {
    expect(safeInternalPath(null, fallback)).toBe(fallback);
    expect(safeInternalPath(undefined, fallback)).toBe(fallback);
  });

  it("resolves every refusal to this origin, not a foreign one", () => {
    const origin = "https://sprachenlernen.vercel.app";
    for (const hostile of ["//evil.com", "/\\evil.com", "https://evil.com"]) {
      const resolved = new URL(safeInternalPath(hostile, fallback), origin);
      expect(resolved.origin).toBe(origin);
    }
  });
});

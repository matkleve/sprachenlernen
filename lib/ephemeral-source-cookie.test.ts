import { describe, expect, it } from "vitest";

import type { Source } from "@/lib/coverage";
import {
  EPHEMERAL_SOURCE_MAX_BODY_CHARS,
  parseEphemeralSourceCookie,
  serializeEphemeralSourceCookie,
} from "@/lib/ephemeral-source-cookie";

/**
 * Contract: docs/specs/feature/word-capture.md
 */

const sampleSource = (): Source => ({
  id: "learner-1700000000000",
  languageCode: "es",
  kind: "text",
  title: "Hola",
  origin: "learner",
  body: "Hola mundo.",
  addedAt: "2026-08-18T12:00:00.000Z",
  ephemeral: true,
});

describe("ephemeral source cookie", () => {
  it("AC-3: round-trips a session-only learner source", () => {
    const source = sampleSource();
    const serialized = serializeEphemeralSourceCookie(source);
    expect(parseEphemeralSourceCookie(serialized)).toEqual(source);
  });

  it("AC-4: rejects bodies above the cookie size budget", () => {
    const source = sampleSource();
    source.body = "x".repeat(EPHEMERAL_SOURCE_MAX_BODY_CHARS + 1);
    expect(() => serializeEphemeralSourceCookie(source)).toThrow(/too long/i);
  });

  it("returns null for malformed payloads", () => {
    expect(parseEphemeralSourceCookie("not-json")).toBeNull();
    expect(parseEphemeralSourceCookie(JSON.stringify({ id: "" }))).toBeNull();
  });
});

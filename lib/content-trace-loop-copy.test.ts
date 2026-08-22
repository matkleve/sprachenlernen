/**
 * UC-021 textual equivalents for content traceability loop copy.
 * Contract: docs/specs/feature/content-traceability.loop-copy.md
 */
import { describe, expect, it } from "vitest";

import de from "@/messages/de.json";
import en from "@/messages/en.json";

const LOOP_KEYS = [
  "contentTrace.word.next",
  "contentTrace.source.comfortable",
  "contentTrace.source.demanding",
  "contentTrace.source.unlocked",
  "contentTrace.session.next",
  "contentTrace.library.month",
] as const;

function messageAt(path: string, messages: typeof en): string | undefined {
  const parts = path.split(".");
  let node: unknown = messages;
  for (const part of parts) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

describe("content-trace loop copy (UC-021)", () => {
  for (const key of LOOP_KEYS) {
    it(`EN ${key} is present and non-empty`, () => {
      const value = messageAt(key, en);
      expect(value).toBeTruthy();
      expect(value!.length).toBeGreaterThan(10);
    });

    it(`DE ${key} is present and non-empty`, () => {
      const value = messageAt(key, de);
      expect(value).toBeTruthy();
      expect(value!.length).toBeGreaterThan(10);
    });
  }
});

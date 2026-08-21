/**
 * Contract: docs/specs/service/content-ingestion.md (lane A consent)
 */
import { describe, expect, it } from "vitest";

import {
  parseAdaptationConsent,
  serializeAdaptationConsent,
} from "@/lib/adaptation-consent";

describe("adaptation-consent", () => {
  it("treats only the serialized value as granted consent", () => {
    expect(parseAdaptationConsent(undefined)).toBe(false);
    expect(parseAdaptationConsent("")).toBe(false);
    expect(parseAdaptationConsent("0")).toBe(false);
    expect(parseAdaptationConsent(serializeAdaptationConsent())).toBe(true);
  });
});

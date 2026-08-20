/**
 * Contract: docs/specs/service/content-ingestion.md
 */
import { describe, expect, it } from "vitest";

import {
  isLearnerPrivateSource,
  validateCatalogueLicence,
} from "@/lib/content-ingestion";

describe("content-ingestion", () => {
  it("refuses catalogue sources without licence.kind", () => {
    expect(validateCatalogueLicence({ origin: "catalogue" })).toMatch(/licence\.kind/);
    expect(
      validateCatalogueLicence({
        origin: "catalogue",
        licence: { kind: "learner-private", fetchedAt: "2026-08-20T00:00:00.000Z" },
      }),
    ).toMatch(/allowlist/);
  });

  it("accepts licence-cleared catalogue sources", () => {
    expect(
      validateCatalogueLicence({
        origin: "catalogue",
        licence: {
          kind: "cc-by",
          attribution: "Wikinews contributors",
          fetchedAt: "2026-08-20T00:00:00.000Z",
        },
      }),
    ).toBeNull();
  });

  it("marks learner-private intake", () => {
    expect(
      isLearnerPrivateSource({
        origin: "learner",
        licence: { kind: "learner-private", fetchedAt: "2026-08-20T00:00:00.000Z" },
      }),
    ).toBe(true);
  });
});

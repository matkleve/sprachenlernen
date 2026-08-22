/**
 * Contract: docs/specs/service/content-ingestion.md
 */
import { describe, expect, it } from "vitest";

import {
  isLearnerPrivateSource,
  validateCatalogueLicence,
  validateSourceIngestion,
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

  it("prefixes catalogue ingestion errors for loadSources", () => {
    expect(validateSourceIngestion({ origin: "catalogue" }, "sources[0]")).toMatch(
      /sources\[0\]: catalogue sources require licence\.kind/,
    );
  });

  it("requires generated flag and licence.kind generated to match", () => {
    expect(
      validateCatalogueLicence({
        origin: "catalogue",
        generated: true,
        licence: { kind: "cc-by", fetchedAt: "2026-08-22T00:00:00.000Z" },
      }),
    ).toMatch(/generated/);
    expect(
      validateCatalogueLicence({
        origin: "catalogue",
        licence: { kind: "generated", fetchedAt: "2026-08-22T00:00:00.000Z" },
      }),
    ).toMatch(/generated: true/);
    expect(
      validateCatalogueLicence({
        origin: "catalogue",
        generated: true,
        licence: { kind: "generated", fetchedAt: "2026-08-22T00:00:00.000Z" },
      }),
    ).toBeNull();
  });

  it("accepts partner-tos catalogue sources with partner metadata", () => {
    expect(
      validateCatalogueLicence({
        origin: "catalogue",
        licence: {
          kind: "partner-tos",
          partnerId: "dw",
          attribution: "Deutsche Welle",
          sourceUrl: "https://www.dw.com/es/ejemplo",
          fetchedAt: "2026-08-22T00:00:00.000Z",
        },
      }),
    ).toBeNull();
  });
});

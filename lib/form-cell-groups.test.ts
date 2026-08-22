/**
 * Contract: docs/specs/service/form-mastery-signal.md (T-W5)
 */
import { describe, expect, it } from "vitest";

import { formCellGroupKey, formCellGroupShortLabel } from "@/lib/form-cell-groups";

describe("formCellGroupKey", () => {
  it("groups -ar present verbs by conjugation class and tense", () => {
    expect(formCellGroupKey("es", "hablar", "ind.pres.3sg")).toBe("verb-1-ind.pres");
    expect(formCellGroupShortLabel("es", "verb-1-ind.pres")).toBe("-ar · present");
  });

  it("groups irregular verbs by tense", () => {
    expect(formCellGroupKey("es", "ser", "ind.pres.3sg")).toBe("irregular-ind.pres");
  });

  it("groups nominal cells by paradigm code", () => {
    expect(formCellGroupKey("es", "el", "m.pl")).toBe("nominal-m.pl");
    expect(formCellGroupShortLabel("es", "nominal-m.pl")).toBe("masculine plural");
  });
});

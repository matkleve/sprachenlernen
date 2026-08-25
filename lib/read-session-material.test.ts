/**
 * Contract: docs/specs/service/method-session-budget.md
 */
import { describe, expect, it } from "vitest";

import {
  assessReadMaterialSufficiency,
  minSentencesForBudgetMinutes,
  timedReadDurationSec,
} from "@/lib/read-session-material";
import { resolveSequentialReadWindows } from "@/lib/material-unit";
import { loadLexiconForLanguage } from "@/lib/shipped-language";

describe("read-session-material", () => {
  it("requires more sentences for longer packages", () => {
    expect(minSentencesForBudgetMinutes(20)).toBe(8);
    expect(minSentencesForBudgetMinutes(45)).toBe(18);
  });

  it("flags three sentences as insufficient for a 20-minute package", () => {
    const text = "Uno. Dos. Tres.";
    const result = assessReadMaterialSufficiency(text, 20, "window");
    expect(result.sufficient).toBe(false);
    expect(result.sentenceCount).toBe(3);
  });

  it("sizes timed read duration from budget minutes", () => {
    const sec = timedReadDurationSec("extensive-reading", 20);
    expect(sec).toBeGreaterThan(600);
    expect(sec).toBeLessThanOrEqual(20 * 60);
  });
});

describe("resolveSequentialReadWindows", () => {
  it("splits a long body into multiple timed windows", () => {
    const lexicon = loadLexiconForLanguage("es");
    const body =
      "Uno dos tres. El café está en la mesa. La casa es grande. María bebe té con azúcar en la terraza. " +
      "Los niños juegan en el parque pequeño. El sol brilla sobre la ciudad antigua. Por la tarde llegan más clientes al café. " +
      "El gobierno anuncia medidas nuevas. Los expertos discuten el cambio climático. Muchas ciudades registran temperaturas altas.";

    const windows = resolveSequentialReadWindows(body, 900, {
      lexicon: lexicon ?? undefined,
      heldLemmas: new Set(),
      chunkSec: 300,
    });

    expect(windows.length).toBeGreaterThanOrEqual(1);
    expect(windows.reduce((sum, window) => sum + window.durationSec, 0)).toBe(900);
  });
});

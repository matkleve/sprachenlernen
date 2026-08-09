import { describe, expect, it } from "vitest";

import { loadSpanishMeaningRecallDeck, validateStarterDeck } from "@/lib/starter-deck";

describe("starter-deck", () => {
  it("loads the shipped Spanish meaning-recall pool", () => {
    const result = loadSpanishMeaningRecallDeck();
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.deck.language).toBe("es");
    expect(result.deck.taskType).toBe("meaning-recall");
    expect(result.deck.cards.length).toBe(50);
    expect(result.deck.cards[0]?.taskId).toBe("es:de:meaning-recall");
  });

  it("rejects an invalid deck", () => {
    const result = validateStarterDeck({ language: "es", taskType: "x", cards: [] });
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.errors.join(" ")).toMatch(/cards/);
    }
  });
});

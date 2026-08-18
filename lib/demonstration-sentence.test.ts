import { describe, expect, it } from "vitest";

import {
  loadDemonstrationBank,
  pickDemonstrationSentence,
  type DemonstrationSentenceBank,
} from "./demonstration-sentence";

const bank: DemonstrationSentenceBank = {
  sentences: [
    {
      id: "a",
      text: "A B C.",
      translation: "A B C.",
      tokens: ["A", "B", "C."],
      lemmaIds: ["es:a", "es:b", "es:c"],
    },
    {
      id: "b",
      text: "D E.",
      translation: "D E.",
      tokens: ["D", "E."],
      lemmaIds: ["es:d", "es:e"],
    },
  ],
};

describe("pickDemonstrationSentence", () => {
  it("prefers one unknown lemma when held set is partial", () => {
    const held = new Set(["es:a", "es:b", "es:c"]);
    const pick = pickDemonstrationSentence(bank, held, "2026-08-16");
    expect(pick?.id).toBe("b");
  });

  it("is stable for the same day key", () => {
    const pick1 = pickDemonstrationSentence(bank, new Set(), "2026-08-16");
    const pick2 = pickDemonstrationSentence(bank, new Set(), "2026-08-16");
    expect(pick1?.id).toBe(pick2?.id);
  });

  it("loads shipped language banks", () => {
    const es = loadDemonstrationBank("es");
    expect(es?.sentences.length).toBeGreaterThan(0);
  });
});

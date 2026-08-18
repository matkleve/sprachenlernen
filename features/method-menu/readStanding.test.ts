import { beforeEach, describe, expect, it, vi } from "vitest";

import { listTaskStatesForTaskIds } from "@/lib/db/task-state";
import { poolForActiveLanguage } from "@/lib/db/learner-pools";

import { readStanding } from "./readStanding";

vi.mock("@/lib/db/learner-pools", () => ({
  poolForActiveLanguage: vi.fn(),
}));

vi.mock("@/lib/db/task-state", () => ({
  listTaskStatesForTaskIds: vi.fn(),
}));

const meaningCard = (lemma: string, rank: number) => ({
  taskId: `es:${lemma}:meaning-recall`,
  wordId: `es:${lemma}`,
  lemma,
  front: lemma,
  descriptionKey: `card.es:${lemma}.meaning-recall.back`,
  frequencyRank: rank,
});

describe("readStanding", () => {
  beforeEach(() => {
    vi.mocked(poolForActiveLanguage).mockReset();
    vi.mocked(listTaskStatesForTaskIds).mockReset();
  });

  it("routes on no language", async () => {
    vi.mocked(poolForActiveLanguage).mockResolvedValue({ status: "no-language" });

    expect(await readStanding()).toEqual({ status: "no-language" });
    expect(listTaskStatesForTaskIds).not.toHaveBeenCalled();
  });

  it("omits standing when task state cannot be read", async () => {
    vi.mocked(poolForActiveLanguage).mockResolvedValue({
      status: "ok",
      cards: [meaningCard("hola", 1)],
      languageCodes: ["es"],
    });
    vi.mocked(listTaskStatesForTaskIds).mockResolvedValue({
      status: "error",
      error: "boom",
    });

    expect(await readStanding()).toEqual({ status: "omit" });
  });

  it("requests meaning-recall task ids only, not the form-recall deck", async () => {
    vi.mocked(poolForActiveLanguage).mockResolvedValue({
      status: "ok",
      cards: [
        meaningCard("hola", 1),
        {
          taskId: "es:hola:form-recall",
          wordId: "es:hola",
          lemma: "hola",
          front: "hola",
          back: "gloss",
          descriptionKey: "card.es:hola.form-recall.front",
          frequencyRank: 1,
          paradigmCell: "ind.pres.3sg",
        },
      ],
      languageCodes: ["es"],
    });
    vi.mocked(listTaskStatesForTaskIds).mockResolvedValue({ status: "ok", rows: [] });

    await readStanding();

    expect(listTaskStatesForTaskIds).toHaveBeenCalledWith(["es:hola:meaning-recall"]);
  });

  it("returns empty standing when nothing has been reviewed yet", async () => {
    vi.mocked(poolForActiveLanguage).mockResolvedValue({
      status: "ok",
      cards: [meaningCard("hola", 1)],
      languageCodes: ["es"],
    });
    vi.mocked(listTaskStatesForTaskIds).mockResolvedValue({ status: "ok", rows: [] });

    const outcome = await readStanding();

    expect(outcome).toEqual({ status: "ok", summary: { kind: "empty" } });
  });
});

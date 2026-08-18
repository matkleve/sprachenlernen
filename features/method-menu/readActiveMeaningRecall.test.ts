import { describe, expect, it, vi } from "vitest";

import { readActiveMeaningRecall } from "./readActiveMeaningRecall";

vi.mock("@/lib/db/learner-pools", () => ({
  poolForActiveLanguage: vi.fn(),
}));

vi.mock("@/lib/db/task-state", () => ({
  listTaskStatesForTaskIds: vi.fn(),
}));

import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import { listTaskStatesForTaskIds } from "@/lib/db/task-state";

describe("readActiveMeaningRecall", () => {
  it("loads meaning-recall task ids only", async () => {
    vi.mocked(poolForActiveLanguage).mockResolvedValue({
      status: "ok",
      languageCodes: ["es"],
      cards: [
        {
          taskId: "es:hola:meaning-recall",
          wordId: "w1",
          lemma: "hola",
          front: "hola",
          descriptionKey: "es:hola",
          frequencyRank: 1,
        },
        {
          taskId: "es:hola:form-recall",
          wordId: "w1",
          lemma: "hola",
          front: "hola",
          descriptionKey: "es:hola",
          frequencyRank: 1,
        },
      ],
    });
    vi.mocked(listTaskStatesForTaskIds).mockResolvedValue({
      status: "ok",
      rows: [],
    });

    const outcome = await readActiveMeaningRecall();

    expect(outcome).toEqual({
      status: "ok",
      languageCode: "es",
      cards: [
        {
          taskId: "es:hola:meaning-recall",
          wordId: "w1",
          lemma: "hola",
          front: "hola",
          descriptionKey: "es:hola",
          frequencyRank: 1,
        },
      ],
      stateRows: [],
    });
    expect(listTaskStatesForTaskIds).toHaveBeenCalledWith(["es:hola:meaning-recall"]);
  });
});

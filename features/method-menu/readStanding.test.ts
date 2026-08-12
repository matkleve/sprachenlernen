import { beforeEach, describe, expect, it, vi } from "vitest";

import { listReviewsForTaskIds } from "@/lib/db/review-log";
import { poolForActiveLanguage } from "@/lib/db/learner-pools";

import { readStanding } from "./readStanding";

vi.mock("@/lib/db/learner-pools", () => ({
  poolForActiveLanguage: vi.fn(),
}));

vi.mock("@/lib/db/review-log", () => ({
  listReviewsForTaskIds: vi.fn(),
  toSchedulerReview: vi.fn((row: { reviewedAt: string; grade: string }) => ({
    at: Date.parse(row.reviewedAt),
    grade: row.grade,
  })),
}));

const meaningCard = (lemma: string, rank: number) => ({
  taskId: `es:${lemma}:meaning-recall`,
  wordId: `es:${lemma}`,
  lemma,
  front: lemma,
  back: "gloss",
  frequencyRank: rank,
});

describe("readStanding", () => {
  beforeEach(() => {
    vi.mocked(poolForActiveLanguage).mockReset();
    vi.mocked(listReviewsForTaskIds).mockReset();
  });

  it("routes on no language", async () => {
    vi.mocked(poolForActiveLanguage).mockResolvedValue({ status: "no-language" });

    expect(await readStanding()).toEqual({ status: "no-language" });
    expect(listReviewsForTaskIds).not.toHaveBeenCalled();
  });

  it("omits standing when review history cannot be read", async () => {
    vi.mocked(poolForActiveLanguage).mockResolvedValue({
      status: "ok",
      cards: [meaningCard("hola", 1)],
      languageCodes: ["es"],
    });
    vi.mocked(listReviewsForTaskIds).mockResolvedValue({
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
          frequencyRank: 1,
          paradigmCell: "ind.pres.3sg",
        },
      ],
      languageCodes: ["es"],
    });
    vi.mocked(listReviewsForTaskIds).mockResolvedValue({ status: "ok", reviews: [] });

    await readStanding();

    expect(listReviewsForTaskIds).toHaveBeenCalledWith(["es:hola:meaning-recall"]);
  });

  it("returns empty standing when nothing has been reviewed yet", async () => {
    vi.mocked(poolForActiveLanguage).mockResolvedValue({
      status: "ok",
      cards: [meaningCard("hola", 1)],
      languageCodes: ["es"],
    });
    vi.mocked(listReviewsForTaskIds).mockResolvedValue({ status: "ok", reviews: [] });

    const outcome = await readStanding();

    expect(outcome).toEqual({ status: "ok", summary: { kind: "empty" } });
  });
});

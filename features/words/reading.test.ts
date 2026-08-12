import { beforeEach, describe, expect, it, vi } from "vitest";

import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import { listReviewsForTaskIds } from "@/lib/db/review-log";
import type { StarterCard } from "@/lib/starter-deck";

import { readWordsHome } from "./reading";

/**
 * Contract: docs/specs/feature/words-home.md, docs/specs/service/vocabulary-snapshot.md
 *
 * poolForActiveLanguage carries meaning-recall and form-recall cards
 * together, for the review session's benefit. This page shows one atlas row
 * per word, so a mixed pool without a filter double-counts every lemma that
 * has a distinct form — verified on the shipped Spanish pool: it dropped the
 * capped top-100 atlas to 62 distinct lemmas. Regression coverage for that,
 * not a hypothetical.
 */

vi.mock("@/lib/db/review-log", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/db/review-log")>()),
  listReviewsForTaskIds: vi.fn(),
}));

vi.mock("@/lib/db/learner-pools", () => ({ poolForActiveLanguage: vi.fn() }));

const now = Date.UTC(2026, 7, 12);

const meaningCard: StarterCard = {
  taskId: "es:hablar:meaning-recall",
  wordId: "es:hablar",
  lemma: "hablar",
  front: "hablar",
  back: "to speak",
  frequencyRank: 4,
};

const formCard: StarterCard = {
  taskId: "es:hablar:hablo:form-recall",
  wordId: "es:hablar",
  lemma: "hablar",
  front: "hablar (I)",
  back: "hablo",
  frequencyRank: 4,
};

beforeEach(() => {
  vi.mocked(listReviewsForTaskIds).mockClear();
  vi.mocked(listReviewsForTaskIds).mockResolvedValue({ status: "ok", reviews: [] });
  vi.mocked(poolForActiveLanguage).mockResolvedValue({
    status: "ok",
    cards: [meaningCard, formCard],
    languageCodes: ["es"],
  });
});

describe("readWordsHome", () => {
  it("counts each word once, even when the pool also carries its form-recall card", async () => {
    const outcome = await readWordsHome(now);

    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;
    expect(outcome.snapshot.counts).toEqual({ held: 0, fragile: 0, new: 1 });
    expect(outcome.snapshot.atlas).toHaveLength(1);
  });

  it("asks the review log for meaning-recall task IDs only", async () => {
    await readWordsHome(now);

    expect(listReviewsForTaskIds).toHaveBeenCalledWith(["es:hablar:meaning-recall"]);
  });

  it("reports no-language rather than an empty snapshot when nothing is chosen", async () => {
    vi.mocked(poolForActiveLanguage).mockResolvedValue({ status: "no-language" });

    const outcome = await readWordsHome(now);

    expect(outcome.status).toBe("no-language");
  });

  it("returns a handled error when the log reports one", async () => {
    vi.mocked(listReviewsForTaskIds).mockResolvedValue({
      status: "error",
      error: "Not signed in.",
    });

    const outcome = await readWordsHome(now);

    expect(outcome.status).toBe("error");
    if (outcome.status !== "error") return;
    expect(outcome.error.referenceId).toBeTruthy();
  });
});

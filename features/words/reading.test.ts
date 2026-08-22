import { beforeEach, describe, expect, it, vi } from "vitest";

import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import { getSpokenLanguage } from "@/lib/db/profiles";
import { listReviewsForTaskIds } from "@/lib/db/review-log";
import { listTaskStatesForTaskIds } from "@/lib/db/task-state";
import type { StarterCard } from "@/lib/starter-deck";

import { readWordsHome } from "./reading";

/**
 * Contract: docs/specs/feature/words-home.md, docs/specs/service/vocabulary-snapshot.md
 */

vi.mock("@/lib/db/task-state", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/db/task-state")>()),
  listTaskStatesForTaskIds: vi.fn(),
}));

vi.mock("@/lib/db/review-log", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/db/review-log")>()),
  listReviewsForTaskIds: vi.fn(),
}));

vi.mock("@/lib/db/learner-pools", () => ({ poolForActiveLanguage: vi.fn() }));

vi.mock("@/lib/db/content-sources", () => ({
  listLearnerSourcesForLanguage: vi.fn().mockResolvedValue({ status: "ok", sources: [] }),
}));

vi.mock("@/lib/db/profiles", () => ({ getSpokenLanguage: vi.fn() }));

const now = Date.UTC(2026, 7, 12);

const meaningCard: StarterCard = {
  taskId: "es:hablar:meaning-recall",
  wordId: "es:hablar",
  lemma: "hablar",
  front: "hablar",
  descriptionKey: "card.es:hablar.meaning-recall.back",
  frequencyRank: 4,
};

const formCard: StarterCard = {
  taskId: "es:hablar:hablo:form-recall",
  wordId: "es:hablar",
  lemma: "hablar",
  front: "hablar (I)",
  back: "hablo",
  descriptionKey: "card.es:hablar.form-recall.front",
  frequencyRank: 4,
};

beforeEach(() => {
  vi.mocked(listTaskStatesForTaskIds).mockClear();
  vi.mocked(listTaskStatesForTaskIds).mockResolvedValue({ status: "ok", rows: [] });
  vi.mocked(listReviewsForTaskIds).mockClear();
  vi.mocked(listReviewsForTaskIds).mockResolvedValue({ status: "ok", reviews: [] });
  vi.mocked(getSpokenLanguage).mockClear();
  vi.mocked(getSpokenLanguage).mockResolvedValue({ status: "ok", spokenLanguage: "en" });
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
    expect(outcome.blocks).toHaveLength(2);
  });

  it("loads task_state for meaning-recall task IDs only", async () => {
    await readWordsHome(now);

    expect(listTaskStatesForTaskIds).toHaveBeenCalledWith(["es:hablar:meaning-recall"]);
  });

  it("reports no-language rather than an empty snapshot when nothing is chosen", async () => {
    vi.mocked(poolForActiveLanguage).mockResolvedValue({ status: "no-language" });

    const outcome = await readWordsHome(now);

    expect(outcome.status).toBe("no-language");
  });

  it("loads a content trace index for the active language", async () => {
    const outcome = await readWordsHome(now);

    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;
    expect(outcome.contentTraceIndex).not.toBeNull();
    expect(outcome.contentTraceIndex?.lemmaSources["uno"]?.length).toBeGreaterThanOrEqual(3);
  });

  it("returns a handled error when task state cannot be read", async () => {
    vi.mocked(listTaskStatesForTaskIds).mockResolvedValue({
      status: "error",
      error: "Not signed in.",
    });

    const outcome = await readWordsHome(now);

    expect(outcome.status).toBe("error");
    if (outcome.status !== "error") return;
    expect(outcome.error.referenceId).toBeTruthy();
  });
});

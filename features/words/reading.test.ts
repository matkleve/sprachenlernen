import { beforeEach, describe, expect, it, vi } from "vitest";

import { poolForActiveLanguage } from "@/lib/db/learner-pools";
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
  vi.mocked(listTaskStatesForTaskIds).mockClear();
  vi.mocked(listTaskStatesForTaskIds).mockResolvedValue({ status: "ok", rows: [] });
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
    expect(outcome.snapshot.counts).toEqual({ held: 0, shaky: 0, new: 1 });
    expect(outcome.snapshot.atlas).toHaveLength(1);
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

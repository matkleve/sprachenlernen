import { beforeEach, describe, expect, it, vi } from "vitest";

import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import { listTaskStatesForTaskIds } from "@/lib/db/task-state";
import { loadSpanishMeaningRecallDeck } from "@/lib/starter-deck";

import { readProgress } from "./reading";

/** Contract: docs/specs/page/progress.md */

vi.mock("@/lib/db/task-state", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/db/task-state")>()),
  listTaskStatesForTaskIds: vi.fn(),
}));

vi.mock("@/lib/db/learner-pools", () => ({ poolForActiveLanguage: vi.fn() }));

const spanishDeck = loadSpanishMeaningRecallDeck();
const spanishCards = spanishDeck.status === "ok" ? spanishDeck.deck.cards : [];

const now = Date.UTC(2026, 7, 9);

beforeEach(() => {
  vi.mocked(listTaskStatesForTaskIds).mockClear();
  vi.mocked(poolForActiveLanguage).mockResolvedValue({
    status: "ok",
    cards: spanishCards,
    languageCodes: ["es"],
  });
});

describe("readProgress", () => {
  it("reports no-language rather than an empty reading when nothing is chosen", async () => {
    vi.mocked(poolForActiveLanguage).mockResolvedValue({ status: "no-language" });

    const outcome = await readProgress(now);

    expect(outcome.status).toBe("no-language");
    expect(listTaskStatesForTaskIds).not.toHaveBeenCalled();
  });

  it("returns a reading when task state can be read", async () => {
    vi.mocked(listTaskStatesForTaskIds).mockResolvedValue({ status: "ok", rows: [] });

    const outcome = await readProgress(now);

    expect(outcome.status).toBe("ok");
  });

  it("returns a handled error when task state reports one", async () => {
    vi.mocked(listTaskStatesForTaskIds).mockResolvedValue({
      status: "error",
      error: "Not signed in.",
    });

    const outcome = await readProgress(now);

    expect(outcome.status).toBe("error");
    if (outcome.status !== "error") return;
    expect(outcome.error.referenceId).toBeTruthy();
    expect(outcome.error.developerMessage).toContain("Not signed in.");
  });

  it("returns a handled error when task state throws instead of returning one", async () => {
    vi.mocked(listTaskStatesForTaskIds).mockImplementation(() => {
      throw new Error("fetch failed");
    });

    const outcome = await readProgress(now);

    expect(outcome.status).toBe("error");
    if (outcome.status !== "error") return;
    expect(outcome.error.developerMessage).toContain("fetch failed");
    expect(outcome.error.userMessage).not.toMatch(/^an error occurred/i);
  });
});

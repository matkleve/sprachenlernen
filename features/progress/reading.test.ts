import { beforeEach, describe, expect, it, vi } from "vitest";

import { listReviewsForTaskIds } from "@/lib/db/review-log";

import { readProgress } from "./reading";

/**
 * Contract: docs/specs/page/progress.md — the failure half.
 *
 * A failed read and a learner who has done nothing render the same sentence
 * on this page ("not measured"), so the only thing separating them is that one
 * of them is an error outcome. That makes these two cases load-bearing rather
 * than defensive.
 */

vi.mock("@/lib/db/review-log", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/db/review-log")>()),
  listReviewsForTaskIds: vi.fn(),
}));

const now = Date.UTC(2026, 7, 9);

// Braces are load-bearing. `beforeEach(() => mock.mockClear())` returns the
// mock, vitest takes a function returned from a hook to be its teardown, and
// so calls the mock again after every test — where a mock that throws throws
// outside the code under test and fails it with assertions all green
// (docs/TRAPS.md).
beforeEach(() => {
  vi.mocked(listReviewsForTaskIds).mockClear();
});

describe("readProgress", () => {
  it("returns a reading when the log can be read", async () => {
    vi.mocked(listReviewsForTaskIds).mockResolvedValue({ status: "ok", reviews: [] });

    const outcome = await readProgress(now);

    expect(outcome.status).toBe("ok");
  });

  it("returns a handled error when the log reports one", async () => {
    vi.mocked(listReviewsForTaskIds).mockResolvedValue({
      status: "error",
      error: "Not signed in.",
    });

    const outcome = await readProgress(now);

    expect(outcome.status).toBe("error");
    if (outcome.status !== "error") return;
    expect(outcome.error.referenceId).toBeTruthy();
    expect(outcome.error.developerMessage).toContain("Not signed in.");
  });

  it("returns a handled error when the log throws instead of returning one", async () => {
    // The adapter returns its own failures, but a rejected fetch inside
    // supabase-js arrives as an exception. Without the boundary this is an
    // unhandled 500 and the user sees the generic page UC-065 bans.
    // Throws synchronously, which is what a missing environment does inside
    // `createServerSupabaseClient`. Not `mockRejectedValue`, and not an async
    // mock that throws: both hand vitest a rejected promise it counts against
    // the test even after the code under test has caught it.
    vi.mocked(listReviewsForTaskIds).mockImplementation(() => {
      throw new Error("fetch failed");
    });

    const outcome = await readProgress(now);

    expect(outcome.status).toBe("error");
    if (outcome.status !== "error") return;
    expect(outcome.error.developerMessage).toContain("fetch failed");
    expect(outcome.error.userMessage).not.toMatch(/^an error occurred/i);
  });
});

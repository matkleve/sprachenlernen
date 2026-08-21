import { describe, expect, it, vi } from "vitest";

import { applyTaskLifecycle } from "@/lib/db/task-lifecycle";
import * as auth from "@/lib/db/auth";
import * as taskState from "@/lib/db/task-state";

/**
 * Contract: docs/specs/feature/word-detail.md, BACKEND.md §4.
 *
 * `task_id` is not a per-account value — it is a shared string like
 * `es:haber:meaning-recall`, identical in every learner's deck. An update
 * filtered on `task_id` alone therefore names one row per account, not one
 * row. RLS refuses the others, so nothing leaked; but BACKEND.md §4 is
 * explicit that the scope filter is not the caller's job to remember, and the
 * adapter takes an injectable client — a service-role one would write across
 * every account with no policy left to stop it.
 */

type Recorded = { column: string; value: unknown };

function recordingClient(recorded: Recorded[]) {
  const builder = {
    update: vi.fn(() => builder),
    insert: vi.fn(() => Promise.resolve({ error: null })),
    eq: vi.fn((column: string, value: unknown) => {
      recorded.push({ column, value });
      return builder;
    }),
    then: (resolve: (value: { error: null }) => unknown) => resolve({ error: null }),
  };
  return {
    from: vi.fn(() => builder),
    builder,
  };
}

describe("applyTaskLifecycle — multi-tenant scoping", () => {
  it("scopes the update to the account, not to the shared task id alone", async () => {
    vi.spyOn(auth, "getAccount").mockResolvedValue({
      id: "user-1",
      email: "a@example.com",
    });
    vi.spyOn(taskState, "listTaskStatesForTaskIds").mockResolvedValue({
      status: "ok",
      rows: [
        {
          taskId: "es:haber:meaning-recall",
          wordId: "es:haber",
          state: "review",
          stability: 4,
          difficulty: 5,
          due: new Date().toISOString(),
          lastReviewAt: new Date().toISOString(),
          lapses: 0,
          lastGrade: "good",
          reviewCount: 3,
          weightsVersion: "fsrs-v1",
        },
      ],
    } as Awaited<ReturnType<typeof taskState.listTaskStatesForTaskIds>>);

    const recorded: Recorded[] = [];
    const client = recordingClient(recorded);

    const result = await applyTaskLifecycle(
      "es:haber:meaning-recall",
      "retire",
      client as never,
    );

    expect(result).toEqual({ status: "ok" });
    expect(recorded).toContainEqual({ column: "user_id", value: "user-1" });
    expect(recorded).toContainEqual({
      column: "task_id",
      value: "es:haber:meaning-recall",
    });
  });
});

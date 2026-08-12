import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { appendReview, listReviewsForTaskIds, toSchedulerReview } from "@/lib/db/review-log";
import { SHIPPED_ES_POOL_SIZE } from "@/lib/starter-deck";

/**
 * Offline adapter coverage. RLS with payload columns is proven in
 * lib/db/access-control.test.ts against the live project.
 */

const installationId = "11111111-1111-4111-8111-111111111111";
const reviewedAt = new Date("2026-08-09T12:00:00.000Z");

function authForUser(user: { id: string; email: string } | null) {
  const session = user ? { user } : null;
  return {
    getSession: vi.fn().mockResolvedValue({ data: { session } }),
    getUser: vi.fn().mockResolvedValue({ data: { user } }),
  };
}

function appendFakeClient(options: {
  userId: string | null;
  rpc?: { data: string | null; error: { message: string; code?: string } | null };
  existingStates?: unknown[];
}) {
  const rpc = vi.fn().mockResolvedValue(options.rpc ?? { data: "row-1", error: null });
  const taskStateSelect = vi.fn().mockReturnValue({
    in: vi.fn().mockResolvedValue({ data: options.existingStates ?? [], error: null }),
  });
  const from = vi.fn().mockImplementation((table: string) => {
    if (table === "task_state") return { select: taskStateSelect };
    throw new Error(`unexpected table ${table}`);
  });

  return {
    auth: authForUser(
      options.userId ? { id: options.userId, email: "a@example.com" } : null,
    ),
    from,
    rpc,
  } as unknown as SupabaseClient;
}

const validInput = {
  taskId: "es:hablar:meaning-recall",
  grade: "good" as const,
  reviewedAt,
  latencyMs: 420,
  installationId,
};

describe("appendReview", () => {
  it("appends a row for a signed-in account", async () => {
    const client = appendFakeClient({ userId: "user-1" });

    const result = await appendReview(validInput, client);

    expect(result).toEqual({ status: "appended", id: "row-1" });
    expect(client.rpc).toHaveBeenCalledWith(
      "append_review_with_task_state",
      expect.objectContaining({
        p_task_id: "es:hablar:meaning-recall",
        p_word_id: "es:hablar",
        p_grade: "good",
        p_installation_id: installationId,
      }),
    );
  });

  it("treats a duplicate review_id as appended", async () => {
    const client = appendFakeClient({
      userId: "user-1",
      rpc: { data: null, error: { code: "23505", message: "duplicate key value" } },
    });

    const reviewId = "22222222-2222-4222-8222-222222222222";
    const result = await appendReview({ ...validInput, reviewId }, client);

    expect(result).toEqual({ status: "appended", id: reviewId });
  });

  it("refuses when there is no session", async () => {
    const client = appendFakeClient({ userId: null });

    const result = await appendReview(validInput, client);

    expect(result).toEqual({ status: "error", error: "You are not signed in." });
  });

  it("refuses an invalid grade before touching the database", async () => {
    const client = appendFakeClient({ userId: "user-1" });

    const result = await appendReview(
      { ...validInput, grade: "nope" as "good" },
      client,
    );

    expect(result.status).toBe("error");
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it("surfaces insert errors from Supabase", async () => {
    const client = appendFakeClient({
      userId: "user-1",
      rpc: { data: null, error: { message: "permission denied" } },
    });

    const result = await appendReview(validInput, client);

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.error).toBe("Could not save your answer.");
    }
  });

  it("maps a missing column to schema-mismatch user copy", async () => {
    const client = appendFakeClient({
      userId: "user-1",
      rpc: {
        data: null,
        error: { code: "PGRST204", message: "Could not find review_id column" },
      },
    });

    const result = await appendReview(validInput, client);

    expect(result).toEqual({ status: "error", error: "Could not save your answer." });
  });
});

describe("listReviewsForTaskIds", () => {
  function listClient(rows: unknown[], signedIn = true) {
    const order = vi.fn().mockResolvedValue({ data: rows, error: null });
    const inFilter = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ in: inFilter });
    const client = {
      auth: authForUser(signedIn ? { id: "user-1", email: "a@example.com" } : null),
      from: vi.fn().mockReturnValue({ select }),
    } as unknown as SupabaseClient;

    return { client, select, inFilter, order };
  }

  const row = {
    id: "row-1",
    user_id: "user-1",
    installation_id: installationId,
    task_id: "task-1",
    grade: "good",
    reviewed_at: reviewedAt.toISOString(),
    latency_ms: 420,
    created_at: reviewedAt.toISOString(),
  };

  it("requests rows ordered by reviewed_at for scheduler rebuild", async () => {
    const { client, inFilter, order } = listClient([row]);

    const result = await listReviewsForTaskIds(["task-1", "task-2"], client);

    // Ascending order is not cosmetic: `rebuild` replays reviews in the order
    // it receives them, so a descending result silently produces a different
    // stability for the same history.
    expect(inFilter).toHaveBeenCalledWith("task_id", ["task-1", "task-2"]);
    expect(order).toHaveBeenCalledWith("reviewed_at", { ascending: true });
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;

    expect(toSchedulerReview(result.reviews[0]!)).toEqual({
      at: reviewedAt.getTime(),
      grade: "good",
    });
  });

  it("returns an empty result without querying when there are no task ids", async () => {
    const { client, select } = listClient([row]);

    const result = await listReviewsForTaskIds([], client);

    expect(result).toEqual({ status: "ok", reviews: [] });
    expect(select).not.toHaveBeenCalled();
  });

  it("refuses when there is no session", async () => {
    const { client, select } = listClient([row], false);

    const result = await listReviewsForTaskIds(["task-1"], client);

    // A signed-out read must not fall through to "no history", which the
    // session builder would treat as a brand-new learner and answer with a
    // full queue of new cards.
    expect(result.status).toBe("error");
    expect(select).not.toHaveBeenCalled();
  });

  /**
   * `.in()` rides in the PostgREST query string, so the whole pool travels in
   * the request line. The 2000-lemma pool crosses the request-line limit of a
   * typical gateway, which answers 414 — invisible to every other test here,
   * because they all stub the client.
   */
  function chunkedClient(rowsPerCall: unknown[][]) {
    const calls: string[][] = [];
    let call = 0;
    const select = vi.fn().mockReturnValue({
      in: vi.fn().mockImplementation((_column: string, ids: string[]) => {
        calls.push(ids);
        const rows = rowsPerCall[call] ?? [];
        call += 1;
        return { order: vi.fn().mockResolvedValue({ data: rows, error: null }) };
      }),
    });
    const client = {
      auth: authForUser({ id: "user-1", email: "a@example.com" }),
      from: vi.fn().mockReturnValue({ select }),
    } as unknown as SupabaseClient;

    return { client, calls };
  }

  const rowAt = (taskId: string, iso: string) => ({ ...row, task_id: taskId, reviewed_at: iso });

  it("splits a pool-sized task list into bounded requests", async () => {
    const taskIds = Array.from(
      { length: SHIPPED_ES_POOL_SIZE },
      (_, i) => `es:lemma-${i}:meaning-recall`,
    );
    const { client, calls } = chunkedClient([]);

    const result = await listReviewsForTaskIds(taskIds, client);

    expect(result.status).toBe("ok");
    expect(calls.length).toBeGreaterThan(1);
    expect(Math.max(...calls.map((ids) => ids.length))).toBeLessThanOrEqual(100);
    expect(calls.flat()).toEqual(taskIds);
  });

  it("orders reviews by reviewed_at across chunk boundaries", async () => {
    const taskIds = Array.from({ length: 150 }, (_, i) => `task-${i}`);
    const { client } = chunkedClient([
      [rowAt("task-1", "2026-08-09T12:00:02.000Z")],
      [rowAt("task-120", "2026-08-09T12:00:01.000Z")],
    ]);

    const result = await listReviewsForTaskIds(taskIds, client);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    // Each chunk arrives ordered; the concatenation is not. `rebuild` replays
    // in the order it receives, so this sort changes the stability it derives.
    expect(result.reviews.map((review) => review.taskId)).toEqual(["task-120", "task-1"]);
  });

  it("returns a repeated task id's rows once, as the single query did", async () => {
    // The id repeats across a batch boundary. Unbatched, `.in()` collapsed it;
    // batched it would be queried twice and `rebuild` would replay a doubled
    // history — a stability the learner never earned.
    const taskIds = [...Array.from({ length: 100 }, (_, i) => `task-${i}`), "task-0"];
    const { client, calls } = chunkedClient([[rowAt("task-0", "2026-08-09T12:00:00.000Z")]]);

    const result = await listReviewsForTaskIds(taskIds, client);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(calls.flat().filter((id) => id === "task-0")).toHaveLength(1);
    expect(result.reviews).toHaveLength(1);
  });

  it("surfaces an error from any chunk rather than a short history", async () => {
    const taskIds = Array.from({ length: 150 }, (_, i) => `task-${i}`);
    const select = vi.fn().mockReturnValue({
      in: vi
        .fn()
        .mockReturnValueOnce({ order: vi.fn().mockResolvedValue({ data: [row], error: null }) })
        .mockReturnValueOnce({
          order: vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } }),
        }),
    });
    const client = {
      auth: authForUser({ id: "user-1", email: "a@example.com" }),
      from: vi.fn().mockReturnValue({ select }),
    } as unknown as SupabaseClient;

    const result = await listReviewsForTaskIds(taskIds, client);

    // A partial read looks exactly like a learner who reviewed less than they
    // did, and the scheduler would happily reschedule from it.
    expect(result.status).toBe("error");
  });
});

describe("toSchedulerReview", () => {
  it("maps reviewed_at to epoch milliseconds", () => {
    const review = toSchedulerReview({
      id: "row-1",
      userId: "user-1",
      installationId,
      taskId: "task-1",
      grade: "again",
      reviewedAt: "2026-08-09T12:00:00.000Z",
      latencyMs: 100,
      createdAt: "2026-08-09T12:00:01.000Z",
    });

    expect(review).toEqual({ at: reviewedAt.getTime(), grade: "again" });
  });
});

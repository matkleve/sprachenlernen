import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { appendReview, listReviewsForTaskIds, toSchedulerReview } from "@/lib/db/review-log";

/**
 * Offline adapter coverage. RLS with payload columns is proven in
 * lib/db/access-control.test.ts against the live project.
 */

const installationId = "11111111-1111-4111-8111-111111111111";
const reviewedAt = new Date("2026-08-09T12:00:00.000Z");

function fakeClient(options: {
  userId: string | null;
  insert?: { data: { id: string } | null; error: { message: string } | null };
  select?: { data: unknown[] | null; error: { message: string } | null };
}): SupabaseClient {
  const insert = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue(options.insert ?? { data: { id: "row-1" }, error: null }),
    }),
  });

  const selectChain = {
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue(
      options.select ?? {
        data: [
          {
            id: "row-1",
            user_id: options.userId,
            installation_id: installationId,
            task_id: "task-1",
            grade: "good",
            reviewed_at: reviewedAt.toISOString(),
            latency_ms: 420,
            created_at: reviewedAt.toISOString(),
          },
        ],
        error: null,
      },
    ),
  };

  const select = vi.fn().mockReturnValue(selectChain);

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: options.userId ? { id: options.userId, email: "a@example.com" } : null,
        },
      }),
    },
    from: vi.fn().mockImplementation((table: string) => {
      expect(table).toBe("review_log");
      return { insert, select };
    }),
  } as unknown as SupabaseClient;
}

const validInput = {
  taskId: "task-1",
  grade: "good" as const,
  reviewedAt,
  latencyMs: 420,
  installationId,
};

describe("appendReview", () => {
  it("appends a row for a signed-in account", async () => {
    const insert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: "row-1" }, error: null }),
      }),
    });
    const client = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "a@example.com" } },
        }),
      },
      from: vi.fn().mockReturnValue({ insert }),
    } as unknown as SupabaseClient;

    const result = await appendReview(validInput, client);

    expect(result).toEqual({ status: "appended", id: "row-1" });
    expect(insert).toHaveBeenCalledWith({
      user_id: "user-1",
      installation_id: installationId,
      task_id: "task-1",
      grade: "good",
      reviewed_at: reviewedAt.toISOString(),
      latency_ms: 420,
    });
  });

  it("refuses when there is no session", async () => {
    const client = fakeClient({ userId: null });

    const result = await appendReview(validInput, client);

    expect(result).toEqual({ status: "error", error: "Not signed in." });
  });

  it("refuses an invalid grade before touching the database", async () => {
    const client = fakeClient({ userId: "user-1" });

    const result = await appendReview(
      { ...validInput, grade: "nope" as "good" },
      client,
    );

    expect(result.status).toBe("error");
    expect(client.from).not.toHaveBeenCalled();
  });

  it("surfaces insert errors from Supabase", async () => {
    const client = fakeClient({
      userId: "user-1",
      insert: { data: null, error: { message: "permission denied" } },
    });

    const result = await appendReview(validInput, client);

    expect(result).toEqual({ status: "error", error: "permission denied" });
  });
});

describe("listReviewsForTaskIds", () => {
  function listClient(rows: unknown[], signedIn = true) {
    const order = vi.fn().mockResolvedValue({ data: rows, error: null });
    const inFilter = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ in: inFilter });
    const client = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: signedIn ? { id: "user-1", email: "a@example.com" } : null },
        }),
      },
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

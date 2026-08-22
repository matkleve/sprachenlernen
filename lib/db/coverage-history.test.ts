import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import {
  appendCoverageSnapshots,
  listCoverageHistoryForLanguage,
} from "@/lib/db/coverage-history";

vi.mock("@/lib/db/client", () => ({
  createServerSupabaseClient: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/db/client";

function authForUser(user: { id: string; email: string } | null) {
  const session = user ? { user } : null;
  return {
    getSession: vi.fn().mockResolvedValue({ data: { session } }),
    getUser: vi.fn().mockResolvedValue({ data: { user } }),
  };
}

function historyClient(options: {
  userId: string | null;
  selectMany?: { data: Record<string, unknown>[] | null; error: { message: string } | null };
  insert?: { error: { message: string } | null };
}) {
  const insert = vi.fn().mockResolvedValue(options.insert ?? { error: null });
  const select = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue(
      options.selectMany ?? {
        data: [
          {
            source_id: "es-fixture-cafe",
            measured_at: "2026-08-10T10:00:00.000Z",
            coverage_percent: 84,
            calibration_dated: "2026-08-01",
          },
        ],
        error: null,
      },
    ),
  });

  const from = vi.fn((table: string) => {
    if (table === "coverage_history") {
      return { select, insert };
    }
    throw new Error(`unexpected table ${table}`);
  });

  return {
    auth: authForUser(
      options.userId
        ? { id: options.userId, email: "learner@example.com" }
        : null,
    ),
    from,
    insert,
  } as unknown as SupabaseClient;
}

describe("coverage-history db adapter", () => {
  it("returns empty rows when signed out", async () => {
    vi.mocked(createServerSupabaseClient).mockResolvedValue(
      historyClient({ userId: null }),
    );

    const outcome = await listCoverageHistoryForLanguage("es");
    expect(outcome).toEqual({ status: "ok", rows: [] });
  });

  it("lists coverage rows for the signed-in user", async () => {
    vi.mocked(createServerSupabaseClient).mockResolvedValue(
      historyClient({ userId: "user-1" }),
    );

    const outcome = await listCoverageHistoryForLanguage("es");
    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;
    expect(outcome.rows[0]?.sourceId).toBe("es-fixture-cafe");
    expect(outcome.rows[0]?.coveragePercent).toBe(84);
  });

  it("appends snapshots for the signed-in user", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const client = historyClient({ userId: "user-1", insert: { error: null } });
    vi.mocked(client.from).mockImplementation(((table: string) => {
      if (table === "coverage_history") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
          insert,
        };
      }
      throw new Error(`unexpected table ${table}`);
    }) as unknown as typeof client.from);
    vi.mocked(createServerSupabaseClient).mockResolvedValue(client);

    const outcome = await appendCoverageSnapshots("es", [
      {
        sourceId: "es-fixture-cafe",
        coveragePercent: 96,
        calibrationDated: "2026-08-01",
      },
    ]);

    expect(outcome).toEqual({ status: "ok", appended: 1 });
    expect(insert).toHaveBeenCalled();
  });
});

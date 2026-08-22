import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAccount } from "@/lib/db/auth";
import { createServerSupabaseClient } from "@/lib/db/client";
import { getLearnerWorld, setLearnerWorld } from "@/lib/db/learner-world";

vi.mock("@/lib/db/auth", () => ({
  getAccount: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  createServerSupabaseClient: vi.fn(),
}));

/** Contract: docs/specs/service/learner-world.md (T-W23) */

type WorldRow = {
  language_code: string;
  world_id: string;
  set_at: string;
};

function mockLearnerWorldClient(options: {
  userId: string | null;
  rows?: WorldRow[];
}) {
  const state = { rows: [...(options.rows ?? [])] };

  const from = vi.fn((table: string) => {
    if (table !== "learner_world") throw new Error(`unexpected table ${table}`);

    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => {
              const row = state.rows.find((entry) => entry.language_code === "es") ?? null;
              return { data: row, error: null };
            }),
          })),
          maybeSingle: vi.fn(async () => ({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(async (payload: { world_id: string; set_at: string }) => {
        state.rows.push({
          language_code: "es",
          world_id: payload.world_id,
          set_at: payload.set_at,
        });
        return { error: null };
      }),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(async () => ({ error: null })),
        })),
      })),
    };
  });

  return { from, state };
}

describe("learner-world db adapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAccount).mockResolvedValue({ id: "user-1", email: "learner@example.com" });
  });

  it("returns general when no row exists (AC getWorld default)", async () => {
    const supabase = mockLearnerWorldClient({ userId: "user-1", rows: [] });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(supabase as never);

    const outcome = await getLearnerWorld("es");
    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;
    expect(outcome.world.worldId).toBe("general");
    expect(outcome.hasRow).toBe(false);
    expect(outcome.world.setAt).toBeNull();
  });

  it("persists and reads back a chosen world (AC setWorld)", async () => {
    const supabase = mockLearnerWorldClient({ userId: "user-1", rows: [] });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(supabase as never);

    const setOutcome = await setLearnerWorld("es", "politics");
    expect(setOutcome.status).toBe("ok");

    const readOutcome = await getLearnerWorld("es");
    expect(readOutcome.status).toBe("ok");
    if (readOutcome.status !== "ok") return;
    expect(readOutcome.world.worldId).toBe("politics");
    expect(readOutcome.hasRow).toBe(true);
    expect(readOutcome.world.setAt).toBeTruthy();
  });

  it("returns previous world id on update", async () => {
    const supabase = mockLearnerWorldClient({
      userId: "user-1",
      rows: [{ language_code: "es", world_id: "politics", set_at: "2026-08-01T00:00:00.000Z" }],
    });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(supabase as never);

    const outcome = await setLearnerWorld("es", "nature");
    expect(outcome).toEqual({ status: "ok", previousWorldId: "politics" });
  });

  it("errors when signed out", async () => {
    vi.mocked(getAccount).mockResolvedValue(null);
    const supabase = mockLearnerWorldClient({ userId: null });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(supabase as never);

    const outcome = await getLearnerWorld("es");
    expect(outcome.status).toBe("error");
  });
});

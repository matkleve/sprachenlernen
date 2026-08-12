import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAccount } from "@/lib/db/auth";
import { ensureProfile, getSpokenLanguage, setSpokenLanguage } from "@/lib/db/profiles";

vi.mock("@/lib/db/auth", () => ({
  getAccount: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  createServerSupabaseClient: vi.fn(),
}));

/** Contract: docs/specs/service/spoken-language.md */

function mockSupabase(rows: { spoken_language: string }[] = []) {
  const state = { rows: [...rows] };

  const from = vi.fn((table: string) => {
    if (table !== "profiles") throw new Error(`unexpected table ${table}`);

    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(async () => {
            const row = state.rows[0] ?? null;
            return { data: row, error: null };
          }),
        })),
      })),
      insert: vi.fn(async (payload: { user_id: string; spoken_language: string }) => {
        state.rows.push({ spoken_language: payload.spoken_language });
        return { error: null };
      }),
      update: vi.fn(() => ({
        eq: vi.fn(async (column: string, value: string) => {
          if (column !== "user_id") return { error: null };
          if (state.rows[0]) state.rows[0].spoken_language = "de";
          return { error: null };
        }),
      })),
    };
  });

  return { from, state };
}

describe("profiles adapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAccount).mockResolvedValue({ id: "u1", email: "a@example.com" });
  });

  it("returns the stored spoken language", async () => {
    const supabase = mockSupabase([{ spoken_language: "de" }]);
    const { createServerSupabaseClient } = await import("@/lib/db/client");
    vi.mocked(createServerSupabaseClient).mockResolvedValue(supabase as never);

    const outcome = await getSpokenLanguage();
    expect(outcome).toEqual({ status: "ok", spokenLanguage: "de" });
  });

  it("seeds en when no profile row exists yet", async () => {
    const supabase = mockSupabase();
    const { createServerSupabaseClient } = await import("@/lib/db/client");
    vi.mocked(createServerSupabaseClient).mockResolvedValue(supabase as never);

    const outcome = await getSpokenLanguage();
    expect(outcome).toEqual({ status: "ok", spokenLanguage: "en" });
    expect(supabase.from).toHaveBeenCalledWith("profiles");
  });

  it("inserts a profile with the requested spoken language", async () => {
    const supabase = mockSupabase();
    const { createServerSupabaseClient } = await import("@/lib/db/client");
    vi.mocked(createServerSupabaseClient).mockResolvedValue(supabase as never);

    const outcome = await ensureProfile("de");
    expect(outcome).toEqual({ status: "ok" });
    expect(supabase.state.rows[0]?.spoken_language).toBe("de");
  });

  it("refuses an unshipped spoken language code", async () => {
    const supabase = mockSupabase([{ spoken_language: "en" }]);
    const { createServerSupabaseClient } = await import("@/lib/db/client");
    vi.mocked(createServerSupabaseClient).mockResolvedValue(supabase as never);

    const outcome = await setSpokenLanguage("fr");
    expect(outcome.status).toBe("error");
  });
});

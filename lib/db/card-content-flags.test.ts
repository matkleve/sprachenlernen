import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAccount } from "@/lib/db/auth";
import { getSpokenLanguage } from "@/lib/db/profiles";
import { flagCardContent, listFlaggedWordIds } from "@/lib/db/card-content-flags";

vi.mock("@/lib/db/auth", () => ({
  getAccount: vi.fn(),
}));

vi.mock("@/lib/db/profiles", () => ({
  getSpokenLanguage: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  createServerSupabaseClient: vi.fn(),
}));

/** Contract: docs/specs/service/broken-card-detection.md */

describe("card-content-flags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAccount).mockResolvedValue({ id: "u1", email: "a@example.com" });
    vi.mocked(getSpokenLanguage).mockResolvedValue({ status: "ok", spokenLanguage: "en" });
  });

  it("flags a card for the account spoken language", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({ insert }));
    const { createServerSupabaseClient } = await import("@/lib/db/client");
    vi.mocked(createServerSupabaseClient).mockResolvedValue({ from } as never);

    const outcome = await flagCardContent("es:perro");
    expect(outcome).toEqual({ status: "ok" });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "u1",
        word_id: "es:perro",
        spoken_language: "en",
      }),
    );
  });

  it("lists flagged word ids for the spoken language", async () => {
    const eq = vi.fn().mockReturnThis();
    const select = vi.fn(() => ({
      eq,
    }));
    eq.mockImplementation(() => ({
      eq: vi.fn().mockResolvedValue({
        data: [{ word_id: "es:perro" }],
        error: null,
      }),
    }));
    const from = vi.fn(() => ({ select }));
    const { createServerSupabaseClient } = await import("@/lib/db/client");
    vi.mocked(createServerSupabaseClient).mockResolvedValue({ from } as never);

    const outcome = await listFlaggedWordIds("en");
    expect(outcome).toEqual({ status: "ok", wordIds: ["es:perro"] });
  });
});

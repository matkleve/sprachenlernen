import { describe, expect, it, vi } from "vitest";

import { redirect } from "next/navigation";

import { loadMethodCatalogue } from "./catalogue";
import { loadMethodsDestination } from "./loadMethodsDestination";
import { readStanding } from "./readStanding";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("./catalogue", () => ({
  loadMethodCatalogue: vi.fn(() => ({ catalogue: [], presets: [], errors: [] })),
}));
vi.mock("./readStanding", () => ({ readStanding: vi.fn() }));

describe("loadMethodsDestination", () => {
  it("redirects when no language is chosen", async () => {
    vi.mocked(readStanding).mockResolvedValue({ status: "no-language" });

    await loadMethodsDestination(Promise.resolve({}));

    expect(redirect).toHaveBeenCalled();
  });

  it("returns catalogue data for Methods and mirror routes", async () => {
    vi.mocked(readStanding).mockResolvedValue({
      status: "ok",
      summary: { kind: "recorded", held: 1, poolSize: 10 },
    });
    vi.mocked(loadMethodCatalogue).mockReturnValue({
      catalogue: { entries: [{ id: "x" } as never] },
      presets: [],
      errors: [],
    });

    const data = await loadMethodsDestination(Promise.resolve({ skill: "reading" }));

    expect(data.catalogue?.entries).toHaveLength(1);
    expect(data.initialSearchParams).toEqual({ skill: "reading" });
  });
});

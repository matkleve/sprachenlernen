import { beforeEach, describe, expect, it, vi } from "vitest";

import { REFLECTION_SEEN_COOKIE, reflectionSeenValue } from "@/lib/reflection-seen";

const set = vi.fn();
const cookiesMock = vi.fn(async () => ({ set }));
const revalidatePath = vi.fn();

vi.mock("next/headers", () => ({
  cookies: () => cookiesMock(),
}));

vi.mock("next/cache", () => ({
  revalidatePath,
}));

describe("markReflectionSeenAction", () => {
  beforeEach(() => {
    set.mockClear();
    revalidatePath.mockClear();
  });

  it("stores the iso week and language in the reflection-seen cookie", async () => {
    const { markReflectionSeenAction } = await import("./actions");

    await markReflectionSeenAction("2026-W33", "es");

    expect(set).toHaveBeenCalledWith(
      REFLECTION_SEEN_COOKIE,
      reflectionSeenValue("2026-W33", "es"),
      expect.objectContaining({ path: "/", httpOnly: true }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/progress");
  });
});

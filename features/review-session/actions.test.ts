import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildSessionAction } from "@/features/review-session/actions";
import * as reviewLog from "@/lib/db/review-log";
import { copy } from "@/features/review-session/content";

vi.mock("@/lib/db/review-log", async (importOriginal) => {
  const actual = await importOriginal<typeof reviewLog>();
  return {
    ...actual,
    listReviewsForTaskIds: vi.fn(),
  };
});

describe("buildSessionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns session build copy when review history load throws", async () => {
    vi.mocked(reviewLog.listReviewsForTaskIds).mockRejectedValueOnce(
      new Error("cookies() unavailable"),
    );

    const outcome = await buildSessionAction();

    expect(outcome).toEqual({
      status: "error",
      error: copy.loadError,
    });
  });
});

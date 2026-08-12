import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildSessionAction } from "@/features/review-session/actions";
import * as taskState from "@/lib/db/task-state";
import { copy } from "@/features/review-session/content";

vi.mock("@/lib/db/task-state", async (importOriginal) => {
  const actual = await importOriginal<typeof taskState>();
  return {
    ...actual,
    listTaskStatesForTaskIds: vi.fn(),
  };
});

describe("buildSessionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns session build copy when task state load throws", async () => {
    vi.mocked(taskState.listTaskStatesForTaskIds).mockRejectedValueOnce(
      new Error("cookies() unavailable"),
    );

    const outcome = await buildSessionAction();

    expect(outcome).toEqual({
      status: "error",
      error: copy.loadError,
    });
  });
});

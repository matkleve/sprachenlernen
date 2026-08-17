import { describe, expect, it, vi } from "vitest";

import { applyTaskLifecycle } from "@/lib/db/task-lifecycle";
import * as auth from "@/lib/db/auth";
import * as taskState from "@/lib/db/task-state";

describe("applyTaskLifecycle", () => {
  it("refuses suspend on a never-reviewed word", async () => {
    vi.spyOn(auth, "getAccount").mockResolvedValue({ id: "user-1" } as Awaited<
      ReturnType<typeof auth.getAccount>
    >);
    vi.spyOn(taskState, "listTaskStatesForTaskIds").mockResolvedValue({
      status: "ok",
      rows: [],
    });

    const result = await applyTaskLifecycle(
      "es:haber:meaning-recall",
      "suspend",
      {} as never,
    );

    expect(result).toEqual({
      status: "error",
      error: "You can suspend a word only after you have reviewed it once.",
    });
  });
});

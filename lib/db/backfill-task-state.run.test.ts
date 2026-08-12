import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { backfillTaskState } from "@/lib/db/backfill-task-state";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasLiveProject = Boolean(url && serviceRoleKey);
const shouldRun = process.env.RUN_TASK_STATE_BACKFILL === "1";

/** Operator entry point: `RUN_TASK_STATE_BACKFILL=1 npx vitest run lib/db/backfill-task-state.run.test.ts` */
describe.skipIf(!hasLiveProject || !shouldRun)("backfill-task-state (live)", () => {
  it("backfills task_state from review_log for all users with history", async () => {
    const admin = createClient(url!, serviceRoleKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    await expect(backfillTaskState(admin)).resolves.toBeUndefined();
  }, 300_000);
});

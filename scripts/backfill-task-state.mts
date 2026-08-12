#!/usr/bin/env node
/**
 * Backfill `task_state` from append-only `review_log` for every user.
 * Contract: docs/specs/service/task-state.supplement.md § Backfill migration.
 *
 * Usage (service role required):
 *   RUN_TASK_STATE_BACKFILL=1 npx vitest run lib/db/backfill-task-state.run.test.ts
 */

console.error(
  "Use: RUN_TASK_STATE_BACKFILL=1 npx vitest run lib/db/backfill-task-state.run.test.ts\n" +
    "Implementation lives in lib/db/backfill-task-state.ts (needs @/ path aliases).",
);
process.exit(1);

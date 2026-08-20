#!/usr/bin/env node
/**
 * Gate: hosted catalogue durations stay within budget tolerance (T-MV5).
 * Contract: docs/specs/service/method-session-budget.md
 */
import { spawnSync } from "node:child_process";

const { status } = spawnSync(
  "npm",
  ["run", "--silent", "test", "--", "catalogue-budget.test.ts"],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
  },
);

process.exit(status ?? 1);

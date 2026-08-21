#!/usr/bin/env node
/**
 * Wrapper — runs the Vitest batch runner so @/ imports resolve.
 * Contract: docs/specs/service/content-adaptation.md (T-CI3)
 */
import { spawnSync } from "node:child_process";

const extra = process.argv.slice(2);
const result = spawnSync(
  process.execPath,
  ["./node_modules/vitest/vitest.mjs", "run", "lib/adapt-catalogue.run.test.ts", ...extra],
  {
    cwd: process.cwd(),
    env: { ...process.env, RUN_ADAPT_CATALOGUE: "1" },
    stdio: "inherit",
  },
);

process.exit(result.status ?? 1);

#!/usr/bin/env node
/**
 * Gate: hosted exercise recipes stay within viability allowlist (T-MV1).
 * Contract: docs/specs/service/method-session-viability.md
 */
import { spawnSync } from "node:child_process";

const { status } = spawnSync("npm", ["run", "--silent", "test", "--", "viability.test.ts"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(status ?? 1);

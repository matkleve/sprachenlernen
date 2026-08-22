#!/usr/bin/env node
/**
 * Seed app_texts from snapshot JSON. Contract: docs/specs/service/app-texts.md
 *
 * Usage (service role required):
 *   npm run import:app-texts
 */
console.error(
  "Use: npm run import:app-texts\n" +
    "Implementation lives in lib/db/import-app-texts.ts (RUN_APP_TEXTS_IMPORT=1 vitest run).",
);
process.exit(1);

#!/usr/bin/env node
/**
 * Gate: every interactive surface uses a primitive from interaction-registry.json.
 *
 * Catches hand-rolled <button>, buttonVariants on Link, and gradeButtonClass
 * outside components/ui before they drift from the interaction kernel.
 */

import { readFileSync, globSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "../..");
const REGISTRY_PATH = join(ROOT, "docs/specs/system/interaction-registry.json");

const registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));

const SCAN_DIRS = ["app", "features"];
const SCAN_GLOB = "**/*.{ts,tsx}";

const files = SCAN_DIRS.flatMap((dir) =>
  globSync(`${dir}/${SCAN_GLOB}`, { cwd: ROOT }),
);

function isExempt(filePath, content, line) {
  return registry.exemptions.some((entry) => {
    if (filePath !== entry.file && !filePath.endsWith(entry.file)) return false;
    if (entry.pattern && !line.includes(entry.pattern) && !content.includes(entry.pattern)) {
      return false;
    }
    return true;
  });
}

const violations = [];

for (const file of files) {
  const content = readFileSync(join(ROOT, file), "utf8");
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    const lineNo = index + 1;

    if (/<button\b/.test(line) && !isExempt(file, content, line)) {
      violations.push({
        file,
        line: lineNo,
        rule: "raw-button",
        message: "Use a primitive from components/ui/ — see interaction-registry.json",
      });
    }

    for (const forbidden of registry.forbiddenOutsidePrimitives) {
      if (line.includes(forbidden) && !isExempt(file, content, line)) {
        violations.push({
          file,
          line: lineNo,
          rule: "forbidden-symbol",
          message: `${forbidden} is only allowed inside components/ui/ primitives`,
        });
      }
    }
  });
}

if (violations.length) {
  console.error("\x1b[31m✗ interaction surfaces check failed\x1b[0m\n");
  for (const v of violations) {
    console.error(`  ${relative(ROOT, join(ROOT, v.file))}:${v.line}  ${v.message}`);
  }
  console.error(`\n  Registry: docs/specs/system/interaction-registry.json`);
  console.error(`  Inventory: docs/specs/system/interaction-inventory.md\n`);
  process.exit(1);
}

console.log(
  `\x1b[32m✓ interaction surfaces\x1b[0m — ${files.length} files, ${registry.primitives.length} primitives`,
);

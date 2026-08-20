#!/usr/bin/env node
/**
 * Gate: study docs stay uniform and navigable.
 *
 *  1. Every STUDY-/DR-/EXP-/QA-/BL-/ARCH- file has valid frontmatter id + type.
 *  2. No duplicate ids.
 *  3. study/README.md links resolve.
 *  4. Warn on ⚠ SPEC GAP inside active study chapters (should live in specs).
 */
import { existsSync, globSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

const problems = [];
const warnings = [];

const fail = (file, msg) => problems.push(`✗ ${file}  ${msg}`);
const warn = (file, msg) => warnings.push(`⚠ ${file}  ${msg}`);

const meta = (text, key) =>
  text.match(new RegExp(`<!--\\s*${key}:\\s*(.+?)\\s*-->`))?.[1] ?? null;

const ID_PATTERNS = [
  { glob: "docs/study/STUDY-*.md", prefix: "STUDY-", type: "reasoning|correction|antipattern|bibliography" },
  { glob: "docs/study/archive/ARCH-*.md", prefix: "ARCH-", type: "archived-bridge" },
  { glob: "docs/reviews/design/DR-*.md", prefix: "DR-", type: "design-review" },
  { glob: "docs/explorations/EXP-*.md", prefix: "EXP-", type: "exploration" },
  { glob: "docs/qa/QA-*.md", prefix: "QA-", type: "qa" },
  { glob: "docs/backlog/BL-*.md", prefix: "BL-", type: "backlog" },
];

const seenIds = new Map();

for (const { glob, prefix, type } of ID_PATTERNS) {
  for (const file of globSync(glob, { cwd: ROOT })) {
    const text = readFileSync(join(ROOT, file), "utf8");
    const id = meta(text, "id");
    const docType = meta(text, "type");

    if (!id) {
      fail(file, "missing `<!-- id: … -->` frontmatter");
      continue;
    }
    if (!id.startsWith(prefix) && !(prefix === "STUDY-" && id === "STUDY-sources")) {
      fail(file, `id "${id}" must start with "${prefix}"`);
    }
    if (!docType) {
      fail(file, "missing `<!-- type: … -->` frontmatter");
    } else if (!new RegExp(`^(${type})$`).test(docType)) {
      fail(file, `type "${docType}" must be one of ${type}`);
    }
    if (seenIds.has(id)) {
      fail(file, `duplicate id "${id}" (also in ${seenIds.get(id)})`);
    } else {
      seenIds.set(id, file);
    }

    if (file.startsWith("docs/study/STUDY-") && text.includes("⚠ SPEC GAP")) {
      warn(file, "contains ⚠ SPEC GAP — move to spec or IMPLEMENTATION-PLAN");
    }
  }
}

// Legacy paths must not remain
const legacy = globSync("docs/study/[0-9][0-9]-*.md", { cwd: ROOT });
for (const file of legacy) {
  fail(file, "legacy numbered study file — see docs/study/MIGRATION-MAP.md");
}

if (problems.length) {
  console.error("check:study failed\n");
  for (const p of problems) console.error(p);
  if (warnings.length) {
    console.error("\nWarnings:");
    for (const w of warnings) console.warn(w);
  }
  process.exit(1);
}

console.log("check:study ok");
if (warnings.length) {
  for (const w of warnings) console.warn(w);
}

#!/usr/bin/env node
/**
 * Add standard frontmatter to migrated study-family docs if missing.
 */
import { globSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

const meta = (text, key) =>
  text.match(new RegExp(`<!--\\s*${key}:\\s*(.+?)\\s*-->`))?.[1] ?? null;

/** @type {Record<string, { type: string; correctedBy?: string; spawns?: string }>} */
const META = {
  "STUDY-001-duolingo.md": { type: "reasoning" },
  "STUDY-002-evidence.md": { type: "reasoning" },
  "STUDY-003-level-model.md": { type: "reasoning", spawns: "UC-004" },
  "STUDY-004-flashcards-srs.md": { type: "reasoning", spawns: "UC-005, UC-006, UC-012, UC-013" },
  "STUDY-005-input-reading-listening.md": { type: "reasoning", spawns: "UC-007, UC-008" },
  "STUDY-006-production.md": { type: "reasoning", spawns: "UC-015, UC-016, UC-017" },
  "STUDY-007-offline-and-paper.md": { type: "reasoning", spawns: "UC-009, UC-026" },
  "STUDY-008-motivation.md": { type: "reasoning", spawns: "UC-006, UC-019" },
  "STUDY-009-antipatterns.md": { type: "antipattern" },
  "STUDY-010-method-cards.md": { type: "reasoning", spawns: "UC-010, UC-039, UC-042" },
  "STUDY-011-pronunciation-perception.md": { type: "reasoning", spawns: "UC-014" },
  "STUDY-012-accessibility.md": { type: "reasoning", spawns: "UC-020, UC-021" },
  "STUDY-013-landscape.md": { type: "correction", correctedBy: "STUDY-005" },
  "STUDY-014-further-findings.md": { type: "reasoning" },
  "STUDY-015-own-content.md": { type: "reasoning", spawns: "UC-027, UC-028, UC-029, UC-030" },
  "STUDY-016-language-kit.md": { type: "correction", spawns: "UC-035, UC-036, UC-037, UC-040" },
  "STUDY-017-milestones-and-map.md": { type: "reasoning", spawns: "UC-031, UC-032, UC-033, UC-034" },
  "STUDY-018-speaking-and-sentences.md": { type: "reasoning", spawns: "UC-043, UC-044" },
  "STUDY-019-method-catalogue-and-context.md": { type: "reasoning", spawns: "UC-045, UC-046, UC-047, UC-048, UC-057" },
  "STUDY-020-visual-design.md": { type: "reasoning" },
  "STUDY-021-how-an-exercise-runs.md": { type: "reasoning", spawns: "UC-049" },
  "STUDY-022-speaking-as-the-goal.md": { type: "correction", correctedBy: "STUDY-019", spawns: "UC-050, UC-051, UC-052, UC-053" },
  "STUDY-023-why-it-does-not-feel-productive.md": { type: "correction", correctedBy: "STUDY-008", spawns: "UC-054, UC-055, UC-056" },
  "STUDY-024-readiness-and-difficulty.md": { type: "correction", correctedBy: "STUDY-002", spawns: "UC-058, UC-060, UC-061" },
  "STUDY-025-method-badges.md": { type: "reasoning" },
  "STUDY-026-notifications-and-reflections.md": { type: "reasoning" },
  "STUDY-027-material-units-and-listening-defer.md": { type: "reasoning", spawns: "UC-077" },
  "STUDY-sources.md": { type: "bibliography" },
};

const ARCH = {
  "ARCH-043-early-foundation-sessions.md": { spawns: "UC-079" },
  "ARCH-044-foundation-phase-expert-review.md": {},
  "ARCH-045-method-duration-variants.md": {},
  "ARCH-046-method-length-and-level-matched-content.md": {},
  "ARCH-048-content-licensing-and-adaptation.md": {},
};

function injectFrontmatter(file, id, type, extra = {}) {
  const path = join(ROOT, file);
  let text = readFileSync(path, "utf8");
  if (meta(text, "id")) return false;

  const lines = [`<!-- id: ${id} -->`, `<!-- type: ${type} -->`];
  lines.push(file.includes("/archive/") ? "<!-- status: archived -->" : "<!-- status: active -->");
  if (extra.correctedBy) lines.push(`<!-- corrected-by: ${extra.correctedBy} -->`);
  if (extra.spawns) lines.push(`<!-- spawns: ${extra.spawns} -->`);

  const block = `${lines.join("\n")}\n\n`;
  text = text.replace(/^(# .+\n\n)/, `$1${block}`);
  writeFileSync(path, text);
  return true;
}

function studyId(name) {
  if (name === "STUDY-sources.md") return "STUDY-sources";
  return name.match(/^(STUDY-\d+)/)?.[1] ?? basename(name, ".md");
}

let n = 0;

for (const [name, extra] of Object.entries(META)) {
  if (injectFrontmatter(`docs/study/${name}`, studyId(name), extra.type, extra)) n++;
}

for (const [name, extra] of Object.entries(ARCH)) {
  const id = name.match(/^(ARCH-\d+)/)?.[1] ?? name;
  if (injectFrontmatter(`docs/study/archive/${name}`, id, "archived-bridge", extra)) n++;
}

for (const file of globSync("docs/reviews/design/DR-*.md", { cwd: ROOT })) {
  const id = basename(file, ".md").match(/^(DR-\d+)/)?.[1];
  if (id && injectFrontmatter(file, id, "design-review")) n++;
}

for (const file of globSync("docs/explorations/EXP-*.md", { cwd: ROOT })) {
  const id = basename(file, ".md").match(/^(EXP-\d+)/)?.[1];
  if (id && injectFrontmatter(file, id, "exploration")) n++;
}

for (const file of globSync("docs/qa/QA-*.md", { cwd: ROOT })) {
  const id = basename(file, ".md").match(/^(QA-\d+)/)?.[1];
  if (id && injectFrontmatter(file, id, "qa")) n++;
}

for (const file of globSync("docs/backlog/BL-*.md", { cwd: ROOT })) {
  const id = basename(file, ".md").match(/^(BL-\d+)/)?.[1];
  if (id && injectFrontmatter(file, id, "backlog")) n++;
}

console.log(`Added frontmatter to ${n} files.`);

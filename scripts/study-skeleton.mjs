#!/usr/bin/env node
/**
 * Wrap active study chapters in the STUDY-FORMAT skeleton (idempotent).
 */
import { globSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

const meta = (text, key) =>
  text.match(new RegExp(`<!--\\s*${key}:\\s*(.+?)\\s*-->`))?.[1] ?? null;

/** @type {Record<string, string>} */
const THESIS = {
  "STUDY-001": "Duolingo's strength is habit; its weakness is optimizing return instead of measured competence.",
  "STUDY-002": "Every research claim here must carry an evidence grade and a product consequence.",
  "STUDY-003": "Level is a bundle of skill-specific measurements — one progress bar lies.",
  "STUDY-004": "SRS works when the learner trusts the schedule; trust comes from visibility, not secrecy.",
  "STUDY-005": "Comprehensible input builds fluency; flashcards build word knowledge — neither replaces the other.",
  "STUDY-006": "Production learning needs honest feedback; mouth grading without ear training is limited.",
  "STUDY-007": "The most effective drills are often off-phone — the app must take paper results back in.",
  "STUDY-008": "Motivation surfaces must not trade long-term learning for daily return.",
  "STUDY-009": "Named product anti-patterns we deliberately refuse to build.",
  "STUDY-010": "Preference and measured effect are two ledgers — never optimize selection on thumbs alone.",
  "STUDY-011": "Pronunciation starts in the ear; HVPT is cheap, evidenced, and under-implemented in apps.",
  "STUDY-012": "Accessibility is computed across skills and routes, not a single display mode.",
  "STUDY-013": "The competitor landscape corrects overstated claims about input tools and platforms.",
  "STUDY-014": "Secondary findings (chunks, sleep, styles myth) with explicit product hooks.",
  "STUDY-015": "Learner-owned content is essential — with honest limits on simplification and rights.",
  "STUDY-016": "Each language is code plus data, shipped with an honest quality tier — never implied fluency.",
  "STUDY-017": "Learners need a map of reachable milestones, not only a compass saying keep going.",
  "STUDY-018": "Core speaking practice can work without an AI tutor at the centre.",
  "STUDY-019": "Context filters run before floor and effect; methods without context requirements are refused.",
  "STUDY-020": "Visual design must promise scholarship, not gamification — tokens carry meaning.",
  "STUDY-021": "An exercise runs prepare → do → wait → check → decide; navigation is not performance.",
  "STUDY-022": "Speaking may lead the headline without rewriting what the level model measures.",
  "STUDY-023": "Feeling unproductive is often a denominator problem — sometimes real, sometimes illusion.",
  "STUDY-024": "Targeting beats gating; difficulty follows holdings, not locks or hidden menus.",
  "STUDY-025": "Method cards expose skill, evidence, and effort — three families, not one medal.",
  "STUDY-026": "Reflections and notifications may inform without guilt or streak pressure.",
  "STUDY-027": "Material units and listening defer are learner scope controls, not curriculum gates.",
  "STUDY-sources": "Every citation records how far it was actually checked — no borrowed authority.",
};

const REJECT =
  "Chapter-specific rejections appear inline above. Shared catalogue: [STUDY-009-antipatterns.md](STUDY-009-antipatterns.md).";

const OPEN =
  "Implementation questions live in specs (`## Open`), use cases (`## Undecided`), or [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md).";

function related(spawns, correctedBy, id) {
  const lines = ["## Related", ""];
  if (spawns) {
    for (const uc of spawns.split(",").map((s) => s.trim()).filter(Boolean)) {
      lines.push(`- ${uc} — [use-cases/README.md](../use-cases/README.md)`);
    }
  }
  if (correctedBy) lines.push(`- Corrects \`${correctedBy}\` — see that chapter's inline amendments.`);
  lines.push("- Normative contracts: [specs/README.md](../specs/README.md)");
  if (id === "STUDY-009") lines.push("- Referenced by other chapters as the anti-pattern catalogue.");
  return lines.join("\n");
}

function stripTailSections(body) {
  return body.replace(/\n## (What we reject|Open questions|Related)\n[\s\S]*$/, "").trimEnd();
}

function parseFile(text) {
  const title = text.match(/^# .+/);
  if (!title) return null;

  let rest = text.slice(title[0].length).replace(/^\n+/, "");
  const frontmatter = [];

  while (true) {
    const m = rest.match(/^<!--[\s\S]*?-->\n/);
    if (!m) break;
    frontmatter.push(m[0].trimEnd());
    rest = rest.slice(m[0].length);
  }

  rest = rest.replace(/^\n+/, "");

  if (rest.startsWith("## Thesis")) {
    const idx = rest.indexOf("## Product consequences");
    if (idx === -1) return null;
    rest = rest.slice(idx + "## Product consequences".length).replace(/^\n+/, "");
  }

  while (true) {
    const m = rest.match(/^<!--[\s\S]*?-->\n/);
    if (!m) break;
    frontmatter.push(m[0].trimEnd());
    rest = rest.slice(m[0].length);
  }

  rest = rest.replace(/^\n+/, "");
  rest = stripTailSections(rest);
  rest = rest.replace(/^---\n\n/, "");

  return { title: title[0], frontmatter: frontmatter.join("\n"), body: rest.trimEnd() };
}

let updated = 0;

for (const file of globSync("docs/study/STUDY-*.md", { cwd: ROOT })) {
  const path = join(ROOT, file);
  const text = readFileSync(path, "utf8");
  const parsed = parseFile(text);
  if (!parsed) {
    console.warn(`skip ${file}: could not parse`);
    continue;
  }

  const fmMatch = text.match(/(<!--[\s\S]*?-->\n)+/);
  const fullMeta = parsed.frontmatter || (fmMatch ? fmMatch[0].trim() : "");
  const id = meta(fullMeta, "id") ?? meta(text, "id");
  if (!id || !THESIS[id]) {
    console.warn(`skip ${file}: no thesis for ${id}`);
    continue;
  }

  const spawns = meta(fullMeta, "spawns") ?? meta(text, "spawns");
  const correctedBy = meta(fullMeta, "corrected-by") ?? meta(text, "corrected-by");

  const out = [
    parsed.title,
    "",
    parsed.frontmatter,
    "",
    "## Thesis",
    "",
    THESIS[id],
    "",
    "## Evidence",
    "",
    "Findings marked `[A]`–`[D]` appear inline in the sections below.",
    "",
    "## Product consequences",
    "",
    parsed.body,
    "",
    "## What we reject",
    "",
    id === "STUDY-009" ? "This chapter is the shared reject catalogue." : REJECT,
    "",
    "## Open questions",
    "",
    OPEN,
    "",
    related(spawns, correctedBy, id),
    "",
  ].join("\n");

  writeFileSync(path, out);
  updated++;
}

console.log(`Skeleton (re)applied to ${updated} study chapter(s).`);

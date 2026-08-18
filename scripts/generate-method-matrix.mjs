#!/usr/bin/env node
/**
 * Regenerate docs/METHOD-IMPLEMENTATION-MATRIX.md from data/methods/*.json.
 * Run: node scripts/generate-method-matrix.mjs
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const BUILT = new Set(["srs-session", "partial-dictation", "full-dictation"]);
const PARTIAL = new Set([]);

const ENGINE = {
  "srs-session": "card",
  "audio-cards": "card",
  "collocation-cards": "card",
  "close-a-frequency-block": "card",
};

const COMPONENTS = {
  "partial-dictation": "— (shipped: short/standard/long)",
  "full-dictation": "— (shipped: short/standard/long)",
  "full-dictation": "audio-play, full-dictation, sheet-download",
  "extensive-reading": "material-preview, text-display, comprehension-questions",
  "free-production": "timed-write, feedback",
  "build-a-sentence": "type-with-word, reveal-answer",
  "cloze-sentences": "cloze-type",
  "minimal-pairs": "minimal-pair",
  "four-three-two": "round-marker, speak-prompt, voice-submit, rubric",
  "diary-three-sentences": "timed-write, feedback",
  "dictogloss": "audio-play, type-freely, diff-highlight",
  "listening-level-1": "audio-play, comprehension-questions",
  "shadowing": "shadow-line, audio-play",
};

const PRIORITY = {
  "partial-dictation": "done",
  "full-dictation": "done",
  "extensive-reading": "P1",
  "free-production": "P2",
  "build-a-sentence": "P2",
  "cloze-sentences": "P2",
  "minimal-pairs": "P2",
  "dictogloss": "P3",
  "four-three-two": "P3",
  "diary-three-sentences": "P3",
  "listening-level-1": "P3",
};

const dir = join(ROOT, "data/methods");
const files = readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "presets.json").sort();
const bySection = {};

for (const file of files) {
  const data = JSON.parse(readFileSync(join(dir, file), "utf8"));
  const section = data.section;
  if (!bySection[section]) bySection[section] = [];
  for (const e of data.entries) {
    const id = e.id;
    const type = e.type || "method";
    let engine = "—";
    if (type === "commitment") engine = "commitment";
    else if (!e.hosted) engine = "off";
    else engine = ENGINE[id] || "runner";

    let built = "—";
    if (BUILT.has(id)) built = PARTIAL.has(id) ? "◐ partial" : "✅";
    else if (engine === "off") built = "off-app";
    else if (engine === "card") built = "pool only";
    else built = "❌";

    bySection[section].push({
      id,
      ev: e.evidence,
      host: e.hosted ? "Y" : "N",
      engine,
      mat: e.materialTopics?.length ? "Y" : "—",
      built,
      comps: COMPONENTS[id] || (engine === "off" ? "debrief" : "see recipe doc"),
      pri: PRIORITY[id] || (e.hosted && e.evidence === "A" ? "P2–P3" : e.hosted ? "P3–P4" : "defer"),
      type,
    });
  }
}

let md = `# Method implementation matrix

**Last synced:** ${new Date().toISOString().slice(0, 10)} — run \`node scripts/generate-method-matrix.mjs\` to refresh counts from \`data/methods/\`.

Single view of every catalogue Method: **evidence**, **hosting**, **planned engine**,
**recipe** (specced in [\`exercise-recipe-composer.methods.md\`](specs/service/exercise-recipe-composer.methods.md)),
and **build status** (code in [\`lib/exercise-recipe-built.ts\`](../lib/exercise-recipe-built.ts),
[\`lib/method-session.ts\`](../lib/method-session.ts)).

## Summary

| | Count |
| --- | ---: |
| Methods | 53 |
| Commitments | 6 |
| Hosted (\`hosted: true\`) | 34 |
| **Built in-app** | **2** (\`srs-session\`, \`partial-dictation\`) |
| Exercise runner specced | 40 |
| Card engine specced | 4 |
| Off-app / debrief only | 19 |

### Legend

| Column | Meaning |
| --- | --- |
| **Ev** | Evidence grade A–D ([study/21](study/21-method-catalogue-and-context.md)) |
| **Host** | \`hosted: true\` — product intends to run in-app |
| **Engine** | \`card\` → \`/words/review\`; \`runner\` → \`/practice\`; \`off\` → detail + optional debrief |
| **Mat.** | Material setup on detail (\`materialTopics\`) |
| **Built** | ✅ runnable · ◐ partial · ❌ specced not built · off-app · pool only |
| **Pri** | Suggested build order (this doc) — not a spec |

`;

const sectionOrder = [
  "reading",
  "listening",
  "speaking",
  "writing",
  "form",
  "vocabulary",
  "world",
  "commitments",
];

for (const section of sectionOrder) {
  const rows = bySection[section] || [];
  const label =
    section === "commitments"
      ? `${rows.length} commitments`
      : `${rows.filter((r) => r.type === "method").length}`;
  md += `## ${section.charAt(0).toUpperCase() + section.slice(1)} (${label})\n\n`;
  md += `| id | Ev | Host | Engine | Mat. | Built | Pri | Components still needed |\n`;
  md += `| --- | --- | --- | --- | --- | --- | --- | --- |\n`;
  for (const r of rows) {
    md += `| \`${r.id}\` | ${r.ev} | ${r.host} | ${r.engine} | ${r.mat} | ${r.built} | ${r.pri} | ${r.comps} |\n`;
  }
  md += "\n";
}

md += `## Recommended build order

| Wave | Methods | Why |
| --- | --- | --- |
| **P1** | \`full-dictation\`, \`extensive-reading\` | Dictation reuse; reading has material setup in catalogue |
| **P2** | \`free-production\`, \`build-a-sentence\`, \`cloze-sentences\`, \`minimal-pairs\` | Evidence A, short recipes, no TTS |
| **P3** | \`dictogloss\`, \`four-three-two\`, \`diary-three-sentences\`, \`listening-level-1\` | Needs audio + production components |
| **P4** | Remaining hosted runners | Shared components from P1–P3 |
| **Card** | Form-recall practice, \`close-a-frequency-block\` | Extend card engine |
| **Defer** | Off-app, thin-evidence hosted, commitments | No session or low ROI |

## Related docs

| Doc | Owns |
| --- | --- |
| [\`data/methods/\`](../data/methods/) | Catalogue source of truth |
| [\`exercise-recipe-composer.methods.md\`](specs/service/exercise-recipe-composer.methods.md) | Specced step sequence |
| [\`exercise-step-components.md\`](specs/service/exercise-step-components.md) | Component catalogue |
| [\`method-engines.md\`](specs/service/method-engines.md) | Routing contract |
| [\`study/21-method-catalogue-and-context.md\`](study/21-method-catalogue-and-context.md) | Pedagogy narrative |
`;

const out = join(ROOT, "docs/METHOD-IMPLEMENTATION-MATRIX.md");
writeFileSync(out, md);
console.log(`✓ ${out} (${md.split("\n").length} lines)`);

#!/usr/bin/env node
import { readFileSync, writeFileSync, globSync } from "node:fs";
import { basename, join } from "node:path";

const ROOT = join(import.meta.dirname, "../..");

const files = globSync("docs/specs/*/**/*.md", { cwd: ROOT })
  .filter((f) => basename(f) !== "README.md" && basename(f).split(".").length === 2)
  .map((f) => {
    const text = readFileSync(join(ROOT, f), "utf8");
    return {
      f,
      id: text.match(/<!-- id: (SPEC-[^ ]+) -->/)?.[1],
      uc: text.match(/<!-- use-case: ([^ ]+) -->/)?.[1] ?? "—",
      status: text.match(/<!-- status: ([^ ]+) -->/)?.[1] ?? "?",
      kind: f.split("/")[2],
      slug: basename(f, ".md"),
    };
  })
  .filter((r) => r.id)
  .sort((a, b) => a.id.localeCompare(b.id));

const kinds = ["component", "feature", "page", "service", "system"];
let index = "";

for (const kind of kinds) {
  const rows = files.filter((r) => r.kind === kind);
  if (!rows.length) continue;
  index += `\n### ${kind}/ (${rows.length})\n\n`;
  index += "| ID | Spec | Use case | Status |\n| --- | --- | --- | --- |\n";
  for (const r of rows) {
    index += `| \`${r.id}\` | [${r.slug}.md](${kind}/${r.slug}.md) | ${r.uc} | ${r.status} |\n`;
  }
}

const active = files.filter((r) => r.status === "active").length;
const superseded = files.filter((r) => r.status === "superseded").length;
const draft = files.filter((r) => r.status === "draft").length;

const header = `# Specs

Implementation contracts. **This folder is the source of truth** — code
implements what is written here.

Format and size rules: [\`../SPEC-FORMAT.md\`](../SPEC-FORMAT.md).
Scaffold one: \`npm run new:spec\`.

**Index synced 2026-08-17.** ${files.length} canonical specs — ${active} active,
${superseded} superseded, ${draft} draft. \`npm run check:specs\` verifies
bidirectional traceability to use cases; this index is for navigation. Regenerate
after adding specs: \`node scripts/generate-specs-index.mjs\`.

## Taxonomy

| Folder | Holds | Rule of thumb |
| --- | --- | --- |
| \`feature/\` | one user-facing capability, end to end | mirrors \`features/<name>/\` |
| \`component/\` | a reusable primitive's contract | mirrors \`components/ui/<Name>.tsx\` |
| \`page/\` | a route's composition and page-level state | mirrors \`app/<route>/\` |
| \`service/\` | a boundary to something outside the app | mirrors \`lib/<name>/\` |
| \`system/\` | cross-cutting gates and inventories | mirrors \`scripts/\` or repo-wide rules |

The folder mirrors the code path. When you cannot decide which folder a spec
belongs in, you have usually not decided where the code goes either — decide
that first.

## Rules

- **One canonical spec per thing.** Detail goes into linked sibling files, never
  into a second copy under a different folder.
- **A spec never restates another spec.** Link to it. Two copies of a rule means
  one of them is already wrong, you just don't know which.
- **Specs describe token names, never hex values.** Values live in
  \`app/globals.css\`.
- **Every spec names one runnable check.** "It builds" is not a check.

## Index
`;

writeFileSync(join(ROOT, "docs/specs/README.md"), header + index + "\n");
console.log(`✓ specs index: ${files.length} entries`);

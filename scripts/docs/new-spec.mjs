#!/usr/bin/env node
/**
 * Scaffold a spec or a use case with its metadata already wired up.
 *
 * The two-way link between a use case and its specs is the thing people forget,
 * and `check-specs` then fails on work that was otherwise finished. Writing
 * both ends here means it is never wrong in the first place.
 *
 *   npm run new:spec -- use-case "Inspect one item from a list"
 *   npm run new:spec -- component button UC-001
 *   npm run new:spec -- feature item-picker UC-001
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = join(import.meta.dirname, "../..");
const KINDS = ["component", "feature", "page", "service"];

const [kind, name, useCase] = process.argv.slice(2);

const usage = () => {
  console.error(
    `Usage:\n` +
      `  npm run new:spec -- use-case "<title>"\n` +
      `  npm run new:spec -- <${KINDS.join("|")}> <slug> <UC-NNN>\n`,
  );
  process.exit(2);
};

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const write = (path, body) => {
  if (existsSync(join(ROOT, path))) {
    console.error(`✗ ${path} already exists`);
    process.exit(1);
  }
  mkdirSync(dirname(join(ROOT, path)), { recursive: true });
  writeFileSync(join(ROOT, path), body);
  console.log(`✓ ${path}`);
};

// --- use case ---------------------------------------------------------------

if (kind === "use-case") {
  if (!name) usage();

  const dir = join(ROOT, "docs/use-cases");
  const used = readdirSync(dir)
    .map((f) => Number(f.match(/^UC-(\d{3})-/)?.[1]))
    .filter(Number.isFinite);
  const id = `UC-${String(Math.max(0, ...used) + 1).padStart(3, "0")}`;

  write(
    `docs/use-cases/${id}-${slugify(name)}.md`,
    `# ${id} — ${name}

<!-- id: ${id} -->
<!-- specs:  -->

**Who:**
**Wants to:**
**So that:**

## Today

How they do it now, and what it costs them.

## Success looks like

-

## Out of scope

-
`,
  );

  console.log(`\nNext: npm run new:spec -- feature <slug> ${id}`);
  process.exit(0);
}

// --- spec -------------------------------------------------------------------

if (!KINDS.includes(kind) || !name || !useCase) usage();
if (!/^UC-\d{3}$/.test(useCase)) {
  console.error(`✗ "${useCase}" is not a use-case id (expected UC-001)`);
  process.exit(1);
}

const slug = slugify(name);
const id = `SPEC-${kind}-${slug}`;

// Find the use case and register this spec on it, so traceability holds
// immediately rather than after check-specs complains.
const ucDir = join(ROOT, "docs/use-cases");
const ucFile = readdirSync(ucDir).find((f) => f.startsWith(`${useCase}-`));

if (!ucFile) {
  console.error(`✗ no use case file for ${useCase} in docs/use-cases/`);
  process.exit(1);
}

const ucPath = join(ucDir, ucFile);
const ucText = readFileSync(ucPath, "utf8");
const specsLine = ucText.match(/<!--\s*specs:\s*(.*?)\s*-->/);

if (!specsLine) {
  console.error(`✗ ${ucFile} has no \`<!-- specs: -->\` comment to register into`);
  process.exit(1);
}

const existing = specsLine[1].split(",").map((s) => s.trim()).filter(Boolean);

write(
  `docs/specs/${kind}/${slug}.md`,
  `# ${name}

<!-- id: ${id} -->
<!-- use-case: ${useCase} -->
<!-- status: draft -->

One or two plain sentences: what this is and who it is for.

## Scope

- **In:**
- **Out:**

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 |  |  |

## States

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
|  |  |  |  |

## Acceptance criteria

- [ ] Given …, when …, then …

## Check

\`npm test -- ${slug}\`
`,
);

if (!existing.includes(id)) {
  writeFileSync(ucPath, ucText.replace(specsLine[0], `<!-- specs: ${[...existing, id].join(", ")} -->`));
  console.log(`✓ registered ${id} on ${useCase}`);
}

console.log(`\nNext: fill in the acceptance criteria, then write the check that fails.`);

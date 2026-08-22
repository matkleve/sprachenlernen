#!/usr/bin/env node
/**
 * Gate: the spec system stays navigable and traceable.
 *
 * Checks, in order of how much pain each one prevents:
 *
 *  1. Traceability BOTH ways — every spec names a use case that exists, and
 *     that use case names it back. A one-way link rots silently: you change a
 *     requirement and have no way to find what implements it.
 *  2. Size caps — a spec nobody finishes reading is not a contract.
 *  3. Required sections — a spec with no acceptance criteria and no named check
 *     is a design note wearing a contract's clothes.
 *  4. No hex values in specs — specs describe token names; values live in
 *     app/globals.css, in exactly one place.
 *  5. Every spec's named check resolves to a test that exists. Otherwise the
 *     `## Check` line is prose and the spec has no verification.
 *  6. Every relative link in the docs resolves. A doc that points at a file
 *     someone renamed is worse than no doc, because people trust it.
 *  7. AGENTS.md stays under its line cap (ADR-0003).
 *  8. Diary entries are named YYYY-MM-DD.md, so "the latest entry" is a
 *     question with an answer.
 */

import { existsSync, globSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

const ROOT = join(import.meta.dirname, "..");

const WARN_LINES = 150;
const ERROR_LINES = 180;

const REQUIRED_SECTIONS = ["## Acceptance criteria", "## Check"];

const problems = [];
const warnings = [];

const fail = (file, msg) => problems.push(`✗ ${file}  ${msg}`);
const warn = (file, msg) => warnings.push(`⚠ ${file}  ${msg}`);

const meta = (text, key) => text.match(new RegExp(`<!--\\s*${key}:\\s*(.+?)\\s*-->`))?.[1] ?? null;
const list = (value) => (value ? value.split(",").map((s) => s.trim()).filter(Boolean) : []);

/**
 * A split child holds detail for a parent: `item-picker.acceptance-criteria.md`
 * next to `item-picker.md`. It is exempt from the skeleton and the size cap —
 * splitting is the remedy for the cap, so applying the cap to the result would
 * be a loop.
 */
const isSplitChild = (file) => basename(file).split(".").length > 2;

// --- collect ----------------------------------------------------------------

const useCaseFiles = globSync("docs/use-cases/UC-*.md", { cwd: ROOT });
const specFiles = globSync("docs/specs/*/**/*.md", { cwd: ROOT }).filter(
  (f) => basename(f) !== "README.md",
);

const useCases = new Map();
const specs = new Map();

for (const file of useCaseFiles) {
  const text = readFileSync(join(ROOT, file), "utf8");
  const id = meta(text, "id");

  if (!id) {
    fail(file, "missing `<!-- id: UC-NNN -->`");
    continue;
  }
  if (!/^UC-\d{3}$/.test(id)) fail(file, `id "${id}" must look like UC-001`);
  if (!basename(file).startsWith(`${id}-`)) fail(file, `filename does not start with "${id}-"`);
  if (useCases.has(id)) fail(file, `duplicate id "${id}" (also in ${useCases.get(id).file})`);

  useCases.set(id, { file, specs: list(meta(text, "specs")) });
}

for (const file of specFiles) {
  const text = readFileSync(join(ROOT, file), "utf8");
  const id = meta(text, "id");
  const child = isSplitChild(file);

  if (!id) {
    if (!child) fail(file, "missing `<!-- id: SPEC-... -->`");
    continue;
  }
  if (specs.has(id)) fail(file, `duplicate id "${id}" (also in ${specs.get(id).file})`);

  specs.set(id, {
    file,
    text,
    child,
    useCase: meta(text, "use-case"),
    status: meta(text, "status"),
    lines: text.trimEnd().split("\n").length,
  });
}

// --- 1. traceability --------------------------------------------------------

for (const [id, spec] of specs) {
  if (spec.child) continue;

  // id must match the path: docs/specs/<kind>/<slug>.md → SPEC-<kind>-<slug>
  const parts = spec.file.split("/").slice(2); // drop "docs/specs/"
  const expected = `SPEC-${parts.join("-").replace(/\.md$/, "")}`;
  if (id !== expected) fail(spec.file, `id "${id}" should be "${expected}" to match its path`);

  if (!spec.useCase) {
    fail(spec.file, "missing `<!-- use-case: UC-NNN -->` — a spec without a use case is a solution looking for a problem");
  } else if (!useCases.has(spec.useCase)) {
    fail(spec.file, `references unknown use case "${spec.useCase}"`);
  } else if (!useCases.get(spec.useCase).specs.includes(id)) {
    fail(
      spec.file,
      `${spec.useCase} does not list "${id}" back — add it to the \`specs:\` comment in ${useCases.get(spec.useCase).file}`,
    );
  }

  if (!spec.status) fail(spec.file, "missing `<!-- status: draft|active|superseded -->`");
  else if (!["draft", "active", "superseded"].includes(spec.status))
    fail(spec.file, `unknown status "${spec.status}"`);
}

for (const [id, uc] of useCases) {
  if (uc.specs.length === 0) {
    warn(uc.file, `${id} lists no specs yet — an unkept promise until it does`);
  }
  for (const specId of uc.specs) {
    if (!specs.has(specId)) fail(uc.file, `lists unknown spec "${specId}"`);
  }
}

// --- 2/3/4. per-spec checks -------------------------------------------------

for (const [, spec] of specs) {
  if (spec.child) continue;

  if (spec.lines > ERROR_LINES) {
    fail(
      spec.file,
      `${spec.lines} lines exceeds the ${ERROR_LINES}-line cap — split it: move a section into a sibling like "<name>.acceptance-criteria.md" and link it`,
    );
  } else if (spec.lines > WARN_LINES) {
    warn(spec.file, `${spec.lines} lines — approaching the ${ERROR_LINES}-line cap`);
  }

  for (const section of REQUIRED_SECTIONS) {
    if (!spec.text.includes(section)) fail(spec.file, `missing required section "${section}"`);
  }

  const hex = spec.text.match(/#[0-9a-fA-F]{6}\b/);
  if (hex) {
    fail(
      spec.file,
      `contains a hex value (${hex[0]}) — specs name tokens, values live in app/globals.css`,
    );
  }
}

// --- 5. every spec's named check points at a test that exists ---------------
//
// Closes the third leg of the chain: use case → spec → test. Without this, the
// `## Check` line is prose — it can name a test that was renamed, or one that
// was never written, and the spec still looks complete.

const TEST_FILES = globSync("{app,components,features,lib}/**/*.test.{ts,tsx}", { cwd: ROOT });

for (const [, spec] of specs) {
  if (spec.child) continue;

  const section = spec.text.split(/^## Check$/m)[1];
  const pattern = section?.match(/npm test\s+--\s+([\w.-]+)/)?.[1];

  if (!pattern) {
    // Not every check is a vitest run — a spec may name a script or a manual
    // procedure. Only verify the ones that claim to be a test.
    if (section && /npm test/.test(section)) {
      fail(spec.file, "`## Check` names `npm test` but no runnable pattern — use `npm test -- <pattern>`");
    }
    continue;
  }

  if (!TEST_FILES.some((f) => f.includes(pattern))) {
    fail(
      spec.file,
      `\`## Check\` runs \`npm test -- ${pattern}\` but no test file matches — the spec has no verification`,
    );
  }
}

// --- 6. links resolve -------------------------------------------------------

const LINKED = [
  ...globSync("docs/**/*.md", { cwd: ROOT }),
  ...["AGENTS.md", "CLAUDE.md", "README.md", "CONTRIBUTING.md"],
  ...globSync(".claude/**/*.md", { cwd: ROOT }),
];

let linksChecked = 0;

for (const file of LINKED) {
  const text = readFileSync(join(ROOT, file), "utf8");

  for (const [, target] of text.matchAll(/]\(([^)#\s]+)(?:#[^)\s]*)?\)/g)) {
    if (/^(https?:|mailto:)/.test(target)) continue;

    linksChecked++;
    const resolved = resolve(ROOT, dirname(file), decodeURIComponent(target));
    if (!existsSync(resolved)) fail(file, `broken link → ${target}`);
  }
}

// --- 7. AGENTS.md stays short -----------------------------------------------

// ADR-0003 commits to this, so it is enforced rather than hoped for. Instruction
// files past ~150 lines cost more per request without behaving better — they get
// skimmed. When this fails, the fix is to move a section into docs/ and link it,
// never to raise the cap.
const AGENTS_CAP = 150;
const agentsLines = readFileSync(join(ROOT, "AGENTS.md"), "utf8").trimEnd().split("\n").length;

if (agentsLines > AGENTS_CAP) {
  fail(
    "AGENTS.md",
    `${agentsLines} lines exceeds the ${AGENTS_CAP}-line cap — move a section into docs/ and link it (see ADR-0003)`,
  );
} else if (agentsLines > AGENTS_CAP - 5) {
  // Deliberately narrow. A warning that fires at the intended steady state is
  // one people learn to ignore, which costs more than not having it.
  warn("AGENTS.md", `${agentsLines} lines — approaching the ${AGENTS_CAP}-line cap`);
}

// --- 8. diary entries are dated ---------------------------------------------

for (const file of globSync("docs/diary/*.md", { cwd: ROOT })) {
  const name = basename(file);
  if (name === "README.md") continue;
  if (!/^\d{4}-\d{2}-\d{2}\.md$/.test(name)) {
    fail(file, "diary entries must be named YYYY-MM-DD.md");
  }
}

// --- report -----------------------------------------------------------------

warnings.forEach((w) => console.warn(w));
problems.forEach((p) => console.error(p));

if (problems.length) {
  console.error(`\n✗ specs: ${problems.length} problem(s)`);
  process.exit(1);
}

console.log(
  `✓ specs: ${specs.size} spec(s) and ${useCases.size} use case(s) traceable both ways, ` +
    `${linksChecked} doc links resolve` +
    (warnings.length ? ` (${warnings.length} warning(s))` : ""),
);

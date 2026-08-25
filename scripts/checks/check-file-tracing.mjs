#!/usr/bin/env node
/**
 * Gate: every route that reads `data/` at runtime is listed in
 * `outputFileTracingIncludes`.
 *
 * Why this is a gate. Next traces a route's dependencies by following imports.
 * It cannot follow `readFileSync(join(process.cwd(), "data/lemma/es.json"))` —
 * the path is a string, built at runtime. So the file is simply absent from the
 * deployment, the read throws, and the route shows its error state. Nothing
 * fails at build time and nothing fails locally, because locally the whole repo
 * is on disk. It has already happened once here: `/methods` shipped without
 * `data/methods/**` and showed "Could not load the method catalogue" in
 * production (docs/TRAPS.md).
 *
 * The list in next.config.ts was written by hand, so it drifted the moment a
 * new route reached for a new directory — `/content` and `/content/[id]` read
 * four directories between them and were never added at all. Hand-maintaining
 * it is the bug; deriving it is the fix.
 *
 * How: from each `app/**\/page.tsx`, walk the local import graph and collect
 * every literal `data/<dir>` any reachable file mentions. A dynamic path still
 * carries its prefix as a literal, which is exactly the part that needs
 * tracing. Over-reporting is the safe direction — an extra entry costs bundle
 * bytes, a missing one costs a broken page.
 */

import { globSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

const ROOT = join(import.meta.dirname, "../..");

/** `app/(app)/content/[id]/page.tsx` → `/content/[id]`; `app/(marketing)/page.tsx` → `/`. */
const routeKey = (file) => {
  const path = file
    .replace(/^app/, "")
    .replace(/\/page\.tsx$/, "")
    .replace(/\/\([^/]+\)/g, "");
  return path === "" ? "/" : path;
};

const EXTENSIONS = [".ts", ".tsx", "/index.ts", "/index.tsx"];

const resolveImport = (specifier, fromFile) => {
  let base;
  if (specifier.startsWith("@/")) base = join(ROOT, specifier.slice(2));
  else if (specifier.startsWith(".")) base = resolve(ROOT, dirname(fromFile), specifier);
  else return null; // node_modules — cannot reach data/

  for (const extension of ["", ...EXTENSIONS]) {
    const candidate = base + extension;
    if (existsSync(candidate) && !candidate.endsWith("/")) {
      try {
        if (readFileSync(candidate, "utf8") !== undefined) return candidate;
      } catch {
        /* a directory — try the next extension */
      }
    }
  }
  return null;
};

/**
 * Directories reached through a path stored *in* the data, which no scan of the
 * source can see. `data/languages/<code>.json` carries `frequency.file`, and
 * `loadLexiconForLanguage` reads whatever that names — so a route that reads a
 * language profile also reads the frequency list, always.
 */
const IMPLIED = { languages: ["frequency"] };

/** Every `data/<dir>` literal reachable from one route, imports followed. */
function dataDirsFor(entry) {
  const seen = new Set();
  const found = new Set();
  const queue = [join(ROOT, entry)];

  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    // A test file is never imported by a page, but a barrel can pull one in by
    // accident; it deploys nothing either way.
    if (/\.(test|run\.test)\.tsx?$/.test(file)) continue;

    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }

    // Import specifiers are exactly what the tracer *can* follow, so
    // `import x from "@/data/i18n/…"` needs no entry. Strip them first, or
    // every statically imported JSON file reads as an untraced runtime path.
    const runtimeText = text
      // Comments name paths constantly ("same data as `data/i18n/…`") and
      // deploy nothing.
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:"'`])\/\/[^\n]*/g, "$1")
      .replace(/from\s+["'][^"']+["']/g, "")
      .replace(/\bimport\s*\(\s*["'][^"']+["']\s*\)/g, "")
      .replace(/\brequire\s*\(\s*["'][^"']+["']\s*\)/g, "");

    for (const [, dir] of runtimeText.matchAll(/["'`](?:\.\/)?data\/([a-z0-9-]+)\//g)) {
      found.add(dir);
    }

    for (const [, specifier] of text.matchAll(/from\s+["']([^"']+)["']/g)) {
      const target = resolveImport(specifier, file.slice(ROOT.length + 1));
      if (target) queue.push(target);
    }
  }

  for (const dir of [...found]) {
    for (const implied of IMPLIED[dir] ?? []) found.add(implied);
  }
  return found;
}

// The declared map, read as text: next.config.ts is TypeScript, and this script
// runs under plain node.
const CONFIG = readFileSync(join(ROOT, "next.config.ts"), "utf8");
const declaredBlock =
  CONFIG.match(/outputFileTracingIncludes:\s*\{([\s\S]*?)\n {2}\},/)?.[1] ?? "";

const declared = new Map();
for (const [, route, body] of declaredBlock.matchAll(/"([^"]+)":\s*\[([\s\S]*?)\]/g)) {
  declared.set(
    route,
    new Set([...body.matchAll(/"\.\/data\/([a-z0-9-]+)\//g)].map((m) => m[1])),
  );
}

let problems = 0;

for (const page of globSync("app/**/page.tsx", { cwd: ROOT })) {
  const route = routeKey(page);
  const needed = dataDirsFor(page);
  if (needed.size === 0) continue;

  const listed = declared.get(route) ?? new Set();
  const missing = [...needed].filter((dir) => !listed.has(dir)).sort();
  if (missing.length === 0) continue;

  problems++;
  console.error(
    `✗ ${page}\n` +
      `    "${route}" reads ${missing.map((d) => `data/${d}/`).join(", ")} at runtime,\n` +
      `    but outputFileTracingIncludes does not list ${missing.length > 1 ? "them" : "it"}.\n` +
      `    Add to next.config.ts:  "${route}": [${missing.map((d) => `"./data/${d}/**/*"`).join(", ")}]`,
  );
}

// An entry for a route that no longer exists is dead weight that reads as
// coverage — the same failure as a stale test.
const routes = new Set(globSync("app/**/page.tsx", { cwd: ROOT }).map(routeKey));
for (const route of declared.keys()) {
  if (routes.has(route)) continue;
  problems++;
  console.error(
    `✗ next.config.ts  outputFileTracingIncludes lists "${route}", which is not a route\n` +
      `    Nothing traces it. Remove the entry or fix the path.`,
  );
}

if (problems) {
  console.error(`\n✗ file-tracing: ${problems} problem(s)`);
  process.exit(1);
}

console.log(
  `✓ file-tracing: every route that reads data/ at runtime is traced (${declared.size} entries)`,
);

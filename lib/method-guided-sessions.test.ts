/**
 * Contract: docs/specs/service/method-guided-sessions.md
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";

const KINDS = new Set(["graded", "guided", "card", "check-in"]);
const METHOD_ROW = /^\| `([a-z0-9-]+)` \| (graded|guided|card|check-in) \|/gm;

function catalogueIds(): string[] {
  const dir = join(process.cwd(), "data/methods");
  const ids: string[] = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "presets.json")) {
    const data = JSON.parse(readFileSync(join(dir, file), "utf8"));
    for (const entry of data.entries) ids.push(entry.id);
  }
  return ids.sort();
}

function methodsSpecRows(): { id: string; kind: string; recipe: string }[] {
  const md = readFileSync(
    join(process.cwd(), "docs/specs/service/exercise-recipe-composer.methods.md"),
    "utf8",
  );
  const rows: { id: string; kind: string; recipe: string }[] = [];
  for (const match of md.matchAll(METHOD_ROW)) {
    const line = md.split("\n").find((l) => l.includes(`| \`${match[1]}\` |`)) ?? "";
    const parts = line.split("|").map((p) => p.trim());
    rows.push({ id: match[1]!, kind: match[2]!, recipe: parts[3] ?? "" });
  }
  return rows;
}

describe("method guided sessions spec coverage", () => {
  it("every catalogue id has a session kind and recipe in composer.methods", () => {
    const specIds = new Set(methodsSpecRows().map((r) => r.id));
    const missing = catalogueIds().filter((id) => !specIds.has(id));
    expect(missing).toEqual([]);
  });

  it("every composer.methods row uses a valid session kind", () => {
    for (const row of methodsSpecRows()) {
      expect(KINDS.has(row.kind), row.id).toBe(true);
      expect(row.recipe.length, row.id).toBeGreaterThan(10);
    }
  });

  it("translate-a-song recipe includes song-picker and adaptive translation", () => {
    const row = methodsSpecRows().find((r) => r.id === "translate-a-song");
    expect(row?.kind).toBe("guided");
    expect(row?.recipe).toContain("song-picker");
    expect(row?.recipe).toContain("type-freely");
  });

  it("role-play recipe includes wait before confirm-done", () => {
    const row = methodsSpecRows().find((r) => r.id === "role-play");
    expect(row?.kind).toBe("guided");
    expect(row?.recipe).toContain("W:wait");
    expect(row?.recipe).toContain("confirm-done");
  });

  it("catalogue loads and matches composer AC count", () => {
    const { catalogue } = loadMethodCatalogue();
    expect(catalogue).toBeDefined();
    expect(methodsSpecRows().length).toBe(catalogue!.entries.length);
  });
});

/**
 * The guard on the honesty rule. Contract: docs/specs/service/sentence-check.md
 *
 * `check.test.ts` proves each rule fires. This file proves the rules stay quiet
 * on correct language, which is the harder and more important half: a red word
 * under a correct sentence is the failure STUDY-006 says costs trust in every
 * other signal the app gives. A new heuristic that makes a finding "smarter"
 * usually breaks a sentence here first.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { loadLemmaTable } from "@/lib/lemma-table";
import { checkSentence } from "@/lib/sentence-check";
import type { FindingCategory } from "@/lib/sentence-check";

const TABLE = loadLemmaTable(
  JSON.parse(readFileSync(join(process.cwd(), "data/lemma/es.json"), "utf8")),
  "es",
).table!;

function findings(text: string) {
  const result = checkSentence({ text }, TABLE, "es");
  if (result.status !== "checked") throw new Error(`unavailable: ${result.reason}`);
  return result.findings;
}

/** Correct Spanish a beginner might plausibly write. Every finding is a lie. */
const CORRECT = [
  "Mi casa es grande",
  "La casa blanca es bonita",
  "Las casas son grandes",
  "El agua está fría",
  "Yo tengo un perro pequeño",
  "Nosotros vamos al cine",
  "Ella vive en una ciudad grande",
  "Los niños comen pan",
  "Tengo mucha hambre",
  "El problema es difícil",
  "Me gusta el día",
  "Ayer comí con mi familia",
  "La mano derecha",
  "Un hombre alto entró",
  "Vengo del trabajo",
  "No sé dónde está",
  "Quiero aprender español",
  "Mi hermana tiene dos gatos",
  "Esta semana trabajo mucho",
  "Los estudiantes leen libros",
];

/** Errors the four rules exist to catch, with the correction each should offer. */
const WRONG: readonly [string, FindingCategory, string | undefined][] = [
  ["el casa es grande", "agreement", "la"],
  ["las casa es grande", "agreement", "la"],
  ["una casa blancos", "agreement", "blanca"],
  ["los niño comen pan", "agreement", undefined],
  ["yo tienes un perro", "person", "tengo"],
  ["yo vas al cine", "person", "voy"],
  ["nosotros voy al cine", "person", "vamos"],
  ["mi casa es grandee", "spelling", undefined],
  ["quiero aprendar espanol", "spelling", undefined],
];

describe("stays quiet on correct Spanish", () => {
  for (const text of CORRECT) {
    it(text, () => {
      expect(findings(text)).toEqual([]);
    });
  }
});

describe("catches what it claims to catch", () => {
  for (const [text, category, suggestion] of WRONG) {
    it(`${text} → ${category}`, () => {
      const found = findings(text).filter((finding) => finding.category === category);
      expect(found.length).toBeGreaterThan(0);
      if (suggestion) expect(found[0]?.suggestion).toBe(suggestion);
    });
  }
});

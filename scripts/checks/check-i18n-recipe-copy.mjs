#!/usr/bin/env node
/**
 * Gate: exercise recipe composers must not ship hardcoded UI-locale copy.
 *
 * Target-language content (Spanish comprehension checks, dictation sentences) lives
 * in content data or QUESTIONS_BY_SOURCE — not English chrome strings in recipes.
 * Rule: docs/I18N.md § Gate: no hardcoded literals (recipe slice).
 */
import { readFileSync, globSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../");
const recipeDir = path.join(root, "lib/exercise-recipe");

const offenders = [];

for (const file of globSync("*.ts", { cwd: recipeDir })) {
  if (file.endsWith(".test.ts")) continue;
  const rel = `lib/exercise-recipe/${file}`;
  const text = readFileSync(path.join(recipeDir, file), "utf8");

  if (/\boffers:\s*\[/.test(text)) {
    offenders.push(`${rel}: use offerKeys instead of offers`);
  }
  if (/\bdeclineLabel:\s*"/.test(text)) {
    offenders.push(`${rel}: remove declineLabel — OffersStep uses exerciseRunner.decline`);
  }

  if (file === "comprehension-questions.ts") {
    const fallback = text.match(/const FALLBACK_QUESTIONS[\s\S]*?^\];/m)?.[0] ?? "";
    if (/\bprompt:\s*"/.test(fallback)) {
      offenders.push(`${rel}: FALLBACK_QUESTIONS must use promptKey, not prompt literals`);
    }
    if (/\blabel:\s*"/.test(fallback)) {
      offenders.push(`${rel}: FALLBACK_QUESTIONS options must use labelKey, not label literals`);
    }
  }
}

if (offenders.length > 0) {
  console.error("Recipe copy must go through messages/ keys (docs/I18N.md):\n");
  for (const line of offenders) console.error(`  - ${line}`);
  process.exit(1);
}

console.log("recipe i18n copy ok");

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

function leafPaths(value, prefix = "") {
  const paths = [];
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      paths.push(...leafPaths(child, prefix ? `${prefix}.${key}` : key));
    }
    return paths;
  }
  paths.push(prefix);
  return paths;
}

const en = JSON.parse(readFileSync(path.join(root, "../../messages/en.json"), "utf8"));
const de = JSON.parse(readFileSync(path.join(root, "../../messages/de.json"), "utf8"));

const enPaths = new Set(leafPaths(en));
const dePaths = new Set(leafPaths(de));

const missingInDe = [...enPaths].filter((key) => !dePaths.has(key)).sort();
const missingInEn = [...dePaths].filter((key) => !enPaths.has(key)).sort();

if (missingInDe.length > 0 || missingInEn.length > 0) {
  if (missingInDe.length > 0) {
    console.error("Keys in en.json missing from de.json:");
    for (const key of missingInDe) console.error(`  - ${key}`);
  }
  if (missingInEn.length > 0) {
    console.error("Keys in de.json missing from en.json:");
    for (const key of missingInEn) console.error(`  - ${key}`);
  }
  process.exit(1);
}

console.log(`i18n key parity ok (${enPaths.size} keys)`);

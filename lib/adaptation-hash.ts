/**
 * Stable hashes for personal T3 adaptation cache keys.
 * Contract: docs/specs/service/content-adaptation.md
 */
import { createHash } from "node:crypto";

export function hashSourceText(text: string): string {
  return createHash("sha256").update(text.trim()).digest("hex").slice(0, 16);
}

export function hashHeldLemmaSet(heldLemmas: ReadonlySet<string>): string {
  const sorted = [...heldLemmas].sort();
  return createHash("sha256").update(sorted.join("|")).digest("hex").slice(0, 16);
}

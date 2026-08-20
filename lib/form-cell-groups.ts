/**
 * Paradigm cell groups for Progress breakdown. Contract:
 * docs/specs/service/form-mastery-signal.md (T-W5)
 */

import { paradigmCellLabel } from "@/lib/paradigm-cells";

/**
 * Groups collapse person variants — `ind.pres.1sg` and `ind.pres.3sg` share a key.
 * Returns null when the cell cannot be labelled (caller skips those cards).
 */
export function paradigmCellGroupKey(cell: string): string | null {
  const label = paradigmCellLabel(cell);
  if (!label) return null;
  if (label.person !== null) return `verb:${label.form}`;
  return `nominal:${label.form}`;
}

/** Human-facing pattern name — the shared `form` field from the cell label. */
export function paradigmCellGroupLabel(cell: string): string | null {
  return paradigmCellLabel(cell)?.form ?? null;
}

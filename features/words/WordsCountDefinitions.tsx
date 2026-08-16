import { disclosureSummaryClass } from "@/components/ui/Disclosure";

import { copy } from "./content";

/**
 * Collapsed count definitions — detail lives here, not on every stat tile.
 * Mirrors method detail: prose in disclosure, short labels on the face.
 */
export function WordsCountDefinitions() {
  return (
    <details className="mt-6">
      <summary className={disclosureSummaryClass}>{copy.countsDefinitionsSummary}</summary>
      <dl className="mt-2 space-y-3 text-sm leading-relaxed text-muted">
        <div>
          <dt className="font-medium text-ink">{copy.held}</dt>
          <dd>{copy.heldDescription}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink">{copy.fragile}</dt>
          <dd>{copy.fragileDescription}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink">{copy.newWords}</dt>
          <dd>{copy.newDescription}</dd>
        </div>
      </dl>
    </details>
  );
}

"use client";

import { useTranslations } from "next-intl";

import { disclosureSummaryClass } from "@/components/ui/Disclosure";

/**
 * Collapsed count definitions — detail lives here, not on every stat tile.
 * Mirrors method detail: prose in disclosure, short labels on the face.
 */
export function WordsCountDefinitions() {
  const t = useTranslations("words");

  return (
    <details className="mt-6">
      <summary className={disclosureSummaryClass}>{t("countsDefinitionsSummary")}</summary>
      <dl className="mt-2 space-y-3 text-sm leading-relaxed text-muted">
        <div>
          <dt className="font-medium text-ink">{t("held")}</dt>
          <dd>{t("heldDescription")}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink">{t("fragile")}</dt>
          <dd>{t("fragileDescription")}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink">{t("newWords")}</dt>
          <dd>{t("newDescription")}</dd>
        </div>
      </dl>
    </details>
  );
}

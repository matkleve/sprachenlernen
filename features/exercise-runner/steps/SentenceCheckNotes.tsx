"use client";

import { useTranslations } from "next-intl";

import type { FindingCategory, SentenceCheckResult } from "@/lib/sentence-check";

/**
 * next-intl reads a dot as nesting, so the category label keys are flat and
 * mapped here rather than built from the category id at the call site.
 */
const CATEGORY_KEYS: Record<FindingCategory, string> = {
  spelling: "categorySpelling",
  agreement: "categoryAgreement",
  person: "categoryPerson",
  "missing-target": "categoryMissingTarget",
};

type SentenceCheckNotesProps = {
  /** `null` until a check has returned. */
  result: SentenceCheckResult | null;
  busy: boolean;
};

/**
 * What was found, under the lines. Contract:
 * docs/specs/service/sentence-check.md
 *
 * The wording is the whole point of this component. "Keine Fehler gefunden"
 * names what was examined; it never says the sentence is correct, because the
 * checker cannot see word order, word choice or idiom, and STUDY-006 is
 * explicit that a green tick on a wrong sentence costs trust in every other
 * signal the app gives.
 */
export function SentenceCheckNotes({ result, busy }: SentenceCheckNotesProps) {
  const t = useTranslations("exerciseRunner");
  const tCheck = useTranslations("sentenceCheck");

  if (busy) {
    return (
      <p className="text-sm text-muted" role="status">
        {t("sentenceCheckChecking")}
      </p>
    );
  }

  if (!result) {
    return <p className="text-sm text-muted">{t("sentenceCheckHint")}</p>;
  }

  if (result.status === "unavailable") {
    return (
      <div role="status" className="rounded-card border border-line bg-surface-raised p-3">
        <p className="text-sm text-ink">{t("sentenceCheckUnavailable")}</p>
        <p className="mt-1 text-sm text-muted">{t("sentenceCheckUnavailableHint")}</p>
      </div>
    );
  }

  if (result.findings.length === 0) {
    return (
      <div role="status" className="rounded-card border border-line bg-success-soft p-3">
        <p className="text-sm font-medium text-ink">{t("sentenceCheckNoFindings")}</p>
        <p className="mt-1 text-sm text-muted">{t("sentenceCheckWhatWasChecked")}</p>
      </div>
    );
  }

  return (
    <div role="status" className="space-y-2">
      <ul className="space-y-1.5">
        {result.findings.map((finding, index) => (
          <li
            key={`${finding.category}-${finding.tokenIndex}-${index}`}
            className="text-sm leading-snug text-ink"
          >
            <span className="font-medium text-danger">
              {tCheck(CATEGORY_KEYS[finding.category] as "categorySpelling")}
            </span>
            {" · "}
            {tCheck(
              finding.messageKey as "spellingUnknown",
              finding.messageValues as Record<string, string>,
            )}
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted">{t("sentenceCheckFixHint")}</p>
    </div>
  );
}

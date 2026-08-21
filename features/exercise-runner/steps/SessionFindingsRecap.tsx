"use client";

import { useTranslations } from "next-intl";

import type { SessionFindings } from "@/lib/exercise-runner";
import type { FindingCategory } from "@/lib/sentence-check";

/** next-intl reads a dot as nesting, so category label keys stay flat. */
const CATEGORY_KEYS: Record<FindingCategory, string> = {
  spelling: "categorySpelling",
  agreement: "categoryAgreement",
  person: "categoryPerson",
  "missing-target": "categoryMissingTarget",
};

/**
 * What the checks found across the session, on the closing step. Contract:
 * docs/specs/feature/exercise-runner.md
 *
 * Deliberately not an offer. The buttons here used to read "Schedule this word
 * for review" while doing nothing but advancing the step — a promise the app
 * does not keep is worse than no promise, and it sat directly on top of a
 * feature whose whole argument is that it only claims what it can support.
 * When queueing an error as a card actually exists, it belongs here as a real
 * action.
 *
 * The same limit as every other surface applies to the wording: it says what
 * was examined, never that the sentences were correct.
 */
export function SessionFindingsRecap({ findings }: { findings: SessionFindings }) {
  const t = useTranslations("exerciseRunner");
  const tCheck = useTranslations("sentenceCheck");

  if (findings.checked === 0 && findings.unavailable === 0) return null;

  const total = findings.byCategory.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <div className="space-y-3">
      <p className="text-base font-medium text-ink">
        {total === 0
          ? t("recapAllClean", { checked: findings.checked })
          : t("recapHeading", { total, checked: findings.checked })}
      </p>

      {findings.byCategory.length > 0 ? (
        <ul className="space-y-1">
          {findings.byCategory.map((entry) => (
            <li key={entry.category} className="text-sm text-ink">
              <span className="font-medium">
                {tCheck(CATEGORY_KEYS[entry.category] as "categorySpelling")}
              </span>
              {" · "}
              {t("recapCategoryCount", { count: entry.count })}
            </li>
          ))}
        </ul>
      ) : null}

      {findings.words.length > 0 ? (
        <p className="text-sm text-muted">
          {t("recapWords", { words: findings.words.join(", ") })}
        </p>
      ) : null}

      {findings.unavailable > 0 ? (
        <p className="text-sm text-muted">
          {t("recapUnavailable", { count: findings.unavailable })}
        </p>
      ) : null}

      <p className="text-sm text-muted">{t("sentenceCheckWhatWasChecked")}</p>
    </div>
  );
}

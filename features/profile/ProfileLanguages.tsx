import { ActionLink } from "@/components/ui/ActionLink";
import { LanguageListRow } from "@/components/ui/LanguageListRow";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { switchProfileLanguageAction } from "@/features/profile/actions";
import { copy } from "@/features/profile/content";
import type { LanguageHoldings } from "@/lib/db/language-holdings";
import type { ListLanguagesOutcome } from "@/lib/db/learning-languages";
import { routes } from "@/lib/routes";
import { hasUnaddedShippedLanguage } from "@/lib/starter-deck";

/**
 * The languages block on the profile. Contract: docs/specs/page/profile.md
 *
 * Renders its own failure rather than throwing, so a broken language read
 * leaves export and delete working — one failed block must not take the page.
 */

export type ProfileLanguagesProps = {
  outcome: ListLanguagesOutcome;
  holdings?: Record<string, LanguageHoldings>;
  /** A switch that failed, so the learner is told rather than left guessing. */
  switchFailed?: boolean;
};

export function ProfileLanguages({ outcome, holdings, switchFailed }: ProfileLanguagesProps) {
  const learningCodes =
    outcome.status === "ok" ? outcome.languages.map((language) => language.languageCode) : [];
  const showAddLanguage =
    outcome.status === "ok" && outcome.languages.length > 0 && hasUnaddedShippedLanguage(learningCodes);

  return (
    <section className="mt-page-content">
      <h2 className="text-xl font-semibold text-ink">{copy.languagesHeading}</h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        {copy.languagesCaption}
      </p>

      {switchFailed ? (
        <p role="alert" className="mt-6 text-base leading-relaxed text-danger">
          {copy.switchError}
        </p>
      ) : null}

      {outcome.status === "error" ? (
        <p role="alert" className="mt-6 text-base leading-relaxed text-danger">
          {copy.languagesError}
        </p>
      ) : outcome.languages.length === 0 ? (
        // Never an empty table: a learner who has not chosen is not a learner
        // with zero languages, and the difference is a route.
        <div className="mt-6">
          <p className="text-base leading-relaxed text-muted">{copy.noneYet}</p>
          <ActionLink href={routes.chooseLanguage} className="mt-4">
            {copy.chooseFirst}
          </ActionLink>
        </div>
      ) : (
        <>
          <ul className="mt-6 grid gap-3">
            {outcome.languages.map((language) => {
              const standing = holdings?.[language.languageCode];
              const poolSize = standing?.poolSize;
              return (
                <li key={language.languageCode}>
                  <LanguageListRow
                    code={language.languageCode}
                    isActive={language.isActive}
                    activeLabel={copy.active}
                    standing={
                      poolSize !== null && poolSize !== undefined
                        ? { held: standing?.heldCount ?? 0, pool: poolSize }
                        : null
                    }
                    standingLabel={copy.standing}
                    viewProgressHref={routes.progress}
                    viewProgressLabel={copy.viewProgress}
                  >
                    {language.isActive ? null : (
                      <form action={switchProfileLanguageAction.bind(null, language.languageCode)}>
                        <SubmitButton variant="secondary" size="sm">
                          {copy.makeActive}
                        </SubmitButton>
                      </form>
                    )}
                  </LanguageListRow>
                </li>
              );
            })}
          </ul>

          {showAddLanguage ? (
            <ActionLink href={routes.chooseLanguage} variant="secondary" className="mt-4">
              {copy.addLanguage}
            </ActionLink>
          ) : null}
        </>
      )}
    </section>
  );
}

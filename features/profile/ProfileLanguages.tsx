import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { languageNames } from "@/features/language-picker/content";
import { copy } from "@/features/profile/content";
import type { ListLanguagesOutcome } from "@/lib/db/learning-languages";
import { routes } from "@/lib/routes";

/**
 * The languages block on the profile. Contract: docs/specs/page/profile.md
 *
 * Renders its own failure rather than throwing, so a broken language read
 * leaves export and delete working — one failed block must not take the page.
 */

export type ProfileLanguagesProps = {
  outcome: ListLanguagesOutcome;
  switchTo: (code: string) => Promise<void>;
};

export function ProfileLanguages({ outcome, switchTo }: ProfileLanguagesProps) {
  return (
    <section className="mt-page-content">
      <h2 className="text-xl font-semibold text-ink">{copy.languagesHeading}</h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        {copy.languagesCaption}
      </p>

      {outcome.status === "error" ? (
        <p role="alert" className="mt-6 text-base leading-relaxed text-danger">
          {copy.languagesError}
        </p>
      ) : outcome.languages.length === 0 ? (
        // Never an empty table: a learner who has not chosen is not a learner
        // with zero languages, and the difference is a route.
        <div className="mt-6">
          <p className="text-base leading-relaxed text-muted">{copy.noneYet}</p>
          <Link href={routes.chooseLanguage} className="mt-4 inline-block">
            <Button type="button">{copy.chooseFirst}</Button>
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-6 grid gap-3">
            {outcome.languages.map((language) => {
              const names = languageNames[language.languageCode];
              return (
                <li
                  key={language.languageCode}
                  className="flex items-center justify-between gap-4 rounded-card border border-line bg-surface p-4"
                >
                  <div>
                    <p className="text-base font-semibold text-ink">
                      {names?.endonym ?? language.languageCode}
                    </p>
                    <p className="text-sm text-muted">
                      {names?.english ?? language.languageCode}
                    </p>
                  </div>

                  {language.isActive ? (
                    <p className="text-sm font-medium text-ink">{copy.active}</p>
                  ) : (
                    <form
                      action={async () => {
                        "use server";
                        await switchTo(language.languageCode);
                      }}
                    >
                      <Button type="submit" variant="secondary" size="sm">
                        {copy.makeActive}
                      </Button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>

          <Link href={routes.chooseLanguage} className="mt-4 inline-block">
            <Button type="button" variant="secondary">
              {copy.addLanguage}
            </Button>
          </Link>
        </>
      )}
    </section>
  );
}

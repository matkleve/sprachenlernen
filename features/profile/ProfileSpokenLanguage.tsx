import { LanguageListRow } from "@/components/ui/LanguageListRow";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { copy } from "@/features/profile/content";
import type { SpokenLanguageOutcome } from "@/lib/db/profiles";
import { shippedSpokenLanguages, spokenLanguageLabel } from "@/lib/spoken-language";

/**
 * Spoken-language block on the profile. Contract:
 * docs/specs/service/spoken-language.md
 */

export type ProfileSpokenLanguageProps = {
  outcome: SpokenLanguageOutcome;
  changeFailed?: boolean;
  changeTo: (code: string) => Promise<void>;
};

export function ProfileSpokenLanguage({
  outcome,
  changeFailed,
  changeTo,
}: ProfileSpokenLanguageProps) {
  return (
    <section className="mt-page-content">
      <h2 className="text-xl font-semibold text-ink">{copy.spokenHeading}</h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        {copy.spokenCaption}
      </p>

      {changeFailed ? (
        <p role="alert" className="mt-6 text-base leading-relaxed text-danger">
          {copy.spokenChangeError}
        </p>
      ) : null}

      {outcome.status === "error" ? (
        <p role="alert" className="mt-6 text-base leading-relaxed text-danger">
          {copy.spokenError}
        </p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {shippedSpokenLanguages().map((language) => {
            const isCurrent = language.code === outcome.spokenLanguage;
            return (
              <li key={language.code}>
                <LanguageListRow
                  code={language.code}
                  names={{ endonym: language.endonym, english: language.english }}
                  isActive={isCurrent}
                  activeLabel={copy.active}
                  actionSlot={
                    isCurrent
                      ? undefined
                      : (
                        <form action={changeTo.bind(null, language.code)}>
                          <SubmitButton variant="secondary" size="sm">
                            {copy.makeActive}
                          </SubmitButton>
                        </form>
                      )
                  }
                />
              </li>
            );
          })}
        </ul>
      )}

      {outcome.status === "ok" ? (
        <p className="sr-only">
          Current spoken language: {spokenLanguageLabel(outcome.spokenLanguage).endonym}
        </p>
      ) : null}
    </section>
  );
}

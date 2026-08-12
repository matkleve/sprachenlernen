import { SubmitButton } from "@/components/ui/SubmitButton";
import { spokenLanguageLabel, shippedSpokenLanguages } from "@/lib/spoken-language";
import { copy } from "@/features/profile/content";
import type { SpokenLanguageOutcome } from "@/lib/db/profiles";

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
              <li
                key={language.code}
                className="flex items-center justify-between gap-4 rounded-card border border-line bg-surface p-4"
              >
                <div>
                  <p className="text-base font-semibold text-ink">{language.endonym}</p>
                  <p className="text-sm text-muted">{language.english}</p>
                </div>

                {isCurrent ? (
                  <p className="text-sm font-medium text-ink">{copy.active}</p>
                ) : (
                  <form
                    action={async () => {
                      "use server";
                      await changeTo(language.code);
                    }}
                  >
                    <SubmitButton variant="secondary" size="sm">
                      {copy.makeActive}
                    </SubmitButton>
                  </form>
                )}
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

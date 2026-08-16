"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { LanguageListRow } from "@/components/ui/LanguageListRow";
import { changeSpokenLanguageAction } from "@/features/profile/actions";
import type { SpokenLanguageOutcome } from "@/lib/db/profiles";
import { shippedSpokenLanguages, spokenLanguageLabel } from "@/lib/spoken-language";
import { useTranslations } from "next-intl";

/**
 * Spoken-language block on the profile. Contract:
 * docs/specs/service/spoken-language.md
 *
 * Client for the same reason as ProfileLanguages — server actions must not
 * cross the LanguageListRow boundary via bound form actions.
 */

export type ProfileSpokenLanguageProps = {
  outcome: SpokenLanguageOutcome;
  changeFailed?: boolean;
};

export function ProfileSpokenLanguage({
  outcome,
  changeFailed: changeFailedProp,
}: ProfileSpokenLanguageProps) {
  const router = useRouter();
  const t = useTranslations("profile");
  const [pending, startTransition] = useTransition();
  const [changeFailed, setChangeFailed] = useState(changeFailedProp ?? false);
  const [pendingCode, setPendingCode] = useState<string | null>(null);

  const onChange = (code: string) => {
    setChangeFailed(false);
    setPendingCode(code);
    startTransition(async () => {
      try {
        await changeSpokenLanguageAction(code);
        router.refresh();
      } catch {
        setChangeFailed(true);
      } finally {
        setPendingCode(null);
      }
    });
  };

  return (
    <section className="mt-page-content">
      <h2 className="text-xl font-semibold text-ink">{t("spokenHeading")}</h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        {t("spokenCaption")}
      </p>

      {changeFailed ? (
        <p role="alert" className="mt-6 text-base leading-relaxed text-danger">
          {t("spokenChangeError")}
        </p>
      ) : null}

      {outcome.status === "error" ? (
        <p role="alert" className="mt-6 text-base leading-relaxed text-danger">
          {t("spokenError")}
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
                  activeLabel={t("active")}
                  actionSlot={
                    isCurrent
                      ? undefined
                      : (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          pending={pending && pendingCode === language.code}
                          disabled={pending}
                          onClick={() => onChange(language.code)}
                        >
                          {t("makeActive")}
                        </Button>
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

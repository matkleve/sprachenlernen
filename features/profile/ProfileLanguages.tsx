"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ActionLink } from "@/components/ui/ActionLink";
import { Button } from "@/components/ui/Button";
import { LanguageListRow } from "@/components/ui/LanguageListRow";
import { LearnerWorldEditor } from "@/features/learner-world/LearnerWorldEditor";
import { switchProfileLanguageAction } from "@/features/profile/actions";
import type { LearnerWorldId } from "@/lib/learner-world";
import type { LanguageHoldings } from "@/lib/db/language-holdings";
import type { ListLanguagesOutcome } from "@/lib/db/learning-languages";
import { routes } from "@/lib/routes";
import { hasUnaddedShippedLanguage } from "@/lib/starter-deck";
import { useTranslations } from "next-intl";

/**
 * The languages block on the profile. Contract: docs/specs/page/profile.md
 *
 * Client so language switches call server actions directly — the same pattern
 * as LanguageSwitcher. Forms with bound actions inside LanguageListRow children
 * fail RSC serialization in production.
 */

export type ProfileLanguagesProps = {
  outcome: ListLanguagesOutcome;
  holdings?: Record<string, LanguageHoldings>;
  worlds?: Record<string, { worldId: LearnerWorldId }>;
  /** A switch that failed, so the learner is told rather than left guessing. */
  switchFailed?: boolean;
};

export function ProfileLanguages({ outcome, holdings, worlds, switchFailed: switchFailedProp }: ProfileLanguagesProps) {
  const router = useRouter();
  const t = useTranslations("profile");
  const [pending, startTransition] = useTransition();
  const [switchFailed, setSwitchFailed] = useState(switchFailedProp ?? false);
  const [pendingCode, setPendingCode] = useState<string | null>(null);

  const learningCodes =
    outcome.status === "ok" ? outcome.languages.map((language) => language.languageCode) : [];
  const showAddLanguage =
    outcome.status === "ok" && outcome.languages.length > 0 && hasUnaddedShippedLanguage(learningCodes);

  const onSwitch = (code: string) => {
    setSwitchFailed(false);
    setPendingCode(code);
    startTransition(async () => {
      try {
        await switchProfileLanguageAction(code);
        router.refresh();
      } catch {
        setSwitchFailed(true);
      } finally {
        setPendingCode(null);
      }
    });
  };

  return (
    <section className="mt-page-content">
      <h2 className="text-xl font-semibold text-ink">{t("languagesHeading")}</h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        {t("languagesCaption")}
      </p>

      {switchFailed ? (
        <p role="alert" className="mt-6 text-base leading-relaxed text-danger">
          {t("switchError")}
        </p>
      ) : null}

      {outcome.status === "error" ? (
        <p role="alert" className="mt-6 text-base leading-relaxed text-danger">
          {t("languagesError")}
        </p>
      ) : outcome.languages.length === 0 ? (
        <div className="mt-6">
          <p className="text-base leading-relaxed text-muted">{t("noneYet")}</p>
          <ActionLink href={routes.chooseLanguage} className="mt-4">
            {t("chooseFirst")}
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
                    activeLabel={t("active")}
                    standing={
                      poolSize !== null && poolSize !== undefined
                        ? { held: standing?.heldCount ?? 0, pool: poolSize }
                        : null
                    }
                    standingLabel={(held, pool) => t("standing", { held, poolSize: pool })}
                    viewProgressHref={routes.progress}
                    viewProgressLabel={t("viewProgress")}
                    footerSlot={
                      <LearnerWorldEditor
                        languageCode={language.languageCode}
                        currentWorldId={worlds?.[language.languageCode]?.worldId ?? "general"}
                      />
                    }
                    actionSlot={
                      language.isActive
                        ? undefined
                        : (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            pending={pending && pendingCode === language.languageCode}
                            disabled={pending}
                            onClick={() => onSwitch(language.languageCode)}
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

          {showAddLanguage ? (
            <ActionLink href={routes.chooseLanguage} variant="secondary" className="mt-4">
              {t("addLanguage")}
            </ActionLink>
          ) : null}
        </>
      )}
    </section>
  );
}

"use client";

import { useTranslations } from "next-intl";

type RevealAnswerStepProps = {
  config: Record<string, unknown>;
};

export function RevealAnswerStep({ config }: RevealAnswerStepProps) {
  const t = useTranslations("exerciseRunner");
  const word = typeof config.word === "string" ? config.word : "";
  const gloss = typeof config.gloss === "string" ? config.gloss : "";
  const exemplar = typeof config.exemplar === "string" ? config.exemplar : "";
  const body = typeof config.body === "string" ? config.body : t("revealAnswerDefault");

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed text-ink">{body}</p>
      {exemplar ? (
        <div className="rounded-card border border-line bg-surface-raised p-4">
          <p className="text-sm font-medium text-muted">{t("revealAnswerExemplarLabel")}</p>
          <p className="mt-2 text-lg text-ink">{exemplar}</p>
        </div>
      ) : null}
      {word && gloss ? (
        <p className="text-sm text-muted">
          {t("revealAnswerMeaning", { word, gloss })}
        </p>
      ) : null}
    </div>
  );
}

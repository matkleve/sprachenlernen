"use client";

import { useTranslations } from "next-intl";

type RevealAnswerStepProps = {
  config: Record<string, unknown>;
};

export function RevealAnswerStep({ config }: RevealAnswerStepProps) {
  const t = useTranslations("exerciseRunner");
  const answer =
    typeof config.answer === "string"
      ? config.answer
      : typeof config.exemplar === "string"
        ? config.exemplar
        : "";
  const note = typeof config.note === "string" ? config.note : "";

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ink">{t("revealAnswerHeading")}</p>
      {answer ? <p className="text-lg text-ink">{answer}</p> : null}
      {note ? <p className="text-sm text-muted">{note}</p> : null}
    </div>
  );
}

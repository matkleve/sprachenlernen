"use client";

import { useTranslations } from "next-intl";

import { practiceLeadClass } from "@/features/exercise-runner/practice-surface/PracticeSurface";
import { Textarea } from "@/components/ui/Input";

type TypeWithWordStepProps = {
  config: Record<string, unknown>;
  value: string;
  onTextChange: (text: string) => void;
};

export function TypeWithWordStep({ config, value, onTextChange }: TypeWithWordStepProps) {
  const t = useTranslations("exerciseRunner");
  const word = typeof config.word === "string" ? config.word : "";
  const gloss = typeof config.gloss === "string" ? config.gloss : "";

  if (!word) {
    return null;
  }

  return (
    <div className="space-y-4 max-md:space-y-2">
      <p className={practiceLeadClass}>
        {t("typeWithWordPrompt", { word })}
      </p>
      {gloss ? (
        <p className="text-sm text-muted">{t("typeWithWordGloss", { gloss })}</p>
      ) : null}
      <Field label={t("typeWithWordFieldLabel")}>
        <Textarea
          value={value}
          onChange={(event) => onTextChange(event.target.value)}
          placeholder={t("typeWithWordPlaceholder")}
          rows={3}
          className="max-md:min-h-[4.5rem] md:min-h-[5.5rem]"
          aria-label={t("typeWithWordFieldLabel")}
        />
      </Field>
      <p className="text-sm text-muted max-md:text-xs">{t("typeWithWordHint")}</p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Field } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Input";

type TypeWithWordStepProps = {
  config: Record<string, unknown>;
};

export function TypeWithWordStep({ config }: TypeWithWordStepProps) {
  const t = useTranslations("exerciseRunner");
  const word = typeof config.word === "string" ? config.word : "";
  const gloss = typeof config.gloss === "string" ? config.gloss : "";
  const [sentence, setSentence] = useState("");

  if (!word) {
    return null;
  }

  return (
    <div className="space-y-4">
      <p className="text-lg text-ink">
        {t("typeWithWordPrompt", { word })}
      </p>
      {gloss ? (
        <p className="text-sm text-muted">{t("typeWithWordGloss", { gloss })}</p>
      ) : null}
      <Field label={t("typeWithWordFieldLabel")}>
        <Textarea
          value={sentence}
          onChange={(event) => setSentence(event.target.value)}
          placeholder={t("typeWithWordPlaceholder")}
          rows={4}
          aria-label={t("typeWithWordFieldLabel")}
        />
      </Field>
      <p className="text-sm text-muted">{t("typeWithWordHint")}</p>
    </div>
  );
}

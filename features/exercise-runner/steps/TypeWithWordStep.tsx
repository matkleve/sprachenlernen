"use client";

import { useTranslations } from "next-intl";

import { Field } from "@/components/ui/Field";

type TypeWithWordStepProps = {
  config: Record<string, unknown>;
};

export function TypeWithWordStep({ config }: TypeWithWordStepProps) {
  const t = useTranslations("exerciseRunner");
  const word = typeof config.word === "string" ? config.word : "";
  const hint = typeof config.hint === "string" ? config.hint : "";

  return (
    <div className="space-y-4">
      <p className="text-lg text-ink">
        {t("typeWithWordPrompt", { word })}
        {hint ? <span className="text-muted"> ({hint})</span> : null}
      </p>
      <Field label={t("typeWithWordLabel")}>
        <textarea
          className="min-h-24 w-full rounded-lg border border-line bg-surface px-3 py-2 text-base text-ink"
          placeholder={t("typeWithWordPlaceholder")}
          aria-label={t("typeWithWordLabel")}
        />
      </Field>
    </div>
  );
}

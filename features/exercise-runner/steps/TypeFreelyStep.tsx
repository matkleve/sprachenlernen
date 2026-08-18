"use client";

import { useTranslations } from "next-intl";

import { Field } from "@/components/ui/Field";

type TypeFreelyStepProps = {
  config: Record<string, unknown>;
  submitDraft: { text: string };
  onTextChange: (text: string) => void;
};

export function TypeFreelyStep({ config, submitDraft, onTextChange }: TypeFreelyStepProps) {
  const t = useTranslations("exerciseRunner");
  const prompt =
    typeof config.prompt === "string" ? config.prompt : t("typeFreelyDefault");
  const minSentences =
    typeof config.minSentences === "number" ? config.minSentences : undefined;

  return (
    <div className="space-y-4">
      <p className="text-lg text-ink">{prompt}</p>
      {minSentences !== undefined ? (
        <p className="text-sm text-muted">{t("typeFreelyMinSentences", { count: minSentences })}</p>
      ) : null}
      <Field label={t("typeFreelyLabel")}>
        <textarea
          value={submitDraft.text}
          onChange={(e) => onTextChange(e.target.value)}
          className="min-h-32 w-full rounded-lg border border-line bg-surface px-3 py-2 text-base text-ink"
          placeholder={t("submitTextPlaceholder")}
        />
      </Field>
    </div>
  );
}

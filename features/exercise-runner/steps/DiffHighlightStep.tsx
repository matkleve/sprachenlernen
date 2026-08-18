"use client";

import { useTranslations } from "next-intl";

type DiffHighlightStepProps = {
  config: Record<string, unknown>;
  submitDraft: { text: string };
};

/** v1: side-by-side reference and learner text — no inline diff algorithm yet. */
export function DiffHighlightStep({ config, submitDraft }: DiffHighlightStepProps) {
  const t = useTranslations("exerciseRunner");
  const reference = typeof config.reference === "string" ? config.reference : "";

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-ink">{t("diffReferenceHeading")}</p>
      <p className="rounded-card border border-line bg-surface-raised p-3 text-base text-ink">
        {reference}
      </p>
      <p className="text-sm font-medium text-ink">{t("diffYourVersionHeading")}</p>
      <p className="rounded-card border border-line p-3 text-base text-ink">
        {submitDraft.text.trim() || t("diffEmpty")}
      </p>
      <p className="text-sm text-muted">{t("diffHighlightHint")}</p>
    </div>
  );
}

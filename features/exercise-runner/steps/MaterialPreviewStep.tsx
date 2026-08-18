"use client";

import { useTranslations } from "next-intl";

type MaterialPreviewStepProps = {
  config: Record<string, unknown>;
};

export function MaterialPreviewStep({ config }: MaterialPreviewStepProps) {
  const t = useTranslations("exerciseRunner");
  const title = typeof config.title === "string" ? config.title : "";
  const coveragePercent =
    typeof config.coveragePercent === "number" ? Math.round(config.coveragePercent) : null;

  return (
    <div className="space-y-3">
      <h3 className="text-base font-medium text-ink">{t("materialPreviewHeading")}</h3>
      {title ? <p className="text-lg text-ink">{title}</p> : null}
      {coveragePercent !== null ? (
        <p className="text-sm text-muted">
          {t("materialPreviewCoverage", { percent: coveragePercent })}
        </p>
      ) : null}
      <p className="text-sm text-muted">{t("materialPreviewHint")}</p>
    </div>
  );
}

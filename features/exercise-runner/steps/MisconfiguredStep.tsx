"use client";

import { useTranslations } from "next-intl";

type MisconfiguredStepProps = {
  componentId: string;
  missing: readonly string[];
};

/**
 * A recipe handed this component a config it cannot use. Visible on purpose:
 * the previous behaviour was to render nothing, so a renamed composer key
 * produced a blank step in front of the learner and a green test suite —
 * the silent failure Constitution §4 exists to stop.
 */
export function MisconfiguredStep({ componentId, missing }: MisconfiguredStepProps) {
  const t = useTranslations("exerciseRunner");

  return (
    <p className="text-base text-muted">
      {t("misconfiguredComponent", { component: componentId, keys: missing.join(", ") })}
    </p>
  );
}

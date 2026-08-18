"use client";

import { useTranslations } from "next-intl";

import type { StepRenderProps } from "@/features/exercise-runner/steps/types";

export function ChecklistStep({ step }: Pick<StepRenderProps, "step">) {
  const t = useTranslations("exerciseRunner");
  const introKey =
    typeof step.config.introKey === "string" ? step.config.introKey : undefined;
  const items = Array.isArray(step.config.items) ? (step.config.items as string[]) : [];

  return (
    <div className="space-y-4">
      {introKey ? (
        <p className="text-base leading-relaxed text-ink">
          {t(introKey as "introBuildASentence")}
        </p>
      ) : null}
      {items.length > 0 ? (
        <>
          <p className="text-sm font-medium text-ink">{t("prepareChecklist")}</p>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item} className="flex items-center gap-2 text-base text-ink">
                <span className="size-4 rounded border border-line" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

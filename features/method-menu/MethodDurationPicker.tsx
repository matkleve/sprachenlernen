"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { FilterPill } from "@/components/ui/FilterPill";
import { catalogueVariantMinutes } from "@/lib/method-session-budget";
import { menuQueryString, type SearchParams } from "@/lib/method-menu-filter";
import { cn } from "@/lib/utils";

export type MethodDurationPickerProps = {
  methodId: string;
  durations: number[];
  searchParams: SearchParams;
  selectedVariantMinutes: number;
  className?: string;
};

export function MethodDurationPicker({
  methodId,
  durations,
  searchParams,
  selectedVariantMinutes,
  className,
}: MethodDurationPickerProps) {
  const router = useRouter();
  const t = useTranslations("methodMenu");

  const packages = catalogueVariantMinutes(durations);

  if (packages.length <= 1) return null;

  const selectVariant = (variantMinutes: number) => {
    const next: SearchParams = { ...searchParams, variantMinutes: String(variantMinutes) };
    router.replace(
      `/methods/${methodId}${menuQueryString(next, { includeVariantMinutes: true })}`,
      { scroll: false },
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      <h2 className="text-sm font-semibold text-ink">{t("durationHeading")}</h2>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t("durationHeading")}>
        {packages.map((minutes) => (
          <FilterPill
            key={minutes}
            current={selectedVariantMinutes === minutes}
            onClick={() => selectVariant(minutes)}
          >
            {t("durationChip", { minutes })}
          </FilterPill>
        ))}
      </div>
    </div>
  );
}

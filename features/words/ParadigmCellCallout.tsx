import { getTranslations } from "next-intl/server";

import { Disclosure, DisclosurePanel, DisclosureSummary } from "@/components/ui/Disclosure";
import { cn } from "@/lib/utils";

const calloutShellClass =
  "mt-4 max-w-2xl rounded-card border border-line bg-surface-raised shadow-soft";

/** Paradigm-cell explainer — mirrors LemmaCallout. UC-078 */
export async function ParadigmCellCallout() {
  const t = await getTranslations("words");

  return (
    <>
      <Disclosure
        aria-label={t("paradigmCellCalloutTitle")}
        className={cn(calloutShellClass, "p-0 md:hidden")}
      >
        <DisclosureSummary>{t("paradigmCellCalloutTitle")}</DisclosureSummary>
        <DisclosurePanel>
          <p className="border-t border-line px-4 pb-4 pt-3 text-sm leading-relaxed text-muted">
            {t("paradigmCellCalloutBody")}
          </p>
        </DisclosurePanel>
      </Disclosure>

      <aside
        aria-label={t("paradigmCellCalloutTitle")}
        className={cn(calloutShellClass, "hidden p-4 md:block")}
      >
        <p className="text-sm font-semibold text-ink">{t("paradigmCellCalloutTitle")}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{t("paradigmCellCalloutBody")}</p>
      </aside>
    </>
  );
}

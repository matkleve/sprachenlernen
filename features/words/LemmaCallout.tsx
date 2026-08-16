import { getTranslations } from "next-intl/server";

import { Disclosure, DisclosureSummary } from "@/components/ui/Disclosure";
import { cn } from "@/lib/utils";

const calloutClass =
  "mt-4 max-w-2xl rounded-card border border-accent-soft bg-accent-soft text-sm leading-relaxed text-ink";

/**
 * Lemma explainer — collapsed on mobile, always visible from md up.
 * Reuse: Disclosure. Contract: docs/specs/feature/words-home.md
 */
export async function LemmaCallout() {
  const t = await getTranslations("words");

  return (
    <>
      <Disclosure
        aria-label={t("lemmaCalloutTitle")}
        className={cn(calloutClass, "px-4 py-3 md:hidden")}
      >
        <DisclosureSummary>{t("lemmaCalloutTitle")}</DisclosureSummary>
        <p className="mt-2 text-muted">{t("lemmaCalloutBody")}</p>
      </Disclosure>

      <aside aria-label={t("lemmaCalloutTitle")} className={cn(calloutClass, "hidden px-4 py-3 md:block")}>
        <p className="font-semibold">{t("lemmaCalloutTitle")}</p>
        <p className="mt-1 text-muted">{t("lemmaCalloutBody")}</p>
      </aside>
    </>
  );
}

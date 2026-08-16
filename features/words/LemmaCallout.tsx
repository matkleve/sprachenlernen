import { Disclosure, DisclosurePanel, DisclosureSummary } from "@/components/ui/Disclosure";
import { copy } from "@/features/words/content";
import { cn } from "@/lib/utils";

const calloutShellClass =
  "mt-4 max-w-2xl rounded-card border border-line bg-surface-raised shadow-soft";

/**
 * Lemma explainer — collapsed on mobile, always visible from md up.
 * Reuse: Disclosure. Contract: docs/specs/feature/words-home.md
 */
export function LemmaCallout() {
  return (
    <>
      <Disclosure
        aria-label={copy.lemmaCalloutTitle}
        className={cn(calloutShellClass, "p-0 md:hidden")}
      >
        <DisclosureSummary>{copy.lemmaCalloutTitle}</DisclosureSummary>
        <DisclosurePanel>
          <p className="border-t border-line px-4 pb-4 pt-3 text-sm leading-relaxed text-muted">
            {copy.lemmaCalloutBody}
          </p>
        </DisclosurePanel>
      </Disclosure>

      <aside
        aria-label={copy.lemmaCalloutTitle}
        className={cn(calloutShellClass, "hidden p-4 md:block")}
      >
        <p className="text-sm font-semibold text-ink">{copy.lemmaCalloutTitle}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{copy.lemmaCalloutBody}</p>
      </aside>
    </>
  );
}

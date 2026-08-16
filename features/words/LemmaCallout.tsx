import { Disclosure, DisclosureSummary } from "@/components/ui/Disclosure";
import { copy } from "@/features/words/content";
import { cn } from "@/lib/utils";

const calloutClass =
  "mt-4 max-w-2xl rounded-card border border-accent-soft bg-accent-soft text-sm leading-relaxed text-ink";

/**
 * Lemma explainer — collapsed on mobile, always visible from md up.
 * Reuse: Disclosure. Contract: docs/specs/feature/words-home.md
 */
export function LemmaCallout() {
  return (
    <>
      <Disclosure
        aria-label={copy.lemmaCalloutTitle}
        className={cn(calloutClass, "px-4 py-3 md:hidden")}
      >
        <DisclosureSummary>{copy.lemmaCalloutTitle}</DisclosureSummary>
        <p className="mt-2 text-muted">{copy.lemmaCalloutBody}</p>
      </Disclosure>

      <aside aria-label={copy.lemmaCalloutTitle} className={cn(calloutClass, "hidden px-4 py-3 md:block")}>
        <p className="font-semibold">{copy.lemmaCalloutTitle}</p>
        <p className="mt-1 text-muted">{copy.lemmaCalloutBody}</p>
      </aside>
    </>
  );
}

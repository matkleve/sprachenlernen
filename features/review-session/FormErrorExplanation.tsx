"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Disclosure, DisclosurePanel, DisclosureSummary } from "@/components/ui/Disclosure";
import type { FormCellExplanationData } from "@/lib/form-cell-explanation";

type FormErrorExplanationProps = {
  explanation: FormCellExplanationData;
  /** Opens after Again/Hard — still dismissible. */
  defaultExpanded?: boolean;
};

/**
 * On-demand rule for one paradigm cell. Contract:
 * docs/specs/component/form-error-explanation.md
 */
export function FormErrorExplanation({
  explanation,
  defaultExpanded = false,
}: FormErrorExplanationProps) {
  const t = useTranslations();
  const tReview = useTranslations("reviewSession");
  const [open, setOpen] = useState(defaultExpanded);

  useEffect(() => {
    if (defaultExpanded) setOpen(true);
  }, [defaultExpanded]);

  let ruleText: string;
  try {
    ruleText = t(explanation.ruleKey as Parameters<typeof t>[0]);
  } catch {
    return null;
  }

  return (
    <Disclosure
      aria-label={tReview("formExplanationSummary")}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="mt-3"
    >
      <DisclosureSummary className="px-3 py-2 text-sm font-medium text-ink">
        {tReview("formExplanationSummary")}
      </DisclosureSummary>
      <DisclosurePanel>
        <div className="space-y-2 border-t border-line px-3 pb-3 pt-2 text-sm leading-relaxed text-muted">
          <p>{ruleText}</p>
          {explanation.exampleSurfaces.length > 0 ? (
            <p>
              {tReview("formExplanationExamples", {
                examples: explanation.exampleSurfaces.join(", "),
              })}
            </p>
          ) : null}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}

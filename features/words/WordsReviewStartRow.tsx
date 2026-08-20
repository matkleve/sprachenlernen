"use client";

import { PenLine } from "lucide-react";

import { ActionLink } from "@/components/ui/ActionLink";
import { IconLink } from "@/components/ui/IconLink";

type WordsReviewStartRowProps = {
  startHref: string;
  startLabel: string;
  formsHref?: string;
  formsLabel?: string;
};

/** Primary review CTA with optional icon-only forms deck entry. */
export function WordsReviewStartRow({
  startHref,
  startLabel,
  formsHref,
  formsLabel,
}: WordsReviewStartRowProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <ActionLink href={startHref} variant="primary" size="lg" className="w-full sm:w-auto">
        {startLabel}
      </ActionLink>
      {formsHref && formsLabel ? (
        <IconLink href={formsHref} aria-label={formsLabel} title={formsLabel}>
          <PenLine className="size-5" aria-hidden />
        </IconLink>
      ) : null}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { holding } from "@/features/app-shell/content";
import { copy as reviewCopy } from "@/features/review-session/content";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: holding.words.title,
};

/**
 * Words destination — vocabulary home and one-tap review entry (UC-063).
 * Contract: docs/specs/page/words.md
 */
export default function WordsPage() {
  const reviewHref = `${routes.wordsReview}?method=srs-session`;

  return (
    <div className="mx-auto max-w-2xl px-6 pt-page-top pb-page-bottom">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{holding.words.title}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted">{holding.words.intent}</p>

      <div className="mt-page-content">
        <Link href={reviewHref} className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
          {reviewCopy.startReview}
        </Link>
      </div>
    </div>
  );
}

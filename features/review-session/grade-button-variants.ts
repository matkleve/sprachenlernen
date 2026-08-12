import { cva } from "class-variance-authority";

import type { Grade } from "@/lib/scheduler";

/**
 * Anki-style grade tints for the review session only.
 * Tokens: app/globals.css (--color-grade-*).
 */
export const gradeButtonVariants = cva(
  [
    "relative inline-flex h-8 w-full items-center justify-center whitespace-nowrap",
    "touch-manipulation rounded-pill px-3 text-sm font-medium",
    "after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-['']",
    "border shadow-soft transition-[background-color,box-shadow,transform,border-color]",
    "duration-150 ease-out-soft",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
    "hover:-translate-y-px hover:shadow-raised active:translate-y-0 active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
    "disabled:hover:translate-y-0",
  ],
  {
    variants: {
      grade: {
        again:
          "border-grade-again-deep bg-grade-again-soft text-grade-again-ink hover:border-grade-again-deep hover:bg-grade-again-deep",
        hard:
          "border-grade-hard-deep bg-grade-hard-soft text-grade-hard-ink hover:border-grade-hard-deep hover:bg-grade-hard-deep",
        good:
          "border-grade-good-deep bg-grade-good-soft text-grade-good-ink hover:border-grade-good-deep hover:bg-grade-good-deep",
        easy:
          "border-grade-easy-deep bg-grade-easy-soft text-grade-easy-ink hover:border-grade-easy-deep hover:bg-grade-easy-deep",
      },
    },
  },
);

export function gradeButtonClass(grade: Grade): string {
  return gradeButtonVariants({ grade });
}

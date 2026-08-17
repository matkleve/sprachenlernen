import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import {
  disabledState,
  focusRing,
  hitAreaAnchor,
  hitAreaPseudo,
  hoverLift,
  interactiveEmphasis,
  interactionMotion,
  pressScale,
  touchTarget,
} from "@/components/ui/interaction-kernel";
import type { Grade } from "@/lib/scheduler";
import { cn } from "@/lib/utils";

/**
 * Anki-style grade buttons for the review session.
 * Contract: docs/specs/feature/interaction-feedback.md § Exemptions
 *
 * Press only — no pending spinner; card advance is the feedback.
 */
export const gradeButtonVariants = cva(
  [
    hitAreaAnchor,
    "inline-flex h-11 w-full items-center justify-center whitespace-nowrap",
    touchTarget,
    "rounded-pill px-3 text-sm",
    interactiveEmphasis,
    hitAreaPseudo,
    "after:inset-y-0",
    "border shadow-soft",
    interactionMotion,
    focusRing,
    hoverLift,
    pressScale,
    disabledState,
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

export type GradeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof gradeButtonVariants> & {
    grade: Grade;
  };

export const GradeButton = forwardRef<HTMLButtonElement, GradeButtonProps>(function GradeButton(
  { grade, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(gradeButtonVariants({ grade }), className)}
      {...props}
    >
      {children}
    </button>
  );
});

/** @deprecated Use GradeButton — kept for one release so imports can be grep-cleaned. */
export function gradeButtonClass(grade: Grade): string {
  return gradeButtonVariants({ grade });
}

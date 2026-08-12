import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cardInteractive, disabledState } from "@/components/ui/interaction-kernel";
import { cn } from "@/lib/utils";

export type PressableCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** When false, renders as a static card without press affordances. */
  interactive?: boolean;
};

/**
 * Large tappable card — review flip surface.
 * Contract: docs/specs/system/interaction-registry.json
 *
 * Grade buttons use GradeButton instead; this is for single-action flip cards.
 */
export const PressableCard = forwardRef<HTMLButtonElement, PressableCardProps>(
  function PressableCard({ interactive = true, className, disabled, children, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || !interactive}
        className={cn(
          "group relative w-full rounded-card border border-line bg-surface text-center shadow-soft",
          interactive
            ? cn(cardInteractive, "cursor-pointer", disabledState)
            : "cursor-default",
          !interactive && "pointer-events-none",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

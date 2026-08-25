import { forwardRef, type ButtonHTMLAttributes } from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type OptionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  /** `row` — full-width task options; `chip` — inline token toggles. */
  layout?: "row" | "chip";
};

/**
 * Toggle option — secondary at rest, primary when selected, `aria-pressed`.
 * Contract: docs/specs/component/option-button.md
 */
export const OptionButton = forwardRef<HTMLButtonElement, OptionButtonProps>(
  function OptionButton({ selected = false, layout = "row", className, type, ...props }, ref) {
    return (
      <Button
        ref={ref}
        type={type ?? "button"}
        variant={selected ? "primary" : "secondary"}
        size={layout === "row" ? "md" : "sm"}
        className={cn(layout === "row" ? "w-full justify-start" : "rounded-pill", className)}
        aria-pressed={selected}
        {...props}
      />
    );
  },
);

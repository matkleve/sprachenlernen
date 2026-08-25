import { forwardRef, type ButtonHTMLAttributes } from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type OptionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  /** `row` — full-width task options; `chip` — inline token toggles. */
  layout?: "row" | "chip";
  /** `toggle` — multi-select (`aria-pressed`); `radio` — single-select in a group. */
  selectionMode?: "toggle" | "radio";
};

/**
 * Toggle option — secondary at rest, primary when selected, `aria-pressed`.
 * Contract: docs/specs/component/option-button.md
 */
export const OptionButton = forwardRef<HTMLButtonElement, OptionButtonProps>(
  function OptionButton(
    { selected = false, layout = "row", selectionMode = "toggle", className, type, ...props },
    ref,
  ) {
    return (
      <Button
        ref={ref}
        type={type ?? "button"}
        variant={selected ? "primary" : "secondary"}
        size={layout === "row" ? "md" : "sm"}
        className={cn(layout === "row" ? "w-full justify-start" : "rounded-pill", className)}
        role={selectionMode === "radio" ? "radio" : undefined}
        aria-pressed={selectionMode === "toggle" ? selected : undefined}
        aria-checked={selectionMode === "radio" ? selected : undefined}
        {...props}
      />
    );
  },
);

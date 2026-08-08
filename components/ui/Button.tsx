import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * The one button primitive. Contract: docs/specs/component/button.md
 *
 * All five interaction states are baked in here so that no caller has to
 * remember them — that is the whole reason this component exists rather than a
 * hand-rolled <button> per surface.
 */
const button = cva(
  [
    // layout. `relative` anchors the hit-area pseudo-element in the size
    // variants; without it the expanded target would resolve against the page.
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-pill font-medium",
    // The pseudo-element is part of the button for hit testing, so it grows the
    // interactive target to 44px without changing the visual box. Do NOT reach
    // for `min-h-11` instead: min-height beats height, so it would silently
    // flatten every size variant to the same 44px box.
    "after:absolute after:inset-x-0 after:content-['']",
    // motion — always name the properties. Transitioning everything also
    // animates layout, costing a repaint per frame and producing surprises
    // when an unrelated property changes.
    "transition-[background-color,box-shadow,transform,border-color]",
    "duration-150 ease-out-soft",
    // focus-visible, not focus: a mouse click must not leave a ring behind
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
    // active — comes back down and compresses, so it feels pressed
    "active:translate-y-0 active:scale-[0.98]",
    // disabled
    "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
    "disabled:hover:translate-y-0",
  ],
  {
    variants: {
      variant: {
        // hover deepens to a defined token — never brightness()/opacity, which
        // is invisible on saturated fills and inverts on dark surfaces.
        primary:
          "bg-accent text-accent-ink shadow-soft hover:bg-accent-deep hover:-translate-y-px hover:shadow-raised",
        secondary:
          "border border-line bg-surface text-ink shadow-soft hover:border-line-strong hover:-translate-y-px hover:shadow-raised",
        ghost: "text-ink hover:bg-accent-soft",
        danger:
          "bg-danger text-danger-ink shadow-soft hover:bg-danger-deep hover:-translate-y-px hover:shadow-raised",
      },
      size: {
        // Visual height, then the vertical expansion that brings the *target*
        // to 44px. Stacking these vertically closer than the expansion will
        // make the targets overlap — keep at least gap-3 between them.
        sm: "h-8 px-3 text-sm after:-inset-y-1.5", // 32px box → 44px target
        md: "h-10 px-4 text-sm after:-inset-y-0.5", // 40px box → 44px target
        lg: "h-12 px-6 text-base after:inset-y-0", // 48px box, already ≥44
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

export function Button({ className, variant, size, type, ...props }: ButtonProps) {
  return (
    <button
      // Default to "button". A bare <button> inside a form submits it, which is
      // never what a caller who did not think about it wanted.
      type={type ?? "button"}
      className={cn(button({ variant, size }), className)}
      {...props}
    />
  );
}

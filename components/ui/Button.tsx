import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import {
  disabledState,
  focusRing,
  hitAreaAnchor,
  hitAreaExpandMd,
  hitAreaExpandSm,
  hitAreaPseudo,
  hoverLift,
  interactiveCursor,
  interactiveEmphasis,
  interactionMotion,
  pendingBusy,
  pendingNavRing,
  pressFill,
  pressScale,
  touchTarget,
} from "@/components/ui/interaction-kernel";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

export type PendingPolicy = "cta" | "nav" | "none";

/**
 * The one button primitive. Contract: docs/specs/component/button.md
 *
 * All five interaction states are baked in here so that no caller has to
 * remember them — that is the whole reason this component exists rather than a
 * hand-rolled <button> per surface.
 */
export const buttonVariants = cva(
  [
    hitAreaAnchor,
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    touchTarget,
    interactiveCursor,
    "rounded-pill",
    interactiveEmphasis,
    hitAreaPseudo,
    interactionMotion,
    focusRing,
    pressScale,
    disabledState,
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-ink shadow-soft hover:bg-accent-deep hover:-translate-y-px hover:shadow-raised",
        secondary: cn(
          "border border-line bg-surface text-ink shadow-soft hover:border-line-strong hover:-translate-y-px hover:shadow-raised",
          pressFill,
        ),
        floating: cn(
          "border border-line bg-surface text-ink shadow-soft hover:border-line-strong",
          hoverLift,
          pressFill,
        ),
        ghost: "text-ink hover:bg-accent-soft active:bg-accent-soft",
        danger:
          "bg-danger text-danger-ink shadow-soft hover:bg-danger-deep hover:-translate-y-px hover:shadow-raised",
      },
      size: {
        sm: cn("h-8 px-3 text-sm", hitAreaExpandSm),
        md: cn("h-10 px-4 text-sm", hitAreaExpandMd),
        lg: "h-12 px-6 text-base after:inset-y-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    /** Async in flight — mutes control, blocks duplicate taps. */
    pending?: boolean;
    /** How pending looks: spinner on CTAs, ring on icon nav, opacity only. */
    pendingPolicy?: PendingPolicy;
  };

function showSpinnerForPending(
  pending: boolean,
  policy: PendingPolicy,
  variant: ButtonProps["variant"],
): boolean {
  if (!pending || policy !== "cta") return false;
  return variant === "primary" || variant === "danger" || variant === undefined;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    type,
    pending = false,
    pendingPolicy = "cta",
    disabled,
    children,
    ...props
  },
  ref,
) {
  const isBusy = pending;
  const showSpinner = showSpinnerForPending(isBusy, pendingPolicy, variant);
  const showNavRing = isBusy && pendingPolicy === "nav";

  return (
    <button
      ref={ref}
      type={type ?? "button"}
      disabled={disabled || isBusy}
      aria-busy={isBusy || undefined}
      className={cn(
        buttonVariants({ variant, size }),
        isBusy && pendingPolicy !== "nav" && pendingBusy,
        showNavRing && pendingNavRing,
        className,
      )}
      {...props}
    >
      {showSpinner ? <Spinner className="size-4 shrink-0" /> : null}
      {children}
    </button>
  );
});

/** Round icon-only secondary control — OAuth provider buttons on auth forms. */
export const oauthIconButtonClass = cn(
  buttonVariants({ variant: "secondary", size: "sm" }),
  "size-11 min-h-11 min-w-11 rounded-full p-0",
);

/** Icon-only chip sizing — floating shell corners, language trigger. */
export const iconButtonClass = cn(
  buttonVariants({ variant: "floating", size: "sm" }),
  "size-11 min-h-11 min-w-11 rounded-full p-0",
);

/** Compact icon control — review report flag, inline toolbars. */
export const iconButtonSmClass = cn(
  buttonVariants({ variant: "floating", size: "sm" }),
  "size-9 min-h-9 min-w-9 rounded-full p-0",
);

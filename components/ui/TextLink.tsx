import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import {
  focusRing,
  interactiveCursor,
  interactionMotion,
  pressScale,
  touchTarget,
} from "@/components/ui/interaction-kernel";
import { cn } from "@/lib/utils";

/**
 * Inline text link with accent underline and full interaction states.
 * Contract: docs/specs/system/interaction-registry.json
 */
export const textLinkVariants = cva(
  [
    touchTarget,
    interactiveCursor,
    "rounded-pill underline underline-offset-4",
    interactionMotion,
    focusRing,
    pressScale,
  ],
  {
    variants: {
      tone: {
        accent: "text-accent hover:text-accent-deep active:text-accent-deep",
        muted: "text-muted hover:text-ink active:text-ink",
        ink: "font-medium text-ink hover:underline active:text-muted",
      },
      size: {
        sm: "text-sm",
        base: "text-base",
      },
    },
    defaultVariants: { tone: "accent", size: "base" },
  },
);

export type TextLinkProps = ComponentPropsWithoutRef<typeof Link> &
  VariantProps<typeof textLinkVariants>;

export function TextLink({ tone, size, className, ...props }: TextLinkProps) {
  return <Link className={cn(textLinkVariants({ tone, size }), className)} {...props} />;
}

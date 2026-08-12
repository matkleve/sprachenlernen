import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { buttonVariants } from "@/components/ui/Button";
import { languageLabel } from "@/lib/languages";
import { cn } from "@/lib/utils";

/**
 * Decorative flag in a circle. Contract: docs/specs/component/language-flag.md
 *
 * The endonym remains the identifier everywhere — this glyph is only for the
 * shell switcher trigger and must never stand alone as the language name.
 */
const flagCircle = cva("inline-flex items-center justify-center rounded-full leading-none", {
  variants: {
    size: {
      header: cn(
        buttonVariants({ variant: "floating", size: "sm" }),
        "size-11 min-h-11 min-w-11 p-0 text-xl",
      ),
      row: "size-8 min-h-8 min-w-8 border border-line bg-surface text-lg",
    },
  },
  defaultVariants: { size: "header" },
});

export type LanguageFlagProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof flagCircle> & {
    code: string;
  };

export function LanguageFlag({ code, size, className, ...props }: LanguageFlagProps) {
  const { flag } = languageLabel(code);

  return (
    <span className={cn(flagCircle({ size }), className)} {...props}>
      <span aria-hidden="true">{flag}</span>
    </span>
  );
}

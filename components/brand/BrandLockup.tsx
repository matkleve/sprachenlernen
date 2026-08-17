import { cva, type VariantProps } from "class-variance-authority";

import { TextLink } from "@/components/ui/TextLink";
import { shippedLogoDirection } from "@/lib/brand-mark";
import { cn } from "@/lib/utils";

const lockup = cva("inline-flex items-center no-underline hover:opacity-90", {
  variants: {
    size: {
      sm: "gap-2.5",
      md: "gap-3",
      lg: "gap-4",
    },
  },
  defaultVariants: { size: "sm" },
});

const markClass = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
} as const;

const wordmarkClass = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl sm:text-3xl",
} as const;

type BrandLockupProps = {
  href: string;
  wordmark?: string;
  tone?: "mono" | "full";
  className?: string;
} & VariantProps<typeof lockup>;

/** Mark + optional wordmark. Uses img (not next/image) so SVG marks render reliably. */
export function BrandLockup({
  href,
  wordmark,
  tone = "mono",
  size = "sm",
  className,
}: BrandLockupProps) {
  const src = tone === "mono" ? shippedLogoDirection.monoSrc : shippedLogoDirection.markSrc;

  return (
    <TextLink
      href={href}
      tone="ink"
      size="sm"
      className={cn(lockup({ size }), className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG app marks; next/image blocks SVG */}
      <img src={src} alt="" className={cn("shrink-0", markClass[size ?? "sm"])} aria-hidden />
      {wordmark ? (
        <span className={cn("font-serif font-semibold", wordmarkClass[size ?? "sm"])}>{wordmark}</span>
      ) : null}
    </TextLink>
  );
}

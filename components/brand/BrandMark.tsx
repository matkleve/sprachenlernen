import { cva, type VariantProps } from "class-variance-authority";

import { shippedLogoDirection } from "@/lib/brand-mark";
import { cn } from "@/lib/utils";

const mark = cva("shrink-0", {
  variants: {
    size: {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-16 w-16",
    },
  },
  defaultVariants: { size: "sm" },
});

type BrandMarkProps = {
  /** `color` — accent paths on transparent; for chips that supply the surface. */
  tone?: "mono" | "full" | "color";
  className?: string;
} & VariantProps<typeof mark>;

function srcForTone(tone: NonNullable<BrandMarkProps["tone"]>): string {
  if (tone === "mono") return shippedLogoDirection.monoSrc;
  if (tone === "full") return shippedLogoDirection.markSrc;
  return shippedLogoDirection.markSrc.replace(/\.svg$/, "-color.svg");
}

/** App mark only — no link, no wordmark. */
export function BrandMark({ tone = "mono", size = "sm", className }: BrandMarkProps) {
  const src = srcForTone(tone);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG app marks; next/image blocks SVG
    <img src={src} alt="" className={cn(mark({ size }), className)} aria-hidden />
  );
}

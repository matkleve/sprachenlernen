import { cva, type VariantProps } from "class-variance-authority";

import {
  BRAND_SPIRAL_INNER_PATH,
  BRAND_SPIRAL_OUTER_PATH,
  BRAND_SPIRAL_PIVOT,
  BRAND_SPIRAL_VIEW,
} from "@/lib/brand-spiral-geometry";
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

type BrandMarkAnimatedProps = VariantProps<typeof mark> & {
  className?: string;
};

/**
 * Inline spiral mark — dual bands spin anticlockwise on parent `.group` hover.
 * Pivot: translate(pivot) → rotate → translate(-pivot) so both arms share one centre.
 */
export function BrandMarkAnimated({ size = "sm", className }: BrandMarkAnimatedProps) {
  const pivot = BRAND_SPIRAL_PIVOT;
  const offset = -pivot;

  return (
    <svg
      viewBox={`0 0 ${BRAND_SPIRAL_VIEW} ${BRAND_SPIRAL_VIEW}`}
      aria-hidden
      className={cn(mark({ size }), className)}
    >
      <g transform={`translate(${pivot} ${pivot})`}>
        <g className="brand-mark-ring-outer">
          <g transform={`translate(${offset} ${offset})`}>
            <path fill="currentColor" className="text-accent-deep" d={BRAND_SPIRAL_OUTER_PATH} />
          </g>
        </g>
        <g className="brand-mark-ring-inner">
          <g transform={`translate(${offset} ${offset})`}>
            <path fill="currentColor" className="text-accent" d={BRAND_SPIRAL_INNER_PATH} />
          </g>
        </g>
      </g>
    </svg>
  );
}

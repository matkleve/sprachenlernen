import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Traced paths from spiral-learning-color.svg — keep in sync with build script. */
const SPIRAL_INNER =
  "M 244.0 206.0 L 274.0 211.0 L 309.0 231.0 L 335.0 262.0 L 343.0 302.0 L 340.0 344.0 L 325.0 378.0 L 288.0 415.0 L 260.0 426.0 L 255.0 425.0 L 255.0 421.0 L 269.0 413.0 L 286.0 395.0 L 310.0 353.0 L 316.0 330.0 L 315.0 283.0 L 278.0 239.0 L 256.0 231.0 L 234.0 231.0 L 228.0 235.0 L 210.0 253.0 L 200.0 269.0 L 201.0 289.0 L 225.0 311.0 L 236.0 311.0 L 251.0 298.0 L 248.0 282.0 L 231.0 283.0 L 232.0 272.0 L 244.0 266.0 L 259.0 272.0 L 266.0 284.0 L 266.0 301.0 L 253.0 320.0 L 231.0 330.0 L 206.0 325.0 L 191.0 309.0 L 180.0 281.0 L 181.0 253.0 L 191.0 232.0 L 212.0 216.0 Z";
const SPIRAL_OUTER =
  "M 249.0 112.0 L 289.0 117.0 L 332.0 132.0 L 374.0 168.0 L 394.0 198.0 L 394.0 204.0 L 353.0 160.0 L 339.0 150.0 L 304.0 135.0 L 232.0 135.0 L 198.0 149.0 L 177.0 165.0 L 144.0 203.0 L 134.0 222.0 L 134.0 236.0 L 129.0 243.0 L 130.0 295.0 L 139.0 318.0 L 156.0 342.0 L 176.0 361.0 L 200.0 372.0 L 252.0 372.0 L 279.0 356.0 L 306.0 323.0 L 303.0 340.0 L 294.0 358.0 L 273.0 379.0 L 240.0 394.0 L 194.0 394.0 L 177.0 389.0 L 142.0 369.0 L 117.0 338.0 L 107.0 315.0 L 102.0 289.0 L 102.0 233.0 L 112.0 198.0 L 132.0 168.0 L 158.0 142.0 L 184.0 127.0 L 212.0 117.0 Z";

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

/** Inline spiral mark — dual-band counter-rotation on parent `.group` hover. */
export function BrandMarkAnimated({ size = "sm", className }: BrandMarkAnimatedProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      aria-hidden
      className={cn(mark({ size }), className)}
    >
      <g className="brand-mark-spiral-center brand-mark-ring-outer text-accent-deep">
        <path fill="currentColor" d={SPIRAL_OUTER} />
      </g>
      <g className="brand-mark-spiral-center brand-mark-ring-inner text-accent">
        <path fill="currentColor" d={SPIRAL_INNER} />
      </g>
    </svg>
  );
}

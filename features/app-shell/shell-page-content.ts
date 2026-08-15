import { cva, type VariantProps } from "class-variance-authority";

import type { ShellPageLayoutMode } from "@/lib/shell-page-layout";

export const shellPageContentVariants = cva("mx-auto", {
  variants: {
    mode: {
      "scrollable-destination": "px-6 pt-page-top pb-page-bottom",
      "scrollable-drill-in": "px-6 pt-page-top pb-page-bottom",
      "one-screen-runner":
        "flex h-review-session flex-col overflow-hidden px-4 md:h-auto md:overflow-visible md:px-6 md:pt-page-top md:pb-page-bottom",
    },
    width: {
      narrow: "max-w-2xl",
      default: "max-w-3xl",
      wide: "max-w-5xl",
    },
  },
  defaultVariants: {
    mode: "scrollable-destination",
    width: "wide",
  },
});

export type ShellPageContentMode = ShellPageLayoutMode;
export type ShellPageContentWidth = NonNullable<VariantProps<typeof shellPageContentVariants>["width"]>;

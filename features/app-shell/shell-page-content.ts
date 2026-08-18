import { cva, type VariantProps } from "class-variance-authority";

import type { ShellPageLayoutMode } from "@/lib/shell-page-layout";

export const shellPageContentVariants = cva("mx-auto", {
  variants: {
    mode: {
      // Mobile: shell float reserve on <main> already clears the header title —
      // no pt-page-top (was ghost space after titles moved to ShellPageTitle).
      "scrollable-destination": "px-6 pb-page-bottom md:pt-page-top",
      "scrollable-drill-in": "px-6 pb-page-bottom md:pt-page-top",
      "one-screen-runner":
        "flex h-review-session flex-col overflow-hidden px-4 md:h-auto md:overflow-visible md:px-6 md:pt-page-top md:pb-page-bottom",
      "one-screen-exercise":
        "flex h-review-session flex-col overflow-hidden px-4 md:min-h-[var(--height-practice-session)] md:flex md:flex-col md:overflow-hidden md:px-6 md:pt-page-top md:pb-page-bottom",
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

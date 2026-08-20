import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PracticeSurfaceProps = {
  children: ReactNode;
  className?: string;
};

/** Lead instruction copy — stands above prep rows and fields. */
export const practiceLeadClass =
  "text-xl font-medium leading-snug text-ink max-md:text-base max-md:font-semibold";

/** Task-density wrapper for exercise step content. Contract: practice-surface.md */
export function PracticeSurface({ children, className }: PracticeSurfaceProps) {
  return (
    <div
      className={cn(
        "practice-surface flex flex-col space-y-6 text-lg leading-relaxed text-ink",
        "max-md:space-y-3 max-md:text-base max-md:leading-snug",
        className,
      )}
    >
      {children}
    </div>
  );
}

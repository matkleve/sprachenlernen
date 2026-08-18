import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PracticeSurfaceProps = {
  children: ReactNode;
  className?: string;
};

/** Task-density wrapper for exercise step content. Contract: practice-surface.md */
export function PracticeSurface({ children, className }: PracticeSurfaceProps) {
  return (
    <div className={cn("practice-surface space-y-6 text-lg leading-relaxed text-ink", className)}>
      {children}
    </div>
  );
}

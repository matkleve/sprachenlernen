import type { Section } from "@/lib/method-catalogue";
import { cn } from "@/lib/utils";

import { MethodCardHeader } from "./MethodCardHeader";

export type MethodDetailHeroProps = {
  section: Section;
  className?: string;
};

/**
 * Edge-to-edge section graphic — same asset and overlay as method cards.
 * Contract: docs/specs/page/method-detail.md
 */
export function MethodDetailHero({ section, className }: MethodDetailHeroProps) {
  return (
    <div className={cn("relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2", className)}>
      <MethodCardHeader section={section} size="hero" />
    </div>
  );
}

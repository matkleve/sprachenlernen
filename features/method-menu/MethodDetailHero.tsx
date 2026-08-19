import type { Section } from "@/lib/method-catalogue";
import { cn } from "@/lib/utils";

import { MethodCardHeader } from "./MethodCardHeader";

export type MethodDetailHeroProps = {
  section: Section;
  /** Shorter hero on mobile when the page leads with setup + Start. */
  compact?: boolean;
  className?: string;
};

/**
 * Edge-to-edge section graphic under the floating shell header — same asset as
 * cards. Contract: docs/specs/page/method-detail.md
 */
export function MethodDetailHero({ section, compact = false, className }: MethodDetailHeroProps) {
  return (
    <div
      className={cn(
        "relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2",
        "-mt-[var(--shell-float-top-active)] md:mt-0",
        className,
      )}
    >
      <MethodCardHeader section={section} size={compact ? "heroCompact" : "hero"} />
    </div>
  );
}

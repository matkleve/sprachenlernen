import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

type StageFrameProps = {
  edgeRoughness: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * Decorative card frame with optional rough SVG border. Contract:
 * docs/plans/progression-theme-system.md (T-PT0a)
 *
 * The stroke lives on an absolutely positioned SVG layer so feDisplacementMap
 * never reaches text. When roughness is 0 the frame is a normal CSS border on
 * the caller's element.
 */
export function StageFrame({ edgeRoughness, className, style, children }: StageFrameProps) {
  const rough = edgeRoughness > 0;

  return (
    <div
      className={cn(
        "relative",
        rough && "progression-card--rough-edge",
        className,
      )}
      style={style}
    >
      {rough ? (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <rect
            x="0.75"
            y="0.75"
            width="98.5"
            height="98.5"
            rx="8%"
            ry="8%"
            fill="none"
            stroke="var(--color-line-strong)"
            strokeWidth="var(--stage-border-px)"
            vectorEffect="nonScalingStroke"
            filter="url(#progression-edge-rough)"
          />
        </svg>
      ) : null}
      <div className="relative">{children}</div>
    </div>
  );
}

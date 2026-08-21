import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

type StageFrameProps = {
  edgeRoughness: number;
  /** Card radius in CSS px — the SVG works in pixel user units, so it needs a number. */
  radiusPx: number;
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
 *
 * **No `viewBox`.** With one, user units are the viewBox's, and
 * `preserveAspectRatio="none"` stretches them by the card's aspect ratio —
 * separately in x and y. `feDisplacementMap`'s `scale` is in user units, so a
 * scale of 8 became ~56px of wobble across a wide card and ~96px down a tall
 * one, and `rx` skewed with it. Dropping the viewBox makes one user unit one
 * CSS pixel, so `scale` means what it says at every card size.
 */
export function StageFrame({
  edgeRoughness,
  radiusPx,
  className,
  style,
  children,
}: StageFrameProps) {
  const rough = edgeRoughness > 0;

  return (
    <div
      className={cn("relative", rough && "progression-card--rough-edge", className)}
      style={style}
    >
      {rough ? (
        <svg
          aria-hidden
          className={cn(
            "progression-frame-layer",
            "pointer-events-none absolute inset-px overflow-visible",
            "h-[calc(100%-2px)] w-[calc(100%-2px)]",
          )}
        >
          <rect
            width="100%"
            height="100%"
            rx={radiusPx}
            ry={radiusPx}
            fill="none"
            stroke="var(--color-line-strong)"
            strokeWidth="var(--stage-border-px)"
            filter="url(#progression-edge-rough)"
          />
        </svg>
      ) : null}
      <div className="relative">{children}</div>
    </div>
  );
}

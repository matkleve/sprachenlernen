type ProgressionFilterDefsProps = {
  /** feDisplacementMap scale — 0 yields a straight edge. */
  edgeRoughness: number;
};

/**
 * Shared SVG filter for rough card borders. Contract:
 * docs/plans/progression-theme-system.md (T-PT0a)
 *
 * Scale is a React prop because SVG filter primitives cannot read CSS custom
 * properties reliably across browsers — the stage number still drives it via
 * progression.json → stageScopeStyle for everything else.
 */
export function ProgressionFilterDefs({ edgeRoughness }: ProgressionFilterDefsProps) {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute size-0 overflow-hidden"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter
          id="progression-edge-rough"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05"
            numOctaves="3"
            seed="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={edgeRoughness}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

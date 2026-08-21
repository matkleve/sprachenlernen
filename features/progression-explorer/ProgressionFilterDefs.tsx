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
 *
 * `scale` displaces by up to ±scale/2 in each direction, and `StageFrame` draws
 * in pixel user units, so the region has to clear the largest roughness we ship
 * on the smallest framed element (a 36px icon button). -35%/170% covers it;
 * a tighter region clips the corners rather than shrinking the wobble.
 *
 * The turbulence is desaturated before it displaces: chromatic noise pushes the
 * x and y channels by uncorrelated amounts, which frays the stroke instead of
 * chipping it.
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
          x="-35%"
          y="-35%"
          width="170%"
          height="170%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05"
            numOctaves="3"
            seed="2"
            result="rawNoise"
          />
          <feColorMatrix type="saturate" values="0" in="rawNoise" result="noise" />
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

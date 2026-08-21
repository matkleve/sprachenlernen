import type { CSSProperties } from "react";

/**
 * Procedural workshop wood — wiring only. Visual target:
 * docs/specs/feature/progression-reference-board.md (column 1–3).
 */

export type WoodGrainNoiseType = "fractalNoise" | "turbulence";

export type WoodGrainBlendMode = "multiply" | "overlay" | "soft-light" | "normal";

/** feTurbulence + tile presentation knobs */
export type WoodGrainParams = {
  /** baseFrequency X — higher = finer detail along the horizontal axis */
  freqX: number;
  /** baseFrequency Y — higher = finer detail along the vertical axis */
  freqY: number;
  numOctaves: number;
  noiseType: WoodGrainNoiseType;
  seed: number;
  /** Opacity on the filtered rect inside the SVG tile */
  svgOpacity: number;
  /** CSS opacity on the grain layer */
  layerOpacity: number;
  tileWidth: number;
  tileHeight: number;
  blendMode: WoodGrainBlendMode;
  contrast: number;
  brightness: number;
};

export type WoodPlankParams = {
  plankWidth: number;
  seamWidth: number;
  seamOpacity: number;
  colors: [string, string, string, string];
};

export type WoodLightingParams = {
  vignetteStrength: number;
  topHighlight: number;
};

export type WoodLayerVisibility = {
  base: boolean;
  planks: boolean;
  grain: boolean;
  light: boolean;
};

export type WoodSurfaceParams = {
  baseTop: string;
  baseBottom: string;
  grain: WoodGrainParams;
  planks: WoodPlankParams;
  light: WoodLightingParams;
  layers: WoodLayerVisibility;
};

export const DEFAULT_WOOD_GRAIN: WoodGrainParams = {
  freqX: 0.45,
  freqY: 0.02,
  numOctaves: 4,
  noiseType: "fractalNoise",
  seed: 2,
  svgOpacity: 0.65,
  layerOpacity: 0.55,
  tileWidth: 320,
  tileHeight: 48,
  blendMode: "multiply",
  contrast: 1.35,
  brightness: 0.92,
};

export const DEFAULT_WOOD_PLANKS: WoodPlankParams = {
  plankWidth: 78,
  seamWidth: 2,
  seamOpacity: 0.45,
  colors: ["#3f2a18", "#362415", "#422c1a", "#342214"],
};

export const DEFAULT_WOOD_LIGHT: WoodLightingParams = {
  vignetteStrength: 0.55,
  topHighlight: 0.04,
};

export const DEFAULT_WOOD_SURFACE: WoodSurfaceParams = {
  baseTop: "#3d2918",
  baseBottom: "#2a1c10",
  grain: DEFAULT_WOOD_GRAIN,
  planks: DEFAULT_WOOD_PLANKS,
  light: DEFAULT_WOOD_LIGHT,
  layers: { base: true, planks: true, grain: true, light: true },
};

export const WOOD_GRAIN_PRESETS = {
  "workshop-1-raw": {
    label: "Workshop 1 — raw",
    surface: {
      ...DEFAULT_WOOD_SURFACE,
      baseTop: "#3d2918",
      baseBottom: "#2a1c10",
      grain: {
        ...DEFAULT_WOOD_GRAIN,
        layerOpacity: 0.62,
        blendMode: "overlay" as const,
        contrast: 1.5,
      },
      planks: {
        ...DEFAULT_WOOD_PLANKS,
        seamOpacity: 0.45,
        seamWidth: 2,
      },
      light: { vignetteStrength: 0.55, topHighlight: 0.04 },
    } satisfies WoodSurfaceParams,
  },
  "workshop-2-sanded": {
    label: "Workshop 2 — sanded",
    surface: {
      ...DEFAULT_WOOD_SURFACE,
      baseTop: "#4a3422",
      baseBottom: "#342618",
      grain: {
        ...DEFAULT_WOOD_GRAIN,
        layerOpacity: 0.48,
        blendMode: "overlay" as const,
        contrast: 1.25,
        freqX: 0.38,
        freqY: 0.025,
      },
      planks: {
        plankWidth: 82,
        seamWidth: 1,
        seamOpacity: 0.32,
        colors: ["#523820", "#4a3220", "#5a4030", "#463020"],
      },
      light: { vignetteStrength: 0.35, topHighlight: 0.07 },
    } satisfies WoodSurfaceParams,
  },
  "workshop-3-oiled": {
    label: "Workshop 3 — oiled",
    surface: {
      ...DEFAULT_WOOD_SURFACE,
      baseTop: "#523820",
      baseBottom: "#3d2a18",
      grain: {
        ...DEFAULT_WOOD_GRAIN,
        layerOpacity: 0.38,
        blendMode: "soft-light" as const,
        contrast: 1.15,
        brightness: 1.05,
        freqX: 0.32,
        freqY: 0.03,
      },
      planks: {
        plankWidth: 86,
        seamWidth: 1,
        seamOpacity: 0.22,
        colors: ["#6a4a32", "#5f422c", "#705038", "#584028"],
      },
      light: { vignetteStrength: 0.12, topHighlight: 0.1 },
    } satisfies WoodSurfaceParams,
  },
} as const;

export type WoodGrainDirection = "horizontal" | "vertical" | "mixed";

export function woodGrainDirection({ freqX, freqY }: Pick<WoodGrainParams, "freqX" | "freqY">): WoodGrainDirection {
  const ratio = freqX / Math.max(freqY, 0.001);
  if (ratio >= 2) return "horizontal";
  if (ratio <= 0.5) return "vertical";
  return "mixed";
}

export function buildWoodGrainDataUri(
  params: Pick<WoodGrainParams, "freqX" | "freqY" | "numOctaves" | "noiseType" | "seed" | "svgOpacity">,
): string {
  const { freqX, freqY, numOctaves, noiseType, seed, svgOpacity } = params;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 64'>` +
    `<filter id='g'>` +
    `<feTurbulence type='${noiseType}' baseFrequency='${freqX} ${freqY}' numOctaves='${numOctaves}' seed='${seed}' stitchTiles='stitch'/>` +
    `</filter>` +
    `<rect width='100%' height='100%' filter='url(#g)' opacity='${svgOpacity}'/>` +
    `</svg>`;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function buildPlankGradient({ plankWidth, seamWidth, seamOpacity, colors }: WoodPlankParams): string {
  const stops: string[] = [];
  let pos = 0;

  for (const color of colors) {
    if (seamWidth > 0) {
      stops.push(`rgb(0 0 0 / ${seamOpacity}) ${pos}px ${pos + seamWidth}px`);
      pos += seamWidth;
    }
    stops.push(`${color} ${pos}px ${pos + plankWidth}px`);
    pos += plankWidth;
  }

  return `repeating-linear-gradient(90deg, ${stops.join(", ")})`;
}

function plankCycleWidth({ plankWidth, seamWidth, colors }: WoodPlankParams): number {
  return colors.length * plankWidth + colors.length * seamWidth;
}

export function buildWoodSurfaceStyle({
  baseTop,
  baseBottom,
  planks,
  light,
  layers,
}: WoodSurfaceParams): CSSProperties {
  const images: string[] = [];
  const sizes: string[] = [];
  const blends: string[] = [];

  if (layers.light) {
    images.push(
      `radial-gradient(ellipse 130% 90% at 50% 110%, rgb(0 0 0 / ${light.vignetteStrength}) 0%, transparent 55%)`,
      `linear-gradient(180deg, rgb(255 255 255 / ${light.topHighlight}) 0%, transparent 28%)`,
    );
    sizes.push("100% 100%", "100% 100%");
    blends.push("normal", "normal");
  }

  /* Grain renders on its own overlay so contrast/brightness filters apply. */

  if (layers.planks) {
    images.push(buildPlankGradient(planks));
    sizes.push(`${plankCycleWidth(planks)}px 100%`);
    blends.push("normal");
  }

  if (layers.base) {
    images.push(`linear-gradient(180deg, ${baseTop} 0%, ${baseBottom} 100%)`);
    sizes.push("100% 100%");
    blends.push("normal");
  }

  const style: CSSProperties = {
    backgroundColor: baseBottom,
    isolation: "isolate",
  };

  if (images.length > 0) {
    style.backgroundImage = images.join(", ");
    style.backgroundSize = sizes.join(", ");
    style.backgroundBlendMode = blends.join(", ");
  }

  return style;
}

export type WoodGrainLayerStyle = {
  backgroundImage: string;
  backgroundSize: string;
  opacity: number;
  mixBlendMode: WoodGrainBlendMode;
  filter: string;
};

export function buildWoodGrainLayerStyle(grain: WoodGrainParams): WoodGrainLayerStyle {
  return {
    backgroundImage: buildWoodGrainDataUri(grain),
    backgroundSize: `${grain.tileWidth}px ${grain.tileHeight}px`,
    opacity: grain.layerOpacity,
    mixBlendMode: grain.blendMode,
    filter: `contrast(${grain.contrast}) brightness(${grain.brightness})`,
  };
}

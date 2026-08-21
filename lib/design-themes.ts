import type { CSSProperties } from "react";

import presets from "@/data/design-themes/presets.json";

export type BorderWeight = "standard" | "hairline" | "thick" | "soft";

export type DesignThemeTokens = {
  canvas: string;
  surface: string;
  surfaceRaised: string;
  ink: string;
  muted: string;
  /**
   * Ink for content drawn straight onto the canvas. Only needed when the canvas
   * is a *material* that differs in lightness from `surface` — Workshop's wood
   * bench against its pale stone cards. Defaults to `ink`/`muted`.
   */
  canvasInk?: string;
  canvasMuted?: string;
  line: string;
  lineStrong: string;
  accent: string;
  accentDeep: string;
  accentSoft: string;
  accentInk: string;
  danger: string;
  dangerDeep: string;
  dangerSoft: string;
  dangerInk: string;
  success: string;
  successDeep: string;
  successSoft: string;
  successInk: string;
  radiusCard: string;
  radiusPill: string;
};

export type DesignThemePreset = {
  id: string;
  name: string;
  tagline: string;
  rationale: string;
  fontLabel: string;
  radiusLabel: string;
  borderLabel: string;
  borderWeight: BorderWeight;
  tokens: DesignThemeTokens;
};

export const designThemePresets = presets as DesignThemePreset[];

export const designThemeStorageKey = "design-explorer-choice";

/** Maps preset tokens onto the CSS variable names used by app/globals.css. */
export function themeScopeStyle(tokens: DesignThemeTokens): CSSProperties {
  return {
    "--color-canvas": tokens.canvas,
    "--color-surface": tokens.surface,
    "--color-surface-raised": tokens.surfaceRaised,
    "--color-ink": tokens.ink,
    "--color-muted": tokens.muted,
    "--color-surface-ink": tokens.ink,
    "--color-surface-muted": tokens.muted,
    "--color-canvas-ink": tokens.canvasInk ?? tokens.ink,
    "--color-canvas-muted": tokens.canvasMuted ?? tokens.muted,
    "--color-line": tokens.line,
    "--color-line-strong": tokens.lineStrong,
    "--color-accent": tokens.accent,
    "--color-accent-deep": tokens.accentDeep,
    "--color-accent-soft": tokens.accentSoft,
    "--color-accent-ink": tokens.accentInk,
    "--color-danger": tokens.danger,
    "--color-danger-deep": tokens.dangerDeep,
    "--color-danger-soft": tokens.dangerSoft,
    "--color-danger-ink": tokens.dangerInk,
    "--color-success": tokens.success,
    "--color-success-deep": tokens.successDeep,
    "--color-success-soft": tokens.successSoft,
    "--color-success-ink": tokens.successInk,
    "--radius-card": tokens.radiusCard,
    "--radius-pill": tokens.radiusPill,
    backgroundColor: "var(--color-canvas)",
    color: "var(--color-ink)",
  } as CSSProperties;
}

export function borderWeightClass(weight: BorderWeight): string {
  switch (weight) {
    case "thick":
      return "[&_button]:border-2 [&_input]:border-2 [&_select]:border-2";
    case "hairline":
      return "[&_button]:border [&_input]:border [&_select]:border";
    default:
      return "";
  }
}

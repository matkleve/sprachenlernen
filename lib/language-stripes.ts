/**
 * Compact center-badge flag stripes for the vocabulary orbit. Decorative fills only —
 * token names, never raw hex in components. Contract:
 * docs/specs/feature/vocabulary-orbit.md
 */

export type LanguageStripeOrientation = "horizontal" | "vertical";

export type LanguageStripes = {
  orientation: LanguageStripeOrientation;
  /** Tailwind fill utilities, one per stripe band. */
  fills: readonly [string, string, string];
};

const STRIPES: Record<string, LanguageStripes> = {
  es: {
    orientation: "horizontal",
    fills: ["fill-lang-es-1", "fill-lang-es-2", "fill-lang-es-3"],
  },
  it: {
    orientation: "vertical",
    fills: ["fill-lang-it-1", "fill-lang-it-2", "fill-lang-it-3"],
  },
};

export function languageStripes(code: string): LanguageStripes {
  return (
    STRIPES[code] ?? {
      orientation: "horizontal",
      fills: ["fill-muted", "fill-line", "fill-muted"],
    }
  );
}

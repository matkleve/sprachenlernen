import { routes } from "@/lib/routes";

/**
 * Dev preview pages linked from Profile → Dev.
 * Contract: docs/specs/page/profile.md § Section navigation
 *
 * `updatedAt` is the last meaningful change to the page or its tooling — bump
 * when you ship a dev-page change so the list stays honest.
 */

export type DevPage = {
  href: string;
  name: string;
  description: string;
  /** ISO calendar date (YYYY-MM-DD) */
  updatedAt: string;
};

const DEV_PAGES: DevPage[] = [
  {
    href: routes.materialExplorer,
    name: "Material explorer",
    description:
      "Nine material recipes on the same card + input + button — base, texture, edge, lighting.",
    updatedAt: "2026-08-21",
  },
  {
    href: routes.woodTextureLab,
    name: "Wood textures",
    description: "Four horizontal-grain wood species from the reference board, labelled for marking.",
    updatedAt: "2026-08-21",
  },
  {
    href: routes.woodGrainLab,
    name: "Wood grain lab",
    description:
      "Canvas procedural workshop wood — domain-warped rings and fibres before promoting to progression.",
    updatedAt: "2026-08-21",
  },
  {
    href: routes.progressionExplorer,
    name: "Progression explorer",
    description: "One slider through nine interface stages — chapters, texture, depth.",
    updatedAt: "2026-08-21",
  },
  {
    href: routes.profileDevSentenceRealizer,
    name: "Sentence realizer",
    description:
      "Random plan from memory, rendered for every present-tense person via the lemma-table inverse index.",
    updatedAt: "2026-08-21",
  },
  {
    href: routes.safariBisect,
    name: "Safari bisect",
    description: "The iOS/PWA layout bisect routes (study/31).",
    updatedAt: "2026-08-20",
  },
  {
    href: routes.methodCardAssets,
    name: "Method card assets",
    description: "Section graphics and skill-tier badges as they render on cards.",
    updatedAt: "2026-08-18",
  },
  {
    href: routes.brandExplorer,
    name: "Brand explorer",
    description: "Logo and PWA icon directions at favicon, header and Home Screen sizes.",
    updatedAt: "2026-08-16",
  },
  {
    href: routes.primitives,
    name: "Primitives",
    description: "Every UI primitive with all five interaction states.",
    updatedAt: "2026-08-10",
  },
  {
    href: routes.designExplorer,
    name: "Design explorer",
    description: "The five base theme presets side by side.",
    updatedAt: "2026-08-09",
  },
];

export function formatDevPageUpdatedAt(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year!, month! - 1, day));
}

/** Newest first — for Profile → Dev. */
export function devPagesByRecency(): DevPage[] {
  return [...DEV_PAGES].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

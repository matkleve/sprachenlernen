import { routes } from "@/lib/routes";

/**
 * Owner dev preview pages linked from Profile → Dev.
 * Contract: docs/specs/page/profile.md § Dev
 *
 * Bump `lastUpdatedAt` when the page or its tooling meaningfully changes —
 * ProfileDevSection sorts by this field (latest first).
 */

export type DevPage = {
  href: string;
  name: string;
  description: string;
  /** UTC ms when this preview was last meaningfully changed. */
  lastUpdatedAt: number;
};

/** English-only dev tooling — not passed through i18n. */
export const DEV_PAGES: DevPage[] = [
  {
    href: routes.materialExplorer,
    name: "Material explorer",
    description:
      "Nine material recipes on the same card + input + button — base, texture, edge, lighting.",
    lastUpdatedAt: Date.parse("2026-08-21T18:00:00Z"),
  },
  {
    href: routes.woodGrainLab,
    name: "Wood grain lab",
    description:
      "Canvas procedural workshop wood — domain-warped rings and fibres before promoting to progression.",
    lastUpdatedAt: Date.parse("2026-08-21T17:30:00Z"),
  },
  {
    href: routes.woodTextureLab,
    name: "Wood textures",
    description: "Four horizontal-grain wood species from the reference board, labelled for marking.",
    lastUpdatedAt: Date.parse("2026-08-21T15:11:45Z"),
  },
  {
    href: routes.profileDevSentenceRealizer,
    name: "Sentence realizer",
    description:
      "Random plan from memory, rendered for every present-tense person via the lemma-table inverse index.",
    lastUpdatedAt: Date.parse("2026-08-21T11:05:58Z"),
  },
  {
    href: routes.progressionExplorer,
    name: "Progression explorer",
    description: "One slider through nine interface stages — chapters, texture, depth.",
    lastUpdatedAt: Date.parse("2026-08-21T08:53:42Z"),
  },
  {
    href: routes.methodCardAssets,
    name: "Method card assets",
    description: "Section graphics and skill-tier badges as they render on cards.",
    lastUpdatedAt: Date.parse("2026-08-18T14:20:28Z"),
  },
  {
    href: routes.brandExplorer,
    name: "Brand explorer",
    description: "Logo and PWA icon directions at favicon, header and Home Screen sizes.",
    lastUpdatedAt: Date.parse("2026-08-16T17:10:02Z"),
  },
  {
    href: routes.safariBisect,
    name: "Safari bisect",
    description: "The iOS/PWA layout bisect routes (study/31).",
    lastUpdatedAt: Date.parse("2026-08-15T22:21:38Z"),
  },
  {
    href: routes.primitives,
    name: "Primitives",
    description: "Every UI primitive with all five interaction states.",
    lastUpdatedAt: Date.parse("2026-08-10T13:59:51Z"),
  },
  {
    href: routes.designExplorer,
    name: "Design explorer",
    description: "The five base theme presets side by side.",
    lastUpdatedAt: Date.parse("2026-08-09T17:17:46Z"),
  },
];

export function devPagesSortedByLatest(): DevPage[] {
  return [...DEV_PAGES].sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);
}

export function formatDevPageLastUpdated(lastUpdatedAt: number): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(lastUpdatedAt);
}

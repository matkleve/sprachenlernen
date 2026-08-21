import { ExternalLink } from "lucide-react";

import { routes } from "@/lib/routes";

/**
 * Links to the dev-only preview pages. Contract:
 * docs/specs/page/profile.md § Dev
 *
 * Not translated, and deliberately: everything it points at is English-only
 * owner tooling, so a German label on the way to an English page would be a
 * courtesy that ends one tap later.
 */

type DevLink = {
  href: string;
  name: string;
  description: string;
};

const DEV_LINKS: DevLink[] = [
  {
    href: routes.profileDevSentenceRealizer,
    name: "Sentence realizer",
    description:
      "Random plan from memory, rendered for every present-tense person via the lemma-table inverse index.",
  },
  {
    href: routes.woodGrainLab,
    name: "Wood grain lab",
    description:
      "Layer-by-layer workshop wood — tune feTurbulence direction, planks, and lighting before promoting to progression.",
  },
  {
    href: routes.progressionExplorer,
    name: "Progression explorer",
    description: "One slider through nine interface stages — chapters, texture, depth.",
  },
  {
    href: routes.materialExplorer,
    name: "Material explorer",
    description:
      "Nine material recipes on the same card + input + button — base, texture, edge, lighting.",
  },
  {
    href: routes.woodTextureLab,
    name: "Wood textures",
    description: "Four horizontal-grain wood species from the reference board, labelled for marking.",
  },
  {
    href: routes.designExplorer,
    name: "Design explorer",
    description: "The five base theme presets side by side.",
  },
  {
    href: routes.brandExplorer,
    name: "Brand explorer",
    description: "Logo and PWA icon directions at favicon, header and Home Screen sizes.",
  },
  {
    href: routes.methodCardAssets,
    name: "Method card assets",
    description: "Section graphics and skill-tier badges as they render on cards.",
  },
  {
    href: routes.primitives,
    name: "Primitives",
    description: "Every UI primitive with all five interaction states.",
  },
  {
    href: routes.safariBisect,
    name: "Safari bisect",
    description: "The iOS/PWA layout bisect routes (study/31).",
  },
];

export function ProfileDevSection() {
  return (
    <section className="mt-page-content">
      <h2 className="font-serif text-xl font-semibold text-ink">Dev</h2>
      <p className="mt-1 text-sm text-muted">
        Preview pages for design decisions. Nothing here changes your account or your learning
        data.
      </p>

      <ul className="mt-4 flex flex-col gap-2">
        {DEV_LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="group flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-soft transition hover:-translate-y-px hover:border-line-strong hover:shadow-raised active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-ink">{link.name}</span>
                <span className="mt-0.5 block text-sm text-muted">{link.description}</span>
              </span>
              <ExternalLink aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

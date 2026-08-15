import type { Metadata } from "next";

import { ActionLink } from "@/components/ui/ActionLink";
import { TextLink } from "@/components/ui/TextLink";
import { copy } from "@/features/install/content";
import { routes } from "@/lib/routes";
import { noIndexPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = noIndexPageMetadata({
  title: copy.title,
});

/**
 * Home Screen install instructions — public, no auth redirect.
 * Contract: docs/specs/feature/pwa-install.md
 */
export default function InstallPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-page-top pb-page-bottom">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{copy.title}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted">{copy.intro}</p>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{copy.whyHeading}</h2>
        <p className="mt-4 text-base leading-relaxed text-muted">{copy.whyBody}</p>
        <p className="mt-4 text-base leading-relaxed text-muted">{copy.noButton}</p>
      </section>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{copy.stepsHeading}</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-base leading-relaxed text-muted">
          {copy.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="mt-4 text-sm leading-relaxed text-muted">{copy.alreadySignedIn}</p>
        <ActionLink href={routes.landing} className="mt-6" aria-label={copy.openSiteAria}>
          {copy.openSite}
        </ActionLink>
      </section>

      <p className="mt-page-content">
        <TextLink href={routes.methods}>{copy.backToApp}</TextLink>
      </p>
    </div>
  );
}

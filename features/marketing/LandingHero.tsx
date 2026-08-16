import { getTranslations } from "next-intl/server";

import { ActionLink } from "@/components/ui/ActionLink";
import { TextLink } from "@/components/ui/TextLink";
import { hoursPerYear } from "@/lib/dose-band";
import { routes } from "@/lib/routes";

/**
 * The signed-out view of `/`. Contract: docs/specs/page/landing.md
 *
 * A Server Component: the signed-in redirect lives in the page, not here, so
 * this stays testable without mocking the router.
 */
export async function LandingHero() {
  const t = await getTranslations("marketing");
  const pillars = t.raw("landing.pillars") as { text: string }[];

  return (
    <div className="mx-auto max-w-3xl px-6 pt-page-top pb-page-bottom">
      <p className="text-sm font-medium uppercase tracking-widest text-accent">
        {t("landing.eyebrow")}
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        {t("landing.headline")}
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{t("landing.subhead")}</p>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        {t("landing.timeHonesty", { hours: Math.round(hoursPerYear(15)) })}
      </p>

      <div className="mt-page-content flex flex-wrap items-center gap-3">
        <ActionLink href={routes.signUp} variant="primary" size="lg">
          {t("landing.primaryCta")}
        </ActionLink>
        <ActionLink href={routes.signIn} variant="secondary" size="lg">
          {t("landing.secondaryCta")}
        </ActionLink>
      </div>

      <section
        aria-labelledby="landing-pillars"
        className="mt-page-content rounded-card border border-line bg-surface p-6 shadow-soft"
      >
        <h2 id="landing-pillars" className="text-sm font-semibold uppercase tracking-wide text-muted">
          {t("landing.pillarsHeading")}
        </h2>
        <ul className="mt-4 space-y-3 text-base text-ink">
          {pillars.map((pillar) => (
            <li key={pillar.text} className="flex gap-3">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-pill bg-accent" />
              <span>{pillar.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-page-content flex flex-col gap-3">
        <TextLink href={routes.languages}>{t("landing.languagesLink")}</TextLink>
        <TextLink href={routes.designExplorer}>{t("landing.designExplorerLink")}</TextLink>
      </p>
    </div>
  );
}

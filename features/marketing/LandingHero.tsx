import { getTranslations } from "next-intl/server";

import { BrandLockup } from "@/components/brand/BrandLockup";
import { ActionLink } from "@/components/ui/ActionLink";
import { TextLink } from "@/components/ui/TextLink";
import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { hoursPerYear } from "@/lib/dose-band";
import { getAccount } from "@/lib/db/auth";
import { routes } from "@/lib/routes";

import { LandingMethodPreview } from "./LandingMethodPreview";

/**
 * The `/` hero. Contract: docs/specs/page/landing.md
 *
 * A Server Component: signed-in vs signed-out CTAs are chosen here from the
 * session so the page route stays a thin redirect handler for auth callbacks.
 */
export async function LandingHero() {
  const t = await getTranslations("marketing");
  const pillars = t.raw("landing.pillars") as { text: string }[];
  const signedIn = (await getAccount()) !== null;
  const { catalogue } = loadMethodCatalogue();
  const dayKey = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-3xl px-6 pt-page-top pb-page-bottom">
      <BrandLockup href={routes.landing} wordmark={t("header.brand")} size="lg" tone="full" className="mb-6" />
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
        {signedIn ? (
          <ActionLink href={routes.appHome} variant="primary" size="lg">
            {t("header.toApp")}
          </ActionLink>
        ) : (
          <>
            <ActionLink href={routes.signUp} variant="primary" size="lg">
              {t("landing.primaryCta")}
            </ActionLink>
            <ActionLink href={routes.signIn} variant="secondary" size="lg">
              {t("landing.secondaryCta")}
            </ActionLink>
          </>
        )}
      </div>

      {catalogue ? (
        <LandingMethodPreview catalogue={catalogue} dayKey={dayKey} />
      ) : null}

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

      <p className="mt-page-content">
        <TextLink href={routes.languages}>{t("landing.languagesLink")}</TextLink>
      </p>
    </div>
  );
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ActionLink } from "@/components/ui/ActionLink";
import { TextLink } from "@/components/ui/TextLink";
import { routes } from "@/lib/routes";
import { noIndexPageMetadata } from "@/lib/site-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("install");
  return noIndexPageMetadata({ title: t("title") });
}

/**
 * Home Screen install instructions — public, no auth redirect.
 * Contract: docs/specs/feature/pwa-install.md
 */
export default async function InstallPage() {
  const t = await getTranslations("install");
  const steps = t.raw("steps") as string[];

  return (
    <div className="mx-auto max-w-2xl px-6 py-page-top pb-page-bottom">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{t("title")}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted">{t("intro")}</p>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{t("whyHeading")}</h2>
        <p className="mt-4 text-base leading-relaxed text-muted">{t("whyBody")}</p>
        <p className="mt-4 text-base leading-relaxed text-muted">{t("noButton")}</p>
      </section>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{t("stepsHeading")}</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-base leading-relaxed text-muted">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="mt-4 text-sm leading-relaxed text-muted">{t("alreadySignedIn")}</p>
        <ActionLink href={routes.landing} className="mt-6" aria-label={t("openSiteAria")}>
          {t("openSite")}
        </ActionLink>
      </section>

      <p className="mt-page-content">
        <TextLink href={routes.methods}>{t("backToApp")}</TextLink>
      </p>
    </div>
  );
}

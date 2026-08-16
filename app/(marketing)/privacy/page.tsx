import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { absoluteUrl, indexablePageMetadata } from "@/lib/site-metadata";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy");
  return indexablePageMetadata({
    title: t("title"),
    description: t("intro"),
    openGraph: {
      title: `${t("title")} · Sprachenlernen`,
      description: t("intro"),
      url: absoluteUrl(routes.privacy),
    },
  });
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");
  const stores = t.raw("stores") as string[];

  return (
    <div className="mx-auto max-w-2xl px-6 pt-page-top pb-page-bottom">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{t("title")}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted">{t("intro")}</p>
      <ul className="mt-page-content list-disc space-y-2 pl-5 text-base text-muted">
        {stores.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-page-content text-sm text-muted">{t("contact")}</p>
      <p className="mt-4 text-sm text-muted">{t("accountLink")}</p>
    </div>
  );
}

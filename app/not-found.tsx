import { getTranslations } from "next-intl/server";

import { ActionLink } from "@/components/ui/ActionLink";
import { routes } from "@/lib/routes";

/**
 * The 404. Uses `ActionLink` rather than a hand-styled anchor — the focus ring
 * and pending feedback are the primitive's job, and this page had its own copy
 * of both (docs/specs/feature/interaction-feedback.md).
 */
export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="mx-auto max-w-xl px-6 pt-page-top pb-page-bottom">
      <h1 className="text-2xl font-semibold text-ink">{t("title")}</h1>
      <p className="mt-3 text-base leading-relaxed text-muted">{t("body")}</p>
      <div className="mt-6">
        <ActionLink href={routes.landing} variant="secondary">
          {t("back")}
        </ActionLink>
      </div>
    </div>
  );
}

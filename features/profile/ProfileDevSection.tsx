import { ActionLink } from "@/components/ui/ActionLink";
import { routes } from "@/lib/routes";
import { getTranslations } from "next-intl/server";

/**
 * Dev tooling links — only rendered outside production.
 */
export async function ProfileDevSection() {
  const t = await getTranslations("profile");

  return (
    <section aria-labelledby="profile-dev-heading">
      <h2 id="profile-dev-heading" className="text-lg font-semibold text-ink">
        {t("devHeading")}
      </h2>
      <p className="mt-2 text-sm text-muted">{t("devCaption")}</p>
      <ul className="mt-4 flex flex-col gap-2">
        <li>
          <ActionLink href={routes.profileDevSentenceRealizer} variant="secondary">
            {t("devSentenceRealizer")}
          </ActionLink>
        </li>
        <li>
          <ActionLink href={routes.designExplorer} variant="secondary">
            {t("devDesignExplorer")}
          </ActionLink>
        </li>
        <li>
          <ActionLink href="/dev/brand" variant="secondary">
            {t("devBrandExplorer")}
          </ActionLink>
        </li>
      </ul>
    </section>
  );
}

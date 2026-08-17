import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { ErrorCallout } from "@/components/ui/ErrorCallout";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { SourceDetail } from "@/features/content/SourceDetail";
import { readSourceDetail } from "@/features/content/reading";
import { toUserFacing } from "@/lib/errors";
import { routes } from "@/lib/routes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const outcome = await readSourceDetail(id);
  if (outcome.status === "ok") {
    return { title: outcome.reading.source.title };
  }
  const t = await getTranslations("contentTrace");
  return { title: t("library.title") };
}

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const outcome = await readSourceDetail(id);

  if (outcome.status === "no-language") redirect(routes.chooseLanguage);

  if (outcome.status === "error") {
    return (
      <ShellPageContent width="narrow">
        <ErrorCallout {...toUserFacing(outcome.error)} />
      </ShellPageContent>
    );
  }

  if (outcome.status === "not-found") {
    const t = await getTranslations("contentTrace");
    return (
      <ShellPageContent mode="scrollable-drill-in" width="narrow">
        <p className="text-base text-muted">{t("source.notFound")}</p>
      </ShellPageContent>
    );
  }

  return <SourceDetail reading={outcome.reading} />;
}

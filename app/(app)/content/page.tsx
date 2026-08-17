import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { ErrorCallout } from "@/components/ui/ErrorCallout";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { ContentLibrary } from "@/features/content/ContentLibrary";
import { readContentLibrary } from "@/features/content/reading";
import { toUserFacing } from "@/lib/errors";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contentTrace");
  return { title: t("library.title") };
}

export default async function ContentPage() {
  const outcome = await readContentLibrary();

  if (outcome.status === "no-language") redirect(routes.chooseLanguage);

  if (outcome.status === "error") {
    return (
      <ShellPageContent width="narrow">
        <ErrorCallout {...toUserFacing(outcome.error)} />
      </ShellPageContent>
    );
  }

  return <ContentLibrary sources={outcome.sources} />;
}

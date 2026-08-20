import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { LearnerWorldSetup } from "@/features/learner-world/LearnerWorldSetup";
import { getLearnerWorld } from "@/lib/db/learner-world";
import { activeLanguageOf, listLearningLanguages } from "@/lib/db/learning-languages";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("learnerWorld");
  return { title: t("pageTitle") };
}

/** Contract: docs/specs/feature/learner-world-setup.md */
export default async function LearnerWorldSetupPage() {
  const languages = await listLearningLanguages();
  if (languages.status === "error") {
    redirect(routes.chooseLanguage);
  }
  const active = activeLanguageOf(languages.languages);
  if (!active) {
    redirect(routes.chooseLanguage);
  }

  const world = await getLearnerWorld(active);
  if (world.status === "ok" && world.hasRow) {
    redirect(routes.appHome);
  }

  return (
    <ShellPageContent width="narrow">
      <LearnerWorldSetup />
    </ShellPageContent>
  );
}

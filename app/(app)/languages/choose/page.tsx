import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { LanguagePicker } from "@/features/language-picker/LanguagePicker";
import { readPicker } from "@/features/language-picker/reading";
import { addLearningLanguage } from "@/lib/db/learning-languages";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("languagePicker");
  return { title: t("title") };
}

/** Contract: docs/specs/page/language-picker.md */
export default async function ChooseLanguagePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations("languagePicker");
  const outcome = await readPicker();
  const failed = (await searchParams).failed !== undefined;

  async function choose(code: string) {
    "use server";
    const added = await addLearningLanguage(code);
    redirect(added.status === "ok" ? routes.learnerWorldSetup : `${routes.chooseLanguage}?failed`);
  }

  if (outcome.status === "error") {
    return <LanguagePicker tiles={[]} error={outcome.error} choose={choose} />;
  }

  return (
    <LanguagePicker
      tiles={outcome.tiles}
      error={failed ? t("error") : null}
      choose={choose}
    />
  );
}

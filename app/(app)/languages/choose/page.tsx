import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LanguagePicker } from "@/features/language-picker/LanguagePicker";
import { copy } from "@/features/language-picker/content";
import { readPicker } from "@/features/language-picker/reading";
import { addLearningLanguage } from "@/lib/db/learning-languages";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: copy.title,
};

/** Contract: docs/specs/page/language-picker.md */
export default async function ChooseLanguagePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const outcome = await readPicker();
  // A failed add redirects back here with a marker rather than returning a
  // value: a server action that redirects on success cannot also hand state to
  // the page it did not navigate to, and silently swallowing the failure left
  // the learner tapping a button that repainted an identical screen.
  const failed = (await searchParams).failed !== undefined;

  async function choose(code: string) {
    "use server";
    const added = await addLearningLanguage(code);
    redirect(added.status === "ok" ? routes.appHome : `${routes.chooseLanguage}?failed`);
  }

  if (outcome.status === "error") {
    return <LanguagePicker tiles={[]} error={outcome.error} choose={choose} />;
  }

  return (
    <LanguagePicker
      tiles={outcome.tiles}
      error={failed ? copy.error : null}
      choose={choose}
    />
  );
}

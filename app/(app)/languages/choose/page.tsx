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
export default async function ChooseLanguagePage() {
  const outcome = await readPicker();

  async function choose(code: string) {
    "use server";
    const added = await addLearningLanguage(code);
    // A failed add must not strand the learner on a blank screen; the picker
    // re-renders and the error surfaces there.
    if (added.status === "ok") redirect(routes.appHome);
  }

  if (outcome.status === "error") {
    return <LanguagePicker tiles={[]} error={outcome.error} choose={choose} />;
  }

  return <LanguagePicker tiles={outcome.tiles} choose={choose} />;
}

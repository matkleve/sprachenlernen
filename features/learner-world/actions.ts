"use server";

import { redirect } from "next/navigation";

import { setLearnerWorld } from "@/lib/db/learner-world";
import { activeLanguageOf, listLearningLanguages } from "@/lib/db/learning-languages";
import type { LearnerWorldId } from "@/lib/learner-world";
import { routes } from "@/lib/routes";

export async function saveLearnerWorldAction(worldId: LearnerWorldId) {
  const languages = await listLearningLanguages();
  if (languages.status === "error") {
    throw new Error(languages.error);
  }
  const active = activeLanguageOf(languages.languages);
  if (!active) {
    redirect(routes.chooseLanguage);
  }

  const outcome = await setLearnerWorld(active, worldId);
  if (outcome.status === "error") {
    throw new Error(outcome.error);
  }

  redirect(routes.appHome);
}

export async function saveLearnerWorldFromProfileAction(
  languageCode: string,
  worldId: LearnerWorldId,
) {
  const outcome = await setLearnerWorld(languageCode, worldId);
  if (outcome.status === "error") {
    return outcome;
  }
  return outcome;
}

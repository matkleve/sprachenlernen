import { languageLabel } from "@/lib/languages";
import type { ListLanguagesOutcome } from "@/lib/db/learning-languages";

import type { LanguageSwitcherOption } from "./LanguageSwitcher";

/** Maps the learning-language adapter into shell switcher options. */
export function switcherOptionsFrom(
  outcome: ListLanguagesOutcome,
): LanguageSwitcherOption[] {
  if (outcome.status !== "ok") return [];

  return outcome.languages.map((language) => ({
    code: language.languageCode,
    endonym: languageLabel(language.languageCode).endonym,
    emoji: languageLabel(language.languageCode).emoji,
    isActive: language.isActive,
  }));
}

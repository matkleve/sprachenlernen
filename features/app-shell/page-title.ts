import { copy as languagePickerCopy } from "@/features/language-picker/content";
import { copy as methodMenuCopy } from "@/features/method-menu/content";
import { copy as profileCopy } from "@/features/profile/content";
import { copy as progressCopy } from "@/features/progress/content";
import { copy as reviewCopy } from "@/features/review-session/content";
import { routes } from "@/lib/routes";

import { holding } from "./content";
import { methodTitlesById } from "./method-titles";

/**
 * The visible page title for the shell header. Contract:
 * docs/specs/feature/app-shell.md
 *
 * Mirrors each route's document title / h1 so the header and tab cannot drift.
 */
export function shellPageTitle(pathname: string): string {
  if (pathname === routes.methods) return methodMenuCopy.title;
  if (pathname === routes.methodsMirror) return methodMenuCopy.mirrorTitle;
  if (pathname === routes.words) return holding.words.title;
  if (pathname === routes.progress) return progressCopy.title;
  if (pathname === routes.wordsReview) return reviewCopy.title;
  if (pathname === routes.profile) return profileCopy.title;
  if (pathname === routes.chooseLanguage) return languagePickerCopy.title;

  if (pathname.startsWith(`${routes.methods}/`)) {
    const id = pathname.slice(routes.methods.length + 1).split("/")[0];
    if (id) return methodTitlesById[id] ?? methodMenuCopy.title;
  }

  return "";
}

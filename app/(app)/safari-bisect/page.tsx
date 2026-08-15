import type { Metadata } from "next";

import { TextLink } from "@/components/ui/TextLink";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { copy } from "@/features/safari-bisect/content";
import { bisectLevelHref } from "@/lib/safari-bisect";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: copy.hubTitle,
  robots: { index: false, follow: false },
};

/**
 * Entry hub for Safari / PWA body bisect routes.
 */
export default function SafariBisectHubPage() {
  return (
    <ShellPageContent width="wide">
      <h1 className="text-2xl font-semibold text-ink">{copy.hubTitle}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.hubIntro}</p>

      <ul className="mt-8 space-y-4 text-base">
        <li>
          <TextLink href={bisectLevelHref(routes.wordsBisect, 0)}>{copy.hubWords} — level 0</TextLink>
        </li>
        <li>
          <TextLink href={bisectLevelHref(routes.progressBisect, 0)}>
            {copy.hubProgress} — level 0
          </TextLink>
        </li>
      </ul>
    </ShellPageContent>
  );
}

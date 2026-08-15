import type { Metadata } from "next";

import { LanguageStatus } from "@/features/language-status/LanguageStatus";
import { loadLanguages } from "@/features/language-status/profiles";
import { absoluteUrl, indexablePageMetadata } from "@/lib/site-metadata";
import { routes } from "@/lib/routes";

export const metadata: Metadata = indexablePageMetadata({
  title: "Languages",
  description:
    "What Sprachenlernen claims for each shipped language, and what is still uncalibrated or withheld.",
  openGraph: {
    title: "Languages · Sprachenlernen",
    description:
      "What Sprachenlernen claims for each shipped language, and what is still uncalibrated or withheld.",
    url: absoluteUrl(routes.languages),
  },
});

/**
 * A page composes a feature and hands it data. The reading lives in the
 * feature so a test can reach it without a router (docs/ARCHITECTURE.md).
 */
export default function LanguagesPage() {
  return <LanguageStatus {...loadLanguages()} />;
}

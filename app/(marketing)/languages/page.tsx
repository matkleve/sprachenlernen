import type { Metadata } from "next";

import { LanguageStatus } from "@/features/language-status/LanguageStatus";
import { loadLanguages } from "@/features/language-status/profiles";

export const metadata: Metadata = {
  title: "Languages",
};

/**
 * A page composes a feature and hands it data. The reading lives in the
 * feature so a test can reach it without a router (docs/ARCHITECTURE.md).
 */
export default function LanguagesPage() {
  return <LanguageStatus {...loadLanguages()} />;
}

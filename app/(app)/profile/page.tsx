import type { Metadata } from "next";

import { AccountDataPanel } from "@/features/account-data/AccountDataPanel";
import { copy as accountCopy } from "@/features/account-data/content";
import { signOutAction } from "@/features/app-shell/actions";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { ProfileAppSection } from "@/features/profile/ProfileAppSection";
import { ProfileLanguages } from "@/features/profile/ProfileLanguages";
import { ProfileSpokenLanguage } from "@/features/profile/ProfileSpokenLanguage";
import { copy } from "@/features/profile/content";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { readLanguageHoldings } from "@/lib/db/language-holdings";
import { listLearningLanguages } from "@/lib/db/learning-languages";
import { getSpokenLanguage } from "@/lib/db/profiles";

export const metadata: Metadata = {
  title: copy.title,
};

/** Contract: docs/specs/page/profile.md */
export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const switchFailed = params.failed !== undefined;
  const spokenFailed = params.spoken !== undefined;
  const languages = await listLearningLanguages();
  const spoken = await getSpokenLanguage();
  const holdings =
    languages.status === "ok"
      ? await readLanguageHoldings(languages.languages.map((language) => language.languageCode))
      : { status: "error" as const, error: "" };

  return (
    <ShellPageContent width="narrow">
      <ProfileSpokenLanguage outcome={spoken} changeFailed={spokenFailed} />

      <ProfileLanguages
        outcome={languages}
        holdings={holdings.status === "ok" ? holdings.byCode : undefined}
        switchFailed={switchFailed}
      />

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{accountCopy.title}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{accountCopy.intro}</p>
        <AccountDataPanel />
      </section>

      <ProfileAppSection />

      <form action={signOutAction} className="mt-page-content">
        <SubmitButton variant="secondary">{copy.signOut}</SubmitButton>
      </form>
    </ShellPageContent>
  );
}

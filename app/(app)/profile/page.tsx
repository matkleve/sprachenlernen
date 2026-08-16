import type { Metadata } from "next";

import { AccountDataPanel } from "@/features/account-data/AccountDataPanel";
import { copy as accountCopy } from "@/features/account-data/content";
import { signOutAction } from "@/features/app-shell/actions";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { ProfileAppSection } from "@/features/profile/ProfileAppSection";
import { ProfileHomeScreenSection } from "@/features/profile/ProfileHomeScreenSection";
import { ProfileLanguages } from "@/features/profile/ProfileLanguages";
import { ProfileSections, isProfileSection } from "@/features/profile/ProfileSections";
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
  const sectionParam = typeof params.section === "string" ? params.section : undefined;
  const initialSection = isProfileSection(sectionParam) ? sectionParam : "languages";
  const languages = await listLearningLanguages();
  const spoken = await getSpokenLanguage();
  const holdings =
    languages.status === "ok"
      ? await readLanguageHoldings(languages.languages.map((language) => language.languageCode))
      : { status: "error" as const, error: "" };

  return (
    <ShellPageContent width="narrow">
      <ProfileSections
        initialSection={initialSection}
        languages={
          <>
            <ProfileSpokenLanguage outcome={spoken} changeFailed={spokenFailed} />
            <ProfileLanguages
              outcome={languages}
              holdings={holdings.status === "ok" ? holdings.byCode : undefined}
              switchFailed={switchFailed}
            />
          </>
        }
        data={
          <section>
            <h2 className="text-xl font-semibold text-ink">{accountCopy.title}</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{accountCopy.intro}</p>
            <AccountDataPanel />
          </section>
        }
        device={
          <>
            <ProfileAppSection />
            <ProfileHomeScreenSection />
          </>
        }
        signOut={
          <form action={signOutAction}>
            <SubmitButton variant="secondary">{copy.signOut}</SubmitButton>
          </form>
        }
      />
    </ShellPageContent>
  );
}

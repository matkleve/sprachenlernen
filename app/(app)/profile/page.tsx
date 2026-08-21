import type { Metadata } from "next";

import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { ProfileAppSection } from "@/features/profile/ProfileAppSection";
import { ProfileDevSection } from "@/features/profile/ProfileDevSection";
import { ProfileHomeScreenSection } from "@/features/profile/ProfileHomeScreenSection";
import { ProfileLanguages } from "@/features/profile/ProfileLanguages";
import { ProfileSectionNav } from "@/features/profile/ProfileSectionNav";
import { ProfileSignOut } from "@/features/profile/ProfileSignOut";
import { ProfileSpokenLanguage } from "@/features/profile/ProfileSpokenLanguage";
import { ProfileYourDataSection } from "@/features/profile/ProfileYourDataSection";
import { getTranslations } from "next-intl/server";
import { listLearnerWorlds } from "@/lib/db/learner-world";
import { readLanguageHoldings } from "@/lib/db/language-holdings";
import { listLearningLanguages } from "@/lib/db/learning-languages";
import { getSpokenLanguage } from "@/lib/db/profiles";
import { isProfileSection, profilePanelId } from "@/lib/profile-section";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profile");
  return { title: t("title") };
}

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
  const worlds = await listLearnerWorlds();

  return (
    <ShellPageContent width="narrow">
      <ProfileSectionNav initialSection={initialSection} />

      <div
        id={profilePanelId("languages")}
        role="tabpanel"
        aria-labelledby="profile-section-languages"
        hidden={initialSection !== "languages"}
        className="[&>section:first-child]:mt-0"
      >
        <ProfileSpokenLanguage outcome={spoken} changeFailed={spokenFailed} />
        <ProfileLanguages
          outcome={languages}
          holdings={holdings.status === "ok" ? holdings.byCode : undefined}
          worlds={worlds.status === "ok" ? worlds.worlds : undefined}
          switchFailed={switchFailed}
        />
      </div>

      <div
        id={profilePanelId("data")}
        role="tabpanel"
        aria-labelledby="profile-section-data"
        hidden={initialSection !== "data"}
      >
        <ProfileYourDataSection />
      </div>

      <div
        id={profilePanelId("device")}
        role="tabpanel"
        aria-labelledby="profile-section-device"
        hidden={initialSection !== "device"}
        className="[&>section:first-child]:mt-0"
      >
        <ProfileAppSection />
        <ProfileHomeScreenSection />
      </div>

      <div
        id={profilePanelId("dev")}
        role="tabpanel"
        aria-labelledby="profile-section-dev"
        hidden={initialSection !== "dev"}
        className="[&>section:first-child]:mt-0"
      >
        <ProfileDevSection />
      </div>

      <ProfileSignOut />
    </ShellPageContent>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountDataPanel } from "@/features/account-data/AccountDataPanel";
import { copy as accountCopy } from "@/features/account-data/content";
import { signOutAction } from "@/features/app-shell/actions";
import { ProfileLanguages } from "@/features/profile/ProfileLanguages";
import { copy } from "@/features/profile/content";
import { Button } from "@/components/ui/Button";
import { listLearningLanguages, setActiveLanguage } from "@/lib/db/learning-languages";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: copy.title,
};

/** Contract: docs/specs/page/profile.md */
export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const switchFailed = (await searchParams).failed !== undefined;
  const languages = await listLearningLanguages();

  async function switchTo(code: string) {
    "use server";
    const switched = await setActiveLanguage(code);
    // Dropping this outcome is what made a half-finished switch invisible.
    if (switched.status === "error") redirect(`${routes.profile}?failed`);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pt-page-top pb-page-bottom">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{copy.title}</h1>

      {/* One failed block must not take the page — export and delete still work. */}
      <ProfileLanguages outcome={languages} switchFailed={switchFailed} switchTo={switchTo} />

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{accountCopy.title}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{accountCopy.intro}</p>
        <AccountDataPanel />
      </section>

      <form action={signOutAction} className="mt-page-content">
        <Button type="submit" variant="secondary">{copy.signOut}</Button>
      </form>
    </div>
  );
}

"use client";

import { AccountDataPanel } from "@/features/account-data/AccountDataPanel";
import { copy } from "@/features/account-data/content";

/** Your data panel on /profile. Client wrapper so no server markup crosses ProfileSectionNav. */
export function ProfileYourDataSection() {
  return (
    <section>
      <h2 className="text-xl font-semibold text-ink">{copy.title}</h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.intro}</p>
      <AccountDataPanel />
    </section>
  );
}

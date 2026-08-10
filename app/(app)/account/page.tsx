import type { Metadata } from "next";

import { AccountDataPanel } from "@/features/account-data/AccountDataPanel";
import { copy } from "@/features/account-data/content";

export const metadata: Metadata = {
  title: copy.title,
};

/** Contract: docs/specs/feature/account-data.md */
export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-page-top pb-page-bottom">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{copy.title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.intro}</p>
      <AccountDataPanel />
    </div>
  );
}

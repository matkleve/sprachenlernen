import type { Metadata } from "next";

import { ProgressionExplorer } from "@/features/progression-explorer/ProgressionExplorer";
import { page } from "@/features/progression-explorer/content";

export const metadata: Metadata = {
  title: "Progression explorer",
  robots: { index: false, follow: false },
};

/** Contract: docs/specs/page/progression-explorer.md */
export default function ProgressionExplorerPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-page-top pb-page-bottom">
      <header className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-muted">{page.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink">{page.title}</h1>
        <p className="mt-4 max-w-2xl text-base text-muted">{page.intro}</p>
      </header>

      <div className="mt-page-content">
        <ProgressionExplorer />
      </div>
    </div>
  );
}

import type { Metadata } from "next";

import { DesignExplorer } from "@/features/design-explorer/DesignExplorer";
import { page } from "@/features/design-explorer/content";

export const metadata: Metadata = {
  title: "Design explorer",
  robots: { index: false, follow: false },
};

export default function DesignExplorerPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-page-top pb-page-bottom">
        <header className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-widest text-muted">Dev</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink">{page.title}</h1>
          <p className="mt-4 max-w-2xl text-base text-muted">{page.intro}</p>
        </header>

        <div className="mt-page-content">
          <DesignExplorer />
        </div>
      </div>
  );
}

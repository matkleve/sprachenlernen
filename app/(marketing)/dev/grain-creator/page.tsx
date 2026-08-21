import type { Metadata } from "next";

import { GrainCreator } from "@/features/grain-creator/GrainCreator";
import { page } from "@/features/grain-creator/content";

export const metadata: Metadata = {
  title: "Grain creator",
  robots: { index: false, follow: false },
};

/** Contract: docs/specs/page/grain-creator.md */
export default function GrainCreatorDevPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-page-top pb-page-bottom">
      <header className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-muted">{page.eyebrow}</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-ink">{page.title}</h1>
        <p className="mt-4 max-w-2xl text-base text-muted">{page.intro}</p>
      </header>

      <div className="mt-page-content">
        <GrainCreator />
      </div>
    </div>
  );
}

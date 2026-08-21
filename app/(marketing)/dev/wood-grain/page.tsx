import type { Metadata } from "next";

import { page } from "@/features/wood-grain-lab/content";
import { WoodGrainLab } from "@/features/wood-grain-lab/WoodGrainLab";

export const metadata: Metadata = {
  title: "Wood grain lab",
  robots: { index: false, follow: false },
};

/** Dev-only — tune procedural workshop wood before promoting to progression skins. */
export default function WoodGrainLabPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-page-top pb-page-bottom">
      <header className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-muted">{page.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink">{page.title}</h1>
        <p className="mt-4 max-w-2xl text-base text-muted">{page.intro}</p>
      </header>

      <div className="mt-page-content">
        <WoodGrainLab />
      </div>
    </div>
  );
}

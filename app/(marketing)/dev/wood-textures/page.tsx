import type { Metadata } from "next";

import { WoodTextureLab } from "@/features/wood-texture-lab/WoodTextureLab";
import { page } from "@/features/wood-texture-lab/content";

export const metadata: Metadata = {
  title: "Wood textures",
  robots: { index: false, follow: false },
};

/** Contract: docs/specs/page/wood-texture-lab.md */
export default function WoodTexturesDevPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-page-top pb-page-bottom">
      <header className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-muted">Dev</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-ink">
          {page.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted">{page.intro}</p>
      </header>

      <div className="mt-page-content">
        <WoodTextureLab />
      </div>
    </div>
  );
}

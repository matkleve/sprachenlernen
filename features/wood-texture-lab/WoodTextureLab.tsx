import { cn } from "@/lib/utils";

import { page, woodTextures } from "./content";
import { WoodGrainCanvas } from "./WoodGrainCanvas";

export function WoodTextureLab() {
  return (
    <div className="flex flex-col gap-page-content">
      <p className="rounded-card border border-line bg-surface px-4 py-3 text-sm text-muted">
        {page.grainNote}
      </p>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {woodTextures.map((texture) => (
          <article
            key={texture.id}
            className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4 shadow-soft"
            aria-labelledby={`wood-texture-${texture.id}-title`}
          >
            <div
              className={cn(
                "wood-texture-swatch overflow-hidden",
                texture.pill && "wood-texture-swatch--pill",
              )}
            >
              <WoodGrainCanvas options={texture.grain} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted">
                {texture.number}
              </p>
              <h2
                id={`wood-texture-${texture.id}-title`}
                className="mt-1 font-serif text-lg font-semibold text-ink"
              >
                {texture.name}
              </h2>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted">
                {page.marksHeading}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
                {texture.marks.map((mark) => (
                  <li key={mark}>{mark}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

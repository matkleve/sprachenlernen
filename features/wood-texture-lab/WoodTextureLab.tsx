import { cn } from "@/lib/utils";

import { page, woodTextures } from "./content";
import { WoodGrainCanvas } from "./WoodGrainCanvas";

export function WoodTextureLab() {
  return (
    <div className="flex flex-col gap-page-content">
      <p className="rounded-card border border-line bg-surface px-4 py-3 text-sm text-muted">
        {page.grainNote}
      </p>

      <section className="flex flex-col gap-4" aria-labelledby="wood-tuned-heading">
        <div>
          <h2 id="wood-tuned-heading" className="font-serif text-xl font-semibold text-ink">
            {page.tunedHeading}
          </h2>
          <p className="mt-1 text-sm text-muted">{page.tunedIntro}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {page.tunedVariants.map((variant) => (
            <article
              key={variant.id}
              className="flex flex-col gap-3 rounded-card border border-line bg-surface p-3 shadow-soft"
              aria-labelledby={`wood-tuned-${variant.id}-title`}
            >
              <div className="wood-texture-swatch wood-texture-swatch--tuned overflow-hidden">
                <WoodGrainCanvas options={variant.grain} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted">
                  {variant.number.toString().padStart(2, "0")}
                </p>
                <h3
                  id={`wood-tuned-${variant.id}-title`}
                  className="mt-0.5 font-serif text-base font-semibold text-ink"
                >
                  {variant.name}
                </h3>
                <p className="mt-1 text-xs text-muted">{variant.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="wood-board-heading">
        <div>
          <h2 id="wood-board-heading" className="font-serif text-xl font-semibold text-ink">
            {page.boardHeading}
          </h2>
          <p className="mt-1 text-sm text-muted">{page.boardIntro}</p>
        </div>

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
      </section>
    </div>
  );
}

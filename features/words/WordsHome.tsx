import { ActionLink } from "@/components/ui/ActionLink";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { holding } from "@/features/app-shell/content";
import { copy as reviewCopy } from "@/features/review-session/content";
import { copy } from "@/features/words/content";
import { VocabularyOrbitField } from "@/features/words/VocabularyOrbitField";
import { cardEngineSessionHref } from "@/lib/method-session";
import type { FrequencyBlock } from "@/lib/frequency-blocks";
import { buildVocabularyOrbit } from "@/lib/vocabulary-orbit";
import type { VocabularySnapshot } from "@/lib/vocabulary-snapshot";
import { cn } from "@/lib/utils";

type WordsHomeProps = {
  snapshot: VocabularySnapshot;
  blocks: readonly FrequencyBlock[];
  languageCode: string;
  translations: Readonly<Record<string, string>>;
};

const CHART_HEIGHT_PX = 96;

function maxHorizonCount(snapshot: VocabularySnapshot): number {
  return Math.max(1, ...snapshot.horizon.map((bin) => bin.count));
}

function horizonBarHeight(count: number, max: number): number {
  if (count === 0) return 2;
  return Math.max(4, (count / max) * CHART_HEIGHT_PX);
}

const countCardStyles = {
  held: "border-success-soft bg-success-soft",
  fragile: "border-accent-soft bg-accent-soft",
  new: "border-line bg-surface",
} as const;

export function WordsHome({ snapshot, blocks, languageCode, translations }: WordsHomeProps) {
  const reviewHref = cardEngineSessionHref();
  const horizonMax = maxHorizonCount(snapshot);
  const orbit = buildVocabularyOrbit(snapshot.atlas, translations);

  return (
    <ShellPageContent width="wide">
      <section className="rounded-card border border-line bg-surface-raised p-6 shadow-soft">
        <p className="max-w-2xl text-base leading-relaxed text-muted">{holding.words.intent}</p>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-ink">{copy.reviewHeading}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{copy.reviewCaption}</p>
          <ActionLink href={reviewHref} variant="primary" size="lg" className="mt-4 w-full sm:w-auto">
            {reviewCopy.startReview}
          </ActionLink>
        </div>
      </section>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{copy.countsHeading}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.countsCaption}</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          {(
            [
              {
                key: "held" as const,
                label: copy.held,
                value: snapshot.counts.held,
                description: copy.heldDescription,
              },
              {
                key: "fragile" as const,
                label: copy.fragile,
                value: snapshot.counts.fragile,
                description: copy.fragileDescription,
              },
              {
                key: "new" as const,
                label: copy.newWords,
                value: snapshot.counts.new,
                description: copy.newDescription,
              },
            ] as const
          ).map((item) => (
            <div
              key={item.key}
              className={cn(
                "rounded-card border p-4 shadow-soft",
                countCardStyles[item.key],
              )}
            >
              <dt className="text-sm font-medium text-muted">{item.label}</dt>
              <dd className="mt-2 text-3xl font-semibold tabular-nums text-ink">{item.value}</dd>
              <dd className="mt-2 text-sm text-muted">{item.description}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{copy.blocksHeading}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.blocksCaption}</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {blocks.map((block) => (
            <div
              key={`${block.rankStart}-${block.rankEnd}`}
              className="rounded-card border border-line bg-surface p-4 shadow-soft"
            >
              <dt className="text-sm font-medium text-muted">
                {copy.blockLabel(block.rankStart, block.rankEnd)}
              </dt>
              <dd className="mt-2 text-3xl font-semibold text-ink">
                {copy.blockHeld(block.held, block.poolSize)}
              </dd>
              <dd className="mt-2 text-sm text-muted">{copy.blockHeldDescription}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{copy.horizonHeading}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.horizonCaption}</p>
        <div className="mt-6 w-full" role="img" aria-label={copy.horizonCaption}>
          <div
            className="flex w-full items-end gap-0.5"
            style={{ height: CHART_HEIGHT_PX }}
          >
            {snapshot.horizon.map((bin) => (
              <div
                key={bin.dayOffset}
                className="flex h-full min-w-0 flex-1 flex-col justify-end"
                title={`${copy.horizonDay(bin.dayOffset)}: ${bin.count}`}
              >
                <div
                  className="w-full rounded-pill bg-accent"
                  style={{ height: `${horizonBarHeight(bin.count, horizonMax)}px` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex w-full gap-0.5">
            {snapshot.horizon.map((bin) => (
              <span key={bin.dayOffset} className="min-w-0 flex-1 text-center text-[10px] text-muted">
                {bin.dayOffset % 5 === 0 ? bin.dayOffset + 1 : ""}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-page-content">
        <VocabularyOrbitField orbit={orbit} languageCode={languageCode} atlas={snapshot.atlas} />
      </div>
    </ShellPageContent>
  );
}

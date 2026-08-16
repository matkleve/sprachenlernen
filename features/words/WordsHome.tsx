import { ActionLink } from "@/components/ui/ActionLink";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { holding } from "@/features/app-shell/content";
import { MethodCardHeader } from "@/features/method-menu/MethodCardHeader";
import { methodSectionSurface } from "@/features/method-menu/section-surface";
import { copy as reviewCopy } from "@/features/review-session/content";
import { ReviewHorizonField } from "@/features/words/ReviewHorizonField";
import { LemmaCallout } from "@/features/words/LemmaCallout";
import { WordsCountDefinitions } from "@/features/words/WordsCountDefinitions";
import { WordsReviewCardHeader } from "@/features/words/WordsReviewCardHeader";
import { WordsSectionLabel } from "@/features/words/WordsSectionLabel";
import { copy } from "@/features/words/content";
import { VocabularyOrbitField } from "@/features/words/VocabularyOrbitField";
import { cardEngineSessionHref } from "@/lib/method-session";
import type { FrequencyBlock } from "@/lib/frequency-blocks";
import type { HorizonDisplay } from "@/lib/review-horizon";
import { buildVocabularyOrbit } from "@/lib/vocabulary-orbit";
import type { VocabularySnapshot } from "@/lib/vocabulary-snapshot";

type WordsHomeProps = {
  snapshot: VocabularySnapshot;
  blocks: readonly FrequencyBlock[];
  languageCode: string;
  translations: Readonly<Record<string, string>>;
  horizonDisplay: HorizonDisplay;
  now: number;
};

const countTileClass =
  "rounded-card border border-line bg-surface p-4 shadow-soft";

export function WordsHome({
  snapshot,
  blocks,
  languageCode,
  translations,
  horizonDisplay,
  now,
}: WordsHomeProps) {
  const reviewHref = cardEngineSessionHref();
  const orbit = buildVocabularyOrbit(snapshot.atlas, translations);

  const countItems = [
    { key: "held", label: copy.held, value: snapshot.counts.held },
    { key: "fragile", label: copy.fragile, value: snapshot.counts.fragile },
    { key: "new", label: copy.newWords, value: snapshot.counts.new },
  ] as const;

  return (
    <ShellPageContent width="wide">
      <p className="max-w-2xl text-base leading-relaxed text-muted">{holding.words.intent}</p>

      <section className={methodSectionSurface("vocabulary", "mt-6 rounded-card shadow-soft")}>
        <WordsReviewCardHeader />
        <div className="p-6">
          <h2 className="text-lg font-semibold text-ink">{copy.reviewHeading}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{copy.reviewCaption}</p>
          <ActionLink href={reviewHref} variant="primary" size="lg" className="mt-4 w-full sm:w-auto">
            {reviewCopy.startReview}
          </ActionLink>
        </div>
      </section>

      <section className="mt-page-content">
        <WordsSectionLabel>{copy.countsHeading}</WordsSectionLabel>
        <section className={methodSectionSurface("vocabulary", "rounded-card shadow-soft")}>
          <MethodCardHeader section="vocabulary" />
          <div className="p-6">
            <p className="max-w-2xl text-base leading-relaxed text-muted">{copy.countsCaption}</p>
            <LemmaCallout />
            <dl className="mt-6 grid gap-3 sm:grid-cols-3" aria-label={copy.countsHeading}>
              {countItems.map((item) => (
                <div key={item.key} className={countTileClass}>
                  <dt className="text-sm font-medium text-muted">{item.label}</dt>
                  <dd className="mt-2 text-3xl font-semibold tabular-nums text-ink">{item.value}</dd>
                </div>
              ))}
            </dl>
            <WordsCountDefinitions />
          </div>
        </section>
      </section>

      <section className="mt-page-content">
        <WordsSectionLabel>{copy.blocksHeading}</WordsSectionLabel>
        <p className="mb-4 max-w-2xl text-base leading-relaxed text-muted">{copy.blocksCaption}</p>
        <dl className="grid gap-3 sm:grid-cols-2">
          {blocks.map((block) => (
            <div
              key={`${block.rankStart}-${block.rankEnd}`}
              className={methodSectionSurface("vocabulary", "rounded-card p-4 shadow-soft")}
            >
              <dt className="text-sm font-medium text-muted">
                {copy.blockLabel(block.rankStart, block.rankEnd)}
              </dt>
              <dd className="mt-2 text-3xl font-semibold tabular-nums text-ink">
                {copy.blockHeld(block.held, block.poolSize)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <ReviewHorizonField horizon={snapshot.horizon} display={horizonDisplay} now={now} />

      <div className="mt-page-content">
        <VocabularyOrbitField orbit={orbit} languageCode={languageCode} atlas={snapshot.atlas} />
      </div>
    </ShellPageContent>
  );
}

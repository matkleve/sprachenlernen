import { ActionLink } from "@/components/ui/ActionLink";
import { Table, Td, Th } from "@/components/ui/Table";
import { holding } from "@/features/app-shell/content";
import { copy as reviewCopy } from "@/features/review-session/content";
import { copy } from "@/features/words/content";
import { routes } from "@/lib/routes";
import type { VocabularySnapshot } from "@/lib/vocabulary-snapshot";

type WordsHomeProps = {
  snapshot: VocabularySnapshot;
};

const CHART_HEIGHT_PX = 96;

/**
 * The atlas is ordered by frequency, so the head of it is the part a learner
 * can act on; the tail is 400 rows of "New" that push the page's other
 * sections out of reach. Capped rather than paginated because paging controls
 * would be a second interactive surface for a table nobody scrolls to the end
 * of — revisit if the pool grows again (stage 2).
 */
const ATLAS_ROW_LIMIT = 100;

function maxHorizonCount(snapshot: VocabularySnapshot): number {
  return Math.max(1, ...snapshot.horizon.map((bin) => bin.count));
}

function horizonBarHeight(count: number, max: number): number {
  if (count === 0) return 2;
  return Math.max(4, (count / max) * CHART_HEIGHT_PX);
}

export function WordsHome({ snapshot }: WordsHomeProps) {
  const reviewHref = `${routes.wordsReview}?method=srs-session`;
  const horizonMax = maxHorizonCount(snapshot);
  const atlasRows = snapshot.atlas.slice(0, ATLAS_ROW_LIMIT);

  return (
    <div className="mx-auto max-w-5xl px-6 pt-page-top pb-page-bottom">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{holding.words.title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{holding.words.intent}</p>

      <div className="mt-page-content">
        <ActionLink href={reviewHref} variant="primary" size="lg">
          {reviewCopy.startReview}
        </ActionLink>
      </div>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{copy.countsHeading}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.countsCaption}</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-card border border-line bg-surface p-4 shadow-soft">
            <dt className="text-sm font-medium text-muted">{copy.held}</dt>
            <dd className="mt-2 text-3xl font-semibold text-ink">{snapshot.counts.held}</dd>
            <dd className="mt-2 text-sm text-muted">{copy.heldDescription}</dd>
          </div>
          <div className="rounded-card border border-line bg-surface p-4 shadow-soft">
            <dt className="text-sm font-medium text-muted">{copy.shaky}</dt>
            <dd className="mt-2 text-3xl font-semibold text-ink">{snapshot.counts.shaky}</dd>
            <dd className="mt-2 text-sm text-muted">{copy.shakyDescription}</dd>
          </div>
          <div className="rounded-card border border-line bg-surface p-4 shadow-soft">
            <dt className="text-sm font-medium text-muted">{copy.newWords}</dt>
            <dd className="mt-2 text-3xl font-semibold text-ink">{snapshot.counts.new}</dd>
            <dd className="mt-2 text-sm text-muted">{copy.newDescription}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{copy.horizonHeading}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.horizonCaption}</p>
        <div className="mt-6 overflow-x-auto" role="img" aria-label={copy.horizonCaption}>
          <div
            className="flex min-w-max items-end gap-1"
            style={{ height: CHART_HEIGHT_PX }}
          >
            {snapshot.horizon.map((bin) => (
              <div
                key={bin.dayOffset}
                className="flex h-full w-4 flex-col justify-end"
                title={`${copy.horizonDay(bin.dayOffset)}: ${bin.count}`}
              >
                <div
                  className="w-full rounded-pill bg-accent"
                  style={{ height: `${horizonBarHeight(bin.count, horizonMax)}px` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex min-w-max gap-1">
            {snapshot.horizon.map((bin) => (
              <span key={bin.dayOffset} className="w-4 text-center text-[10px] text-muted">
                {bin.dayOffset % 5 === 0 ? bin.dayOffset + 1 : ""}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{copy.atlasHeading}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.atlasCaption}</p>
        {atlasRows.length < snapshot.atlas.length ? (
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">
            {copy.atlasTruncated(atlasRows.length, snapshot.atlas.length)}
          </p>
        ) : null}
        <Table caption={copy.atlasCaption} className="mt-6">
          <thead>
            <tr>
              <Th scope="col">{copy.atlasColumns.word}</Th>
              <Th scope="col">{copy.atlasColumns.rank}</Th>
              <Th scope="col">{copy.atlasColumns.stability}</Th>
              <Th scope="col">{copy.atlasColumns.status}</Th>
            </tr>
          </thead>
          <tbody>
            {atlasRows.map((point) => (
              <tr key={`${point.lemma}-${point.frequencyRank}`}>
                <Th scope="row">{point.lemma}</Th>
                <Td>{point.frequencyRank}</Td>
                <Td>{point.stability !== null ? point.stability.toFixed(1) : copy.noStability}</Td>
                <Td>{copy.bucketNames[point.bucket]}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </div>
  );
}

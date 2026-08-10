import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { Table, Td, Th } from "@/components/ui/Table";
import { holding } from "@/features/app-shell/content";
import { copy as reviewCopy } from "@/features/review-session/content";
import { copy } from "@/features/words/content";
import { routes } from "@/lib/routes";
import type { VocabularySnapshot } from "@/lib/vocabulary-snapshot";
import { cn } from "@/lib/utils";

type WordsHomeProps = {
  snapshot: VocabularySnapshot;
};

function maxHorizonCount(snapshot: VocabularySnapshot): number {
  return Math.max(1, ...snapshot.horizon.map((bin) => bin.count));
}

export function WordsHome({ snapshot }: WordsHomeProps) {
  const reviewHref = `${routes.wordsReview}?method=srs-session`;
  const horizonMax = maxHorizonCount(snapshot);

  return (
    <div className="mx-auto max-w-5xl px-6 pt-page-top pb-page-bottom">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{holding.words.title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{holding.words.intent}</p>

      <div className="mt-page-content">
        <Link href={reviewHref} className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
          {reviewCopy.startReview}
        </Link>
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
        <div
          className="mt-6 flex items-end gap-1 overflow-x-auto pb-2"
          role="img"
          aria-label={copy.horizonCaption}
        >
          {snapshot.horizon.map((bin) => (
            <div key={bin.dayOffset} className="flex min-w-6 flex-col items-center gap-2">
              <div
                className="w-full min-w-4 rounded-t-sm bg-accent"
                style={{ height: `${Math.max(4, (bin.count / horizonMax) * 96)}px` }}
                title={`${copy.horizonDay(bin.dayOffset)}: ${bin.count}`}
              />
              <span className="text-[10px] text-muted">
                {bin.dayOffset % 5 === 0 ? bin.dayOffset + 1 : ""}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{copy.atlasHeading}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.atlasCaption}</p>
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
            {snapshot.atlas.map((point) => (
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

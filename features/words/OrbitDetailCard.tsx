import { Chip } from "@/components/ui/Chip";
import { copy } from "@/features/words/content";
import { orbitBandForRank } from "@/lib/vocabulary-orbit";
import type { OrbitSegment, OrbitTickSegment } from "@/lib/vocabulary-orbit";

type DetailSegment = Exclude<OrbitSegment, OrbitTickSegment>;

function statusChip(segment: Extract<DetailSegment, { kind: "word" }>) {
  const label = segment.mature ? copy.bucketNames.mature : copy.bucketNames[segment.bucket];

  if (segment.mature || segment.bucket === "held") {
    return <Chip tone="accent">{label}</Chip>;
  }

  if (segment.bucket === "fragile") {
    return (
      <Chip tone="default" className="border-accent-soft bg-accent-soft text-ink">
        {label}
      </Chip>
    );
  }

  return <Chip tone="default">{label}</Chip>;
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 px-3 first:pl-0 last:pr-0 sm:px-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-ink">{value}</dd>
    </div>
  );
}

export function OrbitDetailCard({ segment }: { segment: DetailSegment }) {
  if (segment.kind === "aggregate") {
    return (
      <article className="rounded-card border border-line bg-surface-raised p-5 shadow-soft sm:p-6">
        <h3 className="text-2xl font-semibold text-ink">
          {copy.orbitAggregateHeading(segment.rankStart, segment.rankEnd)}
        </h3>
        <p className="mt-3 text-base leading-relaxed text-muted">
          {copy.orbitAggregateBody(segment.wordCount, segment.heldCount)}
        </p>
        <dl className="mt-5 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center">
          <StatCell label={copy.orbitDetailWordsInBandLabel} value={`${segment.wordCount}`} />
          <div className="hidden h-10 w-px bg-line sm:block" aria-hidden />
          <StatCell
            label={copy.bucketNames.held}
            value={copy.orbitDetailHeldSummary(segment.heldCount, segment.wordCount)}
          />
        </dl>
      </article>
    );
  }

  const band = orbitBandForRank(segment.frequencyRank);
  const stability =
    segment.stability !== null ? segment.stability.toFixed(1) : copy.noStability;

  return (
    <article className="rounded-card border border-line bg-surface-raised p-5 shadow-soft sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-2xl font-semibold text-ink">{segment.lemma}</h3>
          {segment.translation ? (
            <p className="mt-1 text-lg text-muted">{segment.translation}</p>
          ) : null}
        </div>
        {statusChip(segment)}
      </div>

      <dl className="mt-5 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center">
        <StatCell label={copy.orbitDetailRankLabel} value={`#${segment.frequencyRank}`} />
        <div className="hidden h-10 w-px bg-line sm:block" aria-hidden />
        <StatCell label={copy.orbitDetailStabilityLabel} value={stability} />
        {band ? (
          <>
            <div className="hidden h-10 w-px bg-line sm:block" aria-hidden />
            <StatCell
              label={copy.orbitDetailBandLabel}
              value={copy.orbitDetailBandCaption(band.rankStart, band.rankEnd)}
            />
          </>
        ) : null}
      </dl>
    </article>
  );
}

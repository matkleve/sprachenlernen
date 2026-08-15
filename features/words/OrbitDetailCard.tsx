import { copy } from "@/features/words/content";
import type { OrbitSegment } from "@/lib/vocabulary-orbit";

export function OrbitDetailCard({ segment }: { segment: OrbitSegment }) {
  if (segment.kind === "aggregate") {
    return (
      <div className="rounded-card border border-line bg-surface p-4 shadow-soft">
        <h3 className="text-lg font-semibold text-ink">
          {copy.orbitAggregateHeading(segment.rankStart, segment.rankEnd)}
        </h3>
        <p className="mt-2 text-sm text-muted">
          {copy.orbitAggregateBody(segment.wordCount, segment.heldCount)}
        </p>
      </div>
    );
  }

  const status = segment.mature ? copy.bucketNames.mature : copy.bucketNames[segment.bucket];

  return (
    <div className="rounded-card border border-line bg-surface p-4 shadow-soft">
      <h3 className="text-lg font-semibold text-ink">{segment.lemma}</h3>
      {segment.translation ? (
        <p className="mt-1 text-base text-muted">{segment.translation}</p>
      ) : null}
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted">{copy.atlasColumns.rank}</dt>
          <dd className="font-medium text-ink">{segment.frequencyRank}</dd>
        </div>
        <div>
          <dt className="text-muted">{copy.atlasColumns.stability}</dt>
          <dd className="font-medium text-ink">
            {segment.stability !== null ? segment.stability.toFixed(1) : copy.noStability}
          </dd>
        </div>
        <div>
          <dt className="text-muted">{copy.atlasColumns.status}</dt>
          <dd className="font-medium text-ink">{status}</dd>
        </div>
      </dl>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";

import { Chip } from "@/components/ui/Chip";
import { WordDetailActions } from "@/features/words/WordDetailActions";
import { WordTraceBlock } from "@/features/words/WordTraceBlock";
import { buildScheduleReason } from "@/lib/schedule-reason";
import type { ContentTraceIndex } from "@/lib/content-traceability";
import { wordTraceForLemma } from "@/lib/content-traceability";
import type { Grade } from "@/lib/scheduler";
import type { OrbitSegment, OrbitTickSegment } from "@/lib/vocabulary-orbit";

type DetailSegment = Exclude<OrbitSegment, OrbitTickSegment>;

function statusChip(
  segment: Extract<DetailSegment, { kind: "word" }>,
  t: ReturnType<typeof useTranslations<"words">>,
) {
  const label = segment.mature ? t("bucketNames.mature") : t(`bucketNames.${segment.bucket}`);

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

function gradeLabel(grade: Grade, tReview: ReturnType<typeof useTranslations<"reviewSession">>) {
  return tReview(grade);
}

function ScheduleReasonLine({
  segment,
  now,
}: {
  segment: Extract<DetailSegment, { kind: "word" }>;
  now: number;
}) {
  const t = useTranslations("words");
  const tReview = useTranslations("reviewSession");
  const reason = buildScheduleReason(
    {
      state: segment.taskState,
      due: segment.due,
      lastGrade: segment.lastGrade,
      reviewCount: segment.reviewCount,
    },
    now,
  );

  let text: string;
  switch (reason.kind) {
    case "new":
      text = t("wordDetailScheduleNew");
      break;
    case "suspended":
      text = t("wordDetailScheduleSuspended");
      break;
    case "retired":
      text = t("wordDetailScheduleRetired");
      break;
    case "dueToday":
      text = t("wordDetailScheduleDueToday", {
        grade: reason.lastGrade ? gradeLabel(reason.lastGrade, tReview) : t("wordDetailScheduleNoGrade"),
      });
      break;
    case "dueFuture":
      text = t("wordDetailScheduleDueFuture", {
        days: reason.daysUntilDue ?? 0,
        grade: reason.lastGrade ? gradeLabel(reason.lastGrade, tReview) : t("wordDetailScheduleNoGrade"),
      });
      break;
  }

  return <p className="mt-4 text-sm leading-relaxed text-muted">{text}</p>;
}

export function OrbitDetailCard({
  segment,
  now,
  contentTraceIndex = null,
}: {
  segment: DetailSegment;
  now: number;
  contentTraceIndex?: ContentTraceIndex | null;
}) {
  const t = useTranslations("words");
  if (segment.kind === "aggregate") {
    return (
      <article className="rounded-card border border-line bg-surface-raised p-5 shadow-soft sm:p-6">
        <h3 className="text-2xl font-semibold text-ink">
          {t("orbitAggregateHeading", { start: segment.rankStart, end: segment.rankEnd })}
        </h3>
        <p className="mt-3 text-base leading-relaxed text-muted">
          {t("orbitAggregateBody", { count: segment.wordCount, held: segment.heldCount })}
        </p>
        <dl className="mt-5 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center">
          <StatCell label={t("orbitDetailWordsInBandLabel")} value={`${segment.wordCount}`} />
          <div className="hidden h-10 w-px bg-line sm:block" aria-hidden />
          <StatCell
            label={t("bucketNames.held")}
            value={t("orbitDetailHeldSummary", { held: segment.heldCount, total: segment.wordCount })}
          />
        </dl>
      </article>
    );
  }

  const stability =
    segment.stability !== null ? segment.stability.toFixed(1) : t("noStability");

  return (
    <article className="rounded-card border border-line bg-surface-raised p-5 shadow-soft sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-2xl font-semibold text-ink">{segment.lemma}</h3>
          {segment.translation ? (
            <p className="mt-1 text-lg text-muted">{segment.translation}</p>
          ) : null}
        </div>
        {statusChip(segment, t)}
      </div>

      <ScheduleReasonLine segment={segment} now={now} />

      <dl className="mt-5 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center">
        <StatCell label={t("orbitDetailRankLabel")} value={`#${segment.frequencyRank}`} />
        <div className="hidden h-10 w-px bg-line sm:block" aria-hidden />
        <StatCell label={t("orbitDetailStabilityLabel")} value={stability} />
        <div className="hidden h-10 w-px bg-line sm:block" aria-hidden />
        <StatCell
          label={t("orbitDetailBandLabel")}
          value={t("orbitDetailBandCaption", {
            start: segment.frequencyBandStart,
            end: segment.frequencyBandEnd,
          })}
        />
      </dl>

      {contentTraceIndex ? (
        <WordTraceBlock trace={wordTraceForLemma(segment.lemma, contentTraceIndex)} />
      ) : null}

      <WordDetailActions segment={segment} />
    </article>
  );
}

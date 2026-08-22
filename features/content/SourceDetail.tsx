import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/Button";
import { ActionLink } from "@/components/ui/ActionLink";
import { TextLink } from "@/components/ui/TextLink";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { startGapSetAction } from "@/features/content/actions";
import { ReadableText } from "@/features/content/ReadableText";
import type { SourceDetailReading } from "@/features/content/reading";
import { routes } from "@/lib/routes";

type SourceDetailProps = {
  reading: SourceDetailReading;
};

function bandCopy(
  reading: SourceDetailReading,
  t: Awaited<ReturnType<typeof getTranslations<"contentTrace">>>,
) {
  if (reading.coverage.comfortBand === "comfortable") {
    return t("source.comfortable", { pct: reading.coverage.coveragePercent });
  }
  if (reading.coverage.comfortBand === "speed") {
    return t("source.speed", { pct: reading.coverage.coveragePercent });
  }
  return t("source.demanding", { gapCount: reading.gap.kind === "list" ? reading.gap.gapCount : reading.gap.kind === "too-large" ? reading.gap.gapCount : 0 });
}

export async function SourceDetail({ reading }: SourceDetailProps) {
  const t = await getTranslations("contentTrace");

  return (
    <ShellPageContent mode="scrollable-drill-in" width="wide">
      <ActionLink
        href={routes.content}
        variant="ghost"
        size="sm"
        className="mb-4 hidden h-auto px-0 text-sm font-medium text-muted hover:bg-transparent hover:text-ink md:inline-flex"
      >
        ← {t("library.back")}
      </ActionLink>

      <article>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">{reading.source.title}</h1>
        <p className="mt-2 text-sm text-muted">{t(`library.origin.${reading.source.origin}`)}</p>

        <section className="mt-6 rounded-card border border-line bg-surface-raised p-5 shadow-soft">
          <p className="text-lg font-semibold tabular-nums text-ink">
            {t("source.coverage", { pct: reading.coverage.coveragePercent })}
          </p>
          <p className="mt-2 text-base leading-relaxed text-muted">{bandCopy(reading, t)}</p>
        </section>

        {reading.textSentences ? (
          <section className="mt-6 rounded-card border border-line bg-surface-raised p-5 shadow-soft">
            <h2 className="text-lg font-semibold text-ink">{t("reading.heading")}</h2>
            {reading.adapted ? (
              <p className="mt-2 text-sm text-muted">
                {t("source.adaptationLabel", { level: reading.targetLevel })}
              </p>
            ) : null}
            {reading.adapted && reading.sourceUrl ? (
              <a
                href={reading.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex text-sm font-medium text-accent hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t("source.viewOriginal")}
              </a>
            ) : null}
            <div className="mt-4">
              <ReadableText sentences={reading.textSentences} />
            </div>
          </section>
        ) : null}

        {reading.gap.kind === "list" ? (
          <section className="mt-6 rounded-card border border-line bg-surface-raised p-5 shadow-soft">
            <h2 className="text-lg font-semibold text-ink">
              {t("gap.heading", { count: reading.gap.gapCount })}
            </h2>
            {reading.pace.days ? (
              <p className="mt-2 text-sm text-muted">
                {reading.pace.range
                  ? t("gap.paceRange", {
                      min: reading.pace.range.min,
                      max: reading.pace.range.max,
                    })
                  : t("gap.paceSingle", { days: reading.pace.days })}
              </p>
            ) : null}

            {reading.gapProgress && reading.gapProgress.total > 0 ? (
              <p className="mt-2 text-sm text-ink">
                {reading.gapProgress.held >= reading.gapProgress.total
                  ? t("gap.complete")
                  : t("gap.progress", {
                      held: reading.gapProgress.held,
                      total: reading.gapProgress.total,
                    })}
              </p>
            ) : null}

            <ol className="mt-4 list-none space-y-3">
              {reading.gap.lemmas.map((lemma) => (
                <li
                  key={lemma.lemma}
                  className="flex items-baseline justify-between gap-4 border-t border-line pt-3 first:border-t-0 first:pt-0"
                >
                  <div className="min-w-0">
                    <TextLink href={`${routes.words}?lemma=${encodeURIComponent(lemma.lemma)}`} tone="ink" size="sm">
                      {lemma.lemma}
                    </TextLink>
                    {lemma.gloss ? (
                      <p className="mt-1 text-sm text-muted">{lemma.gloss}</p>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-sm tabular-nums text-muted">
                    {t("gap.rank", { rank: lemma.frequencyRank })}
                  </p>
                </li>
              ))}
            </ol>

            {!reading.gapProgress || reading.gapProgress.held < reading.gapProgress.total ? (
              <form action={startGapSetAction.bind(null, reading.source.id)} className="mt-6">
                <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
                  {t("gap.learnSet")}
                </Button>
              </form>
            ) : null}
          </section>
        ) : null}

        {reading.gap.kind === "too-large" ? (
          <section className="mt-6 rounded-card border border-line bg-surface-raised p-5 shadow-soft">
            <p className="text-base leading-relaxed text-muted">
              {t("gap.tooLarge", { count: reading.gap.gapCount })}
            </p>
            {reading.gap.alternateSource ? (
              <TextLink
                href={routes.contentDetail(reading.gap.alternateSource.id)}
                className="mt-4 inline-flex"
              >
                {t("gap.alternate", { title: reading.gap.alternateSource.title })}
              </TextLink>
            ) : null}
          </section>
        ) : null}
      </article>
    </ShellPageContent>
  );
}

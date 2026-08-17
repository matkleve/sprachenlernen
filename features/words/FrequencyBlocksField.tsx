import { getTranslations } from "next-intl/server";

import type { FrequencyBlock } from "@/lib/frequency-blocks";
import { cn } from "@/lib/utils";

type FrequencyBlocksFieldProps = {
  blocks: readonly FrequencyBlock[];
};

const bucketStyles = {
  held: "text-success",
  fragile: "text-accent",
  new: "text-muted",
  holes: "text-muted",
} as const;

function isCoreBand(block: FrequencyBlock): boolean {
  return block.rankStart === 1;
}

export async function FrequencyBlocksField({ blocks }: FrequencyBlocksFieldProps) {
  const t = await getTranslations("words");

  return (
    <section className="mt-page-content">
      <h2 className="text-xl font-semibold text-ink">{t("blocksHeading")}</h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{t("blocksCaption")}</p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {blocks.map((block) => {
          const core = isCoreBand(block);
          const unreviewedKey = core ? ("holes" as const) : ("new" as const);
          const unreviewedLabel = core ? t("blockHoles") : t("newWords");
          const unreviewedDescription = core ? t("blockHolesDescription") : t("blockNewDescription");
          const rows = [
            { key: "held" as const, label: t("held"), value: block.held, description: t("blockHeldRowDescription") },
            {
              key: "fragile" as const,
              label: t("fragile"),
              value: block.fragile,
              description: t("blockFragileRowDescription"),
            },
            {
              key: unreviewedKey,
              label: unreviewedLabel,
              value: block.new,
              description: unreviewedDescription,
            },
          ];

          return (
            <div
              key={`${block.rankStart}-${block.rankEnd}`}
              className="rounded-card border border-line bg-surface p-4 shadow-soft"
              aria-label={t("blockBandAria", {
                start: block.rankStart,
                end: block.rankEnd,
                held: block.held,
                fragile: block.fragile,
                unreviewed: block.new,
                unreviewedLabel,
                poolSize: block.poolSize,
              })}
            >
              <dt className="text-sm font-medium text-muted">
                {t("blockLabel", { start: block.rankStart, end: block.rankEnd })}
              </dt>
              <dd className="mt-3 text-sm leading-relaxed text-muted">{t("blockPoolSize", { poolSize: block.poolSize })}</dd>
              <dd className="mt-4">
                <ul className="space-y-3">
                  {rows.map((row) => (
                    <li key={row.key} className="flex items-baseline justify-between gap-4">
                      <div>
                        <span className={cn("text-sm font-medium", bucketStyles[row.key])}>{row.label}</span>
                        <p className="mt-0.5 text-xs text-muted">{row.description}</p>
                      </div>
                      <span className="text-2xl font-semibold tabular-nums text-ink">{row.value}</span>
                    </li>
                  ))}
                </ul>
              </dd>
              <dd className="mt-4 border-t border-line pt-3 text-sm text-muted">
                {t("blockDistributionSummary", {
                  held: block.held,
                  fragile: block.fragile,
                  unreviewed: block.new,
                  unreviewedLabel: unreviewedLabel.toLowerCase(),
                  poolSize: block.poolSize,
                })}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

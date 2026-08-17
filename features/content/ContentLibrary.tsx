import { getTranslations } from "next-intl/server";

import { SurfaceLink } from "@/components/ui/SurfaceLink";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import type { SourceListItem } from "@/features/content/reading";
import { routes } from "@/lib/routes";

type ContentLibraryProps = {
  sources: readonly SourceListItem[];
};

function bandLabel(
  band: SourceListItem["comfortBand"],
  t: Awaited<ReturnType<typeof getTranslations<"contentTrace">>>,
) {
  if (band === "comfortable") return t("source.bandComfortable");
  if (band === "speed") return t("source.bandSpeed");
  return t("source.bandDemanding");
}

export async function ContentLibrary({ sources }: ContentLibraryProps) {
  const t = await getTranslations("contentTrace");

  return (
    <ShellPageContent width="wide">
      <p className="max-w-2xl text-base leading-relaxed text-muted">{t("library.caption")}</p>

      {sources.length === 0 ? (
        <p className="mt-6 text-base text-muted">{t("library.empty")}</p>
      ) : (
        <ul className="mt-6 list-none space-y-3">
          {sources.map((source) => (
            <li key={source.id}>
              <SurfaceLink
                href={routes.contentDetail(source.id)}
                className="border border-line bg-surface-raised p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-ink">{source.title}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {t(`library.origin.${source.origin}`)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-semibold tabular-nums text-ink">
                      {t("source.coverage", { pct: source.coveragePercent })}
                    </p>
                    <p className="mt-1 text-sm text-muted">{bandLabel(source.comfortBand, t)}</p>
                  </div>
                </div>
                {source.gapCount !== null ? (
                  <p className="mt-3 text-sm text-muted">
                    {t("library.gapSummary", { count: source.gapCount })}
                  </p>
                ) : null}
              </SurfaceLink>
            </li>
          ))}
        </ul>
      )}
    </ShellPageContent>
  );
}

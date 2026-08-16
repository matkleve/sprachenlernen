import { getTranslations } from "next-intl/server";

import { ActionLink } from "@/components/ui/ActionLink";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { ReviewHorizonField } from "@/features/words/ReviewHorizonField";
import { LemmaCallout } from "@/features/words/LemmaCallout";
import { WordsReviewCardHeader } from "@/features/words/WordsReviewCardHeader";
import { VocabularyOrbitField } from "@/features/words/VocabularyOrbitField";
import { cardEngineSessionHref } from "@/lib/method-session";
import type { FrequencyBlock } from "@/lib/frequency-blocks";
import type { HorizonDisplay } from "@/lib/review-horizon";
import { buildVocabularyOrbit } from "@/lib/vocabulary-orbit";
import type { VocabularySnapshot } from "@/lib/vocabulary-snapshot";
import { cn } from "@/lib/utils";
import { methodSectionSurface } from "@/features/method-menu/section-surface";

type WordsHomeProps = {
  snapshot: VocabularySnapshot;
  blocks: readonly FrequencyBlock[];
  languageCode: string;
  translations: Readonly<Record<string, string>>;
  horizonDisplay: HorizonDisplay;
  now: number;
};

const countCardStyles = {
  held: "border-success-soft bg-success-soft",
  fragile: "border-accent-soft bg-accent-soft",
  new: "border-line bg-surface",
} as const;

export async function WordsHome({
  snapshot,
  blocks,
  languageCode,
  translations,
  horizonDisplay,
  now,
}: WordsHomeProps) {
  const t = await getTranslations("words");
  const tReview = await getTranslations("reviewSession");
  const tShell = await getTranslations("appShell");
  const reviewHref = cardEngineSessionHref();
  const orbit = buildVocabularyOrbit(snapshot.atlas, translations);

  return (
    <ShellPageContent width="wide">
      <section className={methodSectionSurface("vocabulary", "rounded-card shadow-soft")}>
        {await WordsReviewCardHeader()}
        <div className="p-6">
          <p className="max-w-2xl text-base leading-relaxed text-muted">
            {tShell("holding.words.intent")}
          </p>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-ink">{t("reviewHeading")}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{t("reviewCaption")}</p>
            <ActionLink href={reviewHref} variant="primary" size="lg" className="mt-4 w-full sm:w-auto">
              {tReview("startReview")}
            </ActionLink>
          </div>
        </div>
      </section>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{t("countsHeading")}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{t("countsCaption")}</p>
        {await LemmaCallout()}
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          {(
            [
              {
                key: "held" as const,
                label: t("held"),
                value: snapshot.counts.held,
                description: t("heldDescription"),
              },
              {
                key: "fragile" as const,
                label: t("fragile"),
                value: snapshot.counts.fragile,
                description: t("fragileDescription"),
              },
              {
                key: "new" as const,
                label: t("newWords"),
                value: snapshot.counts.new,
                description: t("newDescription"),
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
        <h2 className="text-xl font-semibold text-ink">{t("blocksHeading")}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{t("blocksCaption")}</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {blocks.map((block) => (
            <div
              key={`${block.rankStart}-${block.rankEnd}`}
              className="rounded-card border border-line bg-surface p-4 shadow-soft"
            >
              <dt className="text-sm font-medium text-muted">
                {t("blockLabel", { start: block.rankStart, end: block.rankEnd })}
              </dt>
              <dd className="mt-2 text-3xl font-semibold text-ink">
                {t("blockHeld", { held: block.held, poolSize: block.poolSize })}
              </dd>
              <dd className="mt-2 text-sm text-muted">{t("blockHeldDescription")}</dd>
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

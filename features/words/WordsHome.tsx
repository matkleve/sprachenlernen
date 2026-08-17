import { getTranslations } from "next-intl/server";

import { ActionLink } from "@/components/ui/ActionLink";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { MethodCardHeader } from "@/features/method-menu/MethodCardHeader";
import { methodSectionSurface } from "@/features/method-menu/section-surface";
import { FrequencyBlocksField } from "@/features/words/FrequencyBlocksField";
import { ReviewHorizonField } from "@/features/words/ReviewHorizonField";
import { LemmaCallout } from "@/features/words/LemmaCallout";
import { WordsCountDefinitions } from "@/features/words/WordsCountDefinitions";
import { WordsReviewCardHeader } from "@/features/words/WordsReviewCardHeader";
import { WordsSectionLabel } from "@/features/words/WordsSectionLabel";
import { VocabularyOrbitField } from "@/features/words/VocabularyOrbitField";
import { cardEngineSessionHref } from "@/lib/method-session";
import type { FrequencyBlock } from "@/lib/frequency-blocks";
import type { HorizonDisplay } from "@/lib/review-horizon";
import { buildVocabularyOrbit } from "@/lib/vocabulary-orbit";
import type { VocabularySnapshot } from "@/lib/vocabulary-snapshot";
import type { ContentTraceIndex } from "@/lib/content-traceability";

type WordsHomeProps = {
  snapshot: VocabularySnapshot;
  blocks: readonly FrequencyBlock[];
  languageCode: string;
  translations: Readonly<Record<string, string>>;
  horizonDisplay: HorizonDisplay;
  now: number;
  contentTraceIndex: ContentTraceIndex | null;
};

const countTileClass =
  "rounded-card border border-line bg-surface p-4 shadow-soft";

export async function WordsHome({
  snapshot,
  blocks,
  languageCode,
  translations,
  horizonDisplay,
  now,
  contentTraceIndex,
}: WordsHomeProps) {
  const t = await getTranslations("words");
  const tReview = await getTranslations("reviewSession");
  const tShell = await getTranslations("appShell");
  const reviewHref = cardEngineSessionHref();
  const orbit = buildVocabularyOrbit(snapshot.atlas, translations);

  const countItems = [
    { key: "held", label: t("held"), value: snapshot.counts.held },
    { key: "fragile", label: t("fragile"), value: snapshot.counts.fragile },
    { key: "new", label: t("newWords"), value: snapshot.counts.new },
  ] as const;

  return (
    <ShellPageContent width="wide">
      <p className="max-w-2xl text-base leading-relaxed text-muted">
        {tShell("holding.words.intent")}
      </p>

      <section className={methodSectionSurface("vocabulary", "mt-6 rounded-card shadow-soft")}>
        {await WordsReviewCardHeader()}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-ink">{t("reviewHeading")}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{t("reviewCaption")}</p>
          <ActionLink href={reviewHref} variant="primary" size="lg" className="mt-4 w-full sm:w-auto">
            {tReview("startReview")}
          </ActionLink>
        </div>
      </section>

      <section className="mt-page-content">
        <WordsSectionLabel>{t("countsHeading")}</WordsSectionLabel>
        <section className={methodSectionSurface("vocabulary", "rounded-card shadow-soft")}>
          <MethodCardHeader section="vocabulary" />
          <div className="p-6">
            <p className="max-w-2xl text-base leading-relaxed text-muted">{t("countsCaption")}</p>
            {await LemmaCallout()}
            <dl className="mt-6 grid gap-3 sm:grid-cols-3" aria-label={t("countsHeading")}>
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

      {await FrequencyBlocksField({ blocks })}

      <ReviewHorizonField horizon={snapshot.horizon} display={horizonDisplay} now={now} />

      <div className="mt-page-content">
        <VocabularyOrbitField
          orbit={orbit}
          languageCode={languageCode}
          atlas={snapshot.atlas}
          translations={translations}
          now={now}
          contentTraceIndex={contentTraceIndex}
        />
      </div>
    </ShellPageContent>
  );
}

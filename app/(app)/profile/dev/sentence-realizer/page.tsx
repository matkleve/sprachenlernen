import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { SentenceRealizerDev } from "@/features/sentence-realizer-dev/SentenceRealizerDev";
import {
  loadSentencePlans,
  loadSpanishRealizerContext,
  pickShuffledPlan,
} from "@/lib/sentence-realizer/load-context";
import { renderSpanishPlanAllPersons } from "@/lib/sentence-realizer/realize-es";
import { getTranslations } from "next-intl/server";

function parseSeed(raw: string | string[] | undefined): number {
  if (typeof raw !== "string") return Math.floor(Math.random() * 1_000_000);
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Dev matrix for the Spanish sentence realizer. */
export default async function ProfileDevSentenceRealizerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const seed = parseSeed(params.seed);
  const t = await getTranslations("sentenceRealizerDev");

  const plans = loadSentencePlans("es");
  const plan = pickShuffledPlan(plans, seed);
  const ctx = loadSpanishRealizerContext();
  const variants = renderSpanishPlanAllPersons(plan, ctx);

  return (
    <ShellPageContent width="narrow">
      <SentenceRealizerDev
        plan={plan}
        variants={variants}
        seed={seed}
        copy={{
          eyebrow: t("eyebrow"),
          title: t("title"),
          description: t("description"),
          anotherSentence: t("anotherSentence"),
          back: t("back"),
          planLabel: t("planLabel"),
          tableCaption: t("tableCaption"),
          personColumn: t("personColumn"),
          cellColumn: t("cellColumn"),
          sentenceColumn: t("sentenceColumn"),
          partialWarning: t("partialWarning"),
        }}
      />
    </ShellPageContent>
  );
}

/**
 * Content library reading for signed-in learners. Contract:
 * docs/specs/feature/content-traceability.md (T-W8c)
 */
import { cookies } from "next/headers";

import { listLearnerSourcesForLanguage } from "@/lib/db/content-sources";
import { listReviewsForTaskIds } from "@/lib/db/review-log";
import { listTaskStatesForTaskIds } from "@/lib/db/task-state";
import { internalUnexpected, logHandledError, type HandledError } from "@/lib/errors";
import { getSpokenLanguage } from "@/lib/db/profiles";
import { poolForActiveLanguage } from "@/lib/db/learner-pools";
import { glossMapForLemmaCards } from "@/lib/localize-card-description";
import { isMeaningRecallTaskId } from "@/lib/form-recall-pool";
import {
  computeGapSet,
  dailyHeldLemmaCounts,
  estimateGapPace,
  heldLemmaSet,
  pickAlternateSource,
  type GapLemma,
  type GapPaceEstimate,
  type GapView,
} from "@/lib/content-gap";
import {
  computeCoverage,
  sourceText,
  type ComfortBand,
  type CoverageResult,
  type Source,
} from "@/lib/coverage";
import { parseGapSetCookie, GAP_SET_COOKIE } from "@/lib/gap-set-cookie";
import type { StarterCard } from "@/lib/starter-deck";
import { tasksByTaskIdForCards } from "@/lib/task-from-state";

import { loadLexiconForLanguage, loadPersistedSources } from "@/features/content/language-runtime";
import { loadPersistedAdaptationCache, loadPersonalAdaptationCache } from "@/lib/adaptation-cache";
import { parseAdaptationConsent, ADAPTATION_CONSENT_COOKIE } from "@/lib/adaptation-consent";
import { resolveSourceShownBody } from "@/lib/adaptation-shown-body";
import { comprehensionQuestionsForSource } from "@/lib/exercise-recipe/comprehension-questions";
import type { ComprehensionQuestion } from "@/lib/exercise-recipe/comprehension-questions";
import { sentenceBlocksForText, type ReadableSentenceBlock } from "@/lib/readable-sentences";

export type SourceListItem = {
  id: string;
  title: string;
  origin: Source["origin"];
  coveragePercent: number;
  comfortBand: ComfortBand;
  gapCount: number | null;
};

export type SourceDetailReading = {
  source: Source;
  coverage: CoverageResult;
  gap: GapView;
  pace: GapPaceEstimate;
  gapProgress: { held: number; total: number } | null;
  activeGapLemmas: readonly string[];
  textSentences: readonly ReadableSentenceBlock[] | null;
  comprehensionQuestions: readonly ComprehensionQuestion[];
  adapted: boolean;
  targetLevel: string;
  sourceUrl?: string;
};

export type ContentLibraryOutcome =
  | { status: "no-language" }
  | { status: "ok"; sources: SourceListItem[]; languageCode: string }
  | { status: "error"; error: HandledError };

export type SourceDetailOutcome =
  | { status: "no-language" }
  | { status: "not-found" }
  | { status: "ok"; reading: SourceDetailReading; languageCode: string }
  | { status: "error"; error: HandledError };

export async function readContentLibrary(): Promise<ContentLibraryOutcome> {
  try {
    return await readLibrary();
  } catch (cause) {
    return { status: "error", error: fail(cause) };
  }
}

export async function readSourceDetail(sourceId: string): Promise<SourceDetailOutcome> {
  try {
    return await readDetail(sourceId);
  } catch (cause) {
    return { status: "error", error: fail(cause) };
  }
}

async function readLibrary(): Promise<ContentLibraryOutcome> {
  const pool = await poolForActiveLanguage();
  if (pool.status === "no-language") return { status: "no-language" };
  if (pool.status === "error") return { status: "error", error: fail(new Error(pool.error)) };

  const languageCode = pool.languageCodes[0] ?? "es";
  const spoken = await getSpokenLanguage();
  if (spoken.status === "error") {
    return { status: "error", error: fail(new Error(spoken.error)) };
  }
  const bundle = await buildContentBundle(pool.cards, languageCode, spoken.spokenLanguage);
  if (!bundle) return { status: "ok", sources: [], languageCode };

  const sources = bundle.sources.map((source) => {
    const coverage = computeCoverage(sourceText(source), bundle.lexicon, bundle.heldLemmas);
    const gap = computeGapSet(sourceText(source), bundle.lexicon, bundle.heldLemmas, {
      glossForLemma: (lemma) => bundle.translations[lemma] ?? "",
    });
    return {
      id: source.id,
      title: source.title,
      origin: source.origin,
      coveragePercent: coverage.coveragePercent,
      comfortBand: coverage.comfortBand,
      gapCount: gap.kind === "list" || gap.kind === "too-large" ? gap.gapCount : null,
    };
  });

  return { status: "ok", sources, languageCode };
}

async function readDetail(sourceId: string): Promise<SourceDetailOutcome> {
  const pool = await poolForActiveLanguage();
  if (pool.status === "no-language") return { status: "no-language" };
  if (pool.status === "error") return { status: "error", error: fail(new Error(pool.error)) };

  const languageCode = pool.languageCodes[0] ?? "es";
  const spoken = await getSpokenLanguage();
  if (spoken.status === "error") {
    return { status: "error", error: fail(new Error(spoken.error)) };
  }
  const bundle = await buildContentBundle(pool.cards, languageCode, spoken.spokenLanguage);
  if (!bundle) return { status: "not-found" };

  const source = bundle.sources.find((entry) => entry.id === sourceId);
  if (!source) return { status: "not-found" };

  const cookieStore = await cookies();
  const gapSet = parseGapSetCookie(cookieStore.get(GAP_SET_COOKIE)?.value);
  const activeGapLemmas = gapSet?.sourceId === sourceId ? gapSet.lemmas : [];
  const processingConsent = parseAdaptationConsent(
    cookieStore.get(ADAPTATION_CONSENT_COOKIE)?.value,
  );

  const catalogueCache = loadPersistedAdaptationCache();
  const personalCache = loadPersonalAdaptationCache();
  const shown = resolveSourceShownBody(
    source,
    bundle.lexicon,
    bundle.heldLemmas,
    catalogueCache,
    personalCache,
    processingConsent,
  );
  const text = shown.body;
  const coverage = shown.coverage;
  let gap = computeGapSet(text, bundle.lexicon, bundle.heldLemmas, {
    glossForLemma: (lemma) => bundle.translations[lemma] ?? "",
  });

  if (gap.kind === "too-large") {
    const entries = bundle.sources.map((entry) => {
      const entryText = sourceText(entry);
      const entryCoverage = computeCoverage(entryText, bundle.lexicon, bundle.heldLemmas);
      const entryGap = computeGapSet(entryText, bundle.lexicon, bundle.heldLemmas);
      return {
        source: entry,
        coverage: entryCoverage,
        gapCount: entryGap.kind === "list" || entryGap.kind === "too-large" ? entryGap.gapCount : 0,
      };
    });
    gap = {
      ...gap,
      alternateSource: pickAlternateSource(entries, source.id),
    };
  }

  const pace = estimateGapPace(
    gap.kind === "list" ? gap.gapCount : gap.kind === "too-large" ? gap.gapCount : 0,
    bundle.dailyHeldCounts,
  );

  const gapProgress =
    activeGapLemmas.length > 0
      ? {
          held: activeGapLemmas.filter((lemma) => bundle.heldLemmas.has(lemma)).length,
          total: activeGapLemmas.length,
        }
      : gap.kind === "list"
        ? {
            held: gap.lemmas.filter((lemma) => bundle.heldLemmas.has(lemma.lemma)).length,
            total: gap.lemmas.length,
          }
        : null;

  return {
    status: "ok",
    languageCode,
    reading: {
      source,
      coverage,
      gap,
      pace,
      gapProgress,
      activeGapLemmas,
      textSentences:
        source.kind === "text" && text.trim() !== ""
          ? sentenceBlocksForText(text, bundle.lexicon, (lemma) => bundle.translations[lemma] ?? "")
          : null,
      comprehensionQuestions:
        source.kind === "text" ? comprehensionQuestionsForSource(source.id) : [],
      adapted: shown.adapted,
      targetLevel: shown.targetLevel,
      sourceUrl: shown.sourceUrl,
    },
  };
}

type ContentBundle = {
  sources: Source[];
  lexicon: NonNullable<ReturnType<typeof loadLexiconForLanguage>>;
  heldLemmas: Set<string>;
  translations: Readonly<Record<string, string>>;
  dailyHeldCounts: number[];
};

async function persistedSourcesForLanguage(languageCode: string): Promise<Source[]> {
  const fixture = loadPersistedSources(languageCode);
  const learner = await listLearnerSourcesForLanguage(languageCode);
  if (learner.status !== "ok") return fixture;
  return [...fixture, ...learner.sources];
}

async function buildContentBundle(
  cards: readonly StarterCard[],
  languageCode: string,
  spokenLanguage: string,
): Promise<ContentBundle | null> {
  const sources = await persistedSourcesForLanguage(languageCode);
  const lexicon = loadLexiconForLanguage(languageCode);
  if (!lexicon || sources.length === 0) return null;

  const meaningCards = cards.filter((card) => isMeaningRecallTaskId(card.taskId));
  const statesResult = await listTaskStatesForTaskIds(meaningCards.map((card) => card.taskId));
  if (statesResult.status === "error") {
    throw new Error(statesResult.error);
  }

  const tasksByTaskId = tasksByTaskIdForCards(meaningCards, statesResult.rows);
  const heldLemmas = heldLemmaSet(meaningCards, tasksByTaskId);
  const translations = glossMapForLemmaCards(meaningCards, spokenLanguage);

  const reviewsResult = await listReviewsForTaskIds(meaningCards.map((card) => card.taskId));
  if (reviewsResult.status === "error") {
    throw new Error(reviewsResult.error);
  }

  const dailyHeldCounts = dailyHeldLemmaCounts(meaningCards, reviewsResult.reviews, Date.now());

  return {
    sources,
    lexicon,
    heldLemmas,
    translations,
    dailyHeldCounts,
  };
}

function fail(cause: unknown): HandledError {
  const error = internalUnexpected(cause, {
    feature: "content",
    operation: "load your content library",
  });
  logHandledError(error);
  return error;
}

export type { GapLemma, GapView };

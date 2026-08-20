import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { WordsHome } from "@/features/words/WordsHome";
import { wordsReviewGraphicAlt, wordsReviewGraphicSrc } from "@/features/words/words-home-graphic";
import { DEFAULT_FREQUENCY_BANDS } from "@/lib/frequency-blocks";
import { buildHorizonDisplay } from "@/lib/review-horizon";
import type { VocabularySnapshot } from "@/lib/vocabulary-snapshot";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

const now = Date.UTC(2026, 7, 12);
const DAY_MS = 86_400_000;

const emptySnapshot: VocabularySnapshot = {
  counts: { held: 0, fragile: 0, new: 50 },
  horizon: Array.from({ length: 30 }, (_, dayOffset) => ({ dayOffset, count: 0 })),
  atlas: [
    {
      lemma: "de",
      taskId: "es:de:meaning-recall",
      frequencyRank: 1,
      stability: null,
      bucket: "new",
      mature: false,
      taskState: "new",
      due: now,
      lastGrade: null,
      reviewCount: 0,
    },
  ],
};

const sampleBlocks = DEFAULT_FREQUENCY_BANDS.map((band, index) => ({
  ...band,
  poolSize: index === 0 ? 1000 : 500,
  held: index === 0 ? 12 : 3,
  fragile: index === 0 ? 5 : 1,
  new: index === 0 ? 983 : 496,
}));

const homeProps = {
  snapshot: emptySnapshot,
  blocks: sampleBlocks,
  languageCode: "es",
  translations: { de: "of, from" },
  horizonDisplay: buildHorizonDisplay(
    emptySnapshot.horizon,
    now,
    {
      reviewTimestamps: [
        now - 30 * DAY_MS,
        now - DAY_MS,
        now - 2 * DAY_MS,
        now - 3 * DAY_MS,
        now - 4 * DAY_MS,
        now - 5 * DAY_MS,
      ],
      firstReviewByTaskId: new Map([["t1", now - 30 * DAY_MS]]),
    },
    [],
  ),
  now,
  contentTraceIndex: null,
  formsPracticeAvailable: true,
};

async function renderWordsHome() {
  return render(await WordsHome(homeProps));
}

describe("WordsHome", () => {
  it("offers one start review link to a mixed deck without a due count", async () => {
    await renderWordsHome();
    const startLink = screen.getByRole("link", { name: en.words.reviewStartAction });
    expect(startLink.getAttribute("href")).toContain("method=srs-session");
    expect(startLink.getAttribute("href")).not.toContain("deck=");
    expect(screen.queryByRole("link", { name: en.words.reviewMixedAction })).toBeNull();
    expect(screen.queryByText(/\d+\s+due/i)).toBeNull();
    expect(screen.getByRole("heading", { name: en.words.reviewHeading })).toBeDefined();
    expect(screen.getAllByLabelText(en.words.paradigmCellCalloutTitle).length).toBeGreaterThan(0);
    const reviewCard = screen.getByRole("heading", { name: en.words.reviewHeading }).closest("section");
    expect(reviewCard).toBeDefined();
    const headerImage = within(reviewCard as HTMLElement).getByRole("img", {
      name: wordsReviewGraphicAlt(en.words.reviewCardHeaderLabel),
    });
    expect(headerImage.getAttribute("src")).toContain(wordsReviewGraphicSrc);
    expect(screen.queryByRole("heading", { name: en.words.reviewFormsHeading })).toBeNull();
  });

  it("explains that held counts meaning recall and what a lemma is", async () => {
    const user = userEvent.setup();
    await renderWordsHome();
    expect(screen.getByText(en.words.countsCaption)).toBeDefined();
    expect(screen.getAllByLabelText(en.words.lemmaCalloutTitle).length).toBeGreaterThan(0);
    expect(screen.getAllByText(en.words.lemmaCalloutBody).length).toBeGreaterThan(0);
    await user.click(screen.getByText(en.words.countsDefinitionsSummary));
    expect(screen.getByText(en.words.heldDescription)).toBeDefined();
  });

  it("shows count numbers on the card face without per-tile descriptions", async () => {
    await renderWordsHome();
    const countGrid = screen.getByLabelText(en.words.countsHeading);
    const heldTile = within(countGrid).getByText(en.words.held).closest("div");
    expect(heldTile?.textContent).not.toContain("reliably recall");
    expect(heldTile?.textContent).not.toContain("not yet stable");
  });

  it("renders held, fragile, new, bands, horizon and vocabulary orbit", async () => {
    await renderWordsHome();
    expect(screen.getByRole("heading", { name: en.words.countsHeading })).toBeDefined();
    expect(screen.getByRole("heading", { name: en.words.blocksHeading })).toBeDefined();
    expect(screen.getByRole("heading", { name: en.words.horizonHeading })).toBeDefined();
    expect(screen.getByRole("button", { name: en.words.horizonExpand })).toBeDefined();
    expect(screen.getByRole("heading", { name: en.words.orbitHeading })).toBeDefined();
    expect(screen.getByRole("img", { name: en.words.orbitAriaLabel })).toBeDefined();
  });

  it("shows the full band distribution with holes in the core band", async () => {
    await renderWordsHome();

    expect(
      screen.getByLabelText(
        formatMessage(en.words.blockBandAria, {
          start: 1,
          end: 1000,
          held: 12,
          fragile: 5,
          unreviewed: 983,
          unreviewedLabel: en.words.blockHoles,
          poolSize: 1000,
        }),
      ),
    ).toBeDefined();
    expect(screen.getByText(en.words.blockHoles)).toBeDefined();
    expect(
      screen.getByText(
        formatMessage(en.words.blockDistributionSummary, {
          held: 12,
          fragile: 5,
          unreviewed: 983,
          unreviewedLabel: en.words.blockHoles.toLowerCase(),
          poolSize: 1000,
        }),
      ),
    ).toBeDefined();
    expect(
      screen.getByLabelText(
        formatMessage(en.words.blockBandAria, {
          start: 1001,
          end: 2000,
          held: 3,
          fragile: 1,
          unreviewed: 496,
          unreviewedLabel: en.words.newWords,
          poolSize: 500,
        }),
      ),
    ).toBeDefined();
  });

  it("fits the collapsed horizon summary in the content width without horizontal scroll", async () => {
    const { container } = await renderWordsHome();

    expect(screen.getByRole("button", { name: en.words.horizonExpand })).toBeDefined();
    expect(container.querySelector(".overflow-x-auto")).toBeNull();
  });

  it("uses a four-column week row when the horizon is expanded", async () => {
    const user = userEvent.setup();
    await renderWordsHome();

    await user.click(screen.getByRole("button", { name: en.words.horizonExpand }));

    expect(screen.getByRole("group", { name: en.words.horizonCaption })).toBeDefined();
    expect(screen.getAllByText(formatMessage(en.words.horizonWeekLabel, { week: 1 })).length).toBeGreaterThan(0);
    expect(screen.getAllByText(formatMessage(en.words.horizonWeekLabel, { week: 4 })).length).toBeGreaterThan(0);
  });

  it("opens the full word list from the quiet show-list control", async () => {
    const user = userEvent.setup();
    await renderWordsHome();

    await user.click(screen.getByRole("button", { name: en.words.orbitShowList }));

    expect(screen.getByRole("dialog", { name: en.words.orbitListTitle })).toBeDefined();
    expect(screen.getByRole("rowheader", { name: "de" })).toBeDefined();
  });

  it("shows the upgraded detail card when a word segment is selected", async () => {
    const user = userEvent.setup();
    await renderWordsHome();

    await user.click(screen.getByRole("button", { name: /de, rank 1/i }));

    const detailCard = screen.getByRole("heading", { name: "de" }).closest("article");
    expect(detailCard).toBeDefined();
    expect(screen.getByText("of, from")).toBeDefined();
    expect(detailCard?.textContent).toContain(en.words.bucketNames.new);
  });
});

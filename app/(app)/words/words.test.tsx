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
      frequencyRank: 1,
      stability: null,
      bucket: "new",
      mature: false,
    },
  ],
};

const emptyBlocks = DEFAULT_FREQUENCY_BANDS.map((band) => ({
  ...band,
  poolSize: 0,
  held: 0,
  fragile: 0,
  new: 0,
}));

const homeProps = {
  snapshot: emptySnapshot,
  blocks: emptyBlocks,
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
};

async function renderWordsHome() {
  return render(await WordsHome(homeProps));
}

describe("WordsHome", () => {
  it("offers a start review link without a due count", async () => {
    await renderWordsHome();
    const link = screen.getByRole("link", { name: en.reviewSession.startReview });
    expect(link.getAttribute("href")).toContain("method=srs-session");
    expect(screen.queryByText(/\d+\s+due/i)).toBeNull();
    expect(screen.getByRole("heading", { name: en.words.reviewHeading })).toBeDefined();
    const reviewCard = screen.getByRole("heading", { name: en.words.reviewHeading }).closest("section");
    expect(reviewCard).toBeDefined();
    const headerImage = within(reviewCard as HTMLElement).getByRole("img", {
      name: wordsReviewGraphicAlt(en.words.reviewCardHeaderLabel),
    });
    expect(headerImage.getAttribute("src")).toContain(
      encodeURIComponent(wordsReviewGraphicSrc),
    );
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

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { copy as reviewCopy } from "@/features/review-session/content";
import { copy } from "@/features/words/content";
import { WordsHome } from "@/features/words/WordsHome";
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

describe("WordsHome", () => {
  it("offers a start review link without a due count", () => {
    render(<WordsHome {...homeProps} />);
    const link = screen.getByRole("link", { name: reviewCopy.startReview });
    expect(link.getAttribute("href")).toContain("method=srs-session");
    expect(screen.queryByText(/\d+\s+due/i)).toBeNull();
    expect(screen.getByRole("heading", { name: copy.reviewHeading })).toBeDefined();
  });

  it("renders held, fragile, new, bands, horizon and vocabulary orbit", () => {
    render(<WordsHome {...homeProps} />);
    expect(screen.getByRole("heading", { name: copy.countsHeading })).toBeDefined();
    expect(screen.getByRole("heading", { name: copy.blocksHeading })).toBeDefined();
    expect(screen.getByRole("heading", { name: copy.horizonHeading })).toBeDefined();
    expect(screen.getByRole("button", { name: copy.horizonExpand })).toBeDefined();
    expect(screen.getByRole("heading", { name: copy.orbitHeading })).toBeDefined();
    expect(screen.getByRole("img", { name: copy.orbitAriaLabel })).toBeDefined();
  });

  it("fits the collapsed horizon summary in the content width without horizontal scroll", () => {
    const { container } = render(<WordsHome {...homeProps} />);

    expect(screen.getByRole("button", { name: copy.horizonExpand })).toBeDefined();
    expect(container.querySelector(".overflow-x-auto")).toBeNull();
  });

  it("uses a four-column week row when the horizon is expanded", async () => {
    const user = userEvent.setup();
    render(<WordsHome {...homeProps} />);

    await user.click(screen.getByRole("button", { name: copy.horizonExpand }));

    expect(screen.getByRole("group", { name: copy.horizonCaption })).toBeDefined();
    expect(screen.getAllByText(copy.horizonWeekLabel(1)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(copy.horizonWeekLabel(4)).length).toBeGreaterThan(0);
  });

  it("opens the full word list from the quiet show-list control", async () => {
    const user = userEvent.setup();
    render(<WordsHome {...homeProps} />);

    await user.click(screen.getByRole("button", { name: copy.orbitShowList }));

    expect(screen.getByRole("dialog", { name: copy.orbitListTitle })).toBeDefined();
    expect(screen.getByRole("rowheader", { name: "de" })).toBeDefined();
  });

  it("shows the upgraded detail card when a word segment is selected", async () => {
    const user = userEvent.setup();
    render(<WordsHome {...homeProps} />);

    await user.click(screen.getByRole("button", { name: /de, rank 1/i }));

    const detailCard = screen.getByRole("heading", { name: "de" }).closest("article");
    expect(detailCard).toBeDefined();
    expect(screen.getByText("of, from")).toBeDefined();
    expect(detailCard?.textContent).toContain(copy.bucketNames.new);
  });
});

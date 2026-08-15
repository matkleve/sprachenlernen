import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { copy as reviewCopy } from "@/features/review-session/content";
import { copy } from "@/features/words/content";
import { WordsHome } from "@/features/words/WordsHome";
import { DEFAULT_FREQUENCY_BANDS } from "@/lib/frequency-blocks";
import type { VocabularySnapshot } from "@/lib/vocabulary-snapshot";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

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
};

describe("WordsHome", () => {
  it("offers a start review link without a due count", () => {
    render(<WordsHome {...homeProps} />);
    const link = screen.getByRole("link", { name: reviewCopy.startReview });
    expect(link.getAttribute("href")).toContain("method=srs-session");
    expect(screen.queryByText(/\d+\s+due/i)).toBeNull();
    expect(screen.getByRole("heading", { name: copy.reviewHeading })).toBeDefined();
  });

  it("explains that held counts meaning recall and what a lemma is", () => {
    render(<WordsHome {...homeProps} />);
    expect(screen.getByText(copy.countsCaption)).toBeDefined();
    expect(screen.getByLabelText(copy.lemmaCalloutTitle)).toBeDefined();
    expect(screen.getByText(copy.lemmaCalloutBody)).toBeDefined();
    expect(screen.getByText(copy.heldDescription)).toBeDefined();
  });

  it("renders held, fragile, new, bands, horizon and vocabulary orbit", () => {
    const { container } = render(<WordsHome {...homeProps} />);
    expect(screen.getByRole("heading", { name: copy.countsHeading })).toBeDefined();
    expect(screen.getByRole("heading", { name: copy.blocksHeading })).toBeDefined();
    expect(screen.getByRole("heading", { name: copy.horizonHeading })).toBeDefined();
    expect(screen.getByRole("heading", { name: copy.orbitHeading })).toBeDefined();
    expect(screen.getByRole("img", { name: copy.orbitAriaLabel })).toBeDefined();
    const bars = container.querySelectorAll('[role="img"] .rounded-pill');
    expect(bars.length).toBe(30);
  });

  it("opens the full word list from the quiet show-list control", async () => {
    const user = userEvent.setup();
    render(<WordsHome {...homeProps} />);

    await user.click(screen.getByRole("button", { name: copy.orbitShowList }));

    expect(screen.getByRole("dialog", { name: copy.orbitListTitle })).toBeDefined();
    expect(screen.getByRole("rowheader", { name: "de" })).toBeDefined();
  });
});

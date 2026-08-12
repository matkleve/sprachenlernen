import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { copy as reviewCopy } from "@/features/review-session/content";
import { copy } from "@/features/words/content";
import { WordsHome } from "@/features/words/WordsHome";
import { SHIPPED_ES_POOL_SIZE } from "@/lib/starter-deck";
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

describe("WordsHome", () => {
  it("offers a start review link without a due count", () => {
    render(<WordsHome snapshot={emptySnapshot} blocks={emptyBlocks} />);
    const link = screen.getByRole("link", { name: reviewCopy.startReview });
    expect(link.getAttribute("href")).toContain("method=srs-session");
    expect(screen.queryByText(/\d+\s+due/i)).toBeNull();
  });

  it("renders held, fragile, new, bands, horizon and atlas sections", () => {
    const { container } = render(<WordsHome snapshot={emptySnapshot} blocks={emptyBlocks} />);
    expect(screen.getByRole("heading", { name: copy.countsHeading })).toBeDefined();
    expect(screen.getByRole("heading", { name: copy.blocksHeading })).toBeDefined();
    expect(screen.getByRole("heading", { name: copy.horizonHeading })).toBeDefined();
    expect(screen.getByRole("heading", { name: copy.atlasHeading })).toBeDefined();
    const bars = container.querySelectorAll('[role="img"] .rounded-pill');
    expect(bars.length).toBe(30);
  });

  it("caps the atlas and says how much of the deck it is showing", () => {
    const snapshot: VocabularySnapshot = {
      ...emptySnapshot,
      atlas: Array.from({ length: SHIPPED_ES_POOL_SIZE }, (_, index) => ({
        lemma: `lemma-${index}`,
        frequencyRank: index + 1,
        stability: null,
        bucket: "new" as const,
        mature: false,
      })),
    };

    const { container } = render(<WordsHome snapshot={snapshot} blocks={emptyBlocks} />);

    // Truncating silently would read as a smaller deck than the counts above
    // the table claim, which is the one thing this page may not do.
    expect(container.querySelectorAll("tbody tr").length).toBe(100);
    expect(screen.getByText(copy.atlasTruncated(100, SHIPPED_ES_POOL_SIZE))).toBeDefined();
    expect(screen.getByText("lemma-0")).toBeDefined();
    expect(screen.queryByText("lemma-100")).toBeNull();
  });

  it("says nothing about truncation when the whole deck fits", () => {
    render(<WordsHome snapshot={emptySnapshot} blocks={emptyBlocks} />);
    expect(screen.queryByText(/Showing the/)).toBeNull();
  });
});

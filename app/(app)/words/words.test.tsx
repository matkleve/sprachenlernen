import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { copy as reviewCopy } from "@/features/review-session/content";
import { copy } from "@/features/words/content";
import { WordsHome } from "@/features/words/WordsHome";
import type { VocabularySnapshot } from "@/lib/vocabulary-snapshot";

const emptySnapshot: VocabularySnapshot = {
  counts: { held: 0, shaky: 0, new: 50 },
  horizon: Array.from({ length: 30 }, (_, dayOffset) => ({ dayOffset, count: 0 })),
  atlas: [
    {
      lemma: "de",
      frequencyRank: 1,
      stability: null,
      bucket: "new",
    },
  ],
};

describe("WordsHome", () => {
  it("offers a start review link without a due count", () => {
    render(<WordsHome snapshot={emptySnapshot} />);
    const link = screen.getByRole("link", { name: reviewCopy.startReview });
    expect(link.getAttribute("href")).toContain("method=srs-session");
    expect(screen.queryByText(/\d+\s+due/i)).toBeNull();
  });

  it("renders held, shaky, new, horizon and atlas sections", () => {
    render(<WordsHome snapshot={emptySnapshot} />);
    expect(screen.getByRole("heading", { name: copy.countsHeading })).toBeDefined();
    expect(screen.getByRole("heading", { name: copy.horizonHeading })).toBeDefined();
    expect(screen.getByRole("heading", { name: copy.atlasHeading })).toBeDefined();
  });
});

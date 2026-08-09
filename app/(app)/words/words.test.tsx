import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import WordsPage from "@/app/(app)/words/page";
import { copy } from "@/features/review-session/content";

describe("WordsPage", () => {
  it("offers a start review link without a due count", () => {
    render(<WordsPage />);
    const link = screen.getByRole("link", { name: copy.startReview });
    expect(link.getAttribute("href")).toContain("method=srs-session");
    expect(screen.queryByText(/\d+\s+due/i)).toBeNull();
  });
});

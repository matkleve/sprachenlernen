import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import WordsReviewPage from "@/app/(app)/words/review/page";
import { copy } from "@/features/review-session/content";

vi.mock("@/features/review-session/ReviewSession", () => ({
  ReviewSession: ({ methodName }: { methodName: string }) => (
    <div data-testid="review-session">{methodName}</div>
  ),
}));

describe("WordsReviewPage", () => {
  it("mounts the review session for srs-session without reading the catalogue", async () => {
    const page = await WordsReviewPage({ searchParams: Promise.resolve({ method: "srs-session" }) });
    render(page);
    expect(screen.getByTestId("review-session")).toBeDefined();
    expect(screen.getByText(copy.srsSessionName)).toBeDefined();
  });

  it("shows unknown-method copy when method is missing", async () => {
    const page = await WordsReviewPage({ searchParams: Promise.resolve({}) });
    render(page);
    expect(screen.getByText(copy.unknownMethod)).toBeDefined();
  });
});

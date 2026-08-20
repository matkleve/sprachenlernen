import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import {screen} from "@testing-library/react";

import { describe, expect, it, vi } from "vitest";

import WordsReviewPage from "@/app/(app)/words/review/page";

vi.mock("@/features/review-session/ReviewSession", () => ({
  ReviewSession: ({
    methodName,
    initialData,
  }: {
    methodName: string;
    initialData?: { status: string; queue?: unknown[] };
  }) => (
    <div data-testid="review-session">
      <span>{methodName}</span>
      {initialData?.status === "ok" ? (
        <span data-testid="queue-ready">{initialData.queue?.length ?? 0}</span>
      ) : null}
    </div>
  ),
}));

vi.mock("@/features/review-session/actions", () => ({
  buildSessionAction: vi.fn().mockResolvedValue({
    status: "ok",
    languageName: "Spanish",
    sessionLoopContext: {
      heldLemmasAtStart: [],
      meaningTasksByTaskId: {},
    },
    queue: [{ taskId: "es:de:meaning-recall" }],
  }),
}));

describe("WordsReviewPage", () => {
  it("mounts the review session for srs-session with a server-built queue", async () => {
    const page = await WordsReviewPage({ searchParams: Promise.resolve({ method: "srs-session" }) });
    render(page);
    expect(screen.getByTestId("review-session")).toBeDefined();
    expect(screen.getByText(en.reviewSession.srsSessionName)).toBeDefined();
    expect(screen.getByTestId("queue-ready").textContent).toBe("1");
  });

  it("shows unknown-method copy when method is missing", async () => {
    const page = await WordsReviewPage({ searchParams: Promise.resolve({}) });
    render(page);
    expect(screen.getByText(en.reviewSession.unknownMethod)).toBeDefined();
  });
});

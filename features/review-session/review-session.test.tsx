import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import {screen, waitFor} from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  appendReviewAction,
  buildSessionAction,
} from "@/features/review-session/actions";
import { ReviewSession } from "@/features/review-session/ReviewSession";
import {
  createInMemoryReviewQueueStorage,
  createReviewWriteQueue,
} from "@/lib/db/review-write-queue";
import { setReviewQueueForTests } from "@/features/review-session/review-queue";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock("@/features/review-session/actions", () => ({
  appendReviewAction: vi.fn().mockResolvedValue({ status: "appended", id: "row-1" }),
  reportCardAction: vi.fn().mockResolvedValue({ status: "ok" }),
  buildSessionAction: vi.fn().mockResolvedValue({
    status: "ok",
    languageName: "Spanish",
    queue: [
      {
        taskId: "es:de:meaning-recall",
        wordId: "es:de",
        lemma: "de",
        front: "de",
        back: "of, from",
        frequencyRank: 1,
        position: 1,
        total: 2,
      },
      {
        taskId: "es:que:meaning-recall",
        wordId: "es:que",
        lemma: "que",
        front: "que",
        back: "that, which",
        frequencyRank: 2,
        position: 2,
        total: 2,
      },
    ],
  }),
}));

vi.mock("@/lib/installation-id", () => ({
  getInstallationId: vi.fn().mockReturnValue("11111111-1111-4111-8111-111111111111"),
}));

function installTestQueue() {
  const queue = createReviewWriteQueue({
    storage: createInMemoryReviewQueueStorage(),
    flush: (input) =>
      appendReviewAction({
        reviewId: input.reviewId,
        taskId: input.taskId,
        grade: input.grade,
        reviewedAtMs: input.reviewedAtMs,
        latencyMs: input.latencyMs,
        installationId: input.installationId,
      }).then((result) =>
        result.status === "appended"
          ? { status: "appended" as const }
          : { status: "error" as const, error: result.error },
      ),
  });
  setReviewQueueForTests(queue);
  return queue;
}

const testInitialData = {
  status: "ok" as const,
  languageName: "Spanish",
  queue: [
    {
      taskId: "es:de:meaning-recall",
      wordId: "es:de",
      lemma: "de",
      front: "de",
      back: "of, from",
      frequencyRank: 1,
      position: 1,
      total: 2,
    },
    {
      taskId: "es:que:meaning-recall",
      wordId: "es:que",
      lemma: "que",
      front: "que",
      back: "that, which",
      frequencyRank: 2,
      position: 2,
      total: 2,
    },
  ],
};

describe("ReviewSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(appendReviewAction).mockResolvedValue({ status: "appended", id: "row-1" });
    installTestQueue();
  });

  it("renders the first card immediately when the queue is server-built", () => {
    render(
      <ReviewSession
        methodName="Spaced repetition session"
        initialData={testInitialData}
      />,
    );

    expect(screen.getByText("de")).toBeDefined();
    expect(screen.queryByText(en.reviewSession.loading)).toBeNull();
  });

  it("shows the first card with grades, flips on tap, then persists a grade", async () => {
    const user = userEvent.setup();
    render(
      <ReviewSession
        methodName="Spaced repetition session"
        initialData={testInitialData}
      />,
    );

    expect(screen.getByText("de")).toBeDefined();

    expect(screen.getByText("Spanish")).toBeDefined();
    expect(screen.getByRole("button", { name: en.reviewSession.good })).toBeDefined();

    await user.click(screen.getByRole("button", { name: en.reviewSession.flipHint }));

    await waitFor(() => {
      expect(screen.getByText("of, from")).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: en.reviewSession.good }));

    await waitFor(() => {
      expect(appendReviewAction).toHaveBeenCalledWith(
        expect.objectContaining({
          taskId: "es:de:meaning-recall",
          grade: "good",
          installationId: "11111111-1111-4111-8111-111111111111",
          latencyMs: expect.any(Number),
          reviewId: expect.any(String),
        }),
      );
    });
  });

  it("grades without flipping when the learner is confident", async () => {
    const user = userEvent.setup();
    render(<ReviewSession methodName="Spaced repetition session" />);

    await waitFor(() => expect(screen.getByText("de")).toBeDefined());
    expect(screen.queryByText("of, from")).toBeNull();

    await user.click(screen.getByRole("button", { name: en.reviewSession.good }));

    await waitFor(() => {
      expect(appendReviewAction).toHaveBeenCalledWith(
        expect.objectContaining({
          taskId: "es:de:meaning-recall",
          grade: "good",
        }),
      );
      expect(screen.getByText("que")).toBeDefined();
    });
  });

  it("advances before persistence completes and shows retry on failure", async () => {
    let resolveAppend: (value: { status: "appended"; id: string }) => void;
    vi.mocked(appendReviewAction).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAppend = resolve;
        }),
    );

    const user = userEvent.setup();
    render(
      <ReviewSession
        methodName="Spaced repetition session"
        initialData={testInitialData}
      />,
    );

    expect(screen.getByText("de")).toBeDefined();
    await user.click(screen.getByRole("button", { name: en.reviewSession.flipHint }));
    await user.click(screen.getByRole("button", { name: en.reviewSession.good }));

    await waitFor(() => expect(screen.getByText("que")).toBeDefined());
    resolveAppend!({ status: "appended", id: "row-1" });
  });

  it("shows sync retry when persistence fails after advancing", async () => {
    setReviewQueueForTests({
      subscribe(listener) {
        listener({
          pending: 0,
          failed: 1,
          lastError: en.reviewSession.syncFailed,
          pendingSince: null,
        });
        return () => {};
      },
      enqueue: vi.fn().mockResolvedValue(undefined),
      flushAll: vi.fn().mockResolvedValue(undefined),
      retryFailed: vi.fn().mockResolvedValue(undefined),
      getState: () => ({
        pending: 0,
        failed: 1,
        lastError: en.reviewSession.syncFailed,
        pendingSince: null,
      }),
    });

    const user = userEvent.setup();
    render(
      <ReviewSession
        methodName="Spaced repetition session"
        initialData={testInitialData}
      />,
    );

    expect(screen.getByText("de")).toBeDefined();
    await user.click(screen.getByRole("button", { name: en.reviewSession.flipHint }));
    await user.click(screen.getByRole("button", { name: en.reviewSession.good }));

    await waitFor(() => expect(screen.getByText(en.reviewSession.syncFailed)).toBeDefined());
    expect(screen.getByText("que")).toBeDefined();
  });

  it("shows a load error when the queue cannot be built", () => {
    render(
      <ReviewSession
        methodName="Spaced repetition session"
        initialData={{ status: "error", error: "Not signed in." }}
      />,
    );

    expect(screen.getByText("Not signed in.")).toBeDefined();
    const back = screen.getByRole("link", { name: new RegExp(en.reviewSession.backToMethods) });
    expect(back.className).toContain("hidden");
    expect(back.className).toContain("md:inline-block");
  });

  it("shows inline load error when the server action rejects", async () => {
    vi.mocked(buildSessionAction).mockRejectedValueOnce(new Error("server action failed"));

    render(<ReviewSession methodName="Spaced repetition session" />);

    await waitFor(() => {
      expect(screen.getByText(en.reviewSession.loadError)).toBeDefined();
    });
    expect(screen.queryByText("Could not start your review session.")).toBeNull();
  });

  it("ends in the session summary with no grade buttons once the last card is graded", async () => {
    const user = userEvent.setup();
    render(
      <ReviewSession
        methodName="Spaced repetition session"
        initialData={testInitialData}
      />,
    );

    expect(screen.getByText("de")).toBeDefined();
    await user.click(screen.getByRole("button", { name: en.reviewSession.flipHint }));
    await user.click(screen.getByRole("button", { name: en.reviewSession.good }));

    await waitFor(() => expect(screen.getByText("que")).toBeDefined());
    await user.click(screen.getByRole("button", { name: en.reviewSession.flipHint }));
    await user.click(screen.getByRole("button", { name: en.reviewSession.good }));

    await waitFor(() => expect(screen.getByText(en.reviewSession.completeTitle)).toBeDefined());

    for (const grade of [en.reviewSession.again, en.reviewSession.hard, en.reviewSession.good, en.reviewSession.easy]) {
      expect(screen.queryByRole("button", { name: grade }), `${grade} must be gone`).toBeNull();
    }
    expect(screen.getByText(formatMessage(en.reviewSession.completeBody, { count: 2 }))).toBeDefined();
  });

  it("never shows a due count, a backlog figure or a badge", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ReviewSession
        methodName="Spaced repetition session"
        initialData={testInitialData}
      />,
    );

    expect(screen.getByText("de")).toBeDefined();

    const forbidden = /\bdue\b|\bbacklog\b|\boverdue\b|\bremaining\b|\bleft to\b/i;

    const leafText = () =>
      Array.from(container.querySelectorAll("*"))
        .filter((element) => element.children.length === 0)
        .map((element) => element.textContent?.trim() ?? "")
        .filter(Boolean)
        .join(" | ");

    expect(leafText()).not.toMatch(forbidden);
    expect(screen.getByText(formatMessage(en.reviewSession.progress, { position: 1, total: 2 }))).toBeDefined();

    await user.click(screen.getByRole("button", { name: en.reviewSession.flipHint }));
    await user.click(screen.getByRole("button", { name: en.reviewSession.good }));
    await waitFor(() => expect(screen.getByText("que")).toBeDefined());
    expect(leafText()).not.toMatch(forbidden);

    await user.click(screen.getByRole("button", { name: en.reviewSession.flipHint }));
    await user.click(screen.getByRole("button", { name: en.reviewSession.good }));
    await waitFor(() => expect(screen.getByText(en.reviewSession.completeTitle)).toBeDefined());
    expect(leafText()).not.toMatch(forbidden);
  });

  it("shows a success banner after submitting a report", async () => {
    const user = userEvent.setup();
    const { reportCardAction } = await import("@/features/review-session/actions");

    render(
      <ReviewSession
        methodName="Spaced repetition session"
        initialData={testInitialData}
      />,
    );

    await user.click(screen.getByRole("button", { name: copy.report }));
    await user.click(screen.getByRole("button", { name: copy.reportSubmit }));

    await waitFor(() => expect(screen.getByText(copy.reportSuccessTitle)).toBeDefined());
    expect(reportCardAction).toHaveBeenCalledWith("es:de", { category: null, note: null });
  });

  it("clears the report popover when the active card changes", async () => {
    const user = userEvent.setup();
    render(
      <ReviewSession
        methodName="Spaced repetition session"
        initialData={testInitialData}
      />,
    );

    await user.click(screen.getByRole("button", { name: copy.report }));
    expect(screen.getByRole("dialog", { name: copy.reportPopoverTitle })).toBeDefined();

    await user.click(screen.getByRole("button", { name: copy.flipHint }));
    await user.click(screen.getByRole("button", { name: copy.good }));

    await waitFor(() => expect(screen.getByText("que")).toBeDefined());
    expect(screen.queryByRole("dialog", { name: copy.reportPopoverTitle })).toBeNull();
  });

  it("requeues an again grade to the end when the queue is too short for five ahead", async () => {
    const user = userEvent.setup();
    render(
      <ReviewSession
        methodName="Spaced repetition session"
        initialData={testInitialData}
      />,
    );

    expect(screen.getByText("de")).toBeDefined();
    await user.click(screen.getByRole("button", { name: en.reviewSession.flipHint }));
    await user.click(screen.getByRole("button", { name: en.reviewSession.again }));

    await waitFor(() => expect(screen.getByText("que")).toBeDefined());

    await user.click(screen.getByRole("button", { name: en.reviewSession.flipHint }));
    await user.click(screen.getByRole("button", { name: en.reviewSession.good }));

    await waitFor(() => expect(screen.getByText("de")).toBeDefined());
    await waitFor(() => expect(appendReviewAction).toHaveBeenCalledTimes(2));
  });
});

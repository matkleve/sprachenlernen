import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";

import { describe, expect, it } from "vitest";

import { OrbitDetailCard } from "@/features/words/OrbitDetailCard";
import type { ContentTraceIndex } from "@/lib/content-traceability";
import { routes } from "@/lib/routes";
import type { OrbitAggregateSegment, OrbitWordSegment } from "@/lib/vocabulary-orbit";

const now = Date.UTC(2026, 7, 12);
const DAY = 86_400_000;

const wordSegment: OrbitWordSegment = {
  kind: "word",
  id: "word:il:1",
  ringIndex: 0,
  slotIndex: 0,
  lemma: "il",
  translation: "the",
  taskId: "es:il:meaning-recall",
  frequencyRank: 1,
  stability: 0.5,
  bucket: "fragile",
  mature: false,
  lit: "half",
  taskState: "review",
  due: now + 4 * DAY,
  lastGrade: "good",
  reviewCount: 2,
  frequencyBandStart: 1,
  frequencyBandEnd: 1000,
};

const aggregateSegment: OrbitAggregateSegment = {
  kind: "aggregate",
  id: "agg:26-75",
  ringIndex: 1,
  slotIndex: 1,
  rankStart: 26,
  rankEnd: 75,
  wordCount: 40,
  heldCount: 12,
  lit: "lit",
};

describe("OrbitDetailCard", () => {
  it("shows lemma, translation, stats, schedule context, and fragile status chip for a word", () => {
    render(<OrbitDetailCard segment={wordSegment} now={now} />);

    expect(screen.getByRole("heading", { name: "il" })).toBeDefined();
    expect(screen.getByText("the")).toBeDefined();
    expect(screen.getByText("#1")).toBeDefined();
    expect(screen.getByText("0.5")).toBeDefined();
    expect(screen.getByText(en.words.bucketNames.fragile)).toBeDefined();
    expect(
      screen.getByText(
        formatMessage(en.words.orbitDetailBandCaption, { start: 1, end: 1000 }),
      ),
    ).toBeDefined();
    expect(screen.getByText(/Next review in 4 days/)).toBeDefined();
    expect(screen.getByText(/you last chose Good/)).toBeDefined();
    expect(screen.getByRole("button", { name: en.words.wordDetailSuspend })).toBeDefined();
    expect(screen.getByRole("button", { name: en.words.wordDetailRetire })).toBeDefined();
  });

  it("shows only retire for a new word", () => {
    render(
      <OrbitDetailCard
        segment={{ ...wordSegment, bucket: "new", reviewCount: 0, taskState: "new", lastGrade: null }}
        now={now}
      />,
    );

    expect(screen.getByText(en.words.wordDetailScheduleNew)).toBeDefined();
    expect(screen.queryByRole("button", { name: en.words.wordDetailSuspend })).toBeNull();
    expect(screen.getByRole("button", { name: en.words.wordDetailRetire })).toBeDefined();
  });

  it("shows aggregate range and held count", () => {
    render(<OrbitDetailCard segment={aggregateSegment} now={now} />);

    expect(
      screen.getByRole("heading", {
        name: formatMessage(en.words.orbitAggregateHeading, { start: 26, end: 75 }),
      }),
    ).toBeDefined();
    expect(
      screen.getByText(formatMessage(en.words.orbitAggregateBody, { count: 40, held: 12 })),
    ).toBeDefined();
  });

  it("shows linked source titles in the word trace block", () => {
    const contentTraceIndex: ContentTraceIndex = {
      sourcesById: {
        "es-fixture-cafe": { id: "es-fixture-cafe", title: "En el café" },
      },
      lemmaSources: { casa: ["es-fixture-cafe"] },
    };

    render(
      <OrbitDetailCard
        segment={{ ...wordSegment, lemma: "casa", translation: "house" }}
        now={now}
        contentTraceIndex={contentTraceIndex}
      />,
    );

    const link = screen.getByRole("link", { name: "En el café" });
    expect(link.getAttribute("href")).toBe(routes.contentDetail("es-fixture-cafe"));
    expect(screen.getByText("In 1 saved text or episode")).toBeDefined();
  });
});

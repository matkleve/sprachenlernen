import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import {screen} from "@testing-library/react";

import { describe, expect, it } from "vitest";

import { OrbitDetailCard } from "@/features/words/OrbitDetailCard";
import type { OrbitAggregateSegment, OrbitWordSegment } from "@/lib/vocabulary-orbit";

const wordSegment: OrbitWordSegment = {
  kind: "word",
  id: "word:il:1",
  ringIndex: 0,
  slotIndex: 0,
  lemma: "il",
  translation: "the",
  frequencyRank: 1,
  stability: 0.5,
  bucket: "fragile",
  mature: false,
  lit: "half",
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
  it("shows lemma, translation, stats, and fragile status chip for a word", () => {
    render(<OrbitDetailCard segment={wordSegment} />);

    expect(screen.getByRole("heading", { name: "il" })).toBeDefined();
    expect(screen.getByText("the")).toBeDefined();
    expect(screen.getByText("#1")).toBeDefined();
    expect(screen.getByText("0.5")).toBeDefined();
    expect(screen.getByText(en.words.bucketNames.fragile)).toBeDefined();
    expect(screen.getByText(formatMessage(en.words.orbitDetailBandCaption, { start: 1, end: 25 }))).toBeDefined();
  });

  it("shows aggregate range and held count", () => {
    render(<OrbitDetailCard segment={aggregateSegment} />);

    expect(screen.getByRole("heading", { name: formatMessage(en.words.orbitAggregateHeading, { start: 26, end: 75 }) })).toBeDefined();
    expect(screen.getByText(formatMessage(en.words.orbitAggregateBody, { count: 40, held: 12 }))).toBeDefined();
  });
});

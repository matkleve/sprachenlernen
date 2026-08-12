import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReviewCard } from "@/features/review-session/ReviewCard";
import { copy } from "@/features/review-session/content";

vi.mock("@/features/review-session/session-machine", () => ({
  canFlip: () => true,
  canGrade: () => true,
  showsBack: () => true,
}));

const baseCard = {
  wordId: "es:hablar",
  lemma: "hablar",
  front: "to speak",
  back: "hablar",
  frequencyRank: 10,
  position: 1,
  total: 1,
};

describe("ReviewCard", () => {
  it("asks what the lemma means on a meaning-recall card", () => {
    render(
      <ReviewCard
        card={{ ...baseCard, taskId: "es:hablar:meaning-recall" }}
        languageName="Spanish"
        phase="revealed"
        onFlip={() => {}}
        onGrade={() => {}}
      />,
    );

    expect(screen.getByText(copy.prompt)).toBeDefined();
    expect(screen.queryByText(copy.formRecallPrompt)).toBeNull();
  });

  it("asks whether the form was recalled on a form-recall card", () => {
    render(
      <ReviewCard
        card={{
          ...baseCard,
          taskId: "es:hablar:habla:form-recall",
          front: "to speak — write the Spanish form",
          back: "habla",
        }}
        languageName="Spanish"
        phase="revealed"
        onFlip={() => {}}
        onGrade={() => {}}
      />,
    );

    expect(screen.getByText(copy.formRecallPrompt)).toBeDefined();
    expect(screen.queryByText(copy.prompt)).toBeNull();
  });
});

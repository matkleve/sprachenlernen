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

const formCard = {
  ...baseCard,
  taskId: "es:hablar:habla:form-recall",
  front: "to speak",
  back: "habla",
  paradigmCell: "ind.pres.3sg",
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

  it("says nothing about a cell on a card that has none", () => {
    const { container } = render(
      <ReviewCard
        card={{ ...baseCard, taskId: "es:hablar:meaning-recall" }}
        languageName="Spanish"
        phase="revealed"
        onFlip={() => {}}
        onGrade={() => {}}
      />,
    );

    expect(container.textContent).not.toMatch(/present|Write the/);
  });

  it("asks whether the form was recalled on a form-recall card", () => {
    render(
      <ReviewCard
        card={formCard}
        languageName="Spanish"
        phase="revealed"
        onFlip={() => {}}
        onGrade={() => {}}
      />,
    );

    expect(screen.getByText(copy.formRecallPrompt)).toBeDefined();
    expect(screen.queryByText(copy.prompt)).toBeNull();
  });

  it("names the cell it is asking for, so the prompt has one answer", () => {
    // "to speak" alone admits hablo, hablas, habla, hablé… The card is only
    // answerable because it says which cell, and it says so from the code the
    // row carries — never from a sentence baked into the data.
    render(
      <ReviewCard
        card={formCard}
        languageName="Spanish"
        phase="prompting"
        onFlip={() => {}}
        onGrade={() => {}}
      />,
    );

    expect(screen.getByText("to speak")).toBeDefined();
    expect(screen.getByText("he/she · present")).toBeDefined();
    expect(screen.getByText("Write the Spanish form.")).toBeDefined();
    // Presentation, not payload: nothing on screen came from the row verbatim
    // except the meaning and the answer.
    expect(screen.queryByText("ind.pres.3sg")).toBeNull();
  });

  it("falls back to a plain instruction when the language is unknown", () => {
    render(
      <ReviewCard
        card={formCard}
        languageName={null}
        phase="prompting"
        onFlip={() => {}}
        onGrade={() => {}}
      />,
    );

    expect(screen.getByText("Write the form.")).toBeDefined();
  });
});

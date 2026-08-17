import { renderWithIntl as render, en } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ReviewCard } from "@/features/review-session/ReviewCard";

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
  taskId: "es:hablar:meaning-recall",
};

describe("ReviewCard", () => {
  it("asks what the lemma means on a meaning-recall card", () => {
    render(
      <ReviewCard
        card={baseCard}
        languageName="Spanish"
        phase="revealed"
        onFlip={() => {}}
        onGrade={() => {}}
        onSubmitReport={async () => {}}
      />,
    );

    expect(screen.getByText(en.reviewSession.prompt)).toBeDefined();
    expect(screen.queryByText(en.reviewSession.formRecallPrompt)).toBeNull();
  });

  it("says nothing about a cell on a card that has none", () => {
    const { container } = render(
      <ReviewCard
        card={baseCard}
        languageName="Spanish"
        phase="revealed"
        onFlip={() => {}}
        onGrade={() => {}}
        onSubmitReport={async () => {}}
      />,
    );

    expect(container.textContent).not.toMatch(/present|Write the/);
  });

  it("asks whether the form was recalled on a form-recall card", () => {
    render(
      <ReviewCard
        card={{
          ...baseCard,
          taskId: "es:hablar:habla:form-recall",
          front: "to speak",
          back: "habla",
          paradigmCell: "ind.pres.3sg",
        }}
        languageName="Spanish"
        phase="revealed"
        onFlip={() => {}}
        onGrade={() => {}}
        onSubmitReport={async () => {}}
      />,
    );

    expect(screen.getByText(en.reviewSession.formRecallPrompt)).toBeDefined();
    expect(screen.queryByText(en.reviewSession.prompt)).toBeNull();
  });

  it("names the cell it is asking for, so the prompt has one answer", () => {
    render(
      <ReviewCard
        card={{
          ...baseCard,
          taskId: "es:hablar:habla:form-recall",
          front: "to speak",
          back: "habla",
          paradigmCell: "ind.pres.3sg",
        }}
        languageName="Spanish"
        phase="prompting"
        onFlip={() => {}}
        onGrade={() => {}}
        onSubmitReport={async () => {}}
      />,
    );

    expect(screen.getByText("to speak")).toBeDefined();
    expect(screen.getByText("he/she · present")).toBeDefined();
    expect(screen.getByText("Write the Spanish form.")).toBeDefined();
    expect(screen.queryByText("ind.pres.3sg")).toBeNull();
  });

  it("falls back to a plain instruction when the language is unknown", () => {
    render(
      <ReviewCard
        card={{
          ...baseCard,
          taskId: "es:hablar:habla:form-recall",
          paradigmCell: "ind.pres.3sg",
        }}
        languageName={null}
        phase="prompting"
        onFlip={() => {}}
        onGrade={() => {}}
        onSubmitReport={async () => {}}
      />,
    );

    expect(screen.getByText("Write the form.")).toBeDefined();
  });

  it("opens the report popover from the flag control", async () => {
    const user = userEvent.setup();
    render(
      <ReviewCard
        card={baseCard}
        languageName="Spanish"
        phase="prompting"
        onFlip={() => {}}
        onGrade={() => {}}
        onSubmitReport={async () => {}}
      />,
    );

    await user.click(screen.getByRole("button", { name: en.reviewSession.report }));

    expect(screen.getByRole("dialog", { name: en.reviewSession.reportPopoverTitle })).toBeDefined();
  });

  it("keeps wcag-sized grade controls in compact mobile layout", () => {
    const { container } = render(
      <ReviewCard
        card={baseCard}
        languageName="Spanish"
        phase="revealed"
        compact
        onFlip={() => {}}
        onGrade={() => {}}
        onSubmitReport={async () => {}}
      />,
    );

    const gradeButton = screen.getByRole("button", { name: en.reviewSession.good });
    expect(gradeButton.className).toContain("h-11");
    expect(gradeButton.className).not.toContain("text-xs");

    const gradeSection = container.querySelector(".pb-3");
    expect(gradeSection).not.toBeNull();
  });

  it("tightens grade controls in compact mobile layout", () => {
    const { container } = render(
      <ReviewCard
        card={{ ...baseCard, taskId: "es:hablar:meaning-recall" }}
        languageName="Spanish"
        phase="revealed"
        compact
        onFlip={() => {}}
        onGrade={() => {}}
        onReport={() => {}}
      />,
    );

    const gradeButton = screen.getByRole("button", { name: copy.good });
    expect(gradeButton.className).toContain("h-7");
    expect(gradeButton.className).toContain("text-xs");

    const gradeSection = container.querySelector(".pb-3");
    expect(gradeSection).not.toBeNull();
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ReflectionDeck } from "@/components/ui/ReflectionDeck";
import { expectNoA11yViolations } from "@/tests/axe";

const deckCopy = {
  close: "Close",
  previous: "Previous",
  next: "Next",
  seeData: "See the data",
  cardStatus: (index: number, total: number) => `Card ${index} of ${total}`,
};

const cards = [
  { id: "one", headline: "First fact.", visual: <p>Chart one</p> },
  { id: "two", headline: "Second fact.", visual: <p>Chart two</p>, derivationHref: "/progress#signals" },
];

describe("ReflectionDeck", () => {
  it("disables Previous on the first card and Next on the last", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ReflectionDeck
        open
        onClose={onClose}
        periodLabel="This week"
        cards={cards}
        copy={deckCopy}
      />,
    );

    expect(screen.getByRole("button", { name: "Previous" })).toHaveProperty("disabled", true);
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Second fact.")).toBeDefined();
    expect(screen.getByRole("button", { name: "See the data" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
  });

  it("calls onClose when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ReflectionDeck
        open
        onClose={onClose}
        periodLabel="This week"
        cards={cards}
        copy={deckCopy}
      />,
    );

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("has no axe violations while open", async () => {
    const { container } = render(
      <ReflectionDeck
        open
        onClose={() => {}}
        periodLabel="This week"
        cards={cards}
        copy={deckCopy}
      />,
    );

    await expectNoA11yViolations(container);
  });
});

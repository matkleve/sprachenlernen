import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LanguagePicker, type LanguageTile } from "@/features/language-picker/LanguagePicker";
import { copy } from "@/features/language-picker/content";
import { SHIPPED_ES_POOL_SIZE } from "@/lib/starter-deck";

/** Contract: docs/specs/page/language-picker.md */

const spanish: LanguageTile = {
  code: "es",
  poolSize: SHIPPED_ES_POOL_SIZE,
  heldCount: null,
  alreadyLearning: false,
};

const italian: LanguageTile = {
  code: "it",
  poolSize: null,
  heldCount: null,
  alreadyLearning: false,
};

const choose = vi.fn();

describe("LanguagePicker", () => {
  it("offers an available language and names its starter set", () => {
    render(<LanguagePicker tiles={[spanish]} choose={choose} />);

    expect(screen.getByText("Español")).toBeDefined();
    expect(screen.getByText("Spanish")).toBeDefined();
    expect(screen.getByText(copy.notStarted(SHIPPED_ES_POOL_SIZE))).toBeDefined();
    expect(screen.getByRole("button", { name: copy.choose })).toBeDefined();
  });

  it("gives an unavailable language no control at all", () => {
    render(<LanguagePicker tiles={[italian]} choose={choose} />);

    // Not a disabled button: a disabled control still announces an action that
    // exists, and there is none here.
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText(copy.unavailable("Italian"))).toBeDefined();
  });

  it("marks a language already being learned and does not offer it again", () => {
    render(<LanguagePicker tiles={[{ ...spanish, alreadyLearning: true }]} choose={choose} />);

    expect(screen.getByText(copy.alreadyLearning)).toBeDefined();
    expect(screen.queryByRole("button", { name: copy.choose })).toBeNull();
  });

  it("shows zero held as a measurement, not an empty state", () => {
    render(<LanguagePicker tiles={[{ ...spanish, heldCount: 0 }]} choose={choose} />);

    expect(screen.getByText(copy.held(0, SHIPPED_ES_POOL_SIZE))).toBeDefined();
  });

  it("renders the error and stays usable", () => {
    render(<LanguagePicker tiles={[spanish]} error={copy.error} choose={choose} />);

    expect(screen.getByRole("alert").textContent).toBe(copy.error);
    expect(screen.getByRole("button", { name: copy.choose })).toBeDefined();
  });

  it("shows no bar, meter or ring against the starter set", () => {
    // The denominator is a shipped set, not a goal. A bar would promise a
    // finish line the product does not have — the same refusal as the streak.
    const { container } = render(<LanguagePicker tiles={[{ ...spanish, heldCount: 347 }]} choose={choose} />);

    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.queryByRole("meter")).toBeNull();
    expect(container.querySelector("progress, meter")).toBeNull();
  });

  it("never says lemma, and always names the denominator", () => {
    const { container } = render(
      <LanguagePicker tiles={[{ ...spanish, heldCount: 347 }]} choose={choose} />,
    );
    const text = container.textContent ?? "";

    expect(text.toLowerCase()).not.toContain("lemma");
    expect(text).toContain("starter");
  });
});

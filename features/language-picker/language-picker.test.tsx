import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";

import { describe, expect, it, vi } from "vitest";

import { LanguagePicker, type LanguageTile } from "@/features/language-picker/LanguagePicker";
import { SHIPPED_ES_POOL_SIZE } from "@/lib/starter-deck";

/** Contract: docs/specs/page/language-picker.md */

const spanish: LanguageTile = {
  code: "es",
  poolSize: SHIPPED_ES_POOL_SIZE,
  heldCount: null,
  alreadyLearning: false,
  isActive: false,
};

const italian: LanguageTile = {
  code: "it",
  poolSize: null,
  heldCount: null,
  alreadyLearning: false,
  isActive: false,
};

const choose = vi.fn();

describe("LanguagePicker", () => {
  it("offers an available language and names its starter set", async () => {
    render(await LanguagePicker({ tiles: [spanish], choose }));

    expect(screen.getByText("Español")).toBeDefined();
    expect(screen.getByText("Spanish")).toBeDefined();
    expect(
      screen.getByText(formatMessage(en.languagePicker.notStarted, { poolSize: SHIPPED_ES_POOL_SIZE })),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: en.languagePicker.choose })).toBeDefined();
  });

  it("gives an unavailable language no control at all", async () => {
    render(await LanguagePicker({ tiles: [italian], choose }));

    // Not a disabled button: a disabled control still announces an action that
    // exists, and there is none here.
    expect(screen.queryByRole("button")).toBeNull();
    expect(
      screen.getByText(formatMessage(en.languagePicker.unavailable, { name: "Italian" })),
    ).toBeDefined();
  });

  it("marks a language already being learned and does not offer it again", async () => {
    render(await LanguagePicker({ tiles: [{ ...spanish, alreadyLearning: true }], choose }));

    expect(screen.getByText(en.languagePicker.alreadyLearning)).toBeDefined();
    expect(screen.queryByRole("button", { name: en.languagePicker.choose })).toBeNull();
  });

  it("shows zero held as a measurement, not an empty state", async () => {
    render(await LanguagePicker({ tiles: [{ ...spanish, heldCount: 0 }], choose }));

    expect(
      screen.getByText(
        formatMessage(en.languagePicker.held, { held: 0, poolSize: SHIPPED_ES_POOL_SIZE }),
      ),
    ).toBeDefined();
  });

  it("renders the error and stays usable", async () => {
    render(
      await LanguagePicker({ tiles: [spanish], error: en.languagePicker.error, choose }),
    );

    expect(screen.getByRole("alert").textContent).toBe(en.languagePicker.error);
    expect(screen.getByRole("button", { name: en.languagePicker.choose })).toBeDefined();
  });

  it("shows no bar, meter or ring against the starter set", async () => {
    // The denominator is a shipped set, not a goal. A bar would promise a
    // finish line the product does not have — the same refusal as the streak.
    const { container } = render(
      await LanguagePicker({ tiles: [{ ...spanish, heldCount: 347 }], choose }),
    );

    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.queryByRole("meter")).toBeNull();
    expect(container.querySelector("progress, meter")).toBeNull();
  });

  it("never says lemma, and always names the denominator", async () => {
    const { container } = render(
      await LanguagePicker({ tiles: [{ ...spanish, heldCount: 347 }], choose }),
    );
    const text = container.textContent ?? "";

    expect(text.toLowerCase()).not.toContain("lemma");
    expect(text).toContain("starter");
  });

  it("shows Active chip on the language in focus", async () => {
    render(await LanguagePicker({ tiles: [{ ...spanish, isActive: true }], choose }));

    const activeChip = screen.getByText(en.languagePicker.active);
    expect(activeChip.tagName).toBe("SPAN");
    expect(activeChip.className).toContain("bg-accent-soft");
    expect(activeChip.className).toContain("border-accent");
    expect(screen.queryByText(en.languagePicker.alreadyLearning)).toBeNull();
  });
});

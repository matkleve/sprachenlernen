import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { copy } from "./content";

const switchActiveLanguageAction = vi.fn();

vi.mock("./actions", () => ({
  switchActiveLanguageAction: (...args: unknown[]) => switchActiveLanguageAction(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ refresh: vi.fn() })),
}));

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    switchActiveLanguageAction.mockReset();
    switchActiveLanguageAction.mockResolvedValue(undefined);
  });

  it("renders nothing when the account has no languages", () => {
    const { container } = render(<LanguageSwitcher languages={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows a non-interactive flag circle when only one language is being learned", () => {
    render(
      <LanguageSwitcher
        languages={[{ code: "es", endonym: "Español", isActive: true }]}
        layout="floating"
      />,
    );

    expect(screen.getByLabelText(copy.currentLanguage("Español"))).toBeDefined();
    expect(screen.getByText("🇪🇸")).toBeDefined();
    expect(screen.queryByRole("button", { name: copy.switchLanguage })).toBeNull();
  });

  it("opens stacked language cards with a blurred scrim and switches in one action", async () => {
    const user = userEvent.setup();
    render(
      <LanguageSwitcher
        languages={[
          { code: "es", endonym: "Español", isActive: true },
          { code: "it", endonym: "Italiano", isActive: false },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: copy.switchLanguage }));

    const menu = screen.getByRole("menu", { name: copy.switchLanguage });
    expect(menu.className).toContain("gap-2");
    expect(menu.querySelector(".language-switcher-scrim")).toBeNull();
    expect(document.querySelector(".language-switcher-scrim")).not.toBeNull();
    expect(screen.getByText("Active")).toBeDefined();
    expect(screen.queryByRole("link", { name: copy.addLanguage })).toBeNull();

    await user.click(screen.getByRole("button", { name: /Italiano/i }));

    expect(switchActiveLanguageAction).toHaveBeenCalledWith("it");
  });
});

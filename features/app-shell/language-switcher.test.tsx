import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import {screen} from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LanguageSwitcher } from "./LanguageSwitcher";

const switchActiveLanguageAction = vi.fn();
const loadLanguageHoldingsAction = vi.fn();

vi.mock("./actions", () => ({
  switchActiveLanguageAction: (...args: unknown[]) => switchActiveLanguageAction(...args),
  loadLanguageHoldingsAction: (...args: unknown[]) => loadLanguageHoldingsAction(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ refresh: vi.fn() })),
}));

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    switchActiveLanguageAction.mockReset();
    switchActiveLanguageAction.mockResolvedValue(undefined);
    loadLanguageHoldingsAction.mockReset();
    loadLanguageHoldingsAction.mockResolvedValue(null);
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

    expect(
      screen.getByLabelText(formatMessage(en.appShell.currentLanguage, { endonym: "Español" })),
    ).toBeDefined();
    expect(screen.getByText("🇪🇸")).toBeDefined();
    expect(screen.queryByRole("button", { name: en.appShell.switchLanguage })).toBeNull();
  });

  it("shows endonym text on desktop when only one language is being learned", () => {
    render(
      <LanguageSwitcher
        languages={[{ code: "es", endonym: "Español", isActive: true }]}
        layout="inline"
      />,
    );
    expect(screen.getByText("Español")).toBeDefined();
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

    await user.click(screen.getByRole("button", { name: en.appShell.switchLanguage }));

    const menu = screen.getByRole("menu", { name: en.appShell.switchLanguage });
    expect(menu.className).toContain("gap-3");
    expect(menu.className).toContain("w-[min(100vw-2rem,24rem)]");
    expect(menu.querySelector(".language-switcher-scrim")).toBeNull();
    expect(document.querySelector(".language-switcher-scrim")).not.toBeNull();
    expect(screen.getByText("Active")).toBeDefined();
    expect(screen.queryByRole("link", { name: en.appShell.addLanguage })).toBeNull();

    await user.click(screen.getByRole("button", { name: /Italiano/i }));

    expect(switchActiveLanguageAction).toHaveBeenCalledWith("it");
  });
});

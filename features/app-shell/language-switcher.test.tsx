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

  it("shows a non-interactive icon when only one language is being learned", () => {
    render(
      <LanguageSwitcher
        languages={[{ code: "es", endonym: "Español", emoji: "🇪🇸", isActive: true }]}
        layout="floating"
      />,
    );
    expect(
      screen.getByLabelText(copy.currentLanguage("Español")),
    ).toBeDefined();
    expect(screen.getByText("🇪🇸")).toBeDefined();
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("shows endonym text on desktop when only one language is being learned", () => {
    render(
      <LanguageSwitcher
        languages={[{ code: "es", endonym: "Español", emoji: "🇪🇸", isActive: true }]}
        layout="inline"
      />,
    );
    expect(screen.getByText("Español")).toBeDefined();
  });

  it("switches language in one action when more than one is available", async () => {
    const user = userEvent.setup();
    render(
      <LanguageSwitcher
        languages={[
          { code: "es", endonym: "Español", emoji: "🇪🇸", isActive: true },
          { code: "it", endonym: "Italiano", emoji: "🇮🇹", isActive: false },
        ]}
      />,
    );

    const select = screen.getByRole("combobox", { name: copy.switchLanguage });
    await user.selectOptions(select, "it");

    expect(switchActiveLanguageAction).toHaveBeenCalledWith("it");
  });
});

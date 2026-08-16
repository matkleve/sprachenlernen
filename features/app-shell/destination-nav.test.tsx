import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import {screen} from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { usePathname, useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DestinationNavItems } from "./DestinationNavItems";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));

describe("DestinationNavItems", () => {
  const push = vi.fn();

  beforeEach(() => {
    push.mockReset();
    vi.mocked(useRouter).mockReturnValue({
      push,
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });
    vi.mocked(usePathname).mockReturnValue("/methods");
  });

  it("moves current styling to the tapped destination before the route settles", async () => {
    const user = userEvent.setup();
    render(
      <nav>
        <ul>
          <DestinationNavItems layout="pill" />
        </ul>
      </nav>,
    );

    const methods = screen.getByRole("link", { name: en.appShell.destinations.methods });
    const words = screen.getByRole("link", { name: en.appShell.destinations.words });

    expect(methods.getAttribute("aria-current")).toBe("page");
    expect(words.getAttribute("aria-current")).toBeNull();

    await user.click(words);

    expect(methods.getAttribute("aria-current")).toBeNull();
    expect(words.getAttribute("aria-current")).toBe("page");
    expect(push).toHaveBeenCalledWith("/words");
  });

  it("does not dim the tapped destination while navigation is pending", async () => {
    const user = userEvent.setup();
    render(
      <nav>
        <ul>
          <DestinationNavItems layout="pill" />
        </ul>
      </nav>,
    );

    const words = screen.getByRole("link", { name: en.appShell.destinations.words });
    await user.click(words);

    expect(words.className).not.toContain("opacity-70");
  });
});

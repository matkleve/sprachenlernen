import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import {screen} from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";


import { AppShell } from "./AppShell";
import { DestinationError } from "./DestinationError";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

const renderDestinationError = (pathname: string, message = "boom") => {
  vi.mocked(usePathname).mockReturnValue(pathname);
  const reset = vi.fn();
  const error = Object.assign(new Error(message), { digest: "digest-1" });
  return { reset, ...render(<DestinationError error={error} reset={reset} />) };
};

beforeEach(() => {
  vi.mocked(usePathname).mockReset();
  sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

describe("DestinationError", () => {
  it("names the review operation on /words/review", () => {
    renderDestinationError("/words/review");

    expect(screen.getByText("Could not start your review session.")).toBeDefined();
    expect(screen.queryByText(/something went wrong/i)).toBeNull();
  });

  it("names the vocabulary operation on /words", () => {
    renderDestinationError("/words");

    expect(screen.getByText("Could not load your vocabulary.")).toBeDefined();
  });

  it("reloads when Try again is clicked on a render boundary", async () => {
    const reload = vi.fn();
    vi.stubGlobal("location", { ...window.location, reload });
    const { reset } = renderDestinationError("/progress");
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(reload).toHaveBeenCalledOnce();
    expect(reset).not.toHaveBeenCalled();
  });

  it("shows a contextual escape link on profile errors", () => {
    sessionStorage.setItem("app:navigation:previous", "/words");
    renderDestinationError("/profile");

    expect(screen.getByRole("link", { name: "Back to Words" }).getAttribute("href")).toBe(
      "/words",
    );
  });
});

describe("destination errors inside the shell", () => {
  it("keeps destination links visible when content fails", () => {
    vi.mocked(usePathname).mockReturnValue("/words/review");
    const reset = vi.fn();

    render(
      <AppShell languages={[{ code: "es", endonym: "Español", isActive: true }]}>
        <DestinationError
          error={Object.assign(new Error("session crash"), { digest: "d1" })}
          reset={reset}
        />
      </AppShell>,
    );

    const destinationHrefs = new Set(
      screen
        .getAllByRole("link")
        .map((link) => link.getAttribute("href"))
        .filter(
          (href): href is string =>
            href === "/methods" ||
            href === "/words" ||
            href === "/progress",
        ),
    );
    expect(destinationHrefs).toEqual(
      new Set(["/methods", "/words", "/progress"]),
    );
    expect(screen.getByText("Could not start your review session.")).toBeDefined();
  });
});

import { renderWithIntl as render } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PracticePage from "@/app/(app)/practice/page";

describe("PracticePage", () => {
  it("renders exercise runner for partial-dictation", async () => {
    const ui = await PracticePage({
      searchParams: Promise.resolve({ method: "partial-dictation" }),
    });
    render(ui);

    expect(screen.getByRole("heading", { name: "Partial dictation" })).toBeDefined();
    expect(screen.getByText(/Step 1 of 6/)).toBeDefined();
  });

  it("shows not-built for unbuilt hosted method", async () => {
    const ui = await PracticePage({
      searchParams: Promise.resolve({ method: "full-dictation" }),
    });
    render(ui);

    expect(
      screen.getByText(/session is not built yet/i),
    ).toBeDefined();
  });
});

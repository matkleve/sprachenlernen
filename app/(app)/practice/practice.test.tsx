import { renderWithIntl as render, en } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PracticePage from "@/app/(app)/practice/page";

describe("PracticePage", () => {
  it("renders exercise runner for partial-dictation", async () => {
    const ui = await PracticePage({
      searchParams: Promise.resolve({ method: "partial-dictation" }),
    });
    render(ui);

    expect(screen.getByRole("heading", { name: en.methodMenu.entries["partial-dictation"].name })).toBeDefined();
    expect(screen.getByText(/Step 1 of/)).toBeDefined();
  });

  it("renders exercise runner for full-dictation", async () => {
    const ui = await PracticePage({
      searchParams: Promise.resolve({ method: "full-dictation" }),
    });
    render(ui);

    expect(screen.getByRole("heading", { name: en.methodMenu.entries["full-dictation"].name })).toBeDefined();
    expect(screen.getByText(/Step 1 of/)).toBeDefined();
  });

  it("renders exercise runner for extensive-reading", async () => {
    const ui = await PracticePage({
      searchParams: Promise.resolve({ method: "extensive-reading" }),
    });
    render(ui);

    expect(screen.getByRole("heading", { name: en.methodMenu.entries["extensive-reading"].name })).toBeDefined();
    expect(screen.getByText(/Step 1 of 4/)).toBeDefined();
  });

  it("renders exercise runner for build-a-sentence", async () => {
    const ui = await PracticePage({
      searchParams: Promise.resolve({ method: "build-a-sentence" }),
    });
    render(ui);

    expect(
      screen.getByRole("heading", { name: en.methodMenu.entries["build-a-sentence"].name }),
    ).toBeDefined();
    expect(screen.getByText(/Step 1 of/)).toBeDefined();
  });

  it("renders exercise runner for free-production", async () => {
    const ui = await PracticePage({
      searchParams: Promise.resolve({ method: "free-production" }),
    });
    render(ui);

    expect(screen.getByRole("heading", { name: en.methodMenu.entries["free-production"].name })).toBeDefined();
    expect(screen.getByText(/Step 1 of 5/)).toBeDefined();
  });

  it("shows not-built for unbuilt hosted method", async () => {
    const ui = await PracticePage({
      searchParams: Promise.resolve({ method: "narrow-reading" }),
    });
    render(ui);

    expect(screen.getByText(/session is not built yet/i)).toBeDefined();
  });
});

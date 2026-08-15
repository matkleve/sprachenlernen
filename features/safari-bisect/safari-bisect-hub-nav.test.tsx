import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SafariBisectHubNav } from "./SafariBisectHubNav";

describe("SafariBisectHubNav", () => {
  it("lists bisect entry points and direct production routes", () => {
    render(
      <SafariBisectHubNav
        bisectWordsHref="/words-bisect?level=0"
        bisectProgressHref="/progress-bisect?level=0"
      />,
    );

    expect(screen.getByRole("link", { name: /Words bisect/i }).getAttribute("href")).toBe(
      "/words-bisect?level=0",
    );
    expect(screen.getByRole("link", { name: /Open \/methods directly/i }).getAttribute("href")).toBe(
      "/methods",
    );
    expect(screen.getByRole("link", { name: /Open \/words directly/i }).getAttribute("href")).toBe(
      "/words",
    );
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import InstallPage from "@/app/(marketing)/install/page";
import { copy } from "@/features/install/content";

describe("InstallPage", () => {
  it("links to the site root for Home Screen install", () => {
    render(<InstallPage />);

    expect(screen.getByRole("heading", { name: copy.title })).toBeDefined();
    expect(screen.getByRole("link", { name: copy.openSiteAria }).getAttribute("href")).toBe("/");
  });
});

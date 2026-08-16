import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";

import { describe, expect, it } from "vitest";

import InstallPage from "@/app/(marketing)/install/page";

describe("InstallPage", () => {
  it("links to the site root for Home Screen install", async () => {
    render(await InstallPage());

    expect(screen.getByRole("heading", { name: en.install.title })).toBeDefined();
    expect(screen.getByRole("link", { name: en.install.openSiteAria }).getAttribute("href")).toBe("/");
  });
});

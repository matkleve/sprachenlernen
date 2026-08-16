import { describe, expect, it } from "vitest";

import { isProfileSection, profilePanelId } from "@/lib/profile-section";

describe("profile-section", () => {
  it("recognises valid section query values", () => {
    expect(isProfileSection("languages")).toBe(true);
    expect(isProfileSection("data")).toBe(true);
    expect(isProfileSection(undefined)).toBe(false);
    expect(isProfileSection("account")).toBe(false);
  });

  it("builds stable panel ids for the nav and page markup", () => {
    expect(profilePanelId("data")).toBe("profile-panel-data");
  });
});

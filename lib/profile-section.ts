/** Profile in-page section ids. Contract: docs/study/33-profile-section-navigation.md */

export const PROFILE_SECTIONS_CORE = ["languages", "data", "device"] as const;
export type ProfileSectionCore = (typeof PROFILE_SECTIONS_CORE)[number];
export type ProfileSection = ProfileSectionCore | "dev";

/** @deprecated Use profileSectionsForEnv() — kept for tests that omit dev. */
export const PROFILE_SECTIONS = PROFILE_SECTIONS_CORE;

export function showProfileDevSection(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function profileSectionsForEnv(): readonly ProfileSection[] {
  return showProfileDevSection()
    ? [...PROFILE_SECTIONS_CORE, "dev"]
    : PROFILE_SECTIONS_CORE;
}

export function isProfileSection(value: string | undefined): value is ProfileSection {
  if (!value) return false;
  if (value === "dev") return showProfileDevSection();
  return PROFILE_SECTIONS_CORE.includes(value as ProfileSectionCore);
}

export function profilePanelId(section: ProfileSection): string {
  return `profile-panel-${section}`;
}

/** Profile in-page section ids. Contract: docs/study/33-profile-section-navigation.md */

export const PROFILE_SECTIONS = ["languages", "data", "device"] as const;
export type ProfileSection = (typeof PROFILE_SECTIONS)[number];

export function isProfileSection(value: string | undefined): value is ProfileSection {
  return PROFILE_SECTIONS.includes(value as ProfileSection);
}

export function profilePanelId(section: ProfileSection): string {
  return `profile-panel-${section}`;
}

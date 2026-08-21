/** Profile in-page section ids. Contract: docs/study/33-profile-section-navigation.md */

/**
 * `dev` is last on purpose: it is owner tooling on a learner's page. It is
 * visible in production because that is the only place the deployed surfaces
 * can be checked on a real phone — which is the whole reason those pages
 * exist. Hiding it behind `NODE_ENV` would make it useless exactly where it is
 * needed. When the app has learners who are not the owner, this is the line to
 * gate (docs/specs/page/profile.md § Scope).
 */
export const PROFILE_SECTIONS = ["languages", "data", "device", "dev"] as const;
export type ProfileSection = (typeof PROFILE_SECTIONS)[number];

export function isProfileSection(value: string | undefined): value is ProfileSection {
  return PROFILE_SECTIONS.includes(value as ProfileSection);
}

export function profilePanelId(section: ProfileSection): string {
  return `profile-panel-${section}`;
}

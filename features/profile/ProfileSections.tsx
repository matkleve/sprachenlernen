"use client";

import { useCallback, useState, type ReactNode } from "react";

import { FilterPill } from "@/components/ui/FilterPill";
import { copy } from "@/features/profile/content";

/** In-page profile buckets. Contract: docs/study/33-profile-section-navigation.md */
export const PROFILE_SECTIONS = ["languages", "data", "device"] as const;
export type ProfileSection = (typeof PROFILE_SECTIONS)[number];

export function isProfileSection(value: string | undefined): value is ProfileSection {
  return PROFILE_SECTIONS.includes(value as ProfileSection);
}

export type ProfileSectionsProps = {
  initialSection?: ProfileSection;
  languages: ReactNode;
  data: ReactNode;
  device: ReactNode;
  signOut: ReactNode;
};

const SECTION_COPY: Record<ProfileSection, string> = {
  languages: copy.sectionLanguages,
  data: copy.sectionData,
  device: copy.sectionDevice,
};

function sectionUrl(section: ProfileSection) {
  const url = new URL(window.location.href);
  url.searchParams.set("section", section);
  return `${url.pathname}${url.search}`;
}

export function ProfileSections({
  initialSection = "languages",
  languages,
  data,
  device,
  signOut,
}: ProfileSectionsProps) {
  const [section, setSection] = useState<ProfileSection>(initialSection);

  const selectSection = useCallback((next: ProfileSection) => {
    setSection(next);
    window.history.replaceState(null, "", sectionUrl(next));
  }, []);

  const panels: Record<ProfileSection, ReactNode> = {
    languages,
    data,
    device,
  };

  return (
    <>
      <nav aria-label={copy.sectionsNavLabel} className="mb-page-content">
        <ul className="flex flex-wrap items-center gap-1">
          {PROFILE_SECTIONS.map((id) => (
            <li key={id}>
              <FilterPill
                id={`profile-section-${id}`}
                current={section === id}
                aria-controls={`profile-panel-${id}`}
                onClick={() => selectSection(id)}
              >
                {SECTION_COPY[id]}
              </FilterPill>
            </li>
          ))}
        </ul>
      </nav>

      {PROFILE_SECTIONS.map((id) => (
        <div
          key={id}
          id={`profile-panel-${id}`}
          role="tabpanel"
          aria-labelledby={`profile-section-${id}`}
          hidden={section !== id}
          className="[&>section:first-child]:mt-0"
        >
          {panels[id]}
        </div>
      ))}

      <div className="mt-page-content">{signOut}</div>
    </>
  );
}

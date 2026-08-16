"use client";

import { useCallback, useState } from "react";

import { FilterPill } from "@/components/ui/FilterPill";
import { copy } from "@/features/profile/content";
import {
  PROFILE_SECTIONS,
  profilePanelId,
  type ProfileSection,
} from "@/lib/profile-section";

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

function showPanel(section: ProfileSection) {
  for (const id of PROFILE_SECTIONS) {
    const panel = document.getElementById(profilePanelId(id));
    if (panel) panel.hidden = id !== section;
  }
}

export type ProfileSectionNavProps = {
  initialSection?: ProfileSection;
};

/**
 * In-page profile section pills. Toggles server-rendered panels by id — never
 * receives panel content as props (that crosses the RSC boundary in production).
 * Contract: docs/study/33-profile-section-navigation.md
 */
export function ProfileSectionNav({ initialSection = "languages" }: ProfileSectionNavProps) {
  const [section, setSection] = useState<ProfileSection>(initialSection);

  const selectSection = useCallback((next: ProfileSection) => {
    setSection(next);
    showPanel(next);
    window.history.replaceState(null, "", sectionUrl(next));
  }, []);

  return (
    <nav aria-label={copy.sectionsNavLabel} className="mb-page-content">
      <ul className="flex flex-wrap items-center gap-1">
        {PROFILE_SECTIONS.map((id) => (
          <li key={id}>
            <FilterPill
              id={`profile-section-${id}`}
              current={section === id}
              aria-controls={profilePanelId(id)}
              onClick={() => selectSection(id)}
            >
              {SECTION_COPY[id]}
            </FilterPill>
          </li>
        ))}
      </ul>
    </nav>
  );
}

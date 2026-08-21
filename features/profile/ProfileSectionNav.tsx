"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { FilterPill } from "@/components/ui/FilterPill";
import {
  PROFILE_SECTIONS,
  profilePanelId,
  type ProfileSection,
} from "@/lib/profile-section";

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
 * Contract: docs/reviews/design/DR-034-profile-section-navigation.md
 */
export function ProfileSectionNav({ initialSection = "languages" }: ProfileSectionNavProps) {
  const t = useTranslations("profile");
  const [section, setSection] = useState<ProfileSection>(initialSection);

  const sectionCopy = useMemo(
    (): Record<ProfileSection, string> => ({
      languages: t("sectionLanguages"),
      data: t("sectionData"),
      device: t("sectionDevice"),
      dev: t("sectionDev"),
    }),
    [t],
  );

  const selectSection = useCallback((next: ProfileSection) => {
    setSection(next);
    showPanel(next);
    window.history.replaceState(null, "", sectionUrl(next));
  }, []);

  return (
    <nav aria-label={t("sectionsNavLabel")} className="mb-page-content">
      <ul className="flex flex-wrap items-center gap-1">
        {PROFILE_SECTIONS.map((id) => (
          <li key={id}>
            <FilterPill
              id={`profile-section-${id}`}
              current={section === id}
              aria-controls={profilePanelId(id)}
              onClick={() => selectSection(id)}
            >
              {sectionCopy[id]}
            </FilterPill>
          </li>
        ))}
      </ul>
    </nav>
  );
}

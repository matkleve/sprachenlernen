"use client";

import { useEffect, useState } from "react";

import { designThemePresets, designThemeStorageKey } from "@/lib/design-themes";

import { page } from "./content";
import { ThemePreview } from "./ThemePreview";

export function DesignExplorer() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(designThemeStorageKey);
    if (stored && designThemePresets.some((preset) => preset.id === stored)) {
      setSelectedId(stored);
    }
    setReady(true);
  }, []);

  const choose = (id: string) => {
    setSelectedId(id);
    window.localStorage.setItem(designThemeStorageKey, id);
  };

  const selectedPreset = designThemePresets.find((preset) => preset.id === selectedId);

  return (
    <div className="flex flex-col gap-page-content">
      {ready && selectedPreset ? (
        <p
          className="rounded-card border border-accent-soft bg-accent-soft px-4 py-3 text-sm text-ink"
          data-testid="design-explorer-banner"
        >
          <span className="font-medium">{page.selectedBanner}:</span> {selectedPreset.name} —{" "}
          {selectedPreset.tagline}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        {designThemePresets.map((preset) => (
          <ThemePreview
            key={preset.id}
            preset={preset}
            selected={ready && selectedId === preset.id}
            onChoose={() => choose(preset.id)}
          />
        ))}
      </div>
    </div>
  );
}

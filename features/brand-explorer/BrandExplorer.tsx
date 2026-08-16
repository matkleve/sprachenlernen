"use client";

import { useEffect, useState } from "react";

import { brandMarkStorageKey, logoDirections } from "@/lib/brand-mark";

import { page } from "./content";
import { LogoDirectionCard } from "./LogoDirectionCard";

export function BrandExplorer() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(brandMarkStorageKey);
    if (stored && logoDirections.some((direction) => direction.id === stored)) {
      setSelectedId(stored);
    }
    setReady(true);
  }, []);

  const choose = (id: string) => {
    setSelectedId(id);
    window.localStorage.setItem(brandMarkStorageKey, id);
  };

  const selectedDirection = logoDirections.find((direction) => direction.id === selectedId);

  return (
    <div className="flex flex-col gap-page-content">
      {ready && selectedDirection ? (
        <p
          className="rounded-card border border-accent-soft bg-accent-soft px-4 py-3 text-sm text-ink"
          data-testid="brand-explorer-banner"
        >
          <span className="font-medium">{page.selectedBanner}:</span> {selectedDirection.name} —{" "}
          {selectedDirection.tagline}
        </p>
      ) : null}

      <p className="rounded-card border border-line bg-surface px-4 py-3 font-mono text-xs text-muted">
        {page.syncHint}
      </p>

      <div className="grid gap-6 xl:grid-cols-2">
        {logoDirections.map((direction) => (
          <LogoDirectionCard
            key={direction.id}
            direction={direction}
            selected={ready && selectedId === direction.id}
            onChoose={() => choose(direction.id)}
          />
        ))}
      </div>
    </div>
  );
}

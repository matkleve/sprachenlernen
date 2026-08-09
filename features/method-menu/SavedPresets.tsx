"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { NavLink } from "@/components/ui/NavLink";
import type { Context } from "@/lib/method-catalogue";
import { buildMethodsHref, contextToSearchParams } from "@/lib/method-menu-filter";

import { copy } from "./content";

export type SavedPreset = {
  id: string;
  name: string;
  context: Context;
};

const STORAGE_KEY = "sprachenlernen:saved-context-presets";

const readSaved = (): SavedPreset[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedPreset[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeSaved = (presets: SavedPreset[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
};

type SavedPresetsProps = {
  savableContext?: Context;
  searchParams: Record<string, string | string[] | undefined>;
};

export function SavedPresets({ savableContext, searchParams }: SavedPresetsProps) {
  const [saved, setSaved] = useState<SavedPreset[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    setSaved(readSaved());
  }, []);

  const save = () => {
    if (!savableContext || !name.trim()) return;
    const id = `saved-${Date.now()}`;
    const next = [...saved, { id, name: name.trim(), context: savableContext }];
    writeSaved(next);
    setSaved(next);
    setName("");
  };

  const remove = (id: string) => {
    const next = saved.filter((preset) => preset.id !== id);
    writeSaved(next);
    setSaved(next);
  };

  if (saved.length === 0 && !savableContext) return null;

  return (
    <section aria-label={copy.savedPresetsLabel} className="mt-page-content">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">
        {copy.savedPresetsLabel}
      </h2>

      {saved.length > 0 && (
        <ul className="mb-4 flex flex-wrap items-center gap-1">
          {saved.map((preset) => {
            const params = contextToSearchParams(preset.context);
            const href = buildMethodsHref(searchParams, params);
            return (
              <li key={preset.id} className="flex items-center gap-1">
                <NavLink href={href}>{preset.name}</NavLink>
                <button
                  type="button"
                  onClick={() => remove(preset.id)}
                  className="rounded-pill px-2 py-1 text-xs text-muted hover:bg-accent-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={`${copy.removeSavedPreset} ${preset.name}`}
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {savableContext && (
        <div className="flex max-w-md flex-wrap items-end gap-3">
          <Field label={copy.savePresetLabel} className="min-w-[12rem] flex-1">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={copy.savePresetPlaceholder}
            />
          </Field>
          <Button type="button" onClick={save} disabled={!name.trim()}>
            {copy.savePresetAction}
          </Button>
        </div>
      )}
    </section>
  );
}

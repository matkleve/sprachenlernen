import { describe, expect, it } from "vitest";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { findMethod } from "@/features/method-menu/MethodDetail";
import de from "@/messages/de.json";
import en from "@/messages/en.json";
import { localizeMethodEntry } from "@/lib/localize-method-entry";

const { catalogue } = loadMethodCatalogue();
const backgroundListening = findMethod(catalogue, "background-listening")!;

function translateFromMessages(
  messages: typeof en,
  namespace: "methodMenu",
): (key: string) => string {
  const block = messages[namespace].entries as Record<
    string,
    { name: string; summary: string; trains: string; doesNotDo: string }
  >;
  return (key) => {
    const parts = key.split(".");
    const id = parts[1];
    const field = parts[2];
    if (!id || !field) return key;
    return block[id]?.[field as keyof (typeof block)[string]] ?? key;
  };
}

describe("localizeMethodEntry", () => {
  it("returns catalogue English unchanged for en locale", () => {
    const localized = localizeMethodEntry(
      backgroundListening,
      translateFromMessages(en, "methodMenu"),
    );

    expect(localized.name).toBe(backgroundListening.name);
    expect(localized.summary).toBe(backgroundListening.summary);
    expect(localized.doesNotDo).toBe(backgroundListening.doesNotDo);
  });

  it("returns German card copy for de locale", () => {
    const localized = localizeMethodEntry(
      backgroundListening,
      translateFromMessages(de, "methodMenu"),
    );

    expect(localized.name).toBe(de.methodMenu.entries["background-listening"].name);
    expect(localized.name).not.toBe(backgroundListening.name);
    expect(localized.summary).toBe(de.methodMenu.entries["background-listening"].summary);
    expect(localized.doesNotDo).toBe(de.methodMenu.entries["background-listening"].doesNotDo);
  });

  it("falls back to English when one German field is missing", () => {
    const translate = (key: string) => {
      if (key === "entries.background-listening.name") return "Passives Hören ohne Aufgabe";
      return key;
    };

    const localized = localizeMethodEntry(backgroundListening, translate);

    expect(localized.name).toBe("Passives Hören ohne Aufgabe");
    expect(localized.summary).toBe(backgroundListening.summary);
  });
});

describe("method catalogue i18n coverage", () => {
  it("has German rows for every shipped entry id", () => {
    const ids = catalogue!.entries.map((entry) => entry.id).sort();
    const deIds = Object.keys(en.methodMenu.entries).sort();
    expect(deIds).toEqual(ids);
    expect(Object.keys(de.methodMenu.entries).sort()).toEqual(ids);
  });
});

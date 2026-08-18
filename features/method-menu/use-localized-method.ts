"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import type { Entry } from "@/lib/method-catalogue";
import { localizeMethodEntry } from "@/lib/localize-method-entry";

export function useLocalizedMethod<T extends Entry>(entry: T): T {
  const t = useTranslations("methodMenu");
  return useMemo(() => localizeMethodEntry(entry, (key) => t(key as "entries.background-listening.name")), [entry, t]);
}

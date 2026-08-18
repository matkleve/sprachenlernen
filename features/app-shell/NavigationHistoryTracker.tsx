"use client";

import { usePathname } from "next/navigation";

import { advanceNavigationPath } from "@/features/app-shell/navigation-history";

/**
 * Remembers the previous in-app path so error recovery can offer a contextual
 * escape instead of always sending the learner to Methods.
 */
export function NavigationHistoryTracker() {
  const pathname = usePathname();
  advanceNavigationPath(pathname);
  return null;
}

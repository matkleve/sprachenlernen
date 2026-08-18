"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { writeNavigationPrevious } from "@/features/app-shell/navigation-history";

/**
 * Remembers the previous in-app path so error recovery can offer a contextual
 * escape instead of always sending the learner to Methods.
 */
export function NavigationHistoryTracker() {
  const pathname = usePathname();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    const previous = previousPathRef.current;
    if (previous && previous !== pathname) {
      writeNavigationPrevious(previous);
    }
    previousPathRef.current = pathname;
  }, [pathname]);

  return null;
}

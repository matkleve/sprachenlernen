"use client";

import { useCallback, useEffect, useState } from "react";

import {
  METHODS_PATH,
  applySearchParamUpdates,
  menuQueryString,
  parseMenuFilter,
  type MenuFilter,
  type SearchParams,
} from "@/lib/method-menu-filter";

/**
 * Client-owned filter state for /methods. Contract: docs/specs/page/method-menu.md
 *
 * The catalogue is small and static — filtering in memory is instant. The URL
 * is updated with replaceState (no navigation, no scroll jump) so links stay
 * shareable and back/forward still work.
 */
export function useMenuFilter(initialSearchParams: SearchParams) {
  const [searchParams, setSearchParams] = useState<SearchParams>(initialSearchParams);

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const next: SearchParams = {};
      params.forEach((value, key) => {
        next[key] = value;
      });
      setSearchParams(next);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const updateSearchParams = useCallback((updates: Record<string, string | undefined>) => {
    setSearchParams((current) => {
      const next = applySearchParamUpdates(current, updates);
      const query = menuQueryString(next);
      window.history.replaceState(null, "", query ? `${METHODS_PATH}${query}` : METHODS_PATH);
      return next;
    });
  }, []);

  const filter: MenuFilter = parseMenuFilter(searchParams);
  const returnQuery = menuQueryString(searchParams);

  return { searchParams, filter, returnQuery, updateSearchParams };
}

"use client";

import { useShellDestinations } from "./use-shell-destinations";

export type ShellBackTarget = {
  href: string;
  label: string;
};

/**
 * Parent destination for drill-in routes. Contract:
 * docs/specs/feature/mobile-nav-v2.md § Back targets
 */
export function useShellBackTarget(pathname: string): ShellBackTarget | null {
  const destinations = useShellDestinations();

  for (const { href, label } of destinations) {
    if (pathname.startsWith(`${href}/`)) {
      return { href, label };
    }
  }

  return null;
}

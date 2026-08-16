// Legacy English copy — use next-intl messages instead. Kept for reference during migration.
import { shellDestinations } from "./destinations";

export type ShellBackTarget = {
  href: string;
  label: string;
};

/**
 * Parent destination for drill-in routes. Contract:
 * docs/specs/feature/mobile-nav-v2.md § Back targets
 */
export function shellBackTarget(pathname: string): ShellBackTarget | null {
  for (const { href, label } of shellDestinations) {
    if (pathname.startsWith(`${href}/`)) {
      return { href, label };
    }
  }

  return null;
}

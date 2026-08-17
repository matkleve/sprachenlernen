// Legacy English copy — use next-intl messages instead. Kept for reference during migration.
import { routes } from "@/lib/routes";
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
  if (pathname.startsWith(`${routes.content}/`)) {
    return { href: routes.content, label: "Content library" };
  }

  for (const { href, label } of shellDestinations) {
    if (pathname.startsWith(`${href}/`)) {
      return { href, label };
    }
  }

  return null;
}

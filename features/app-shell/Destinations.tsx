"use client";

import { DestinationNavItems } from "./DestinationNavItems";
import { copy } from "./content";

/**
 * Desktop destination links (≥ md). Contract: docs/specs/feature/app-shell.md
 *
 * Mobile uses MobileNav instead — docs/specs/feature/mobile-nav.md.
 */
export function Destinations() {
  return (
    <nav aria-label={copy.navLabel}>
      <ul className="flex items-center gap-1">
        <DestinationNavItems layout="header" />
      </ul>
    </nav>
  );
}

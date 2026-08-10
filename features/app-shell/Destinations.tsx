"use client";

import { DestinationNavItems } from "./DestinationNavItems";
import { copy } from "./content";

/**
 * Desktop destination links (≥ md). Contract: docs/specs/feature/app-shell.md
 *
 * Desktop header only — docs/specs/feature/mobile-nav-v2.md.
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

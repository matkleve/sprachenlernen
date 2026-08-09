"use client";

import { usePathname } from "next/navigation";

import { NavLink } from "@/components/ui/NavLink";
import { routes } from "@/lib/routes";

import { copy } from "./content";

/**
 * The three destinations of ADR-0009. Contract:
 * docs/specs/feature/app-shell.md
 *
 * The only "use client" under the shell, and it is here rather than on
 * AppShell so the client bundle contains three links and nothing else
 * (AGENTS.md boundary 5 — as far down the tree as possible). It exists at all
 * because a layout on the server cannot know which child route rendered, and
 * `usePathname` is the supported way to find out. The alternative — passing a
 * `current` prop from every page — puts the same fact in three places and lets
 * them disagree, which is exactly what docs/STATE.md §6 forbids.
 */

const DESTINATIONS = [
  { href: routes.methods, label: copy.destinations.methods },
  { href: routes.words, label: copy.destinations.words },
  { href: routes.progress, label: copy.destinations.progress },
] as const;

export function Destinations() {
  const pathname = usePathname();

  return (
    <nav aria-label={copy.navLabel}>
      <ul className="flex items-center gap-1">
        {DESTINATIONS.map(({ href, label }) => (
          <li key={href}>
            <NavLink
              href={href}
              // A nested route belongs to its destination — /words/atlas is
              // still Words. Prefix-matching on `${href}/` rather than on
              // `href` keeps /methods from also claiming a future /methods-x.
              current={pathname === href || pathname.startsWith(`${href}/`)}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

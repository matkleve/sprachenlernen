"use client";

import { usePathname } from "next/navigation";

import { IconLink } from "@/components/ui/IconLink";
import { NavLink } from "@/components/ui/NavLink";
import { NavigationPendingProvider, useNavigationPending } from "@/components/ui/navigation-pending-context";

import { isDestinationCurrent } from "./destinations";
import { useShellDestinations } from "./use-shell-destinations";

type DestinationNavItemsProps = {
  /** Header row on desktop; bottom icon pill on mobile. */
  layout?: "header" | "pill";
};

function DestinationNavItemsInner({ layout = "header" }: DestinationNavItemsProps) {
  const pathname = usePathname();
  const shellDestinations = useShellDestinations();
  const navigationPending = useNavigationPending();
  const effectivePath = navigationPending?.pendingHref ?? pathname;
  const pill = layout === "pill";

  return (
    <>
      {shellDestinations.map(({ href, label, icon: Icon }) => {
        const visuallyCurrent = isDestinationCurrent(effectivePath, href);

        if (pill) {
          return (
            <li key={href}>
              <IconLink
                href={href}
                aria-label={label}
                current={visuallyCurrent}
              >
                <Icon aria-hidden className="size-5 shrink-0" />
              </IconLink>
            </li>
          );
        }

        return (
          <li key={href}>
            <NavLink
              href={href}
              current={visuallyCurrent}
              pendingPolicy="nav"
              className="gap-2"
            >
              <Icon aria-hidden className="size-4 shrink-0" />
              {label}
            </NavLink>
          </li>
        );
      })}
    </>
  );
}

export function DestinationNavItems(props: DestinationNavItemsProps) {
  return (
    <NavigationPendingProvider>
      <DestinationNavItemsInner {...props} />
    </NavigationPendingProvider>
  );
}

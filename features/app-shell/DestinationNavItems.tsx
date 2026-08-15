"use client";

import { usePathname } from "next/navigation";

import { NavLink } from "@/components/ui/NavLink";
import { hitAreaExpandNavPill } from "@/components/ui/interaction-kernel";
import { NavigationPendingProvider, useNavigationPending } from "@/components/ui/navigation-pending-context";
import { cn } from "@/lib/utils";

import { isDestinationCurrent, shellDestinations } from "./destinations";

type DestinationNavItemsProps = {
  /** Header row on desktop; bottom pill segments on mobile. */
  layout?: "header" | "pill";
};

function DestinationNavItemsInner({ layout = "header" }: DestinationNavItemsProps) {
  const pathname = usePathname();
  const navigationPending = useNavigationPending();
  const effectivePath = navigationPending?.pendingHref ?? pathname;
  const pill = layout === "pill";

  return (
    <>
      {shellDestinations.map(({ href, label, icon: Icon }) => (
        <li key={href} className={cn(pill && "flex min-w-0 flex-1")}>
          <NavLink
            href={href}
            current={isDestinationCurrent(effectivePath, href)}
            pendingPolicy="nav"
            className={cn(
              pill && [
                "h-auto w-full min-h-14 flex-col gap-1.5 rounded-pill px-2 py-3 text-sm font-bold",
                hitAreaExpandNavPill,
              ],
              !pill && "gap-2",
            )}
          >
            <Icon aria-hidden className={cn("shrink-0", pill ? "size-6" : "size-4")} />
            {label}
          </NavLink>
        </li>
      ))}
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

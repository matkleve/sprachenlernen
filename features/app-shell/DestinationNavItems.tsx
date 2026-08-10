"use client";

import { usePathname } from "next/navigation";

import { NavLink } from "@/components/ui/NavLink";
import { cn } from "@/lib/utils";

import { isDestinationCurrent, shellDestinations } from "./destinations";

type DestinationNavItemsProps = {
  /** Drawer rows are full-width; header pills stay compact. */
  layout?: "header" | "drawer";
  onNavigate?: () => void;
};

export function DestinationNavItems({
  layout = "header",
  onNavigate,
}: DestinationNavItemsProps) {
  const pathname = usePathname();
  const drawer = layout === "drawer";

  return (
    <>
      {shellDestinations.map(({ href, label, icon: Icon }) => (
        <li key={href}>
          <NavLink
            href={href}
            current={isDestinationCurrent(pathname, href)}
            onClick={onNavigate}
            className={cn(
              drawer && "h-11 w-full justify-start gap-3 px-4",
              !drawer && "gap-2",
            )}
          >
            <Icon aria-hidden className="size-4 shrink-0" />
            {label}
          </NavLink>
        </li>
      ))}
    </>
  );
}

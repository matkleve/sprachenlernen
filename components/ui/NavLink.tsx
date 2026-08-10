import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/**
 * A link that can be the one you are on. Contract:
 * docs/specs/component/nav-link.md
 *
 * An anchor, never a button: these navigate, so middle-click, open-in-new-tab
 * and the screen reader's link list all have to work — none of which a
 * `<button onClick={router.push}>` gives you.
 */
export const navLinkVariants = cva(
  [
    // `relative` anchors the hit-area pseudo-element below. Without it the
    // expanded target would resolve against the nearest positioned ancestor,
    // which is usually the page.
    "relative inline-flex items-center justify-center whitespace-nowrap",
    "h-9 rounded-pill px-3 text-sm font-medium",
    // Grows the *target* to 44px without changing the visual box — the same
    // trick and the same reason as Button. `min-h-11` would beat the height
    // and inflate the pill itself.
    "after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']",
    "transition-[background-color,color,transform] duration-150 ease-out-soft",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
    "active:scale-[0.98]",
  ],
  {
    variants: {
      current: {
        // Deliberately the same fill as hover rather than a stronger one: this
        // is where you already are, so it is the item that needs the least
        // pull. A louder treatment competes with the thing you came to do.
        true: "bg-accent-soft text-ink",
        false: "text-muted hover:bg-accent-soft hover:text-ink",
      },
    },
    defaultVariants: { current: false },
  },
);

export type NavLinkProps = ComponentPropsWithoutRef<typeof Link> &
  VariantProps<typeof navLinkVariants>;

export function NavLink({ current, className, ...props }: NavLinkProps) {
  return (
    <Link
      // One value drives both the look and the announcement, so a link cannot
      // read as current to the eye and not to a screen reader.
      aria-current={current ? "page" : undefined}
      className={cn(navLinkVariants({ current }), className)}
      {...props}
    />
  );
}

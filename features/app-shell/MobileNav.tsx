"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

import { DestinationNavItems } from "./DestinationNavItems";
import { signOutAction } from "./actions";
import { copy } from "./content";

/**
 * Phone-width navigation: hamburger opens a drawer with destinations + sign-out.
 * Contract: docs/specs/feature/mobile-nav.md
 */
export function MobileNav() {
  const drawerId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (wasOpenRef.current && !open) {
      menuButtonRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    const first = focusables?.[0];
    const last = focusables?.[focusables.length - 1];
    first?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <Button
        ref={menuButtonRef}
        type="button"
        variant="ghost"
        size="md"
        className="gap-2"
        aria-expanded={open}
        aria-controls={drawerId}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X aria-hidden className="size-5 shrink-0" /> : <Menu aria-hidden className="size-5 shrink-0" />}
        {copy.menuLabel}
      </Button>

      {open ? (
        <>
          <button
            type="button"
            aria-label={copy.menuClose}
            className="fixed inset-0 z-40 bg-ink/40"
            onClick={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            id={drawerId}
            role="dialog"
            aria-modal="true"
            aria-label={copy.navLabel}
            className={cn(
              "fixed inset-y-0 left-0 z-50 flex w-[min(100%,20rem)] flex-col bg-surface shadow-raised",
              "motion-reduce:transition-none",
              "transition-transform duration-200 ease-out-soft",
            )}
          >
            <nav aria-label={copy.navLabel} className="flex-1 px-3 py-4">
              <ul className="flex flex-col gap-1">
                <DestinationNavItems layout="drawer" onNavigate={() => setOpen(false)} />
              </ul>
            </nav>
            <div className="border-t border-line px-3 py-4">
              <form action={signOutAction}>
                <Button type="submit" variant="ghost" size="md" className="w-full justify-start">
                  {copy.signOut}
                </Button>
              </form>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

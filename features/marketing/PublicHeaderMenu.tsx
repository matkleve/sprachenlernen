"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils";

import { PublicHeaderAuthControls } from "./PublicHeaderAuthControls";

type PublicHeaderMenuProps = {
  signedIn: boolean;
};

/** Mobile hamburger menu for the public header. Contract: docs/specs/page/landing.md */
export function PublicHeaderMenu({ signedIn }: PublicHeaderMenuProps) {
  const pathname = usePathname();
  const t = useTranslations("marketing");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuTop, setMenuTop] = useState<number | null>(null);
  const [triggerPosition, setTriggerPosition] = useState<{ top: number; left: number } | null>(
    null,
  );

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setMenuTop(rect.bottom + 8);
      setTriggerPosition({ top: rect.top, left: rect.left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const openMenu = () => {
    const trigger = triggerRef.current;
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      setMenuTop(rect.bottom + 8);
      setTriggerPosition({ top: rect.top, left: rect.left });
    }
    setOpen(true);
  };

  const toggleMenu = () => {
    if (open) {
      setOpen(false);
      return;
    }
    openMenu();
  };

  const popover =
    open && menuTop !== null
      ? createPortal(
          <div ref={menuRef}>
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              className="language-switcher-scrim fixed inset-0 z-language-switcher-scrim"
              onClick={() => setOpen(false)}
            />

            <div
              role="menu"
              aria-label={t("header.menu")}
              className="fixed z-language-switcher-menu right-4 flex w-[min(100vw-2rem,18rem)] flex-col gap-3 rounded-card border border-line bg-surface p-3 shadow-raised"
              style={{ top: menuTop }}
            >
              <PublicHeaderAuthControls
                signedIn={signedIn}
                pathname={pathname}
                layout="menu"
                onNavigate={() => setOpen(false)}
              />
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="relative size-11 shrink-0 min-w-11">
        <IconButton
          ref={triggerRef}
          className={cn(open && triggerPosition && "fixed z-language-switcher-trigger")}
          style={
            open && triggerPosition
              ? { top: triggerPosition.top, left: triggerPosition.left }
              : undefined
          }
          aria-label={t("header.menu")}
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={toggleMenu}
        >
          <Menu aria-hidden className="size-5 shrink-0" />
        </IconButton>
      </div>
      {popover}
    </>
  );
}

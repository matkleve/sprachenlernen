"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";

import { ActionLink } from "@/components/ui/ActionLink";
import { IconButton } from "@/components/ui/IconButton";
import { LanguageFlag } from "@/components/ui/LanguageFlag";
import { LanguageSwitchRow } from "@/components/ui/LanguageSwitchRow";
import { routes } from "@/lib/routes";
import { languageLabel } from "@/lib/languages";
import { cn } from "@/lib/utils";

import { switchActiveLanguageAction } from "./actions";
import { copy } from "./content";

export type LanguageSwitcherOption = {
  code: string;
  endonym: string;
  isActive: boolean;
};

export type LanguageSwitcherProps = {
  languages: readonly LanguageSwitcherOption[];
  /** `floating` for mobile corner chrome; `inline` for the desktop header. */
  layout?: "floating" | "inline";
};

const addLanguageClass = "w-full shadow-raised";

/**
 * One-action language switch (UC-025). Contract: app-shell.md, mobile-nav-v2.md
 */
export function LanguageSwitcher({ languages, layout = "floating" }: LanguageSwitcherProps) {
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    menuTop: number;
    menuLeft: number;
    triggerTop: number;
    triggerLeft: number;
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const [switchFailed, setSwitchFailed] = useState(false);

  const active =
    languages.find((language) => language.isActive)?.code ?? languages[0]?.code ?? "";
  const activeEndonym =
    languages.find((language) => language.code === active)?.endonym ?? active;

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setMenuPosition({
        menuTop: rect.bottom + 8,
        menuLeft: rect.left,
        triggerTop: rect.top,
        triggerLeft: rect.left,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
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

  if (languages.length === 0) return null;

  const openMenu = () => {
    const trigger = triggerRef.current;
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      setMenuPosition({
        menuTop: rect.bottom + 8,
        menuLeft: rect.left,
        triggerTop: rect.top,
        triggerLeft: rect.left,
      });
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

  const onSwitch = (code: string) => {
    if (code === active) {
      setOpen(false);
      return;
    }
    setSwitchFailed(false);
    startTransition(async () => {
      try {
        await switchActiveLanguageAction(code);
        setOpen(false);
        router.refresh();
      } catch {
        setSwitchFailed(true);
      }
    });
  };

  if (languages.length === 1) {
    return (
      <span role="img" aria-label={copy.currentLanguage(activeEndonym)}>
        <LanguageFlag code={active} size="header" />
      </span>
    );
  }

  const popover =
    open && menuPosition
      ? createPortal(
          <div ref={popoverRef}>
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              className="language-switcher-scrim fixed inset-0 z-language-switcher-scrim"
              onClick={() => setOpen(false)}
            />

            <div
              role="menu"
              aria-label={copy.switchLanguage}
              className="fixed z-language-switcher-menu flex w-[min(100vw-2rem,16rem)] flex-col gap-2"
              style={{ top: menuPosition.menuTop, left: menuPosition.menuLeft }}
            >
              {languages.map((language) => (
                <LanguageSwitchRow
                  key={language.code}
                  code={language.code}
                  isActive={language.code === active}
                  activeLabel={copy.active}
                  disabled={pending}
                  onSelect={onSwitch}
                />
              ))}

              <ActionLink
                href={routes.chooseLanguage}
                variant="secondary"
                size="sm"
                className={addLanguageClass}
                onClick={() => setOpen(false)}
              >
                {copy.addLanguage}
              </ActionLink>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative flex flex-col gap-1">
      <div className="relative size-11 shrink-0 min-w-11">
        <IconButton
          ref={triggerRef}
          className={cn(
            open && menuPosition && "fixed z-language-switcher-trigger",
          )}
          style={
            open && menuPosition
              ? { top: menuPosition.triggerTop, left: menuPosition.triggerLeft }
              : undefined
          }
          aria-label={copy.switchLanguage}
          aria-expanded={open}
          aria-haspopup="menu"
          pending={pending}
          disabled={pending}
          onClick={toggleMenu}
        >
          <span aria-hidden="true" className="text-xl leading-none">
            {languageLabel(active).flag}
          </span>
        </IconButton>
      </div>

      {popover}

      {switchFailed ? (
        <p role="alert" className="max-w-[16rem] text-sm text-danger">{copy.switchError}</p>
      ) : null}
    </div>
  );
}

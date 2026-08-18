"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";

import { ActionLink } from "@/components/ui/ActionLink";
import { IconButton } from "@/components/ui/IconButton";
import { LanguageFlag } from "@/components/ui/LanguageFlag";
import { LanguageListRow } from "@/components/ui/LanguageListRow";
import type { LanguageHoldings } from "@/lib/db/language-holdings";
import { routes } from "@/lib/routes";
import { languageLabel } from "@/lib/languages";
import { hasUnaddedShippedLanguage } from "@/lib/starter-deck";
import { cn } from "@/lib/utils";

import { useTranslations } from "next-intl";

import { switchActiveLanguageAction } from "./actions";

export type LanguageSwitcherOption = {
  code: string;
  endonym: string;
  isActive: boolean;
};

export type LanguageSwitcherProps = {
  languages: readonly LanguageSwitcherOption[];
  languageHoldings?: Record<string, LanguageHoldings>;
  /** `floating` for mobile corner chrome; `inline` for the desktop header. */
  layout?: "floating" | "inline";
};

/**
 * One-action language switch (UC-025). Contract: app-shell.md, mobile-nav-v2.md
 */
export function LanguageSwitcher({
  languages,
  languageHoldings,
  layout = "floating",
}: LanguageSwitcherProps) {
  const router = useRouter();
  const t = useTranslations("appShell");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuTop, setMenuTop] = useState<number | null>(null);
  const [triggerPosition, setTriggerPosition] = useState<{ top: number; left: number } | null>(
    null,
  );
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
    if (layout === "inline") {
      return (
        <span className="text-sm font-medium text-ink" aria-current="true">
          {activeEndonym}
        </span>
      );
    }

    return (
      <span role="img" aria-label={t("currentLanguage", { endonym: activeEndonym })}>
        <LanguageFlag code={active} size="header" />
      </span>
    );
  }

  const popover =
    open && menuTop !== null
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
              aria-label={t("switchLanguage")}
              className="fixed z-language-switcher-menu flex w-[min(100vw-2rem,24rem)] flex-col gap-3"
              style={{ top: menuTop, left: triggerPosition?.left ?? 24 }}
            >
              {languages.map((language) => {
                const standing = languageHoldings?.[language.code];
                const poolSize = standing?.poolSize;
                return (
                  <LanguageListRow
                    key={language.code}
                    code={language.code}
                    isActive={language.code === active}
                    activeLabel={t("active")}
                    standing={
                      poolSize !== null && poolSize !== undefined
                        ? { held: standing?.heldCount ?? 0, pool: poolSize }
                        : null
                    }
                    standingLabel={(held, pool) => t("standing", { held, poolSize: pool })}
                    viewProgressHref={routes.progress}
                    viewProgressLabel={t("viewProgress")}
                    disabled={pending}
                    onSelect={
                      language.code === active ? undefined : () => onSwitch(language.code)
                    }
                  />
                );
              })}

              {hasUnaddedShippedLanguage(languages.map((language) => language.code)) ? (
                <ActionLink
                  href={routes.chooseLanguage}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  {t("addLanguage")}
                </ActionLink>
              ) : null}
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
          className={cn(open && triggerPosition && "fixed z-language-switcher-trigger")}
          style={
            open && triggerPosition
              ? { top: triggerPosition.top, left: triggerPosition.left }
              : undefined
          }
          aria-label={t("switchLanguage")}
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
        <p role="alert" className="max-w-full text-sm text-danger">{t("switchError")}</p>
      ) : null}
    </div>
  );
}

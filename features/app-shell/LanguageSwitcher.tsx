"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { ActionLink } from "@/components/ui/ActionLink";
import { LanguageFlag } from "@/components/ui/LanguageFlag";
import { LanguageSwitchRow } from "@/components/ui/LanguageSwitchRow";
import { buttonVariants } from "@/components/ui/Button";
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

const triggerClass = cn(
  buttonVariants({ variant: "floating", size: "sm" }),
  "size-11 min-h-11 min-w-11 rounded-full p-0",
);

/**
 * One-action language switch (UC-025). Contract: app-shell.md, mobile-nav-v2.md
 */
export function LanguageSwitcher({ languages, layout = "floating" }: LanguageSwitcherProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [switchFailed, setSwitchFailed] = useState(false);

  const active =
    languages.find((language) => language.isActive)?.code ?? languages[0]?.code ?? "";
  const activeEndonym =
    languages.find((language) => language.code === active)?.endonym ?? active;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (root && !root.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  if (languages.length === 0) return null;

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

  return (
    <div ref={rootRef} className="relative flex flex-col gap-1">
      <button
        type="button"
        className={cn(triggerClass, pending && "pointer-events-none opacity-70")}
        aria-label={copy.switchLanguage}
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={pending}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true" className="text-xl leading-none">
          {languageLabel(active).flag}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={copy.switchLanguage}
          className={cn(
            "absolute left-0 top-full z-50 mt-2 w-[min(100vw-2rem,16rem)] rounded-card border border-line bg-surface p-2 shadow-raised",
          )}
        >
          <ul className="flex list-none flex-col gap-2">
            {languages.map((language) => (
              <li key={language.code}>
                <LanguageSwitchRow
                  code={language.code}
                  isActive={language.code === active}
                  activeLabel={copy.active}
                  disabled={pending}
                  onSelect={onSwitch}
                />
              </li>
            ))}
          </ul>

          <ActionLink
            href={routes.chooseLanguage}
            variant="secondary"
            size="sm"
            className="mt-2 w-full"
            onClick={() => setOpen(false)}
          >
            {copy.addLanguage}
          </ActionLink>
        </div>
      ) : null}

      {switchFailed ? (
        <p role="alert" className="max-w-[16rem] text-sm text-danger">{copy.switchError}</p>
      ) : null}
    </div>
  );
}

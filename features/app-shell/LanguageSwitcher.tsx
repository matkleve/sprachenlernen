"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Select } from "@/components/ui/Select";
import { buttonVariants } from "@/components/ui/Button";
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

const floatingIconChipClass = cn(
  buttonVariants({ variant: "floating", size: "sm" }),
  "size-11 min-h-11 min-w-11 rounded-full p-0",
);

/**
 * One-action language switch (UC-025). Contract: app-shell.md, mobile-nav-v2.md
 */
export function LanguageSwitcher({ languages, layout = "floating" }: LanguageSwitcherProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [switchFailed, setSwitchFailed] = useState(false);

  if (languages.length === 0) return null;

  const active = languages.find((language) => language.isActive)?.code ?? languages[0]!.code;
  const activeEndonym = languages.find((language) => language.code === active)?.endonym ?? active;

  const onSwitch = (code: string) => {
    if (code === active) return;
    setSwitchFailed(false);
    startTransition(async () => {
      try {
        await switchActiveLanguageAction(code);
        router.refresh();
      } catch {
        setSwitchFailed(true);
      }
    });
  };

  if (layout === "inline") {
    const chipClass = cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-10 min-h-10");

    if (languages.length === 1) {
      return (
        <span className={cn(chipClass, "pointer-events-none cursor-default")} aria-current="true">
          {languages[0]!.endonym}
        </span>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        <Select
          aria-label={copy.switchLanguage}
          disabled={pending}
          value={active}
          onChange={(event) => onSwitch(event.target.value)}
          className={cn(
            chipClass,
            "w-auto min-w-[7rem] pr-8 text-sm font-semibold",
            pending && "pointer-events-none opacity-70",
          )}
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.endonym}
            </option>
          ))}
        </Select>
        {switchFailed ? (
          <p role="alert" className="text-sm text-danger">{copy.switchError}</p>
        ) : null}
      </div>
    );
  }

  // Mobile floating: icon chip with a full-size native select over it.
  // Select's wrapper must cover the chip — an absolute select inside a
  // zero-height wrapper is a dead control (TRAPS candidate).
  if (languages.length === 1) {
    return (
      <span
        className={cn(floatingIconChipClass, "pointer-events-none cursor-default")}
        role="img"
        aria-label={copy.currentLanguage(activeEndonym)}
      >
        <Languages aria-hidden className="size-5 shrink-0" />
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className={cn("relative", floatingIconChipClass, pending && "opacity-70")}>
        <Languages
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2"
        />
        <Select
          aria-label={copy.switchLanguage}
          disabled={pending}
          value={active}
          onChange={(event) => onSwitch(event.target.value)}
          wrapperClassName="absolute inset-0 z-10"
          className={cn(
            "h-full w-full min-h-0 cursor-pointer opacity-0",
            pending && "pointer-events-none",
          )}
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.endonym}
            </option>
          ))}
        </Select>
      </div>
      {switchFailed ? (
        <p role="alert" className="max-w-[11rem] text-sm text-danger">{copy.switchError}</p>
      ) : null}
    </div>
  );
}

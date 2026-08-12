"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

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

  if (languages.length === 0) return null;

  const active = languages.find((language) => language.isActive)?.code ?? languages[0]!.code;
  const activeEndonym = languages.find((language) => language.code === active)?.endonym ?? active;

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
      <Select
        aria-label={copy.switchLanguage}
        disabled={pending}
        value={active}
        onChange={(event) => {
          const code = event.target.value;
          if (code === active) return;
          startTransition(async () => {
            await switchActiveLanguageAction(code);
            router.refresh();
          });
        }}
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
    );
  }

  // Mobile floating: icon-only round chip (endonym in aria-label, not on screen).
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
    <div className={cn("relative", floatingIconChipClass, pending && "opacity-70")}>
      <Languages aria-hidden className="size-5 shrink-0 pointer-events-none" />
      <Select
        aria-label={copy.switchLanguage}
        disabled={pending}
        value={active}
        onChange={(event) => {
          const code = event.target.value;
          if (code === active) return;
          startTransition(async () => {
            await switchActiveLanguageAction(code);
            router.refresh();
          });
        }}
        className={cn(
          "absolute inset-0 cursor-pointer opacity-0",
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
  );
}

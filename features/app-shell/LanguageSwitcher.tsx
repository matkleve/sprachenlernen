"use client";

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

/**
 * One-action language switch (UC-025). Contract: app-shell.md, mobile-nav-v2.md
 */
export function LanguageSwitcher({ languages, layout = "floating" }: LanguageSwitcherProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (languages.length === 0) return null;

  const active = languages.find((language) => language.isActive)?.code ?? languages[0]!.code;
  const chipClass =
    layout === "floating"
      ? cn(buttonVariants({ variant: "floating", size: "sm" }), "h-11 min-h-11")
      : cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-10 min-h-10");

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

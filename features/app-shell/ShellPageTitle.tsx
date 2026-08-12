"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { shellPageTitle } from "./page-title";

/**
 * Centered page title for the shell header. Contract:
 * docs/specs/feature/app-shell.md
 */
export function ShellPageTitle({ className }: { className?: string }) {
  const pathname = usePathname();
  const title = shellPageTitle(pathname);

  if (!title) return null;

  return (
    <h1
      className={cn(
        "pointer-events-none absolute top-1/2 left-1/2 max-w-[min(52vw,14rem)] -translate-x-1/2 -translate-y-1/2 truncate text-center text-sm font-semibold tracking-tight text-ink",
        className,
      )}
      title={title}
    >
      {title}
    </h1>
  );
}

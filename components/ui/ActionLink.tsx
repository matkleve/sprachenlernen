"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Spinner } from "@/components/ui/Spinner";
import { buttonVariants, type ButtonProps } from "@/components/ui/Button";
import { usePendingNavigation } from "@/components/ui/use-pending-navigation";
import { cn } from "@/lib/utils";

type ActionLinkProps = ComponentPropsWithoutRef<typeof Link> &
  Pick<ButtonProps, "variant" | "size"> & {
    children: ReactNode;
  };

/**
 * Navigation control styled as a button with press + pending feedback.
 * Contract: docs/specs/feature/interaction-feedback.md
 */
export function ActionLink({
  href,
  variant,
  size,
  className,
  children,
  onClick,
  ...props
}: ActionLinkProps) {
  const { isPending, onClick: pendingClick } = usePendingNavigation(href);
  const showSpinner =
    isPending && (variant === "primary" || variant === "danger" || variant === undefined);

  return (
    <Link
      href={href}
      aria-busy={isPending || undefined}
      className={cn(
        buttonVariants({ variant, size }),
        "touch-manipulation",
        isPending && "pointer-events-none opacity-70",
        className,
      )}
      onClick={(event) => {
        pendingClick(event);
        onClick?.(event);
      }}
      {...props}
    >
      {showSpinner ? <Spinner className="size-4 shrink-0" /> : null}
      {children}
    </Link>
  );
}

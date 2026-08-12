"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { buttonVariants, type ButtonProps, type PendingPolicy } from "@/components/ui/Button";
import {
  pendingBusy,
  pendingNavRing,
  touchTarget,
} from "@/components/ui/interaction-kernel";
import { Spinner } from "@/components/ui/Spinner";
import { usePendingNavigation } from "@/components/ui/use-pending-navigation";
import { cn } from "@/lib/utils";

type ActionLinkProps = ComponentPropsWithoutRef<typeof Link> &
  Pick<ButtonProps, "variant" | "size"> & {
    children: ReactNode;
    pendingPolicy?: PendingPolicy;
  };

function showSpinnerForPending(
  isPending: boolean,
  policy: PendingPolicy,
  variant: ActionLinkProps["variant"],
): boolean {
  if (!isPending || policy !== "cta") return false;
  return variant === "primary" || variant === "danger" || variant === undefined;
}

/**
 * Navigation control styled as a button with press + pending feedback.
 * Contract: docs/specs/feature/interaction-feedback.md
 */
export function ActionLink({
  href,
  variant,
  size,
  pendingPolicy = "cta",
  className,
  children,
  onClick,
  ...props
}: ActionLinkProps) {
  const { isPending, onClick: pendingClick } = usePendingNavigation(href);
  const showSpinner = showSpinnerForPending(isPending, pendingPolicy, variant);
  const showNavRing = isPending && pendingPolicy === "nav";

  return (
    <Link
      href={href}
      aria-busy={isPending || undefined}
      className={cn(
        buttonVariants({ variant, size }),
        touchTarget,
        isPending && pendingPolicy !== "nav" && pendingBusy,
        showNavRing && pendingNavRing,
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

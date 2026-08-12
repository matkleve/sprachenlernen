import { forwardRef, type ButtonHTMLAttributes } from "react";

import { Button, iconButtonClass, iconButtonSmClass, type ButtonProps } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  Pick<ButtonProps, "pending" | "pendingPolicy" | "variant"> & {
    /** Defaults to nav — ring feedback, no spinner on icon-only controls. */
    pendingPolicy?: ButtonProps["pendingPolicy"];
    size?: "md" | "sm";
  };

/**
 * Round icon-only button — language switcher trigger, menus, report flag.
 * Contract: docs/specs/system/interaction-registry.json
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    className,
    pendingPolicy = "nav",
    variant = "floating",
    size = "md",
    children,
    ...props
  },
  ref,
) {
  return (
    <Button
      ref={ref}
      variant={variant}
      size="sm"
      pendingPolicy={pendingPolicy}
      className={cn(size === "sm" ? iconButtonSmClass : iconButtonClass, className)}
      {...props}
    >
      {children}
    </Button>
  );
});

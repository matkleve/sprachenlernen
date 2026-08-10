import { cn } from "@/lib/utils";

type SpinnerProps = {
  className?: string;
};

/** Decorative spinner for pending primary actions. */
export function Spinner({ className }: SpinnerProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
}

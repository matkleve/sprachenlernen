import { cn } from "@/lib/utils";

/** Frosted backdrop — fades in as collapse approaches 1. */
export function headerBackdropClass(collapse: number): string {
  return cn(
    "border-b border-transparent transition-[background-color,backdrop-filter,border-color] duration-150",
    collapse > 0.02 && "border-line bg-surface/80 backdrop-blur-md",
  );
}

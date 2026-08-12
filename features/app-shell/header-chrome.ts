import { cn } from "@/lib/utils";

/** Frosted backdrop that fades in once the page scrolls. */
export function headerBackdropClass(scrolled: boolean): string {
  return cn(
    "border-b border-transparent transition-[background-color,backdrop-filter,border-color] duration-200",
    scrolled && "border-line bg-surface/80 backdrop-blur-md",
  );
}

import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge has to be told about our custom tokens.
 *
 * Out of the box it only knows Tailwind's default scales, so it does not
 * recognise `rounded-pill` as a border-radius at all — and a class it cannot
 * classify is a class it will never treat as conflicting. `cn("rounded-pill",
 * "rounded-none")` then emits BOTH, and which one wins is down to CSS source
 * order. It looks like `cn()` is broken; it is actually uninformed.
 *
 * These keys mirror the `@theme` namespaces in app/globals.css. **Adding a
 * token there means adding its name here** — otherwise callers silently lose
 * the ability to override it.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: [
        "canvas",
        "surface",
        "surface-raised",
        "ink",
        "muted",
        "line",
        "line-strong",
        "accent",
        "accent-deep",
        "accent-soft",
        "accent-ink",
        "danger",
        "danger-deep",
        "danger-soft",
        "danger-ink",
        "success",
        "success-deep",
        "success-soft",
        "success-ink",
      ],
      radius: ["card", "pill"],
      shadow: ["soft", "raised"],
      spacing: ["page-top", "page-bottom", "page-content"],
      ease: ["out-soft"],
    },
  },
});

/**
 * Merge class names, resolving Tailwind conflicts so that **later wins**.
 *
 * That ordering is the point: it lets a caller neutralise a component's own
 * utility (`<Button className="rounded-none">`) without the component exposing
 * a prop for every possible override.
 *
 * It does NOT help across Tailwind layers — a utility always beats a class
 * defined in `@layer components`, regardless of order. See docs/TRAPS.md.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
        "grade-again-soft",
        "grade-again-deep",
        "grade-again-ink",
        "grade-hard-soft",
        "grade-hard-deep",
        "grade-hard-ink",
        "grade-good-soft",
        "grade-good-deep",
        "grade-good-ink",
        "grade-easy-soft",
        "grade-easy-deep",
        "grade-easy-ink",
        "skill-reading",
        "skill-reading-soft",
        "skill-listening",
        "skill-listening-soft",
        "skill-speaking",
        "skill-speaking-soft",
        "skill-writing",
        "skill-writing-soft",
        "section-reading",
        "section-reading-soft",
        "section-listening",
        "section-listening-soft",
        "section-speaking",
        "section-speaking-soft",
        "section-writing",
        "section-writing-soft",
        "section-form",
        "section-form-soft",
        "section-vocabulary",
        "section-vocabulary-soft",
        "section-world",
        "section-world-soft",
        "section-commitments",
        "section-commitments-soft",
        "lang-es-1",
        "lang-es-2",
        "lang-es-3",
        "lang-it-1",
        "lang-it-2",
        "lang-it-3",
      ],
      radius: ["card", "chip", "pill"],
      shadow: ["soft", "raised"],
      spacing: [
        "page-top",
        "page-bottom",
        "page-content",
        "shell-float-top",
        "shell-float-top-compact",
        "shell-float-top-expanded",
        "shell-float-nav-height",
        "shell-float-nav-gap",
        "shell-float-nav-pad-y",
        "shell-footer-scrim-fade",
        "shell-float-bottom",
      ],
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

/**
 * `decodeURIComponent`, but a malformed percent-encoding (e.g. a hand-edited
 * `?error=%` in the address bar) returns `undefined` instead of throwing an
 * uncaught `URIError` that would 500 the page.
 */
export function safeDecodeURIComponent(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return undefined;
  }
}

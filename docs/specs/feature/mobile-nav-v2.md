# Mobile navigation v2 — floating pill and corner chips

<!-- id: SPEC-feature-mobile-nav-v2 -->
<!-- use-case: UC-063 -->
<!-- status: active -->

Phone-width signed-in chrome: a **floating destination pill** at the bottom and
**floating corner chips** at the top (back when drill-in, sign-out always).
Desktop keeps the horizontal header from [`app-shell.md`](app-shell.md).

**Parent:** [`app-shell.md`](app-shell.md). Supersedes
[`mobile-nav.md`](mobile-nav.md) (hamburger drawer). Still exactly Methods, Words,
Progress (ADR-0009). **No due-count badges** (UC-063).

## Scope

- **In:** `< md` floating bottom pill (three equal segments, icon + micro-label);
  floating top-right sign-out (icon + label); floating top-left back on drill-in
  routes; safe-area insets on shell `main`; token surfaces only; desktop `≥ md`
  unchanged.
- **Out:** hamburger and drawer; full-width mobile header bar; hiding the pill on
  review; profile destination; notification badges; marketing shell.

**Reuse:** `NavLink`, `Button`, `shellDestinations` in `destinations.ts`.
**Gap:** `Button` `floating` variant for corner chips (bordered surface float).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Viewport ≥ `md` | Horizontal nav + inline sign-out in header; no floating chrome |
| 2 | Viewport &lt; `md` on a destination root | Bottom pill visible; top-right sign-out float; no top-left chip |
| 3 | Viewport &lt; `md` on a drill-in route | Back float appears top-left; target is the parent destination |
| 4 | Taps a pill segment | Navigates; current segment marked with `aria-current="page"` |
| 5 | Taps sign-out float | Same `signOutAction` as desktop |
| 6 | Taps back float | Navigates to parent destination (`href`, not blind history) |
| 7 | Scrolls page content | Floats stay visible; content clears floats via shell padding |

## Back targets

When `pathname` is a strict child of a destination (`/words/review`, `/methods/id`,
…), the back chip links to that destination root with its label. Destination
roots themselves show no back chip.

## States

No open/closed machine — pill segments are `current` or `default` only, derived
from the URL.

## Layout

The shell owns mobile inset padding on `<main>` so pages do not each account for
float height. Tokens: `--spacing-shell-float-top`, `--spacing-shell-float-bottom`
in `app/globals.css`.

## Accessibility

- Pill: `<nav aria-label="Switch destination">`; each segment a real link.
- Corner chips: ≥ 44px touch targets; back announces destination name.
- `prefers-reduced-motion`: no entrance animations on floats.

## Acceptance criteria

- [ ] Given viewport &lt; `md` and a signed-in session, when the shell renders,
      then a bottom pill shows three destinations with icon + label and no
      hamburger.
- [ ] Given viewport &lt; `md` on `/words`, then no top-left back chip appears.
- [ ] Given viewport &lt; `md` on `/words/review`, then a back chip links to
      `/words` and the bottom pill remains visible.
- [ ] Given viewport &lt; `md`, then a top-right sign-out float is always present.
- [ ] Given any viewport, then exactly three pill segments — no fourth, no
      due-count digit (UC-063 negative).
- [ ] Given viewport ≥ `md`, then horizontal destination nav renders without
      floating chrome.
- [ ] Given the mobile shell, when tested with axe-core, then no violations.

## Check

`npm test -- mobile-nav-v2 app-shell`

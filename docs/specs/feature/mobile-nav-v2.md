# Mobile navigation v2 — floating pill and corner chips

<!-- id: SPEC-feature-mobile-nav-v2 -->
<!-- use-case: UC-063 -->
<!-- status: active -->

Phone-width signed-in chrome: a **floating destination pill** at the bottom and
**floating corner chips** at the top (back when drill-in, account always).
Desktop keeps the horizontal header from [`app-shell.md`](app-shell.md).

**Parent:** [`app-shell.md`](app-shell.md). Supersedes
[`mobile-nav.md`](mobile-nav.md) (hamburger drawer). Still exactly Methods, Words,
Progress (ADR-0009). **No due-count badges** (UC-063).

## Scope

- **In:** `< md` floating bottom pill (three equal segments, icon + micro-label);
  floating top-right account chip (icon + label) linking to `/profile`; floating top-left back on drill-in
  routes; safe-area insets on shell `main`; token surfaces only; desktop `≥ md`
  unchanged.
- **Out:** hamburger and drawer; full-width mobile header bar; hiding the pill on
  review; profile destination; notification badges; marketing shell.

**Reuse:** `NavLink`, `Button`, `shellDestinations` in `destinations.ts`.
**Gap:** `Button` `floating` variant for corner chips (bordered surface float).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Viewport ≥ `md` | Horizontal nav + inline account link in header; no floating chrome |
| 2 | Viewport &lt; `md` on a destination root | Bottom pill visible; top-right account chip; **top-left language switcher** when the account has at least one learning language |
| 3 | Viewport &lt; `md` on a drill-in route | Back float appears top-left; target is the parent destination; language switcher remains reachable beside the back chip when the account has more than one language |
| 4 | Taps a pill segment | Navigates; current segment marked with `aria-current="page"` |
| 5 | Taps the account chip | `/profile`, where sign out now lives ([`../page/profile.md`](../page/profile.md)) |
| 6 | Taps back float | Navigates to parent destination (`href`, not blind history) |
| 7 | Has more than one learning language | Top-left switcher lists every language; choosing one makes it active and refreshes the current page — one action (UC-025) |
| 8 | Has exactly one learning language | Top-left shows its endonym as a label, not a control |
| 9 | Scrolls page content | Floats stay visible; content clears floats via shell padding |

## Back targets

`shellBackTarget(pathname)` returns `null` on destination roots (no chip).
On drill-in routes it returns `{ href, label }` for the parent destination.

| Path pattern | Back `href` | Label copy |
| --- | --- | --- |
| `/words/review` | `/words` | Words |
| `/methods/[id]` | `/methods` | Methods |
| `/methods`, `/words`, `/progress` | *(no chip)* | — |

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
- [ ] Given viewport &lt; `md` on `/words`, then no top-left back chip appears, and a language switcher or label appears when the account has a learning language.
- [ ] Given viewport &lt; `md` on `/words/review`, then a back chip links to
      `/words` and the bottom pill remains visible.
- [ ] Given viewport &lt; `md`, then a top-right **account** chip is always present, linking to `/profile`, and no sign-out control renders in the shell.
- [ ] Given any viewport, then exactly three pill segments — no fourth, no
      due-count digit (UC-063 negative).
- [ ] Given viewport ≥ `md`, then horizontal destination nav renders without
      floating chrome.
- [ ] Given the mobile shell, when tested with axe-core, then no violations.

## Check

`npm test -- mobile-nav-v2 app-shell`

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
  floating top-right **icon-only** account chip (round, ≥ 44px) linking to
  `/profile`; floating top-left back on drill-in routes; **icon-only** language
  chip (round) on destination roots only — hidden on drill-in so back and
  language never compete; safe-area insets on shell `main`; token surfaces only;
  desktop `≥ md` unchanged.
- **Out:** hamburger and drawer; full-width mobile header bar; hiding the pill on
  review; profile destination; notification badges; marketing shell.

**Reuse:** `NavLink`, `Button`, `shellDestinations` in `destinations.ts`.
**Gap:** `Button` `floating` variant for corner chips (bordered surface float).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Viewport ≥ `md` | Horizontal nav + inline account link in header; no floating chrome |
| 2 | Viewport &lt; `md` on a destination root | Bottom pill visible; top-right account icon chip; **top-left language icon chip** when the account has at least one learning language |
| 3 | Viewport &lt; `md` on a drill-in route | Back float appears top-left (label + arrow); target is the parent destination; **no language chip** — switching mid-drill-in is out of scope |
| 4 | Taps a pill segment | Navigates; current segment marked with `aria-current="page"` |
| 5 | Taps the account chip | `/profile`, where sign out now lives ([`../page/profile.md`](../page/profile.md)) |
| 6 | Taps back float | Navigates to parent destination (`href`, not blind history) |
| 7 | Has more than one learning language | Top-left icon opens the language list; choosing one makes it active and refreshes the current page — one action (UC-025) |
| 8 | Has exactly one learning language | Top-left shows a non-interactive language icon with the endonym in `aria-label` |
| 9 | Scrolls page content | Floats stay visible; content clears floats via shell padding; the top bar gains a frosted blur behind it |
| 10 | On any signed-in route | The page title appears centered in the top bar (mobile floats and desktop header) |

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
      `/words`, no language chip appears, and the bottom pill remains visible.
- [ ] Given viewport &lt; `md`, then a top-right **account** icon chip is always
      present (no text label), linking to `/profile`, and no sign-out control
      renders in the shell.
- [ ] Given viewport &lt; `md` on `/words/review` with `?method=srs-session`,
      then the review session fits one screen without vertical scroll at default
      phone height (card + grades visible together).
- [ ] Given viewport &lt; `md` on `/words`, when the learner scrolls, then the
      top bar shows a frosted blur over scrolling content and the page title
      "Words" is centered between the corner chips.
- [ ] Given any viewport, then exactly three pill segments — no fourth, no
      due-count digit (UC-063 negative).
- [ ] Given viewport ≥ `md`, then horizontal destination nav renders without
      floating chrome.
- [ ] Given the mobile shell, when tested with axe-core, then no violations.

## Check

`npm test -- mobile-nav-v2 app-shell`

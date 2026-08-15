# Mobile navigation v2 — floating pill and corner chips

<!-- id: SPEC-feature-mobile-nav-v2 -->
<!-- use-case: UC-063 -->
<!-- status: active -->

Phone-width signed-in chrome: a **floating destination pill** at the bottom and
**floating corner chips** at the top (back when drill-in, account always).
**Applies only below `md`** — iPad and desktop use flat top nav
([`page-layout.md`](page-layout.md), [`../../study/28-mobile-desktop-layout.md`](../../study/28-mobile-desktop-layout.md)).
Desktop keeps the horizontal header from [`app-shell.md`](app-shell.md).

**Parent:** [`app-shell.md`](app-shell.md). Supersedes
[`mobile-nav.md`](mobile-nav.md) (hamburger drawer). Still exactly Methods, Words,
Progress (ADR-0009). **No due-count badges** (UC-063).

## Scope

- **In:** `< md` floating bottom pill (three **icon-only** round segments matching the
  corner chips — `IconLink`, 44px, labels in `aria-label` only); floating top-right
  **icon-only** account chip (round, ≥ 44px) linking to
  `/profile`; floating top-left **either** a back chip on drill-in routes **or**
  the emoji language chip on destination roots — never both; safe-area insets on
  shell `main`; token surfaces only; desktop `≥ md` unchanged. The language chip
  (decorative glyph from `lib/languages.ts`, not the identifier) that opens a
  popover of [`language-list-row.md`](../component/language-list-row.md) cards.
- **Out:** hamburger and drawer; full-width mobile header bar; hiding the pill on
  review; profile destination; notification badges; marketing shell.

**Reuse:** `IconLink` (mobile pill segments), `NavLink` (desktop header),
`Button`, `shellDestinations` in `destinations.ts`.
**Gap:** `Button` `floating` variant for corner chips (bordered surface float).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Viewport ≥ `md` | Horizontal nav + inline account link in header; no floating chrome |
| 2 | Viewport &lt; `md` on a destination root | Bottom pill visible (three icon-only round chips in a compact pill, same size as corner chips); top-right account icon chip; **top-left language icon chip** when the account has at least one learning language |
| 3 | Viewport &lt; `md` on a drill-in route | **Icon-only** back chip (round, same size as the language chip) in the top-left corner; **no language chip** — target is the parent destination (`aria-label` names it) |
| 4 | Taps a pill segment | Navigates; current segment marked with `aria-current="page"` |
| 5 | Taps the account chip | `/profile`, where sign out now lives ([`../page/profile.md`](../page/profile.md)) |
| 6 | Taps back float | Navigates to parent destination (`href`, not blind history) |
| 7 | Has more than one learning language | Language emoji chip opens a popover: blurred scrim over the page, stacked language cards (gap between each), then **Add a language**; choosing a row makes it active and refreshes — one action (UC-025) |
| 8 | Has exactly one learning language | Top-left shows a non-interactive flag circle with the endonym in `aria-label` |
| 9 | Scrolls page content | Floats stay fixed; the page title stays centered and scales down; a scrim (blur + tint) fades in at the top and out toward the bottom of the header; a matching scrim sits behind the bottom pill, **lifted above Safari's bottom toolbar**, and **blocks taps from reaching content underneath** |
| 10 | On any signed-in route | The page title is centered between the corner chips — large at scroll top, smaller after scrolling down; on mobile it may wrap to **two lines** within a fixed max width, never overlapping the chips; **if it wraps to two lines at rest, it stays two lines while scaling down** (no reflow to one line on scroll); when it wraps, `main` uses `--spacing-shell-float-top-expanded` so content does not sit under the corner chips |

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

Shell chrome, scroll modes, and who owns padding:
[`page-layout.md`](page-layout.md). This spec owns only the floating controls
themselves. Tokens: `--spacing-shell-float-top`, `--shell-float-top-active`,
`--spacing-shell-float-bottom`, `--shell-visual-viewport-bottom-inset`,
`--spacing-shell-float-nav-height` in `app/globals.css`.
`useVisualViewportBottomInset` measures iOS Safari's bottom toolbar on **resize**
when visible; in **standalone PWA** the inset stays `0`. The footer scrim root is
`fixed bottom-0`; only the pill uses `.shell-float-nav-pill-lift` to sit above
measured browser chrome. `ShellPageTitle` sets `--shell-float-top-active` to the
expanded value when the title wraps to two lines.

## Accessibility

- Pill: `<nav aria-label="Switch destination">`; each segment a real link.
- Corner chips: ≥ 44px touch targets; back is icon-only with `aria-label` naming the parent destination.
- `prefers-reduced-motion`: no entrance animations on floats.

## Acceptance criteria

- [ ] Given viewport &lt; `md` and a signed-in session, when the shell renders,
      then a bottom pill shows three icon-only destination chips (no visible text
      labels) and no hamburger.
- [ ] Given viewport &lt; `md`, when the learner taps the pill's dead zones or
      scrim, then page content underneath does not receive the tap.
- [ ] Given viewport &lt; `md` and iOS Safari's bottom toolbar is visible, when
      the shell renders, then the bottom pill sits above the toolbar (measured via
      `useVisualViewportBottomInset`, not a fixed offset).
- [ ] Given viewport &lt; `md` on any drill-in route, then the top-left shows
      **either** a back chip **or** a language chip — never both.
- [ ] Given viewport &lt; `md` on `/methods/[id]`, then a back chip links to
      `/methods` and **no** language chip appears in the top-left corner.
- [ ] Given viewport &lt; `md` on `/words/review`, then a back chip links to
      `/words`, **no** language chip appears, and the bottom pill remains visible.
- [ ] Given viewport &lt; `md`, then a top-right **account** icon chip is always
      present (no text label), linking to `/profile`, and no sign-out control
      renders in the shell.
- [ ] Given viewport &lt; `md` on `/words/review` with `?method=srs-session`,
      then the review session fits one screen without vertical scroll at default
      phone height (card + grades visible together).
- [ ] Given viewport &lt; `md` on `/words`, when the learner scrolls, then the
      page title stays centered between the corner chips, scales down smoothly,
      and a header scrim (blur + tint) fades in at the top and out toward the
      bottom edge.
- [ ] Given any viewport, then exactly three pill segments — no fourth, no
      due-count digit (UC-063 negative).
- [ ] Given viewport ≥ `md`, then horizontal destination nav renders without
      floating chrome.
- [ ] Given viewport &lt; `md` and a long drill-in title, when the learner
      scrolls, then the title scales down but **keeps the same line count** as at
      scroll top (two lines stay two lines).

## Check

`npm test -- mobile-nav-v2 app-shell`

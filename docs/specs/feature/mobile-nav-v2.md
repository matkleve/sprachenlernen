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
  review; profile destination; notification badges; marketing shell; **per-route
  bottom inset** to normalise Safari toolbar visibility (impossible — see
  [`page-layout.md`](page-layout.md) § Safari bottom toolbar).

**Reuse:** `IconLink` (mobile pill segments), `NavLink` (desktop header),
`Button`, `shellDestinations` in `destinations.ts`.
**Gap:** `Button` `floating` variant for corner chips (bordered surface float).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Viewport ≥ `md` | Horizontal nav + inline account link in header; no floating chrome |
| 2 | Viewport &lt; `md` on a destination root | Bottom pill visible (three icon-only round chips in a compact pill, same size as corner chips); top-right account icon chip; **top-left language icon chip** when the account has at least one learning language |
| 3 | Viewport &lt; `md` on a drill-in route | **Icon-only** back chip (round, same size as the language chip) in the top-left corner; **no language chip** — target is the parent destination (`aria-label` names it); neutral surface at rest, accent on press |
| 4 | Taps a pill segment | Navigates; current segment marked with `aria-current="page"` |
| 5 | Taps the account chip | `/profile`, where sign out now lives ([`../page/profile.md`](../page/profile.md)) |
| 5a | Is on `/profile` | Account chip carries `aria-current="page"` and accent fill, same as a current pill segment |
| 6 | Taps back float | Navigates to parent destination (`href`, not blind history) |
| 7 | Has more than one learning language | Language emoji chip opens a popover: blurred scrim over the page, stacked language cards (gap between each), then **Add a language**; choosing a row makes it active and refreshes — one action (UC-025) |
| 8 | Has exactly one learning language | Top-left shows a non-interactive flag circle with the endonym in `aria-label` |
| 9 | Scrolls page content | Floats stay fixed; header scrim as today; **footer scrim bleeds to the viewport bottom** (behind Safari toolbar when present); **destination pill** sits above Safari chrome via `visualViewport` inset and has **padding inside the scrim band**; tap shield blocks dead zones |
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

No open/closed machine. Pill segments and the account chip are `current` or
`default`, derived from the URL. The back chip on drill-in routes is neutral at
rest — see [`interaction-feedback.md`](interaction-feedback.md) § Current navigation.

## Layout

Shell chrome, scroll modes, and who owns padding:
[`page-layout.md`](page-layout.md). This spec owns only the floating controls
themselves. Tokens: `--spacing-shell-float-top`, `--shell-float-top-active`,
`--spacing-shell-float-bottom`, `--shell-visual-viewport-bottom-inset`,
`--spacing-shell-float-nav-height` in `app/globals.css`.
`useVisualViewportBottomInset` measures iOS Safari's bottom toolbar on **resize**
when visible (not on scroll — offsetTop jitters while the page moves).
`.shell-float-footer-scrim` is `fixed bottom-0`; `.shell-float-nav-pill`
positions the pill above measured chrome (legacy `.shell-float-nav-bottom` is
pill-only). Toolbar show/hide is **Safari-controlled** — same measurement on every
route; do not add pathname-specific inset. Study:
[`../../study/29-ios-inset-by-route.md`](../../study/29-ios-inset-by-route.md).
`ShellPageTitle` sets `--shell-float-top-active` to the expanded value when the
title wraps to two lines.

## Accessibility

- Pill: `<nav aria-label="Switch destination">`; each segment a real link.
- Corner chips: ≥ 44px touch targets; back is icon-only with `aria-label` naming the parent destination.
- `prefers-reduced-motion`: no entrance animations on floats.

## Acceptance criteria

- [ ] Given viewport &lt; `md` and a signed-in session, when the shell renders,
      then a bottom pill shows three icon-only destination chips (no visible text
      labels), a **Pride version label** (`vPROUD.DEFAULT.SHAME`) centred under
      the pill in `text-shell-version`, and no hamburger. Versioning:
      [`../../VERSIONING.md`](../../VERSIONING.md). When a newer build is
      deployed, a green **Update available** chip with a download icon appears
      **above** the pill per [`app-update.md`](app-update.md).
- [ ] Given viewport &lt; `md`, when the learner taps the pill's dead zones or
      scrim, then page content underneath does not receive the tap.
- [ ] Given viewport &lt; `md` and iOS Safari's bottom toolbar is visible, when
      the shell renders, then the **destination pill** sits above the toolbar
      (measured via `useVisualViewportBottomInset`) and the **footer scrim**
      still extends to the physical bottom of the viewport behind the toolbar.
- [ ] Given viewport &lt; `md` and no Safari bottom toolbar, when the shell
      renders, then the footer scrim extends to the viewport bottom and the pill
      has visible padding above and below inside the scrim band (not flush).
- [ ] Given viewport &lt; `md` on `/methods` with Safari toolbar hidden, when the
      shell renders, then inset is `0` and the pill sits low — **expected**, not
      a missing inset bug (same code as `/words`).
- [ ] Given viewport &lt; `md` on any drill-in route, then the top-left shows
      **either** a back chip **or** a language chip — never both.
- [ ] Given viewport &lt; `md` on `/methods/[id]`, then a back chip links to
      `/methods` and **no** language chip appears in the top-left corner.
- [ ] Given viewport &lt; `md` on `/words/review`, then a back chip links to
      `/words`, **no** language chip appears, and the bottom pill remains visible.
- [ ] Given viewport &lt; `md`, then a top-right **account** icon chip is always
      present (no text label), linking to `/profile`, and no sign-out control
      renders in the shell.
- [ ] Given viewport &lt; `md` on `/profile`, then the account icon chip is
      marked as the current page with accent fill.
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

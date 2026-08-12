# App shell — three destinations

<!-- id: SPEC-feature-app-shell -->
<!-- use-case: UC-063 -->
<!-- status: active -->

The frame every signed-in screen renders inside: the three destinations of
[ADR-0009](../../adr/0009-three-destinations.md), the marker for the one you are
on, and the way out. It is the `app/(app)/` route group's layout, so a
destination is built once and every screen inherits it.

## Scope

- **In:** the `(app)` layout; the three destinations — Methods, Words, Progress,
  in that order; the current-destination marker; the account link; the
  account gate that keeps `(app)` routes signed-in only.
- **Out:** what `/progress` contains ([`../page/progress.md`](../page/progress.md));
  `/words` content is [`../page/words.md`](../page/words.md); a fourth
  destination for profile or settings,
  which [ADR-0009](../../adr/0009-three-destinations.md) rejected as "a link in
  a corner, not a fifth of the screen"; the runner, which is a surface pushed
  over a destination rather than one of them; and the marketing half, which has
  no shell at all. Responsive mobile navigation:
  [`mobile-nav-v2.md`](mobile-nav-v2.md) (`< md` floating chrome; `≥ md` header).

**Reuse: `ActionLink`.** The account control is a link, not a form — sign out moved onto `/profile`. The
destinations are anchors, not buttons — they navigate, so they must be
right-clickable and openable in a new tab, which a `<button>` is not.

This spec takes over two lines that
[`../service/auth.md`](../service/auth.md) § Scope listed as out and handed
here by name: the first route that *requires* sign-in, and the visible
sign-out control that had no signed-in navigation to live in. That control is now an account link, and sign out sits on `/profile`.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens any `(app)` route while signed in | The shell renders with all three destinations, and the page inside it |
| 2 | Opens any `(app)` route while signed out | Redirected to `/login` **before anything renders** — the response carries no page, not even in its flight payload |
| 3 | Is on `/methods` | Methods carries `aria-current="page"`; the other two do not |
| 4 | Taps Words or Progress | That destination loads. Reaching them never passes through the situation filter or the menu (UC-063) |
| 5 | Signs out | The session ends and they land on `/`, the public landing page |
| 6 | Opens `/`, `/languages`, `/login` or `/signup` | No shell — those are `(marketing)` |
| 7 | A destination's content throws | The shell header and navigation remain; only the destination content area shows the error surface ([`errors-boundaries.md`](../service/errors-boundaries.md)) |
| 8 | Viewport &lt; `md` while signed in | Floating bottom pill + top-right account chip; no full-width header bar ([`mobile-nav-v2.md`](mobile-nav-v2.md)) |
| 9 | Viewport ≥ `md` while signed in | Horizontal destination nav + inline account link in header; no floating chrome |
| 10 | Has more than one learning language on any viewport | A language switcher in the desktop header (left of the destinations) switches the active language in one action (UC-025) |
| 11 | Scrolls page content on desktop | A header scrim (blur + tint) fades in at the top and out toward the bottom; the page title scales down while staying centered |
| 12 | On any signed-in route | The page title is always centered in the header — large at scroll top, smaller after scrolling down |

## States

Not a client state machine (`docs/STATE.md` §1): which destination is current is
derived from the URL on every render and held nowhere. The account condition is
the same two states [`../service/auth.md`](../service/auth.md) already names,
read per request.

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `gated` | no session on a non-public route | Redirect to `/login`; nothing under `(app)` is rendered at all | no |
| `shown` | a session | The shell renders around the destination | no |

Neither is terminal — signing in and signing out move between them, which is
[`../service/auth.md`](../service/auth.md) § States, not a second model.

## Data

Reads the current pathname, and the session — **in two places, on purpose.**

`middleware.ts` is the boundary, because it is the only layer that runs *before*
rendering: a layout's `redirect()` resolves alongside the page beneath it, so
the page is already rendered into the response body by the time the redirect
wins the status. `requireAccount()` in the layout stays as the backstop for a
route the matcher stops covering. Both call `requiresAccount()` from
`lib/routes.ts`, which gates every route that is not in `publicRoutes` — so a
page added under `app/(app)/` is protected even when it is not one of the three
destinations. The shell still renders exactly three links; that list is
`protectedRoutes`, checked separately. See [`../../TRAPS.md`](../../TRAPS.md) —
this was measured against a production build, not reasoned about.

Writes nothing except through `signOut()`.

**No count, in any form.** Not a badge, not a dot, not "12 due". UC-063 forbids
it, [`../../study/10-antipatterns.md`](../../study/10-antipatterns.md) A3 calls
the backlog counter the most common exit route from Anki, and a navigation badge
is the most prominent figure a phone can display. This is a data rule, not a
visual one: the shell is never given a number, so it cannot render one.

## Accessibility

- The destinations sit in a `<nav>` with an accessible name, so a screen-reader
  user can jump to it and knows what it is.
- The current destination is marked with `aria-current="page"` — the visual
  marker alone does not survive being read aloud.
- Every destination is a real link with an href, so it works before JavaScript
  and behaves like a link to the browser.

## Acceptance criteria

- [ ] Given a signed-in Account, when it opens an `(app)` route, then exactly
      three destinations render — Methods, Words, Progress — in that order, each
      linking to `/methods`, `/words` and `/progress`.
- [ ] Given a signed-in Account on `/methods`, then Methods is marked as the
      current page and **neither** Words nor Progress is.
- [ ] Given a signed-in Account on `/words`, then Words is marked as the current
      page and no residue of the previous destination's marker remains.
- [ ] **The negative UC-063 exists for:** given any `(app)` route, then the
      navigation renders no digit at all — no count, no badge, no dot.
- [ ] Given a signed-out visitor, when they open any route under `app/(app)/`,
      then the response is a redirect to `/login` **before anything renders**.
- [ ] Given a signed-out visitor, when they open a public route, then nothing
      redirects them.
- [ ] Given the shell, then it renders exactly three destinations — Methods,
      Words, Progress — and a fourth cannot appear in the navigation without a
      deliberate change to `protectedRoutes`.
- [ ] Given a signed-in Account with more than one learning language, then a
      language switcher is reachable from the shell without opening `/profile`.
- [ ] Given a signed-in Account on `/words`, then the shell header shows the page
      title "Words" centered and large at scroll top, scaling down smoothly on scroll.
- [ ] Given a signed-in Account, then an account link to `/profile` is present,
      and the shell itself renders no sign-out control — signing out is reached
      through the account link ([`../page/profile.md`](../page/profile.md)).
- [ ] Given a `(marketing)` route, then no destination navigation renders on it.
- [ ] Given a signed-in Account and viewport &lt; `md`, then the shell renders a
      floating destination pill and a top-right account chip (no hamburger).
- [ ] The rendered shell has no axe-core violations.

## Check

`npm test -- app-shell` — `app-shell.test.tsx` for the destinations and the
sign-out path, and `middleware-gate.test.ts` for the boundary. The second runs
in the `node` environment: `NextRequest` rejects jsdom's `Headers`, and nothing
in it renders.

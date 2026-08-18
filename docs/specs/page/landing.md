# Landing page — `/`

<!-- id: SPEC-page-landing -->
<!-- use-case: UC-011 -->
<!-- status: active -->

The public front door at `/` ([ADR-0010](../../adr/0010-the-route-model.md)).
Its job is to tell a signed-out visitor what this app is for and how to get in.
**T-B7 (2026-08-11):** thesis 1 led the headline; thesis 12 names the honest
time denominator in the body. **Owner 2026-08-18:** headline now leads with method
choice and checkable progress ([`study/38`](../../study/38-landing-page-update.md)
candidate **I**); thesis 1 moves to the pillar/contrast layer, not the hero.
Serves [UC-011](../../use-cases/UC-011-start-in-the-first-minute.md): the
account is the one unavoidable step, so the path to it must be visible on every
public page.

## Scope

- **In:** the `/` route; the public header on every `(marketing)` route; sign-in
  and sign-up calls to action (signed out) or **To app** and **Sign out**
  (signed in); a short statement of what the product optimises for, quoted from
  the study; a **method preview** — basic filters (time, skill, energy) and three
  catalogue methods with explain-only expansion (no session start). Signed-in
  visitors may read `/` — e.g. from **Open main website** on `/profile` when
  installing to the Home Screen.
- **Out:** full positioning copy and marketing argument (T-B7); OAuth; a fourth
  public route; anything that reads learner data.

**Reuse:** `ActionLink`, `IconButton`, `BrandMark`, `BrandLockup`,
`SubmitButton`, `Dialog`, `MethodFilter` (basic mode), `MethodCardHeader`,
`MethodBadgeRow`, **`ShellHeaderBar`** (shared with app shell — sticky/fixed +
scroll scrim). Header and hero CTAs navigate, so they are anchors styled with
the button contract — not `<button>` elements. Implementation:
`features/app-shell/ShellHeaderBar.tsx`, `features/marketing/PublicHeader.tsx`,
`PublicHeaderAuthControls.tsx`, `PublicHeaderMenu.tsx`,
`features/marketing/LandingMethodPreview.tsx` (preview island).

### Public header — chrome (shared with app shell)

The public header uses **`ShellHeaderBar`** — the same sticky/fixed bar and
scroll scrim as the signed-in shell ([`../feature/app-shell.md`](../feature/app-shell.md)).
Mobile: `fixed` top with safe-area padding; desktop: `sticky top-0`. Marketing
`main` uses `pt-[var(--shell-float-top-active)]` on `< md` so content does not
sit under the fixed bar. No `border-b` or solid `bg-surface` fill — the scrim
provides blur + tint on scroll.

### Public header — auth controls

The header is persistent wayfinding, not a second hero. A UX review (2026-08-17)
rejected the prior pattern for four reasons:

1. **`NavLink` is the wrong primitive.** It exists for app-shell destinations
   (Methods, Words, …) where `current` means *selected section*. Auth routes are
   one-off flows; treating **Sign in** like a shell tab made it a filled pill
   on `/login` — a second accent control beside **Create account**.
2. **Two primaries on auth pages.** `NavLink` `current` uses the same accent
   fill as `ActionLink` `primary`, violating
   [`button.md`](../component/button.md) ("at most one `primary` per surface") and
   erasing hierarchy.
3. **Mismatched geometry.** `NavLink` is `h-11` with `px-4` (shell nav sizing);
   **Create account** is `ActionLink` `sm` (`h-8`, `px-3`). Different heights,
   but similar pill widths because short labels inherit large horizontal padding
   — so the pair looked like two equal buttons.
4. **Hero already carries the CTA pair.** The header must stay lighter: one
   ghost control and one primary, not a duplicate button row.

| Control | Primitive | Variant / size | Notes |
| --- | --- | --- | --- |
| **Sign in** | `ActionLink` | `ghost sm` | signed out only; intrinsic width; no fill at rest |
| **Create account** | `ActionLink` | `primary sm` | signed out only; the **only** primary in the header |
| **Sign out** | `SubmitButton` in `<form>` | `ghost sm` | signed in only; POST via `signOutAction` |
| **To app** | `ActionLink` | `primary sm` | signed in only; navigates to `/methods` |

On `/login` or `/signup`, the matching link sets `aria-current="page"` but
**keeps its variant styling** — ghost stays ghost, primary stays primary. The
form heading carries "you are here"; the header does not add a second accent
fill.

Header auth links use `gap-3` so expanded `sm` hit targets do not overlap.

### Public header — mobile layout (`< md`)

On phone-width viewports the header matches the signed-in shell's top row
([`../feature/app-shell.md`](../feature/app-shell.md)): one line, no wrap.

| Zone | Primitive | Notes |
| --- | --- | --- |
| Left | `ActionLink` `ghost sm` + `BrandMark` | links to `/`; `aria-label` = product name |
| Centre | brand wordmark text | not a heading — the page hero owns `h1` on `/` |
| Right | `IconButton` + menu popover | `Menu` icon; opens auth controls in a `role="menu"` panel |

Auth controls move into the menu popover on mobile. The same variant rules
apply: one `primary`, one `ghost` (or `SubmitButton` ghost for sign-out). Desktop
(`≥ md`) keeps the inline header row from the table above.

The menu trigger uses `aria-expanded`, `aria-haspopup="menu"`, and a scrim to
dismiss. Escape closes the menu.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/` while signed out | The public header and landing hero render |
| 2 | Opens `/` while signed in | The header exposes **To app** and **Sign out** (inline on `≥ md`, in the mobile menu on `< md`); the hero renders with a single **To app** CTA instead of sign-up / sign-in |
| 3 | Taps **Create account** (signed out) | Navigates to `/signup` |
| 4 | Taps **Sign in** (signed out, hero or header) | Navigates to `/login` — on `< md`, **Sign in** is inside the menu popover |
| 5 | Taps **To app** (signed in) | Navigates to `/methods` |
| 6 | Taps **Sign out** (signed in) | POST `signOutAction`; lands on `/` signed out — on `< md`, **Sign out** is inside the menu popover |
| 7 | Opens any other `(marketing)` route | The same public header renders; the hero does not |
| 8 | Taps the logo chip or product name in the header | Navigates to `/` — logo chip on `< md`, lockup wordmark on `≥ md` |
| 9 | Viewport `< md` | Header shows logo chip, centred brand name, and a menu icon; auth controls are inside the menu |
| 10 | Taps the menu icon on mobile | Auth controls appear in a popover; scrim or Escape closes it |
| 11 | Taps outside the menu popover on mobile | Menu closes; header returns to the closed layout |

## States

The signed-in condition is read server-side per request, same as
[`../service/auth.md`](../service/auth.md). The mobile menu open/closed state is
client-only (`PublicHeaderMenu`).

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `signed-out` | no session | Header exposes sign-in controls (inline or in menu); hero shows sign-up / sign-in CTAs | no |
| `signed-in` | a session | Header exposes **To app** / **Sign out** (inline or in menu); hero shows **To app** only | no |
| `menu-closed` | initial; scrim, Escape, or navigation | `< md` header shows logo, centred brand, menu icon only | no |
| `menu-open` | menu icon tapped on `< md` | Popover shows auth controls; trigger has `aria-expanded="true"` | no |

## Data

Reads the session via `getAccount()` in the marketing layout (header) and on `/`
(hero CTAs). **Sign out** writes via `signOutAction`.

Copy lives in `messages/{locale}.json` (`marketing` namespace), including
`marketing.header.menu` for the mobile menu trigger and popover label. Sentences
quoted from the study are marked there with their source; nothing is invented for
positioning.

## Acceptance criteria

- [ ] Given a signed-out visitor on `/`, when the page renders, then **Sign in**
      and **Create account** are reachable from the header (inline on `≥ md`, in
      the menu on `< md`) and the hero's primary action is **Create account**.
- [ ] Given the public header on any `(marketing)` route at `≥ md`, when it
      renders, then **Create account** is the only `primary` control, **Sign in**
      uses `ghost`, and the two links do not share the same button variant.
- [ ] Given the public header menu on `< md` when opened, then **Create account**
      is the only `primary` control, **Sign in** uses `ghost`, and the two links
      do not share the same button variant.
- [ ] Given a visitor on `/login`, when the header renders, then **Sign in**
      carries `aria-current="page"` and does **not** carry an accent fill class
      at rest — whether inline or inside the open menu.
- [ ] Given a signed-in visitor on `/`, when the page renders, then the header
      exposes **To app** and **Sign out** (not sign-in controls), and the hero's
      only CTA is **To app**.
- [ ] Given a signed-in visitor on any `(marketing)` route at `≥ md`, when the
      header renders, then **To app** is the only `primary` control and **Sign
      out** uses `ghost`.
- [ ] Given a signed-in visitor on `< md` with the header menu open, then **To
      app** is the only `primary` control and **Sign out** uses `ghost`.
- [ ] Given any `(marketing)` route, when it renders, then the public header is
      present and no app-shell destination navigation is present.
- [ ] Given viewport `< md` on any `(marketing)` route, when the header renders,
      then the brand name is centred, the logo chip is on the left, auth controls
      are reachable through the menu icon on the right, and the header stays fixed
      at the top with the shared scroll scrim.
- [ ] Given viewport `≥ md` on any `(marketing)` route, when the header renders,
      then auth controls are inline (no hamburger menu) and the header is sticky
      with the shared scroll scrim.
- [ ] When the landing page is rendered, then the headline invites method choice
      and checkable progress (study/38 I), and a thesis-12 time-honesty sentence
      appears in the body (study/25 C4).
- [ ] When the landing page is rendered, then a method preview shows basic
      filters (time, skill, energy) and three catalogue methods; tapping a method
      opens an explain-only dialog with no **Start** action.
- [ ] When the landing page is rendered, it has no axe-core violations.

## Check

`npm test -- landing`

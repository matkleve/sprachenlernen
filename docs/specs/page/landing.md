# Landing page — `/`

<!-- id: SPEC-page-landing -->
<!-- use-case: UC-011 -->
<!-- status: active -->

The public front door at `/` ([ADR-0010](../../adr/0010-the-route-model.md)).
Its job is to tell a signed-out visitor what this app is for and how to get in.
**T-B7 (2026-08-11):** thesis 1 leads the headline; thesis 12 names the honest
time denominator in the body.
Serves [UC-011](../../use-cases/UC-011-start-in-the-first-minute.md): the
account is the one unavoidable step, so the path to it must be visible on every
public page.

## Scope

- **In:** the `/` route; the public header on every `(marketing)` route; sign-in
  and sign-up calls to action; a short statement of what the product optimises
  for, quoted from the study; signed-in visitors redirected to `/methods`.
- **Out:** full positioning copy and marketing argument (T-B7); OAuth; a fourth
  public route; anything that reads learner data.

**Reuse: `ActionLink`.** Header and hero CTAs navigate, so they are anchors
styled with the button contract — not `<button>` elements.

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
| **Sign in** | `ActionLink` | `ghost sm` | intrinsic width; no fill at rest |
| **Create account** | `ActionLink` | `primary sm` | the **only** primary in the header |

On `/login` or `/signup`, the matching link sets `aria-current="page"` but
**keeps its variant styling** — ghost stays ghost, primary stays primary. The
form heading carries "you are here"; the header does not add a second accent
fill.

Header auth links use `gap-3` so expanded `sm` hit targets do not overlap.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/` while signed out | The public header and landing hero render |
| 2 | Opens `/` while signed in | Redirected to `/methods` before the hero renders |
| 3 | Taps **Create account** | Navigates to `/signup` |
| 4 | Taps **Sign in** (hero or header) | Navigates to `/login` |
| 5 | Opens any other `(marketing)` route | The same public header renders; the hero does not |
| 6 | Taps the product name in the header | Navigates to `/` |

## States

Not a client state machine (`docs/STATE.md` §1). The signed-in condition is
read server-side per request, same as [`../service/auth.md`](../service/auth.md).

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `signed-out` | no session | Header + hero shown on `/` | no |
| `signed-in` | a session on `/` | Redirect to `/methods` | no |

## Data

Reads the session via `getAccount()` on `/` only. Writes nothing.

Copy lives in `features/marketing/content.ts`. Sentences quoted from the study
are marked there with their source; nothing is invented for positioning.

## Acceptance criteria

- [ ] Given a signed-out visitor on `/`, when the page renders, then **Sign in**
      and **Create account** links are visible in the header and the hero's
      primary action is **Create account**.
- [ ] Given the public header on any `(marketing)` route, when it renders, then
      **Create account** is the only `primary` control, **Sign in** uses
      `ghost`, and the two links do not share the same button variant.
- [ ] Given a visitor on `/login`, when the header renders, then **Sign in**
      carries `aria-current="page"` and does **not** carry an accent fill class
      at rest.
- [ ] Given a signed-in visitor on `/`, when the page is requested, then the
      response is a redirect to `/methods` and the hero does not render.
- [ ] Given any `(marketing)` route, when it renders, then the public header is
      present and no app-shell destination navigation is present.
- [ ] When the landing page is rendered, then thesis 1 leads the headline and a
      thesis-12 time-honesty sentence appears in the body (study/25 C4).
- [ ] When the landing page is rendered, it has no axe-core violations.

## Check

`npm test -- landing`

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

**Reuse: `Button` variants on `Link`.** Primary and secondary CTAs navigate, so
they are anchors styled with the button contract — not `<button>` elements.
**Reuse: `NavLink`.** The header's text links use the same primitive as the app
shell's destinations.

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
- [ ] Given a signed-in visitor on `/`, when the page is requested, then the
      response is a redirect to `/methods` and the hero does not render.
- [ ] Given any `(marketing)` route, when it renders, then the public header is
      present and no app-shell destination navigation is present.
- [ ] When the landing page is rendered, then thesis 1 leads the headline and a
      thesis-12 time-honesty sentence appears in the body (study/25 C4).
- [ ] When the landing page is rendered, it has no axe-core violations.

## Check

`npm test -- landing`

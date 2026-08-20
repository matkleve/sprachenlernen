# Accounts and authentication (Supabase)

<!-- id: SPEC-service-auth -->
<!-- use-case: UC-011 -->
<!-- status: active -->

T-B8. The `lib/db/` boundary for signup, sign-in, sign-out and the current
Account, backed by Supabase Auth (ADR-0007); the row-level security policy
that makes an Account the enforced owner of every `review_log` row (ADR-0006);
and the test that proves the negative BACKEND.md §8 requires — a signed-in
user cannot read another Account's rows. **Sensitive** (`AGENTS.md`).

## Scope

- **In:** `lib/db/client.ts` (the Supabase client factory for Server and
  Client Components), `lib/db/auth.ts` (`signUp`, `signIn`, `signOut`,
  `getAccount`), `middleware.ts` (session refresh), the `public.review_log`
  table's ownership columns and RLS policies, and thin `/signup` and `/login`
  pages built only from `Field` and `Button` (reuse — no new component).
  `lib/db/client.ts` and `middleware.ts` are the only two files besides this
  spec's tests allowed to import `@supabase/*` directly — `middleware.ts` is
  a necessary second seam because it runs before any Server Component and
  needs the request/response cookie API, not `next/headers`'s `cookies()`
  that `lib/db/client.ts` uses.
- **Out:** the review row's payload — see
  [`review-log.md`](review-log.md) (T-B2); the account gate on signed-in routes and the
  visible sign-out control, both of which this spec listed as out for want of a
  signed-in surface and which
  [`../feature/app-shell.md`](../feature/app-shell.md) took over on 2026-08-09;
  password reset and changing an Account's email. **OAuth (Google, Apple) is in**
  — providers that return a verified session without a separate email-confirmation
  step.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Submits the signup form with an email and a password | An Account is created. If Supabase's project settings return a session immediately, the visitor is signed in and sent to **`/languages/choose`** — a new Account has no learning language, and UC-011 makes choosing it one of the only two things asked before the first exercise. This is the short path, not the guarantee: every destination redirects an account with no language, because signup is only one of four ways in. If email confirmation is required, they see "check your email" and no session is created yet. The confirmation mail links to `/auth/callback` on this deployment's origin (`NEXT_PUBLIC_SITE_URL`, or `VERCEL_URL` on previews, or `http://localhost:3000` locally) — not Supabase's project Site URL alone |
| 2 | Submits the sign-in form with valid credentials | An auth session is created (cookie, via `middleware.ts`) and the visitor is sent to `/methods` |
| 3 | Submits either form with invalid input | The page re-renders with the error Supabase reported next to the password field; no account or session is created |
| 4 | Opens `/login` or `/signup` while already signed in | Redirected to `/methods`; the form is never shown |
| 5 | (Any signed-in request) | `middleware.ts` revalidates and refreshes the session cookie before any Server Component runs. Server code then reads the session with `getSession()` (local cookie, no second Auth round trip) via `getAccount()`. That is sound **only** for callers whose next step is a query through the request-scoped client, because PostgREST verifies the JWT before RLS runs — a forged cookie returns nothing. `getSession()` itself verifies no signature |
| 6 | Taps the Google or Apple OAuth control on `/login` or `/signup` | Redirected to the provider; on success, a session is created and they land on `/methods` without a separate email-confirmation step. An account with no learning language is sent to the picker by the destination itself, so OAuth needs no special case |

### OAuth controls

**Reuse: `SubmitButton`.** Each provider is its own `<form>` posting to
`signInWithOAuthAction`.

The two providers sit **side by side**, centred under the divider — not stacked.
Each control is a **round, icon-only** `secondary` button (`size-11`, 44×44px
target): the provider logo inside, no visible label. The accessible name comes
from `aria-label` ("Continue with Google" / "Continue with Apple"). Stacked
full-width text buttons duplicated the email submit and read as a second form
rather than alternate entry points.
| 7 | Signs up with email and password | Email confirmation remains required before a session exists (project setting) |
| 8 | Follows a confirmation link carrying `?next=` | The visitor lands on that path **only if it is a path on this deployment**; anything else lands on `/methods`. Validated by `safeInternalPath` (`lib/safe-redirect.ts`), which parses rather than prefix-matches — `//evil.com` and `/\evil.com` both start with `/` and both resolve to a foreign origin |
| 9 | Confirms account deletion | The account id comes from `getVerifiedAccount()` — a `getUser()` round trip to Supabase Auth — never from `getAccount()`. Deletion runs on the service-role client, which bypasses RLS, so the cookie cannot be the authority for **which** account is deleted |

## States

Not a client state machine (`docs/STATE.md` §1 — nothing here is tracked in
`useState`; sign-in state is derived server-side from the request's cookies on
every request). Named here as the two conditions a page can observe via
`getAccount()`:

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| signed-out | no valid session cookie | `getAccount()` returns `null` | no |
| signed-in | a valid session cookie | `getAccount()` returns the `Account` | no |

A third reading exists and is not a state: `getVerifiedAccount()` answers the
same question against the Auth server rather than the cookie. It is the reading
required of any caller that acts on `account.id` **outside** the RLS path.

Neither is terminal: `signOut()` and session expiry both move signed-in back
to signed-out; a successful sign-in moves the other way.

## Data

- **`public.review_log`** (migration:
  `supabase/migrations/20260809073100_review_log_ownership.sql`) — `id uuid`
  (the review's own UUID, ADR-0005), `user_id uuid not null` (the owning
  Account, ADR-0006), `installation_id uuid not null` (ADR-0005),
  `created_at`. Payload columns (`task_id`, `grade`, `reviewed_at`,
  `latency_ms`) are defined in [`review-log.md`](review-log.md).
- **RLS**, `to authenticated` only (never `anon` — an Account is mandatory,
  ADR-0006): `select`/`insert` where `(select auth.uid()) = user_id`. No
  `update`/`delete` policy for any role — RLS denies both unconditionally,
  which is what makes the log append-only at the database layer rather than
  by convention (ADR-0005).
- **`Account`** (`lib/db/auth.ts`) — `{ id: string; email: string }`, read
  from Supabase Auth's `auth.users`. No table of our own duplicates it.

## Acceptance criteria

- [ ] Given valid, unused credentials, when a visitor submits `/signup`, then
      an Account exists and they are either signed in or told to confirm by
      email — never left on a bare error.
- [ ] Given a Supabase error on signup or sign-in, when the form is submitted,
      then the page shows that error and creates no Account and no session.
- [ ] Given valid credentials for an existing Account, when a visitor submits
      `/login`, then they are signed in and redirected to `/methods` — the app's
      default route, per ADR-0010, never the public landing page.
- [ ] Given a signed-in Account, when it inserts a `review_log` row with its
      own `user_id`, then the insert succeeds and a `select` returns that row.
- [ ] **The negative case, BACKEND.md §8:** given two signed-in Accounts A and
      B, each with at least one `review_log` row, when B selects from
      `review_log`, then B's result contains **zero** of A's rows and no
      error — RLS filters, it does not fail the query.
- [ ] Given a signed-in Account B, when B inserts a row with A's `user_id`,
      then the insert is refused.
- [ ] Given any signed-in Account, when it attempts to `update` or `delete`
      any `review_log` row — including its own — then zero rows are affected.
- [ ] Given no session at all, when a request selects from `review_log`, then
      it is refused outright (no `anon` grant), distinct from "signed in, saw
      nothing".
- [ ] Given a signed-in Account, when it opens `/login` or `/signup`, then it
      is redirected to `/methods` and never shown the form.
- [ ] Given `/login` or `/signup`, when the OAuth row renders, then Google and
      Apple appear as two round icon buttons in one horizontal row, each with an
      `aria-label` and no visible provider name.
- [ ] Given a confirmation link whose `next` is `//evil.com`, `/\evil.com` or
      any absolute URL, when the callback completes, then the visitor is sent to
      `/methods` on this origin — the redirect never leaves the deployment.
- [ ] Given a confirmation link whose `next` is `/content/<uuid>?x=1`, when the
      callback completes, then the visitor lands on exactly that path.
- [ ] **The negative case for deletion:** given a session cookie the Auth server
      refuses, when `deleteAccount` runs, then no account is deleted and the
      caller is told to sign in — the service-role client is never reached.
- [ ] Given a cookie whose session names account A while the Auth server
      confirms account B, when `deleteAccount` runs, then **B** is deleted and A
      is untouched.

## Open questions

**⚠ SPEC GAP: mandatory email confirmation for password signup contradicts
UC-011's speed goal for that path only.** OAuth paths are immediate. Email/password
signup keeps confirmation on (`mailer_autoconfirm: false`). Turning confirmation
off for email signup is a product decision for UC-011; OAuth does not need it.

## Check

`npm test -- safe-redirect` covers the callback's destination validation.

`npm test -- access-control` — `lib/db/access-control.test.ts` is the
BACKEND.md §8 policy test and runs against the real Supabase project; it
`describe.skipIf`s, visibly, when the three Supabase secrets are absent.
`npm test -- auth` also runs `lib/db/auth.test.ts`, the offline unit coverage
for the adapter's outcome mapping, and `features/auth/oauth-buttons.test.tsx`
for OAuth control layout.

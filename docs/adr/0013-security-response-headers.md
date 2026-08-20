# ADR-0013 — Security response headers, and the two we did not set

- **Status:** Accepted
- **Date:** 2026-08-20
- **Context:** [`BACKEND.md`](../BACKEND.md) §8 (the gates a backend brings),
  [`specs/service/auth.md`](../specs/service/auth.md),
  [`specs/feature/account-data.md`](../specs/feature/account-data.md)

## Context

The app shipped with no security response headers at all: no CSP, no
`X-Frame-Options`, no HSTS, no `Referrer-Policy`. Nothing had gone wrong,
which is exactly the problem — the signed-in half was embeddable in a foreign
iframe, and the delete-account confirmation is a two-click, irreversible
action sitting inside it.

Headers were easy to keep postponing because a wrong one breaks production
only, and only for some surfaces. So the decision below is deliberately split:
what the app's own behavior already proves is safe, versus what needs a live
browser check first.

## Decision

Ship, from `lib/security-headers.ts`, on every route:

| Header | Value | Why this value |
| --- | --- | --- |
| `Content-Security-Policy` | see below | The app loads no external resource |
| `X-Frame-Options` | `DENY` | Browsers that ignore `frame-ancestors` |
| `X-Content-Type-Options` | `nosniff` | JSON export must not be sniffed as HTML |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Learner paths carry source ids |
| `Permissions-Policy` | camera, microphone, geolocation, payment all `()` | No feature asks; `speechSynthesis` is output only and needs no grant |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | **Production only** — sending it from `http://localhost` pins the browser to https for localhost and breaks every other local project on that port |

The CSP is `default-src 'self'` with `object-src 'none'`, `base-uri 'self'`,
`frame-ancestors 'none'`, and `connect-src 'self' <NEXT_PUBLIC_SUPABASE_URL>`.
This is a description of the app, not an aspiration: `next/font/google`
self-hosts at build time, and the only runtime fetch is same-origin
(`/api/app-version`).

## What we did not set, and why

**`script-src` without `'unsafe-inline'`.** The App Router streams hydration
and Flight payloads as inline `<script>` tags. Removing the allowance requires
per-request nonces threaded through `middleware.ts` — a change with its own
failure mode, not a line in a list. The policy without it still blocks the
commoner exfiltration shape: an injected `<script src>` or a `fetch` to a
foreign origin.

**`form-action`.** Chrome applies `form-action` to redirects that *follow* a
form submission. OAuth sign-in is precisely that: a POST to
`signInWithOAuthAction`, a 303 to the Supabase authorize endpoint, and another
hop to Google or Apple. Setting `form-action 'self'` would break sign-in in
production and pass every gate we have, because no automated check in this
repo drives a real OAuth round trip. It goes in when someone has clicked both
providers in a browser against a preview deployment — not before.

## Consequences

- A future external dependency (analytics, a CDN font, an image host) now
  fails visibly in the console instead of silently working. That is the point,
  but it means adding one is a change to this ADR too.
- `lib/security-headers.ts` is framework-free so `next.config.ts` can import it
  before any alias exists, and so the policy is unit-testable
  (`lib/security-headers.test.ts`) rather than a literal nobody can assert on.
- Vercel's own defaults are not relied on; the headers are in the repo.

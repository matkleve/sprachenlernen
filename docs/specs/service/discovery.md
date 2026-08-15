# Discovery — robots, sitemap, and metadata

<!-- id: SPEC-service-discovery -->
<!-- use-case: UC-011 -->
<!-- status: active -->

How **public** routes are exposed to crawlers and social previews. The signed-in
half stays private — middleware redirects bots to `/login`; this spec governs
what they may index when they cannot authenticate.

## Scope

- **In:** `app/robots.ts`, `app/sitemap.ts`, `lib/site-metadata.ts`, root and
  marketing metadata, `robots: noindex` on auth and app routes.
- **Out:** learner data in HTML; per-method Open Graph images; i18n `hreflang`;
  marketing blog or CMS.

## Policy

| Surface | Index? | Why |
| --- | --- | --- |
| `/`, `/languages`, `/privacy` | Yes | Public persuasion and trust |
| `/login`, `/signup`, `/auth/*` | No | Thin duplicate; no learner value |
| `/dev/*` | No | Tooling |
| `(app)/*` | No | Account-gated; middleware blocks anyway |

Signed-in pages export `robots: noindex` as defence in depth. **One** vertical
scroll model on destinations — see [`page-layout.md`](../feature/page-layout.md).

## Behavior

| # | Actor | System response |
| --- | --- | --- |
| 1 | Crawler fetches `/robots.txt` | Allow public paths; disallow app and auth |
| 2 | Crawler fetches `/sitemap.xml` | Lists only indexable public URLs |
| 3 | Social bot fetches `/` | Open Graph title and description from metadata |
| 4 | Anonymous visitor on public route, no auth cookie | Middleware skips Supabase `getUser()` |

## Acceptance criteria

- [ ] `robots.txt` disallows `/methods`, `/words`, `/progress`, `/profile`,
      `/login`, `/signup`, and `/dev/`.
- [ ] `sitemap.xml` includes `/`, `/languages`, and `/privacy` only.
- [ ] `/login` and `/signup` export `robots: noindex`.
- [ ] `(app)` layout exports `robots: noindex`.
- [ ] Landing, languages, and privacy export a page-specific `description` and
      Open Graph fields.
- [ ] Given a public route and no Supabase auth cookie, middleware does not call
      `createServerClient`.

## Check

`npm test -- discovery middleware site-metadata`

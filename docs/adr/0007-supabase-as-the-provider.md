# 0007. Use Supabase for authentication and the review-log database

- **Status:** Accepted
- **Date:** 2026-08-08

## Context

[ADR-0006](0006-require-an-account.md) put a provider decision inside stage 1:
an account is required before the first review, so authentication and a
database both have to exist before any code in Track B can be honest.
[`../BACKEND.md`](../BACKEND.md) §1 lists the real options and the axis that
matters here — whether the provider supplies **both** Postgres and
authentication, since building the second yourself is exactly the kind of
work this decision exists to avoid paying for twice.

The owner has created the Supabase project (`lnkgmjcueahhrzpnzmwq`) and
connected its MCP server. That is the fact that forces the decision now rather
than leaving it open: a project already exists, so the alternative to writing
this record is drifting into using it without one.

## Decision

We use **Supabase** for authentication and for the review-log's server-side
store: Postgres with row-level security as the access-control mechanism
[`../BACKEND.md`](../BACKEND.md) §2 requires, and Supabase Auth for sign-up,
sign-in and session handling. Project ref `lnkgmjcueahhrzpnzmwq`.

This does not relax anything ADR-0005 or ADR-0006 already fixed. The review
log stays append-only with one UUID per review; the row owner is the
authenticated user's id, non-null, enforced by a row-level policy rather than
by application code remembering to filter; and no component reaches Supabase
directly — everything goes through `lib/db/` per
[`../BACKEND.md`](../BACKEND.md) §3, so the client library itself stays behind
one seam.

Two things this ADR does **not** settle, because they are implementation, not
provider choice, and belong in the persistence spec (T-B2) instead: the exact
row schema, and the sync tiebreak between two rows sharing a timestamp from
different installations (the `⚠ SPEC GAP` carried from ADR-0005).

## Alternatives considered

**Postgres + Drizzle/Prisma, auth built by hand.** Full control of the query
layer, no vendor coupling. Lost because it means building session handling,
password reset, and the account lifecycle ourselves — the exact second system
Supabase exists to avoid, for a single-developer project with no reason yet to
want that control.

**SQLite / Turso / D1.** Good for small, read-heavy, edge-deployed data. Lost
because it supplies no authentication, which is now a hard requirement, and
because row-level security — the enforcement mechanism `BACKEND.md` §2
prefers — is a Postgres feature these do not have.

**No server, stay local-only.** This was ADR-0005's rejected alternative
already, and ADR-0006 closed it further: an account cannot be required against
a store with no server behind it.

**A second Supabase-like vendor (e.g. Firebase, Neon + a separate auth
service).** Never seriously on the table once a Supabase project already
existed; listed here only so a future reader knows it was not compared in
detail. If Supabase becomes wrong for a concrete reason, that comparison
belongs in the ADR that supersedes this one, not retrofitted into this one.

## Consequences

**Easier.** One vendor for both halves of the requirement. Row-level security
gives the negative case `BACKEND.md` §6 requires — tenant A cannot read tenant
B's rows — as a policy the database enforces rather than a rule every query has
to remember. The Supabase MCP server and the installed `supabase` /
`supabase-postgres-best-practices` skills mean an agent implementing T-B2 has
direct access to the project and to Supabase-specific best practice, which is
exactly the kind of thing that turns a Sensitive task from guesswork into a
checklist.

**Harder, and these are the real costs.**

- **Vendor coupling in auth**, named in `BACKEND.md` §1 as Supabase's
  known cost. Migrating identity providers later is real work, not a config
  change.
- **RLS is a real skill, and it is the security boundary now**, not a nice-to-have.
  A policy that is missing or wrong fails silently — it looks exactly like
  working code — so `BACKEND.md` §8's policy test is not optional groundwork,
  it is the thing that proves the boundary exists at all.
- **Environment variables now carry real secrets.** The service role key must
  never be `NEXT_PUBLIC_`; only the anon key and project URL may be. This
  becomes a gate per `BACKEND.md` §8 rather than a one-time reminder.
- **`.cursor/mcp.json` is now committed**, pointing at a live project by
  reference. The URL contains no secret — connecting still requires the
  authenticating client to complete Supabase's own OAuth — but anyone with
  write access to this repo can now request that connection, which is worth
  knowing before treating it as inert configuration.

**Committed to.** Supabase as the single provider for auth and the database;
RLS as the enforcement mechanism, never an application-level filter alone; and
the `lib/db/` adapter as the only caller of the Supabase client, so the vendor
coupling this ADR accepts stays confined to one file instead of spreading
through every component that touches data.

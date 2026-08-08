# Adding a backend

This base project ships **frontend-only**, on purpose. Most projects do not need
a database on day one, and the ones that do should pick deliberately rather than
inherit a choice from a template.

This is the module to follow when you do need one. Nothing here is wired up —
it is the set of decisions and boundaries to get right, in order.

---

## What this project has already decided

Read this before §1, because §1 is written for a project that still has a choice
to make and this one no longer does.

Three records, all dated 2026-08-08 and read in order.
[ADR-0005](adr/0005-local-first-review-log-with-accounts-as-an-addition.md): the
review log is **append-only, one UUID per review**, carries the installation it
came from, and **no component knows where it lives**.
[ADR-0006](adr/0006-require-an-account.md): **an account is required before the
first review**, so the row owner is non-null from the first row and the server is
part of stage 1 rather than a later addition.
[ADR-0007](adr/0007-supabase-as-the-provider.md): **the provider is
Supabase** — project `lnkgmjcueahhrzpnzmwq` — for both Postgres and
authentication. So:

- **§1 is decided, not open.** Do not evaluate Drizzle/Prisma, Turso, D1 or "no
  database" for this data — that comparison already happened in ADR-0007's
  alternatives. A task that reopens it is out of scope for itself.
- **§2 ("the client is untrusted") is live from the first write**, enforced as
  Postgres row-level security per ADR-0007 — a policy, not an application-level
  filter that every query has to remember.
- **§3's adapter is mandatory, not advisory.** The browser store still exists — it
  is the offline write path and cache (F82), not the authority — so there are two
  places rows live and exactly one place that may know it: `lib/db/`. It is also
  the only file allowed to import the Supabase client.
- **§8's policy test is stage 1 work**, not a later hardening pass: sign in as one
  user, attempt to read another's rows via RLS, assert the failure. It is the
  highest-value test in the product and the one that has to exist before the
  second account does.
- **§6 still holds: all of this is Sensitive.** Local persistence is persistence,
  and now it is not only local.
- **The Supabase MCP server and skills are already installed** — see
  `.cursor/mcp.json` and `.agents/skills/supabase`. Use the MCP tools to inspect
  the live schema and RLS policies rather than guessing at them from code.

## 0. Write the ADR first

Before the first query. [`adr/0000-template.md`](adr/0000-template.md) — what
forced the decision, what you chose, what lost and why, what you have now
committed to. This is the most expensive decision in the project to reverse; ten
minutes of writing is cheap against it.

## 1. Choose

| Option | Good when | Cost |
| --- | --- | --- |
| **Supabase** | you want Postgres, auth, storage and realtime without running anything; row-level security fits the access model | RLS is a real skill; you own the migration discipline; vendor coupling in auth |
| **Postgres + Drizzle/Prisma** | you want plain Postgres and full control of the query layer | you build auth, storage and access control yourself |
| **SQLite / Turso / D1** | small data, read-heavy, edge deployment | limited concurrency; migration story is yours |
| **No database** | the state is per-user and small | `localStorage` has no server-side truth — never for anything shared or trusted |

If a project's data is multi-tenant (organizations, teams, workspaces), pick the
option whose access control you can enforce **at the data layer**. Everything
else becomes a guard you have to remember on every query, and you will not.

## 2. The rule that outranks the choice

> **The client is untrusted.**

Client-side validation is UX. It tells someone their email looks wrong before
they wait for a round trip. It is not a control — anyone can call your endpoint
directly with whatever payload they like.

So:

- **Every read and write is authorized on the server**, at the data layer where
  possible (Postgres row-level security, or a server-side guard that no query can
  bypass). Never in the component that renders the button.
- **The server re-validates everything** the client validated.
- **Nothing sensitive is `NEXT_PUBLIC_`.** That prefix ships the value to the
  browser in plain text. If it must stay secret, it must not carry the prefix and
  must only be read in server code.

## 3. Wrap the SDK in an adapter

```
lib/db/
  client.ts     the SDK instance, created once
  <domain>.ts   typed functions: listItems(), createItem(), …
```

Components call `listItems()`. Components never import the SDK.

This costs one indirection and buys three things: the choice stays reversible,
the query layer is mockable in tests, and a cross-cutting concern (tenant
scoping, logging, retry) has exactly one place to live instead of being repeated
at every call site and forgotten at one of them.

`docs/specs/service/<name>.md` is where an adapter's contract goes.

## 4. Multi-tenant scoping

If data belongs to an organization or a team, **the scope filter is not optional
and not the caller's job to remember.** Forgetting it once leaks another
tenant's data, it looks exactly like working code, and no type checker will
notice.

Enforce it where it cannot be skipped — a row-level policy, or an adapter that
takes the scope from the session rather than from an argument. A convention that
says "always filter by `org_id`" is not enforcement.

## 5. Migrations

- **Append-only.** Never edit a migration that has run anywhere but your laptop.
- **One concern per migration**, with a name that says what it does.
- **Reversible or explicitly not** — say which in a comment at the top.
- A destructive migration is a **Sensitive** change (below), no matter how small
  the diff.

## 6. Change class

Everything touching the data layer is **Sensitive** (`AGENTS.md`): access
control, migrations, auth, deletion, anything persisted. That means:

- The test is written first and **shown failing** before the implementation.
- A fresh-context adversarial review by a different agent than the implementer
  (`.claude/agents/reviewer.md`).
- Acceptance criteria assert the **negative** case explicitly: a user of tenant A
  cannot read, write, or enumerate tenant B's rows. An access-control test that
  only proves the happy path proves nothing about access control.

## 7. Debug the database first

When something is wrong with uniqueness, overlap, ordering, immutability or
"this row should not exist" — **read the constraints, triggers and policies
before assuming a frontend bug.** The database is where those rules actually
live, and hours get lost looking at components for a violation the schema is
enforcing correctly.

## 8. Add the gates

A backend brings new ways to be wrong, so `npm run verify` grows with it:

- **A policy test.** Sign in as tenant A, attempt to read tenant B, assert the
  failure. This is the single highest-value test in a multi-tenant app.
- **Migration drift.** Fail if the local schema does not match the migrations.
- **Generated types are current.** Fail if regenerating them produces a diff —
  otherwise types silently describe last month's schema.
- **No secret carries `NEXT_PUBLIC_`.** A grep is enough.

Add each to `scripts/verify.mjs` so it runs with everything else. A check that
lives in someone's terminal history is not a gate.

## 9. Update the docs you now invalidate

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — the layer diagram gains a data layer.
- [`GLOSSARY.md`](GLOSSARY.md) — every table and domain entity gets a term.
- [`CONSTITUTION.md`](CONSTITUTION.md) — §2 (the user's data) stops being
  abstract the moment you actually store something.

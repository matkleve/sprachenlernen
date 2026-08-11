# 0005. Store the review log locally first, and add accounts as an addition rather than a migration

- **Status:** Accepted, with the optional-account clause superseded by [0006](0006-require-an-account.md)
- **Date:** 2026-08-08

> **What 0006 changed, later the same day.** An account is **required**, so the
> owner of a review row is non-null from the first row and the server is part of
> stage 1. The rest of this record stands: append-only, one UUID per review, an
> installation id, and no component that knows where the log lives. The reasoning
> below is left exactly as it was written — it is the argument the evidence
> favours, and the one to re-read if the requirement is ever relaxed.

## Context

[ADR-0004](0004-word-task-data-model.md) committed to the review log as the
source of truth: scheduling state, the vocabulary estimate and the level are all
derived from it and may be recomputed at will. That makes *where the log is
written* the most expensive storage decision in the product, because it is the
one artefact that cannot be regenerated.

Three facts force the decision now rather than at the first review.

1. **The log's shape is fixed by its first row.** History accumulates from
   session one. A log written in a shape that assumes a single browser cannot
   later gain an owner without inventing values for every row that already
   exists — and the level model would visibly jump for anyone whose history was
   migrated ([`../study/03-level-model.md`](../study/03-level-model.md), honesty
   rule 4).
2. **Offline is a requirement, not a preference.** F82 puts practice on a phone
   with no connection. A server-first data layer would be retrofitted for that
   within the first stage.
3. **Accounts are wanted, and are now in scope as a destination.** The decision
   of this project's owner (2026-08-08): a database with authentication and real
   accounts is part of the product, not a hypothetical. Roadmap question 1 defers
   *multi-user operation*, which is a different thing from *the log being
   able to belong to a user*.

## Decision

We write the review log to the browser first — IndexedDB, append-only, one UUID
per review, no update in place — and we ship a server database with
authentication later as an **addition** to that log rather than a replacement for
it. Every review row carries, from the first row ever written, the identity it
will need on a server: its own UUID, the timestamp it was recorded at, and the
installation it came from. The owning user is nullable until an account exists,
and attaching one is an update to a single field rather than a reshaping of
history.

No account is required to use the app. A visitor may practise immediately and
their data is theirs, locally. Signing in adds durability, a second device and
recovery; it never unlocks the ability to learn. That ordering is what "browser
first" means here, and it is also what keeps the landing page honest — the
product has to be usable before it asks for anything.

## Alternatives considered

**Local only, forever (no server, no accounts).** The cheapest and the most
private, and it was the standing recommendation in roadmap question 16. Lost
because it makes complete data export (F83) the only way to move between devices,
and because losing a browser profile loses years of history with no recovery —
which contradicts §2 of [`../CONSTITUTION.md`](../CONSTITUTION.md) once there is
anything worth keeping.

**Server first (e.g. Supabase as the primary store).** The cheapest to build,
and one obvious place for everything. Lost on fact 2: an offline-first product
with a server-first data layer is a retrofit, and the retrofit lands exactly in
the code path that writes history.

**Local, with the server as the primary store once an account exists** — that is,
two authorities depending on sign-in state. Lost because it produces two
different answers to "what is my level" during the window where the two disagree,
and the reconciliation logic is precisely the sync work this option was meant to
avoid. The log is append-only for the same reason: one authority, and merges are
unions rather than judgements.

**Requiring an account before the first review.** Simplest possible sync story,
and it is what most products do. Lost because it puts a signup form in front of a
product whose entire argument is that it will not claim what it has not measured
— and it would make the first honest measurement impossible to take from a
stranger.

## Consequences

**Easier.** Stage 1 is unblocked and needs no server, no auth provider and no
privacy surface. Sync, when it arrives, is a union of append-only rows rather
than a conflict resolution problem. And the derived-state discipline from
ADR-0004 pays for itself twice: a device that has been offline for a month
catches up by appending rows and recomputing, with nothing to reconcile.

**Harder, and these are the real costs.**

- **Every write path must be storage-agnostic from the start.** Components call
  an adapter (`lib/db/`, [`../BACKEND.md`](../BACKEND.md) §3), never IndexedDB
  directly. The first component that reaches for storage directly makes the
  server a rewrite.
- **An installation id is now part of the data model.** It is not a device
  fingerprint and must not become one: a random UUID generated once per browser
  profile, used only to order and de-duplicate rows during a later merge.
- **Clock skew is now ours to own.** Timestamps come from an untrusted client, so
  the merge order cannot be pure wall-clock time. **⚠ SPEC GAP: the tiebreak
  rule for two rows with the same timestamp from different installations is
  undecided.** It belongs in the persistence spec, not here.
- **Auth provider is deliberately not decided here.** This ADR fixes the shape
  and the order, not the vendor; choosing one is a separate record, written when
  sync is actually built ([`../BACKEND.md`](../BACKEND.md) §0).

**Committed to.** Append-only, per-review UUIDs, nullable owner, and no
component that knows where the log is. Anything that breaks one of those four
makes accounts a migration again.

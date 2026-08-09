# 0011. The review log shipped server-only, and offline is unbuilt

- **Status:** Proposed — the decision below is the owner's to take, and is
  stated as two options rather than one
- **Date:** 2026-08-09

## Context

[ADR-0005](0005-local-first-review-log-with-accounts-as-an-addition.md) decided
the review log is written **to the browser first**, with the server added later,
and it rejected "server first (e.g. Supabase as the primary store)" by name. Its
fact 2 is the reason: *"Offline is a requirement, not a preference"* — F82 puts
practice on a phone with no connection, and it argued that a server-first data
layer would be retrofitted within the first stage, with the retrofit landing in
the code path that writes history.

**T-B2 shipped server-only.** `lib/db/review-log.ts` inserts straight into
Supabase and reads straight back out. There is no IndexedDB, no local queue, no
cache: `grep -rn "indexedDB" lib features app` returns nothing. A learner with
no connection cannot record a review, and a review taken while the connection
is failing is lost rather than queued — `appendReview` returns an error outcome
and the session offers the card again.

Nothing recorded this. The code and an accepted ADR have disagreed since T-B2
merged, which is precisely the state
[ADR-0002](0002-specs-are-the-source-of-truth.md) says must not be left
standing. It was found by auditing T-B2 against its own contract, not by a gate
— no gate compares code to an ADR.

Two further facts matter for the choice.

1. **ADR-0006 changed the premise that ADR-0005 reasoned from.** With an account
   *required*, a first-run visitor is already behind a network round trip. The
   offline case is therefore no longer "a stranger practising before signing
   up"; it is "a signed-in learner on a train". That is a smaller case than the
   one ADR-0005 was defending, and a real one.
2. **The tiebreak spec gap is currently dormant.** ADR-0005 left the merge order
   for two rows sharing a timestamp from different installations undecided. With
   one server table and one authority there is no merge, so nothing depends on
   it today. It becomes binding again the moment anything writes locally — which
   is to say, it is not closed, it is waiting.

## Decision

**Not taken here.** Two options, with what each costs:

**Option A — accept server-only, and supersede ADR-0005's storage location.**
The log stays as built. F82 is explicitly deferred with a date, `installation_id`
keeps its column but does nothing until sync exists, and the review session gains
an honest offline state ("not saved — you are offline") instead of a generic
failure. Cheapest, and it makes the record match the code today.

**Option B — build the local write path ADR-0005 specified.** IndexedDB queue
behind the existing adapter, flushed when the connection returns. The adapter
boundary that ADR-0005 insisted on has actually been held — no component touches
Supabase directly — so this is an addition inside `lib/db/`, not a rewrite. It
requires answering the tiebreak gap first, and it is the larger piece of work.

The choice turns on one question nobody has answered: **is practising offline
something this product supports, or something it merely wanted to?** F82 says
supports. The shipped code says wanted to.

## Alternatives considered

**Leave it unrecorded and let the code stand as the decision.** Rejected: it is
the state that already existed, and it means the next person to read ADR-0005
builds against a local-first log that is not there. An unwritten decision is
also unreviewable — it cannot be disagreed with.

**Quietly mark ADR-0005 superseded.** Rejected, and this is the more tempting
one. Superseding it would make the documents consistent tonight, and it would
record a product decision — dropping an offline requirement — that no human has
made. Consistency achieved by guessing is exactly what
[`../../AGENTS.md`](../../AGENTS.md) boundary 8 forbids, and the guess would have
been invisible afterwards, because a superseded record stops being read.

## Consequences

**Committed to now, whichever option is taken.** The divergence is written down,
so the next task in this area starts from what is true rather than from ADR-0005.

**Still open, and blocking T-B9.** Sync across devices cannot be specified until
this is answered: with Option A, "sync" is already done — two devices on one
account share one table and there is nothing to merge — and T-B9 reduces to
export/import. With Option B, T-B9 is the merge ADR-0005 described, and the
tiebreak gap has to be closed first.

**Unchanged.** Append-only, the per-review UUID, the non-null owner and the
adapter boundary all hold as ADR-0005 required. Whichever option is taken, none
of them has to move — which is the one part of ADR-0005 that paid for itself
regardless of where the log ended up.

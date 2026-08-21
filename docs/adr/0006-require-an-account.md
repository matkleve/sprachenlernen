# 0006. Require an account before the first review

- **Status:** Accepted
- **Date:** 2026-08-08
- **Supersedes:** the optional-account clause of [0005](0005-local-first-review-log-with-accounts-as-an-addition.md). Everything else in 0005 stands.

## Context

[0005](0005-local-first-review-log-with-accounts-as-an-addition.md), written
earlier the same day, read "browser first" as meaning an account buys durability
rather than capability: practise immediately, sign in later, owner field nullable
until then. That reading was put to the owner explicitly and answered: **an
account is required.**

This decision has a cost that is documented rather than discovered, because the
study argues against it twice with evidence:

- [`../study/STUDY-001-duolingo.md`](../study/STUDY-001-duolingo.md) S1, graded **[A]**: "every
  step we put between 'app opened' and 'first exercise' costs a share of users
  permanently." A signup form is exactly such a step, and the chapter names
  account creation among the barriers that serious tools erect and Duolingo does
  not.
- [`../use-cases/UC-011-start-in-the-first-minute.md`](../use-cases/UC-011-start-in-the-first-minute.md)
  carried "no account is required to start" as an acceptance criterion.

What makes the decision defensible rather than a contradiction is roadmap
question 1: **this is a tool for its author first**, kept open for later. Signup
friction is a cost paid in *acquisition of strangers*, and there are no strangers
yet. For a single known user the form costs one minute once, and in exchange the
data model never has to grow an owner it did not have.

The reverse direction is the expensive one, which is why this is worth deciding
now rather than at the first review: a log written with a nullable owner and later
made mandatory is a backfill; a log written owned and later made anonymous is
simply a relaxation.

## Decision

An account is required before the first review is recorded. The owner of a review
row is **non-null from the first row ever written**, authentication exists before
stage 1 stores anything, and the server is therefore part of stage 1 rather than a
later addition.

What 0005 decided and this record keeps: the review log stays **append-only**,
with **one UUID per review**, carrying the **installation** it came from, and
**no component knows where it lives** — access goes through the `lib/db/` adapter
([`../BACKEND.md`](../BACKEND.md) §3). The browser store also stays, but its job
changes: it is the offline write path and cache
([`../backlog/BL-009-feature-catalogue.md`](../backlog/BL-009-feature-catalogue.md) F82), not
the authority. Because the log is append-only, the two stores hold the same rows
and reconciliation is a union rather than a judgement — which is the property that
made 0005's rejection of "two authorities" unnecessary here.

`/` remains the landing page: a signed-out visitor sees the landing page, and the
app is behind sign-in.

## Alternatives considered

**Optional account, sign in to keep your history** — 0005's position. Lost to the
owner's decision. Recorded because it is what the evidence favours, and because
it is the thing to reconsider first if acquisition ever becomes a goal.

**Anonymous first session, account required to keep it** — practise, then sign up
at the end of the session and the work survives. It is the variant that satisfies
both S1 and a required account, and it is the standard answer in products that
have measured this. Lost because it is strictly more work than either pure
option: it needs the anonymous path, the owned path, *and* the claim step that
attaches one to the other — three code paths where a required account needs one.
For a single-user tool that is a poor trade.

**Account required, but no server yet** — auth against a local credential so the
shape is owned while storage stays local. Lost as the worst of both: it delivers
none of the durability an account is wanted for, while still putting a form in
front of the product.

## Consequences

**Easier.** One code path, one authority for identity, and no backfill ever.
Multi-device and recovery — the reasons an account was wanted — arrive with the
account rather than after it. Data export (F83) and deletion (UC-024) become
implementable as stated instead of ambiguous for anonymous users.

**Harder, and these are the real costs.**

- **Stage 1 now depends on authentication.** Before this, stage 1 was
  a review surface over local storage. It now also contains signup, sign-in,
  session handling and the access-control test that
  [`../BACKEND.md`](../BACKEND.md) §8 calls the highest-value test in the product.
  This is the largest single change to the roadmap that the decision causes.
- **"The client is untrusted" applies immediately**, not on the day sync ships.
  Every write is authorised server-side, at the data layer where possible.
- **A vendor decision is now due.** 0005 deliberately fixed no vendor because
  sync was distant; it no longer is. That decision gets its own record.
  **⚠ SPEC GAP: the auth and database provider is undecided.**
- **The acquisition cost is deferred, not removed.** The trigger to reopen this is
  named so it is not missed: **the first time the product tries to gain a user who
  is not its author.** At that point S1's [A]-graded finding starts costing real
  people, and the anonymous-then-claim variant above is the first thing to price.

**Committed to.** Append-only, per-review UUID, non-null owner, adapter-only
access, and a landing page that never pretends the app is usable without signing
in.

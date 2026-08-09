# ADR-0010 — `/` is the public landing page; the app lives at its destinations

**Status:** accepted · 2026-08-09
**Context:** [`0006-require-an-account.md`](0006-require-an-account.md),
[`0009-three-destinations.md`](0009-three-destinations.md),
[`../IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md)

## Context

Two accepted records disagreed about one route, and the disagreement blocked the
two next pieces of work.

ADR-0009's consequences: *"Methods is the default route. `/` is the menu, not a
dashboard."* The implementation plan, in two places, from ADR-0006 and the
owner's instruction of 2026-08-08: *`/` is the landing page, and the app is not
on it.* With an account required, that landing page is also the whole of what a
signed-out visitor ever sees.

Both cannot hold. T-B10 cannot be specified without knowing where the menu
lives, and T-04 writes a page onto the same route.

The reconciliation was visible from the start and was deliberately **not**
taken, because a plausible guess is still a decision nobody made
([`../../AGENTS.md`](../../AGENTS.md) boundary 8). It is taken now on the
owner's instruction of 2026-08-09: **where a question has a conventional
answer, use the conventional answer.** That is the decision authority for this
record — not a discovery that one of the two earlier records was wrong.

## Decision

**The ordinary shape for an authenticated web app, and nothing more inventive.**

| Route | Who sees it | What it is |
| --- | --- | --- |
| `/` | everyone, signed out included | The landing page. Its job is to persuade (T-B7) |
| `/methods` | signed in | The front door of the app — the method menu (T-B10) |
| `/words` | signed in | The learner's vocabulary |
| `/progress` | signed in | The level model, drilled into its signals |
| `/languages` | everyone | The language status page. Public, because it holds no learner data |

**Signing in lands on `/methods`.** That is what ADR-0009 meant by "the default
route", and its scope is now explicit: the default route **of the app**, not of
the origin.

The two halves get separate layouts through Next's route groups —
`app/(marketing)/` for the public pages and `app/(app)/` for the signed-in
destinations — so the app shell with its three destinations renders for the
second group and never for the first. Route groups do not appear in the URL, so
this costs nothing in the address bar.

## Consequences

- **Neither earlier record is superseded.** ADR-0009 keeps every word; this one
  states the scope its phrase "default route" was always missing. ADR-0006 and
  the plan keep `/` as the landing page. That is the test of a good
  reconciliation — if either had to be struck, it would be the wrong one.
- **T-B10 and T-04 are unblocked.** The menu is specified against `/methods`;
  T-04's holding page goes on `/`, where the real landing page will replace it.
- **The app shell belongs to the `(app)` group**, which means it is built once
  and every destination inherits it, and no marketing page can accidentally
  render a navigation bar aimed at people who cannot use it.
- **A public route is now a deliberate category, not an accident.** `/` and
  `/languages` are public *because they contain no learner data*, and that is
  the test any future public route has to pass. `/languages` is the reason the
  category exists at all: it is a statement about the shipped data, not about a
  person.
- **Nothing here decides what `/` says.** Positioning copy stays T-B7, a product
  decision. This record settles the address, not the argument made at it.

## Alternatives

**`/` shows the landing page signed out and the menu signed in.** Common, and
rejected: one route with two entirely different pages defeats caching, makes the
page impossible to prerender statically, and makes "what is at `/`" a question
with two answers again — which is the problem this record exists to end.

**The app under a path prefix — `/app/methods`.** Also common, and honest about
the split. Rejected because it puts a meaningless segment in every URL the
learner ever sees, and the route group achieves the same layout separation with
no cost to the address.

**Keep ADR-0009 literally: `/` is the menu, and the landing page moves.** This
was the live alternative. Rejected because ADR-0006 makes the landing page the
only thing a signed-out visitor sees, and a product whose front door is behind a
redirect has no front door.

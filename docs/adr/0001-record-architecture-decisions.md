# 0001. Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-07-31

## Context

Decisions made early in a project constrain everything after them, and the
reasoning behind them evaporates within weeks. Without a record, a later
contributor — human or agent — sees only the result, judges it arbitrary, and
either changes it back or works around it. Both are expensive. Chat logs and
commit messages are not a substitute: they are unindexed and nobody rereads them.

## Decision

We keep short Architecture Decision Records in `docs/adr/`, numbered
sequentially, one file per decision, following the template in `0000-template.md`.
Records are append-only: a decision that is reversed gets a new record and the
old one is marked superseded.

## Alternatives considered

- **A single `DECISIONS.md`.** Simpler to skim, but it grows into an unreadable
  wall and invites silent editing of past entries — which destroys the one
  property that makes the log valuable.
- **Commit messages and PR descriptions only.** Free, and already written. But
  unsearchable in practice and organized by *when* rather than *what*, so the
  reasoning cannot be found from the code it explains.
- **Nothing.** Honest for a throwaway project. This is a base project intended to
  be reused, which is exactly the case where reasoning has to outlive the author.

## Consequences

Writing a record costs ten minutes and forces the alternatives to be named,
which occasionally kills the decision — that is the mechanism working. Every
contributor gains one more place to look before changing something structural,
and one more obligation when they do.

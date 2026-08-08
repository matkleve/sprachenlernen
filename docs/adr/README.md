# Architecture Decision Records

A short note per decision that was **hard to make and expensive to reverse**.
Not every choice — only the ones where a future reader would otherwise ask "why
on earth is it like this?" and, finding no answer, change it back.

## When to write one

- You chose between real alternatives and the losing one was defensible.
- The decision constrains future work (a framework, a data model, a boundary).
- You are about to *reverse* an earlier decision. Write the new one; mark the
  old one superseded. Never edit history to look consistent.

Not for: naming, formatting, anything a linter decides, anything you'd change on
a whim next week.

## How

```bash
cp docs/adr/0000-template.md docs/adr/0008-short-slug.md
```

Number sequentially, never reuse a number, never delete a record. A superseded
ADR stays — the fact that it was once the right answer is the most useful part.

## Records

| # | Title | Status |
| --- | --- | --- |
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](0002-specs-are-the-source-of-truth.md) | Specs are the source of truth | Accepted |
| [0003](0003-agents-md-as-the-single-instruction-file.md) | AGENTS.md as the single instruction file | Accepted |
| [0004](0004-word-task-data-model.md) | Model a word as one entity owning several independently scheduled tasks | Accepted |
| [0005](0005-local-first-review-log-with-accounts-as-an-addition.md) | Store the review log locally first, and add accounts as an addition rather than a migration | Accepted, one clause superseded by 0006 |
| [0006](0006-require-an-account.md) | Require an account before the first review | Accepted |
| [0007](0007-supabase-as-the-provider.md) | Use Supabase for authentication and the review-log database | Accepted |
| [0008](0008-simulated-learners-as-a-test-harness.md) | Simulated learners as a test harness, never as evidence | Accepted |

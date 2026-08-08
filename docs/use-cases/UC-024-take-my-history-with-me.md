# UC-024 — Take my learning history with me

<!-- id: UC-024 -->
<!-- specs:  -->

**Who:** anyone who has put a year into the app.
**Wants to:** get everything out — cards, review history, level history — in a
form they can actually use.
**So that:** the years of data they generated stay theirs, and the decision to
keep using the app is a choice rather than a trap.

Derived from [`../CONSTITUTION.md`](../CONSTITUTION.md) §2 and
[`../study/09-feature-catalogue.md`](../study/09-feature-catalogue.md) F83.

## Today

Export is either missing, or a partial dump that omits the part with the value:
the review history. Without it, the memory model cannot be reconstructed
anywhere else, so what looks like an export is really a screenshot. Learners
discover this at the worst moment.

## Success looks like

- One action exports **everything**: words, tasks, every review with its grade,
  latency and timestamp, level history, and the calibration in force at each
  point.
- The format is documented, plain, and readable without this app.
- The export is complete enough that the schedule could be rebuilt elsewhere —
  the review log, not just the current state.
- Deleting an account deletes the data, and this is stated plainly rather than
  implemented as a hidden flag.
- Audio recordings, if any exist, are covered by the same rules: the learner is
  told where they were processed, how long they are kept, and can delete them
  separately.
- None of this is behind a paid tier.

## Out of scope

Import from this format back into the app (that is a different problem),
migration tooling for other apps' formats, and account transfer between people.

# Scheduler — acceptance criteria

Split child of [`scheduler.md`](scheduler.md). The parent owns scope, behavior,
states and data; this file owns the criteria alone.

AC-12 to AC-17 were added on 2026-08-08 after an adversarial review found nine
confirmed defects while all 29 tests passed. Each of them exists because a real
failure got through, not because it seemed prudent.

## Acceptance criteria

- [ ] AC-1 · Given a task with no reviews, when its state is computed, then it is
      `new` and due at or before `now`.
- [ ] AC-2 · Given any task and grade **and a non-zero elapsed time**, when the
      grade is applied, then stability for `again` is lower than for `hard`,
      `hard` lower than `good`, and `good` lower than `easy`.
- [ ] AC-3 · Given a task in `review` **reviewed after non-zero elapsed time**,
      when `good` is applied, then the new interval is strictly longer than the
      previous one.
- [ ] AC-4 · Given a task in **any** state, when retrievability is computed at
      its due date, then it equals the configured target retention within
      `retentionTolerance`. Whole-day rounding is applied only while it stays
      inside that budget, so this holds by construction rather than by luck.
- [ ] AC-5 · While a task is `suspended`, applying any grade shall leave its
      state and due date unchanged and report the transition as illegal.
- [ ] AC-6 · Given a task in `review`, when `again` is applied, then the state is
      `relearning` and difficulty has not decreased.
- [ ] AC-7 · When target retention is raised, the interval produced for the same
      history and grade shall be shorter.
- [ ] AC-8 · Given a projection for all four grades, when the learner then
      answers, then the resulting due date equals the projection for that grade
      exactly.
- [ ] AC-9 · Given a review log, when the state is recomputed from scratch, then
      it equals the state built by applying the reviews one at a time.
- [ ] AC-10 · Given meaning-recall and form-recall for the same `wordId` both due,
      when `buildSession` runs, then exactly one appears in the queue and the
      other remains due for a later session.
- [ ] AC-11 · Given any sequence of legal calls, no task shall ever hold two
      states at once, and no reviewed task shall lack a due date unless
      `retired`.
- [ ] AC-12 · Given any grade applied to a task that is neither `suspended` nor
      `retired`, the review shall be appended to the log. **No answer is ever
      discarded**, in any state, for any grade.
- [ ] AC-13 · Given a review log, when it is rebuilt, then every entry is either
      applied or **reported as rejected** — never silently dropped.
- [ ] AC-14 · Given any task and moment, the projection for a grade shall equal
      what applying that grade produces, **including when applying is refused**
      — a refused grade projects no change and never a negative interval.
- [ ] AC-15 · Given a lapse, the stability it produces shall never fall below the
      initial stability for `again`, however often the task lapses.
- [ ] AC-16 · Given a suspended task, `unsuspend` shall return it as `learning`
      and it shall accept grades again.
- [ ] AC-17 · Given zero elapsed time since the last review, applying a grade
      shall **not** increase stability. Reviewing what you just reviewed teaches
      nothing; this is the spacing effect, not a defect.

## Check

`npm test -- scheduler`

# Session sampling — acceptance criteria

<!-- id: SPEC-service-session-sampling-ac -->
<!-- parent: SPEC-service-session-sampling -->
<!-- status: draft -->

- [ ] Given empty history, when `sampleSession` runs, then all L cards are new
      and weights favour lower `frequencyRank` stochastically (not strict sort).
- [ ] Given two tasks with `R = 0.5` and `R = 0.95` and equal other factors,
      when sampling 1000 sessions, then the low-R task appears in more sessions
      than the high-R task (p < 0.01).
- [ ] Given task A last graded `good` today and task B last graded `again` today,
      equal `R`, when sampling, then B appears more often than A.
- [ ] Given `N_newToday = 8` and `lambdaNewToday = 0.2`, when sampling includes
      new cards, then the empirical inclusion rate for new vs `N_newToday = 0`
      is lower (Monte Carlo, p < 0.05).
- [ ] Given `heldMeaningRecall = 80`, when sampling, then `φ(H) < 0.05` and
      distribution is within 10% of retrievability-only baseline (no foundation
      boost).
- [ ] Given `heldMeaningRecall = 10` and two sessions same simulated day, when
      session 2 builds after session 1 graded all `good`, then overlap of lemmas
      between sessions is ≥ 20% in ≥ 70% of Monte Carlo trials (n ≥ 200).
- [ ] Given form-recall with zero meaning reviews, when sampling `deck=form`,
      then weight is below 1% of max meaning-recall weight (effectively absent).
- [ ] Given meaning held for `wordId`, when sampling `deck=form`, then that
      form-recall task has `fᵢ = 1`.
- [ ] Given sampling picks a card, when `due` is unchanged before next grade,
      then no extra review row is written for the draw itself.
- [ ] Given `samplingReason` on a queue entry, when G1 panel renders (UC-005
      future), then copy maps from reason without exposing raw weights.

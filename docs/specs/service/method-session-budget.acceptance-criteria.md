# Method session budget — acceptance criteria

<!-- parent: SPEC-service-method-session-budget -->

- [ ] Given menu `?minutes=15` and Start on a hosted method, when the session URL
      is built, then `minutes=15` is present on `/practice` or `/words/review`.
- [ ] Given a method with `durations: [10, 20]` and menu at 15, when the learner
      starts, then `budgetMinutes` is 15 (within catalogue range).
- [ ] Given menu at 5 and `durations: [8, 15]`, when detail renders, then the
      session contract shows the **8 min** minimum, not 5.
- [ ] Given `free-production` with `budgetMinutes: 10`, when the recipe composes,
      then `timed-write.durationSec` is within tolerance of 10 minutes minus
      chrome overhead.
- [ ] Given `srs-session` with `budgetMinutes: 10`, when `buildSession` runs,
      then card count is within tolerance of 10 minutes at `SEC_PER_CARD`.
- [ ] Given any hosted recipe after T-MV5, when `estimateWallClock` runs, then
      result is within 85–115 % of `budgetMinutes`.
